import { requireAdmin } from "@/lib/admin";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { Badge, btnSolid } from "@/components/admin/ui";

export default async function AdminPosts() {
  await requireAdmin(); // não depender só do layout: página e layout renderizam em paralelo
  const posts = await db.post.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { updatedAt: "desc" }],
    include: { translations: { select: { locale: true, title: true } }, _count: { select: { likes: true, comments: true } } },
  });
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {posts.length} posts · {posts.filter((p) => p.publishedAt).length} publicados
        </p>
        <Link href="/admin/posts/new" className={btnSolid}><Plus className="size-3.5" /> Novo post</Link>
      </div>
      <ul className="divide-y border-y">
        {posts.map((p) => {
          const pt = p.translations.find((t) => t.locale === "pt");
          const hasEn = p.translations.some((t) => t.locale === "en");
          return (
            <li key={p.id}>
              <Link href={`/admin/posts/${p.id}`} className="grid gap-2 py-4 transition-colors hover:bg-card sm:grid-cols-[1fr_auto] sm:items-center sm:px-3">
                <div className="space-y-1">
                  <p className="font-heading text-2xl leading-tight">{pt?.title ?? "(sem título)"}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.publishedAt ? <Badge tone="solid">Publicado · {fmt.format(p.publishedAt)}</Badge> : <Badge tone="accent">Rascunho</Badge>}
                    <Badge>PT{hasEn ? " · EN" : ""}</Badge>
                    {p.newsletterSentAt && <Badge>Newsletter enviada</Badge>}
                  </div>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  ♥ {p._count.likes} · 💬 {p._count.comments}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
