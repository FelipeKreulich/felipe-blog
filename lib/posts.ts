import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

export type PostCard = {
  id: string; href: string; cover: string | null; title: string; excerpt: string; meta: string; tag: string | null;
};

const readMinutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).length / 220));

// Posts publicados no idioma, já formatados para card.
export async function getPostCards(locale: string, take?: number): Promise<PostCard[]> {
  const t = await getTranslations({ locale, namespace: "home" });
  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
  const posts = await db.post.findMany({
    where: { publishedAt: { not: null }, translations: { some: { locale: locale as Locale } } },
    orderBy: { publishedAt: "desc" },
    take,
    include: { translations: { where: { locale: locale as Locale } }, tags: true },
  });
  return posts.map((p) => {
    const tr = p.translations[0];
    const tag = p.tags[0];
    return {
      id: p.id,
      href: `/posts/${tr.slug}`,
      cover: p.coverImage,
      title: tr.title,
      excerpt: tr.excerpt,
      meta: `${fmt.format(p.publishedAt!)} · ${t("minRead", { n: readMinutes(tr.content) })}`,
      tag: tag ? (locale === "pt" ? tag.namePt : tag.nameEn) : null,
    };
  });
}
