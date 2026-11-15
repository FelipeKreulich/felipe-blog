import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/generated/prisma/enums";

// Post publicado por slug no idioma. Se o slug for do outro idioma, devolve `redirectSlug`.
export const getPost = cache(async (locale: string, slug: string) => {
  const tr = await db.postTranslation.findUnique({
    where: { locale_slug: { locale: locale as Locale, slug } },
    include: { post: { include: { tags: true, _count: { select: { likes: true, comments: true } } } } },
  });
  if (tr?.post.publishedAt) return { tr, post: tr.post };

  const other = await db.postTranslation.findFirst({
    where: { slug, post: { publishedAt: { not: null } } },
    select: { post: { select: { translations: { where: { locale: locale as Locale }, select: { slug: true } } } } },
  });
  const redirectSlug = other?.post.translations[0]?.slug;
  return redirectSlug ? { redirectSlug } : null;
});
