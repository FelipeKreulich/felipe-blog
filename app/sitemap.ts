import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absolute, localePath } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({
    where: { publishedAt: { not: null } },
    select: { updatedAt: true, translations: { select: { locale: true, slug: true } } },
  });
  const latest = posts.reduce((d, p) => (p.updatedAt > d ? p.updatedAt : d), new Date(0));

  const both = (path: string, lastModified: Date, priority: number) =>
    (["pt", "en"] as const).map((l) => ({
      url: absolute(localePath(l, path)),
      lastModified,
      priority,
      alternates: { languages: { "pt-BR": absolute(localePath("pt", path)), en: absolute(localePath("en", path)) } },
    }));

  const postEntries = posts.flatMap((p) => {
    const by = Object.fromEntries(p.translations.map((t) => [t.locale, t.slug]));
    const languages = Object.fromEntries(
      p.translations.map((t) => [t.locale === "pt" ? "pt-BR" : "en", absolute(localePath(t.locale, `/posts/${t.slug}`))]),
    );
    return p.translations.map((t) => ({
      url: absolute(localePath(t.locale, `/posts/${by[t.locale]}`)),
      lastModified: p.updatedAt,
      priority: 0.8,
      alternates: { languages },
    }));
  });

  return [
    ...both("", latest, 1),
    ...both("/posts", latest, 0.7),
    ...both("/terms", latest, 0.2),
    ...both("/privacy", latest, 0.2),
    ...postEntries,
  ];
}
