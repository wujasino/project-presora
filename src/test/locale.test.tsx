import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider, useTranslation } from '@/lib/locale';

// Exercises the code-split locale loader: English ships statically, every other
// language is fetched via dynamic import() on selection, with English fallback
// for keys the active dictionary is missing. Uses react-dom directly so no extra
// testing-library dependency is required.

let setLocaleRef: (l: 'en' | 'pl' | 'de') => void;

const Probe = () => {
  const { t, setLocale, locale } = useTranslation();
  setLocaleRef = setLocale as typeof setLocaleRef;
  return (
    <div>
      <span id="locale">{locale}</span>
      <span id="home">{t('home')}</span>
      <span id="analyze">{t('analyze')}</span>
    </div>
  );
};

const flush = () => new Promise(r => setTimeout(r, 0));

async function mount() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<LocaleProvider><Probe /></LocaleProvider>);
  });
  const text = (id: string) => container.querySelector('#' + id)?.textContent;
  return {
    container,
    text,
    async setLocale(l: 'en' | 'pl' | 'de') {
      await act(async () => { setLocaleRef(l); });
    },
    // Poll across microtask/macrotask ticks until the lazily imported dict lands.
    async waitForText(id: string, expected: string) {
      for (let i = 0; i < 50 && text(id) !== expected; i++) {
        await act(async () => { await flush(); });
      }
      return text(id);
    },
    unmount() { act(() => root.unmount()); container.remove(); },
  };
}

describe('LocaleProvider lazy locale loading', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders English synchronously on first paint', async () => {
    const app = await mount();
    expect(app.text('locale')).toBe('en');
    expect(app.text('home')).toBe('Home');
    app.unmount();
  });

  it('dynamically loads a non-default locale on selection', async () => {
    const app = await mount();
    await app.setLocale('pl');
    expect(app.text('locale')).toBe('pl');
    expect(await app.waitForText('home', 'Strona')).toBe('Strona');
    app.unmount();
  });

  it('falls back to English for keys missing in a partial locale', async () => {
    const app = await mount();
    await app.setLocale('de');
    // Wait for the 'de' chunk so we prove the fallback holds even after it loads.
    expect(await app.waitForText('home', 'Startseite')).toBe('Startseite');
    expect(app.text('locale')).toBe('de');
    // 'de' has no `analyze` key -> English value is used.
    expect(app.text('analyze')).toBe('Analyze');
    app.unmount();
  });

  it('persists the selected locale to localStorage', async () => {
    const app = await mount();
    await app.setLocale('pl');
    expect(localStorage.getItem('bb_locale')).toBe('pl');
    app.unmount();
  });
});
