import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { CommentForm } from "./comment-form";
import { CommentItem, type CommentView } from "./comment-item";

export async function Comments({ postId, path }: { postId: string; path: string }) {
  const [session, t, locale] = await Promise.all([auth(), getTranslations("comments"), getLocale()]);
  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "medium", timeStyle: "short" });
  const me = session?.user;

  const rows = await db.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true } },
      replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
    },
  });
  const view = (c: (typeof rows)[number] | (typeof rows)[number]["replies"][number]): CommentView => ({
    id: c.id, body: c.body, author: c.user.name ?? "—", date: fmt.format(c.createdAt),
    canDelete: !!me && (me.id === c.userId || me.role === "ADMIN"),
  });
  const comments = rows.map((c) => ({ ...view(c), replies: c.replies.map(view) }));
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <section id="comments" aria-labelledby="comments-title" className="space-y-8">
      <h2 id="comments-title" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {t("title", { n: total })}
      </h2>

      {me ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="border border-dashed p-5 text-center text-muted-foreground">
          <Link href={{ pathname: "/signin", query: { next: path } }} className="text-foreground underline decoration-accent underline-offset-4">{t("signInLink")}</Link>{" "}
          {t("signInSuffix")}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="font-heading text-2xl italic text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-8 divide-y [&>li]:pt-8 [&>li:first-child]:pt-0">
          {comments.map((c) => <CommentItem key={c.id} c={c} postId={postId} canReply={!!me} />)}
        </ul>
      )}
    </section>
  );
}
