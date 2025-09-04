import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsent } from "@/components/CookieConsent";
import { CookieBanner } from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kreulich Blog",
    template: "%s | Kreulich Blog"
  },
  description: "Blog sobre tecnologia, programação e outros assuntos.",
  keywords: ["blog", "tecnologia", "programação", "desenvolvimento", "tech"],
  authors: [{ name: "Kreulich" }],
  creator: "Kreulich",
  publisher: "Kreulich Blog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kreulich-blog.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kreulich-blog.vercel.app',
    title: 'Kreulich Blog',
    description: 'Blog sobre tecnologia, programação e outros assuntos.',
    siteName: 'Kreulich Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kreulich Blog',
    description: 'Blog sobre tecnologia, programação e outros assuntos.',
    creator: '@kreulich',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <CookieConsent />
            <CookieBanner />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
