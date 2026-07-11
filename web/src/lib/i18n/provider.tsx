"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionary, type Dictionary, type Lang } from "./dictionary";

/* ------------------------------------------------------------------ */
/*  Language context — single source of truth for the active language  */
/* ------------------------------------------------------------------ */

type I18nContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dictionary;
  /** Switch language (and persist to localStorage) */
  setLang: (lang: Lang) => void;
  /** Toggle between ar / en */
  toggle: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "w-forex-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to Arabic (the site's primary language). Hydrate from storage on mount.
  const [lang, setLangState] = useState<Lang>("ar");

  /* Restore persisted language once on mount (client only).
     Read from <html lang> which the inline script in layout already set,
     so the initial client render matches server output and avoids flicker. */
  useEffect(() => {
    try {
      const domLang = document.documentElement.lang;
      if (domLang === "ar" || domLang === "en") {
        setLangState(domLang);
        return;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "ar" || stored === "en") setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  /* Keep <html lang/dir> in sync */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "ar" ? "en" : "ar"),
    [lang, setLang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: dictionary,
      setLang,
      toggle,
    }),
    [lang, setLang, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Tiny helper: pick a localized value from a { ar, en } object       */
/* ------------------------------------------------------------------ */
type Localized = { ar: string; en: string };

export function useT() {
  const { lang } = useI18n();
  return <T extends Localized>(entry: T): T[Lang] => entry[lang];
}
