"use client";
import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { addComment, type CommentState } from "@/lib/post-actions";

export function CommentForm({ postId, parentId, onDone, autoFocus }: { postId: string; parentId?: string; onDone?: () => void; autoFocus?: boolean }) {
  const t = useTranslations("comments");
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) { ref.current?.reset(); onDone?.(); }
  }, [state.ok, onDone]);

  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <label className="sr-only" htmlFor={`c-${parentId ?? "root"}`}>{t("label")}</label>
      <textarea id={`c-${parentId ?? "root"}`} name="body" required maxLength={2000} rows={parentId ? 2 : 3} autoFocus={autoFocus}
        placeholder={parentId ? t("replyPlaceholder") : t("placeholder")}
        className="w-full resize-y border bg-transparent p-3 leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent" />
      <div className="flex items-center justify-between gap-3">
        <p role="alert" className="font-mono text-[11px] uppercase tracking-wider text-accent">{state.error}</p>
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50">
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {parentId ? t("reply") : t("submit")}
        </button>
      </div>
    </form>
  );
}
