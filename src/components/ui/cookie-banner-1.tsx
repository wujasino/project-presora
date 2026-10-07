"use client";

import { useEffect, useRef, useState } from "react";
import { Cookie, Shield, Info, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
type Prefs = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

interface CookiePanelProps {
  title?: string;
  message?: string;
  acceptText?: string;
  customizeText?: string;
  icon?: "cookie" | "shield" | "info";
  className?: string;
  privacyHref?: string;
  termsHref?: string;
}

const CookiePanel = (props: CookiePanelProps) => {
  const {
    title = "This site uses cookies",
    message = "We use cookies to enhance your experience, analyze traffic and personalize content.",
    acceptText = "Accept all",
    customizeText = "Customize",
    icon = "cookie",
    className,
    privacyHref = "/privacy",
    termsHref = "/terms",
  } = props;

  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  const prefsRef = useRef<HTMLDivElement | null>(null);
  const [prefsHeight, setPrefsHeight] = useState<number>(0);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("cookie-consent")
        : null;

    if (!stored) {
      setRender(true);
      requestAnimationFrame(() => setVisible(true));
    }

    const storedPrefs = localStorage.getItem("cookie-preferences");
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs) as Prefs;
        setPrefs({ necessary: true, ...parsed, necessary: true });
      } catch {
        // malformed stored prefs — ignore and keep defaults
      }
    }
  }, []);

  useEffect(() => {
    if (showPrefs && prefsRef.current) {
      const h = prefsRef.current.scrollHeight;
      setPrefsHeight(h);
    } else {
      setPrefsHeight(0);
    }
  }, [showPrefs, prefs]);

  const closeWithExit = (val?: "true" | "false") => {
    if (val) localStorage.setItem("cookie-consent", val);
    setVisible(false);
    setTimeout(() => setRender(false), 300);
  };

  const savePreferences = () => {
    localStorage.setItem("cookie-preferences", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent", "true");
    setShowPrefs(false);

    setVisible(false);
    setTimeout(() => setRender(false), 300);
  };

  if (!render) return null;

  const IconEl =
    icon === "shield" ? Shield : icon === "info" ? Info : Cookie;

  const PrefRow = ({
    title,
    desc,
    field,
    locked,
  }: {
    title: string;
    desc: string;
    field: keyof Prefs;
    locked?: boolean;
  }) => (
    <div className="flex items-start gap-2 p-2 rounded-lg border border-border">
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && setPrefs((p) => ({ ...p, [field]: !p[field] }))}
        className={cn(
          "mt-0.5 inline-flex size-5 items-center justify-center rounded border",
          locked
            ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
            : "bg-background border-border hover:bg-accent cursor-pointer"
        )}
        aria-pressed={prefs[field]}
        aria-label={`${title} cookie preference`}
      >
        {prefs[field] && <Check className="size-4" />}
      </button>

      <div className="flex-1">
        <div className="text-xs font-medium">
          {title} {locked && <span className="text-[10px] text-muted-foreground">(required)</span>}
        </div>

        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div
        className={cn(
          "relative border-t border-border/70 bg-card/97 text-card-foreground backdrop-blur-xl",
          "shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.35)]",
          "pb-[env(safe-area-inset-bottom)]",
          visible
            ? cn("animate-in", "fade-in", "slide-in-from-bottom-4")
            : cn("animate-out", "fade-out", "slide-out-to-bottom-4"),
          "duration-300 ease-out",
          className
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0 pr-8 sm:pr-0">
              <span className="shrink-0 inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <IconEl className="size-4" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-5">{title}</h2>
                <p className="text-xs leading-5 text-muted-foreground mt-0.5">
                  {message} See our{" "}
                  <a
                    href={privacyHref}
                    className="underline underline-offset-4 hover:text-foreground cursor-pointer"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href={termsHref}
                    className="underline underline-offset-4 hover:text-foreground cursor-pointer"
                  >
                    Terms & Conditions
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
              <button
                type="button"
                onClick={() => setShowPrefs((p) => !p)}
                className={cn(
                  "px-3 py-1.5 rounded-md border border-border/70 cursor-pointer",
                  "bg-muted text-muted-foreground text-xs",
                  "hover:bg-muted/80 transition-colors flex items-center gap-1"
                )}
                aria-expanded={showPrefs}
                aria-controls="cookie-preferences-inline"
              >
                {customizeText}
                {showPrefs ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>

              <button
                type="button"
                onClick={() => closeWithExit("true")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs cursor-pointer whitespace-nowrap",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                {acceptText}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => closeWithExit()}
            className="absolute top-2.5 right-3 sm:top-3.5 inline-flex size-7 items-center justify-center rounded-md hover:bg-foreground/5 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4 text-muted-foreground" />
          </button>

          <div
            id="cookie-preferences-inline"
            ref={prefsRef}
            style={{ height: prefsHeight ? `${prefsHeight}px` : 0 }}
            className={cn(
              "overflow-hidden transition-[height] duration-300 ease-out will-change-[height]"
            )}
          >
            {showPrefs && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <PrefRow
                title="Strictly necessary"
                desc="Required for site functionality."
                field="necessary"
                locked
              />

              <PrefRow
                title="Functional"
                desc="Remembers your preferences."
                field="functional"
              />

              <PrefRow
                title="Analytics"
                desc="Helps us improve the site."
                field="analytics"
              />

              <PrefRow
                title="Marketing"
                desc="Personalized ads."
                field="marketing"
              />

              <div className="flex justify-end gap-2 mt-1 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPrefs(false)}
                  className="px-2.5 py-1 rounded-md border border-border bg-muted text-muted-foreground text-xs hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={savePreferences}
                  className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 cursor-pointer"
                >
                  Save preferences
                </button>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CookiePanel };
