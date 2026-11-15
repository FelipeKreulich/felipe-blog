import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

// RSS em português (idioma padrão). /feed.xml
export async function GET() {
  const posts = await db.post.findMany({
    where: { publishedAt: { not: null }, translations: { some: { locale: "pt" } } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { translations: { where: { locale: "pt" } } },
  });
  const items = posts.map((p) => {
    const tr = p.translations[0];
    const url = `${site.url}/posts/${tr.slug}`;
    return `<item><title>${esc(tr.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${p.publishedAt!.toUTCString()}</pubDate><description>${esc(tr.excerpt)}</description></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.name}</title><link>${site.url}</link><description>Notícias, ensaios e notas sobre tecnologia</description><language>pt-BR</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
