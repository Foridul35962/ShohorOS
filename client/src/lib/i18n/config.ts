export type Locale = "en" | "bn";
export const LOCALES: Locale[] = ["en", "bn"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "shohoros_locale";
export const LOCALE_LABELS: Record<Locale, string> = { en: "English", bn: "বাংলা" };
export function isValidLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as string[]).includes(v);
}
