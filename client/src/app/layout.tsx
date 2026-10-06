import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Hanken_Grotesk, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, translations } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/provider";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import AppProvider from "@/providers/AppProvider";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const bn = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bn", display: "swap" });

async function getLocale() {
  const v = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  return isValidLocale(v) ? v : DEFAULT_LOCALE;
}

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4f7f4" }, { media: "(prefers-color-scheme: dark)", color: "#06100d" }] };

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = translations[await getLocale()];
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={`${display.variable} ${body.variable} ${bn.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body>
        <I18nProvider initialLocale={locale}>
          <ThemeProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
