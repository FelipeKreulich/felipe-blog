"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CommentForm } from "./comment-form";
import { deleteComment } from "@/lib/post-actions";

export type CommentView = { id: string; body: string; author: string; date: string; canDelete: boolean; replies?: CommentView[] };

export function CommentItem({ c, postId, canReply }: { c: CommentView; postId: string; canReply: boolean }) {
  const t = useTranslations("comments");
  const [replying, setReplying] = useState(false);
  const [pending, start] = useTransition();
  const action = "font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent disabled:opacity-50";

  return (
    <li className="space-y-3">
      <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="text-foreground">{c.author}</span>
        <span className="text-muted-foreground">{c.date}</span>
      </div>
      <p className="whitespace-pre-line leading-relaxed">{c.body}</p>
      <div className="flex gap-4">
        {canReply && <button type="button" className={action} onClick={() => setReplying((v) => !v)}>{replying ? t("cancel") : t("reply")}</button>}
        {c.canDelete && <button type="button" disabled={pending} className={action} onClick={() => start(() => deleteComment(c.id))}>{t("delete")}</button>}
      </div>
      {replying && <CommentForm postId={postId} parentId={c.id} autoFocus onDone={() => setReplying(false)} />}
      {!!c.replies?.length && (
        <ul className="space-y-6 border-l-2 border-accent/40 pl-5">
          {c.replies.map((r) => <CommentItem key={r.id} c={r} postId={postId} canReply={false} />)}
        </ul>
      )}
    </li>
  );
}
