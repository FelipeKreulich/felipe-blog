import { site } from "@/lib/site";

export const LOCALES = ["pt", "en"] as const;
export type AppLocale = (typeof LOCALES)[number];

// Caminho público no idioma (pt sem prefixo, en com /en — localePrefix "as-needed").
export const localePath = (locale: string, path = "") => `${locale === "pt" ? "" : `/${locale}`}${path}` || "/";
export const absolute = (path: string) => new URL(path, site.url).toString();

// alternates para uma página com o MESMO caminho nos dois idiomas.
export const sameAlternates = (locale: string, path = "") => ({
  canonical: localePath(locale, path),
  languages: { "pt-BR": localePath("pt", path), en: localePath("en", path), "x-default": localePath("pt", path) },
});

export const ogLocale = (locale: string) => (locale === "pt" ? "pt_BR" : "en_US");
