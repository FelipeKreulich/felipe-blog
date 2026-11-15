// Publica o conteúdo versionado em content/ (posts, tags e páginas legais) no banco do DATABASE_URL.
// Idempotente e seguro para produção: por padrão só CRIA o que não existe (não sobrescreve o que
// foi editado no admin). Use --update para regravar os posts a partir dos arquivos.
//
//   npm run content:publish                 # cria o que falta
//   npm run content:publish -- --update     # também atualiza posts existentes
//   CONTENT_AUTHOR_EMAIL=voce@x.com ...      # autor dos posts (padrão: primeiro admin com senha)
import { PrismaClient } from "@prisma/client";
import { allPosts } from "../content/index";
import { legal } from "../content/legal";
import { TAGS } from "../content/types";
import { existsSync } from "node:fs";

const db = new PrismaClient();
const update = process.argv.includes("--update");

async function main() {
  // validações antes de tocar no banco
  const keys = new Set<string>();
  for (const p of allPosts) {
    if (keys.has(p.key)) throw new Error(`key duplicada: ${p.key}`);
    keys.add(p.key);
    if (!existsSync(`public/covers/${p.cover}.jpg`)) throw new Error(`capa ausente: public/covers/${p.cover}.jpg`);
    for (const l of [p.pt, p.en]) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug)) throw new Error(`slug inválido: ${l.slug}`);
  }

  const email = process.env.CONTENT_AUTHOR_EMAIL;
  const author = email
    ? await db.user.findUnique({ where: { email } })
    : await db.user.findFirst({ where: { role: "ADMIN", passwordHash: { not: null } }, orderBy: { createdAt: "asc" } });
  if (!author) throw new Error("Autor não encontrado. Crie o admin (npm run admin:create) ou defina CONTENT_AUTHOR_EMAIL.");
  console.log(`Autor: ${author.email}${update ? " · modo --update" : ""}`);

  for (const t of TAGS) await db.tag.upsert({ where: { slug: t.slug }, update: { namePt: t.namePt, nameEn: t.nameEn }, create: { ...t } });

  const now = Date.now();
  let created = 0, updated = 0, skipped = 0;
  for (const p of allPosts) {
    const existing = await db.postTranslation.findUnique({ where: { locale_slug: { locale: "pt", slug: p.pt.slug } }, select: { postId: true } });
    const tags = { set: [] as { slug: string }[], connect: p.tags.map((slug) => ({ slug })) };
    const translations = [
      { locale: "pt" as const, slug: p.pt.slug, title: p.pt.title, excerpt: p.pt.excerpt, content: p.pt.body },
      { locale: "en" as const, slug: p.en.slug, title: p.en.title, excerpt: p.en.excerpt, content: p.en.body },
    ];

    if (existing && !update) { skipped++; continue; }
    if (existing) {
      await db.$transaction([
        db.post.update({ where: { id: existing.postId }, data: { coverImage: `/covers/${p.cover}.jpg`, authorId: author.id, tags } }),
        ...translations.map((t) => db.postTranslation.upsert({
          where: { postId_locale: { postId: existing.postId, locale: t.locale } },
          update: { slug: t.slug, title: t.title, excerpt: t.excerpt, content: t.content },
          create: { postId: existing.postId, ...t },
        })),
      ]);
      updated++;
    } else {
      await db.post.create({
        data: {
          authorId: author.id,
          coverImage: `/covers/${p.cover}.jpg`,
          publishedAt: new Date(now - p.daysAgo * 864e5),
          tags: { connect: p.tags.map((slug) => ({ slug })) },
          translations: { create: translations },
        },
      });
      created++;
    }
  }

  // páginas legais: só cria (depois disso o admin é a fonte da verdade)
  let pages = 0;
  for (const [key, langs] of Object.entries(legal)) {
    for (const [locale, doc] of Object.entries(langs) as ["pt" | "en", { title: string; content: string }][]) {
      const exists = await db.page.findUnique({ where: { key_locale: { key, locale } } });
      if (!exists) { await db.page.create({ data: { key, locale, title: doc.title, content: doc.content } }); pages++; }
    }
  }

  // autor de demonstração antigo ("Redação"), se não tiver mais posts
  const legacy = await db.user.findUnique({ where: { email: "redacao@commit-times.local" }, include: { _count: { select: { posts: true } } } });
  if (legacy && legacy._count.posts === 0) { await db.user.delete({ where: { id: legacy.id } }); console.log("Autor de demonstração removido."); }

  console.log(`Posts: ${created} criados, ${updated} atualizados, ${skipped} já existiam · Páginas criadas: ${pages}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => db.$disconnect());
