import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPostCards } from "@/lib/posts";
import { sameAlternates } from "@/lib/seo";
import { PostGrid } from "@/components/site/post-grid";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[locale]/posts">): Promise<Metadata> {
  const { locale } = await params;
  const [t, ts] = await Promise.all([getTranslations({ locale, namespace: "archive" }), getTranslations({ locale, namespace: "site" })]);
  return { title: t("title"), description: ts("tagline"), alternates: sameAlternates(locale, "/posts") };
}

// ponytail: lista tudo de uma vez; paginar quando passar de ~60 posts
export default async function Archive({ params }: PageProps<"/[locale]/posts">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("archive");
  const posts = await getPostCards(locale);

  return (
    <div className="space-y-10">
      <header className="border-b pb-8">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("kicker", { n: posts.length })}</p>
        <h1 className="mt-3 text-5xl sm:text-7xl">{t("title")}</h1>
      </header>
      <PostGrid posts={posts} />
    </div>
  );
}
