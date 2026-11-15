import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getPostCards } from "@/lib/posts";
import { PostGrid } from "@/components/site/post-grid";
import { EditorNote } from "@/components/site/editor-note";
import { Newsletter } from "@/components/site/newsletter";

export const revalidate = 60;

export default async function Home({ params, searchParams }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const deleted = (await searchParams).account === "deleted";
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const posts = await getPostCards(locale, 5); // manchete + 3 + 1 para saber se há mais

  if (posts.length === 0) {
    return <p className="py-24 text-center font-heading text-3xl italic text-muted-foreground">{t("empty")}</p>;
  }

  const [l, ...rest] = posts;
  const latest = rest.slice(0, 3);
  const hasMore = rest.length > 3;

  const tp = await getTranslations("profile");
  return (
    <div className="space-y-12">
      {deleted && <p role="status" className="border-l-2 border-accent bg-card p-4 text-sm">{tp("accountDeleted")}</p>}
      <article className="group grid gap-6 border-b pb-12 md:grid-cols-[2fr_1fr] md:gap-10">
        {l.cover && (
          <Link href={l.href} className="relative block aspect-[21/9] overflow-hidden border md:col-span-2">
            <Image src={l.cover} alt="" fill priority sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
          </Link>
        )}
        <Link href={l.href} className="space-y-4">
          {l.tag && <span className="font-mono text-[11px] uppercase tracking-wider text-accent">{l.tag}</span>}
          <h1 className="text-5xl leading-[1.02] text-balance sm:text-7xl decoration-accent decoration-2 underline-offset-8 group-hover:underline">{l.title}</h1>
        </Link>
        <div className="flex flex-col justify-end gap-4 md:border-l md:pl-10">
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{l.excerpt}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{l.meta}</p>
        </div>
      </article>

      {latest.length > 0 && (
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("latest")}</h2>
          </div>
          <PostGrid posts={latest} />
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Link href="/posts"
                className="group inline-flex items-center gap-2 border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">
                {t("seeMore")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </section>
      )}

      <EditorNote />

      <Newsletter />
    </div>
  );
}
