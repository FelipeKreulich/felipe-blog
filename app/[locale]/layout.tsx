import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/site/providers";
import { Masthead } from "@/components/site/masthead";
import { ThemeScript } from "@/components/site/theme-script";
import { Preloader } from "@/components/site/preloader";
import { Footer } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";
import "../globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: { default: "The Commit Times", template: "%s · The Commit Times" },
    description: t("tagline"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale === "pt" ? "pt-BR" : "en"} suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Providers>
            <Preloader />
            <Masthead />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
            <Footer />
            <CookieConsent />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
