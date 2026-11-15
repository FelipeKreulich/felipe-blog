import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link, redirect } from "@/i18n/routing";
import { getPost } from "@/lib/post";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, localePath, ogLocale } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { LikeButton } from "@/components/post/like-button";
import { Comments } from "@/components/post/comments";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[locale]/posts/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await getPost(locale, slug);
  if (!r || !("tr" in r) || !r.tr) return {};
  const others = await db.postTranslation.findMany({ where: { postId: r.post.id }, select: { locale: true, slug: true } });
  const languages = Object.fromEntries(others.map((o) => [o.locale === "pt" ? "pt-BR" : "en", localePath(o.locale, `/posts/${o.slug}`)]));
  const ownLocale = r.fallbackLocale ?? locale;
  const canonical = localePath(ownLocale, `/posts/${r.tr.slug}`);
  const images = r.post.coverImage ? [{ url: r.post.coverImage, alt: r.tr.title }] : undefined;
  return {
    title: r.tr.title,
    description: r.tr.excerpt,
    alternates: { canonical, languages: { ...languages, "x-default": languages["pt-BR"] ?? canonical } },
    openGraph: {
      type: "article", title: r.tr.title, description: r.tr.excerpt, url: canonical, locale: ogLocale(ownLocale), images,
      publishedTime: r.post.publishedAt?.toISOString(), modifiedTime: r.post.updatedAt.toISOString(),
      authors: ["Felipe Kreulich"], tags: r.post.tags.map((tg) => (ownLocale === "pt" ? tg.namePt : tg.nameEn)),
    },
    twitter: { card: "summary_large_image", title: r.tr.title, description: r.tr.excerpt, images: r.post.coverImage ? [r.post.coverImage] : undefined },
  };
}

export default async function PostPage({ params }: PageProps<"/[locale]/posts/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = await getPost(locale, slug);
  if (!r) notFound();
  if ("redirectSlug" in r && r.redirectSlug) redirect({ href: `/posts/${r.redirectSlug}`, locale });
  if (!("tr" in r) || !r.tr) notFound();

  const { tr, post, fallbackLocale } = r;
  const t = await getTranslations("post");
  const th = await getTranslations("home");
  const me = await getCurrentUser();
  const [html, liked] = await Promise.all([
    renderMarkdown(tr.content),
    me ? db.like.findUnique({ where: { postId_userId: { postId: post.id, userId: me.id } } }).then(Boolean) : false,
  ]);
  const date = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "long" }).format(post.publishedAt!);
  const minutes = Math.max(1, Math.round(tr.content.split(/\s+/).length / 220));

  const ownLocale = fallbackLocale ?? locale;
  const url = absolute(localePath(ownLocale, `/posts/${tr.slug}`));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: tr.title,
    description: tr.excerpt,
    inLanguage: ownLocale === "pt" ? "pt-BR" : "en",
    datePublished: post.publishedAt!.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: url,
    url,
    image: post.coverImage ? [absolute(post.coverImage)] : undefined,
    keywords: post.tags.map((tg) => (ownLocale === "pt" ? tg.namePt : tg.nameEn)).join(", "),
    wordCount: tr.content.split(/\s+/).length,
    author: { "@type": "Person", name: "Felipe Kreulich", url: absolute("/") },
    publisher: { "@type": "Organization", name: "The Commit Times", logo: { "@type": "ImageObject", url: absolute("/brand/logo.svg") } },
  };
  return (
    <article className="space-y-10">
      <JsonLd data={jsonLd} />
      <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {t("back")}
      </Link>

      {fallbackLocale && (
        <p lang={locale} className="mx-auto max-w-3xl border-l-2 border-accent bg-card p-4 text-sm">{t("onlyIn")}</p>
      )}

      <header lang={fallbackLocale ?? undefined} className="mx-auto max-w-3xl space-y-6 text-center">
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

      <div lang={fallbackLocale ?? undefined} className="article prose prose-lg mx-auto max-w-[68ch]" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="mx-auto mt-16 max-w-[68ch] text-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y py-6">
          <LikeButton postId={post.id} liked={liked} count={post._count.likes} signedIn={!!me} />
          <a href="#comments" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            {t("stats", { likes: post._count.likes, comments: post._count.comments })}
          </a>
        </div>
        <div className="mt-16">
          <Comments postId={post.id} path={`/posts/${tr.slug}`} />
        </div>
      </footer>
    </article>
  );
}
