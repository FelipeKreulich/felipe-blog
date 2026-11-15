import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { adminDeleteComment } from "@/lib/admin-actions";
import { ActionButton } from "@/components/admin/action-button";
import { Badge } from "@/components/admin/ui";

export default async function AdminComments() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      post: { select: { translations: { where: { locale: "pt" }, select: { title: true, slug: true } } } },
    },
  });
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

  if (comments.length === 0) return <p className="font-heading text-2xl italic text-muted-foreground">Nenhum comentário ainda.</p>;
  return (
    <ul className="divide-y border-y">
      {comments.map((c) => {
        const post = c.post.translations[0];
        return (
          <li key={c.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <span className="text-foreground">{c.user.name ?? "—"}</span>
                <span>{c.user.email}</span>
                <span>· {fmt.format(c.createdAt)}</span>
                {c.parentId && <Badge>Resposta</Badge>}
                {c.deletedAt && <Badge tone="accent">Removido</Badge>}
              </div>
              <p className={`whitespace-pre-line leading-relaxed ${c.deletedAt ? "italic text-muted-foreground" : ""}`}>{c.deletedAt ? "[removido]" : c.body}</p>
              {post && <Link href={`/posts/${post.slug}#comments`} target="_blank" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground underline-offset-4 hover:underline">em: {post.title}</Link>}
            </div>
            {!c.deletedAt && (
              <ActionButton action={adminDeleteComment.bind(null, c.id)} confirm="Remover este comentário?"
                className="self-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent">
                Remover
              </ActionButton>
            )}
          </li>
        );
      })}
    </ul>
  );
}
