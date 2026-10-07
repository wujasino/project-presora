import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import en from './locales/en';

type Locale = 'en' | 'pl' | 'de' | 'fr' | 'es' | 'it';
type Dict = Record<string, string>;

// English ships in the initial bundle (default locale + fallback for missing keys).
// Every other language is code-split and fetched only when the user selects it,
// keeping ~80% of the translation strings out of the entry chunk.
const loaders: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Dict }>> = {
  pl: () => import('./locales/pl'),
  de: () => import('./locales/de'),
  fr: () => import('./locales/fr'),
  es: () => import('./locales/es'),
  it: () => import('./locales/it'),
};

const SUPPORTED: Locale[] = ['en', 'pl', 'de', 'fr', 'es', 'it'];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [dicts, setDicts] = useState<Partial<Record<Locale, Dict>>>({ en });

  // Fetch a locale's dictionary on demand and cache it. English is always resident.
  const loadLocale = useCallback((l: Locale) => {
    if (l === 'en') return;
    setDicts(prev => {
      if (prev[l]) return prev;
      loaders[l]()
        .then(mod => setDicts(cur => (cur[l] ? cur : { ...cur, [l]: mod.default })))
        .catch(() => { /* keep English fallback if the chunk fails to load */ });
      return prev;
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('bb_locale', l); } catch { /* ignore */ }
    loadLocale(l);
  }, [loadLocale]);

  // Restore a previously selected language (persisted in localStorage) after mount.
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem('bb_locale'); } catch { /* ignore */ }
    if (stored && stored !== 'en' && SUPPORTED.includes(stored as Locale)) {
      const l = stored as Locale;
      setLocaleState(l);
      loadLocale(l);
    }
  }, [loadLocale]);

  // Fall back to English when a key is missing in the active locale (e.g. before its
  // chunk has loaded, or for keys not yet translated).
  const t = useCallback((key: string) => {
    const dict = dicts[locale];
    if (dict && dict[key]) return dict[key];
    return en[key] ?? key;
  }, [dicts, locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return { locale: ctx.locale, setLocale: ctx.setLocale };
};

export const useTranslation = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation must be used within LocaleProvider');
  return { t: ctx.t, locale: ctx.locale, setLocale: ctx.setLocale };
};

export default LocaleContext;
