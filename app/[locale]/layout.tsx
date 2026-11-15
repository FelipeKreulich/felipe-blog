import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { ogLocale } from "@/lib/seo";
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
    metadataBase: new URL(site.url),
    title: { default: "The Commit Times", template: "%s · The Commit Times" },
    description: t("tagline"),
    applicationName: "The Commit Times",
    authors: [{ name: "Felipe Kreulich", url: site.github }],
    creator: "Felipe Kreulich",
    keywords: locale === "pt"
      ? ["tecnologia", "programação", "segurança", "desenvolvimento web", "IA", "blog"]
      : ["technology", "programming", "security", "web development", "AI", "blog"],
    alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: "The Commit Times (RSS)" }] } },
    openGraph: {
      type: "website",
      siteName: "The Commit Times",
      locale: ogLocale(locale),
      alternateLocale: [ogLocale(locale === "pt" ? "en" : "pt")],
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The Commit Times" }],
    },
    twitter: { card: "summary_large_image", images: ["/og.jpg"] },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
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
