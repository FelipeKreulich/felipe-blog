"use client";
import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { toggleLike } from "@/lib/post-actions";

export function LikeButton({ postId, liked, count, signedIn }: { postId: string; liked: boolean; count: number; signedIn: boolean }) {
  const t = useTranslations("likes");
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [state, setState] = useOptimistic({ liked, count });

  const cls = "group inline-flex items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:border-accent";
  const icon = <Heart className={`size-4 transition-transform group-active:scale-90 ${state.liked ? "fill-accent text-accent" : ""}`} />;
  const label = <span className="tabular-nums">{t("count", { n: state.count })}</span>;

  if (!signedIn) {
    return <Link href={{ pathname: "/signin", query: { next: pathname } }} className={cls} title={t("signIn")}>{icon}{label}</Link>;
  }
  return (
    <button type="button" aria-pressed={state.liked} disabled={pending} className={cls}
      onClick={() => start(async () => {
        setState({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
        await toggleLike(postId);
      })}>
      {icon}{label}
    </button>
  );
}
