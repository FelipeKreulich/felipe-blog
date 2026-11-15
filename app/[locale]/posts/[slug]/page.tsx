import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link, redirect } from "@/i18n/routing";
import { getPost } from "@/lib/post";
import { renderMarkdown } from "@/lib/markdown";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LikeButton } from "@/components/post/like-button";
import { Comments } from "@/components/post/comments";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[locale]/posts/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await getPost(locale, slug);
  if (!r || !("tr" in r) || !r.tr) return {};
  return {
    title: r.tr.title,
    description: r.tr.excerpt,
    openGraph: { type: "article", title: r.tr.title, description: r.tr.excerpt, images: r.post.coverImage ? [r.post.coverImage] : [] },
  };
}

export default async function PostPage({ params }: PageProps<"/[locale]/posts/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = await getPost(locale, slug);
  if (!r) notFound();
  if ("redirectSlug" in r && r.redirectSlug) redirect({ href: `/posts/${r.redirectSlug}`, locale });
  if (!("tr" in r) || !r.tr) notFound();

  const { tr, post } = r;
  const t = await getTranslations("post");
  const th = await getTranslations("home");
  const session = await auth();
  const [html, liked] = await Promise.all([
    renderMarkdown(tr.content),
    session?.user ? db.like.findUnique({ where: { postId_userId: { postId: post.id, userId: session.user.id } } }).then(Boolean) : false,
  ]);
  const date = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "long" }).format(post.publishedAt!);
  const minutes = Math.max(1, Math.round(tr.content.split(/\s+/).length / 220));

  return (
    <article className="space-y-10">
      <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {t("back")}
      </Link>

      <header className="mx-auto max-w-3xl space-y-6 text-center">
        <div className="flex flex-wrap justify-center gap-3 font-mono text-[11px] uppercase tracking-wider text-accent">
          {post.tags.map((tag) => <span key={tag.id}>{locale === "pt" ? tag.namePt : tag.nameEn}</span>)}
        </div>
        <h1 className="text-5xl leading-[1.02] text-balance sm:text-7xl">{tr.title}</h1>
        <p className="text-xl leading-relaxed text-pretty text-muted-foreground">{tr.excerpt}</p>
        <p className="border-y py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {t("by")} Felipe Kreulich · {date} · {th("minRead", { n: minutes })}
        </p>
      </header>

      {post.coverImage && (
        <div className="relative aspect-[21/9] overflow-hidden border">
          <Image src={post.coverImage} alt="" fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="article prose prose-lg mx-auto max-w-[68ch]" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="mx-auto max-w-[68ch] space-y-14 border-t pt-8 text-lg">
        <div className="flex items-center justify-between gap-4">
          <LikeButton postId={post.id} liked={liked} count={post._count.likes} signedIn={!!session?.user} />
          <a href="#comments" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            {t("stats", { likes: post._count.likes, comments: post._count.comments })}
          </a>
        </div>
        <Comments postId={post.id} path={`/posts/${tr.slug}`} />
      </footer>
    </article>
  );
}
