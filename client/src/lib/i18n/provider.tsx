"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MotionConfig } from "motion/react";
import { LOCALE_COOKIE_NAME, translations, type Locale, type AppTranslations } from ".";

type Ctx = { locale: Locale; t: AppTranslations; setLocale: (l: Locale) => void };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, set] = useState<Locale>(initialLocale);
  const setLocale = useCallback((l: Locale) => {
    set(l);
    document.cookie = `${LOCALE_COOKIE_NAME}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);
  const value = useMemo(() => ({ locale, t: translations[locale], setLocale }), [locale, setLocale]);
  return (
    <I18nContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
}
