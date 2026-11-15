import { db } from "@/lib/db";
import type { Locale } from "@/lib/generated/prisma/enums";

export const PAGE_KEYS = ["terms", "privacy"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];
export const PAGE_LABEL: Record<PageKey, string> = { terms: "Termos e condições", privacy: "Política de privacidade" };

export const getPage = (key: PageKey, locale: string) =>
  db.page.findUnique({ where: { key_locale: { key, locale: locale as Locale } } });
