import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

// Post publicado por slug no idioma.
// - slug de outro idioma e existe tradução aqui -> { redirectSlug } (troca de URL dentro do mesmo idioma)
// - não existe tradução aqui -> devolve a versão original com fallbackLocale (sem redirect entre idiomas:
//   com detecção de idioma por cookie, um redirect pt<->en vira loop)
export const getPost = cache(async (locale: string, slug: string) => {
  const tr = await db.postTranslation.findUnique({
    where: { locale_slug: { locale: locale as Locale, slug } },
    include: { post: { include: { tags: true, _count: { select: { likes: true, comments: true } } } } },
  });
  if (tr?.post.publishedAt) return { tr, post: tr.post, fallbackLocale: null };

  const other = await db.postTranslation.findFirst({
    where: { slug, post: { publishedAt: { not: null } } },
    include: {
      post: { include: { tags: true, _count: { select: { likes: true, comments: true } }, translations: { where: { locale: locale as Locale }, select: { slug: true } } } },
    },
  });
  if (!other) return null;
  const here = other.post.translations[0]?.slug;
  if (here) return { redirectSlug: here };
  return { tr: other, post: other.post, fallbackLocale: other.locale };
});
