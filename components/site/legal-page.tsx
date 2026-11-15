import { getTranslations } from "next-intl/server";
import { getPage, type PageKey } from "@/lib/pages";
import { renderMarkdown } from "@/lib/markdown";
import { sameAlternates } from "@/lib/seo";

// Página institucional escrita no admin. Sem versão no idioma, cai para PT; sem nenhuma, "em redação".
export async function LegalPage({ pageKey, locale }: { pageKey: PageKey; locale: string }) {
  const page = (await getPage(pageKey, locale)) ?? (await getPage(pageKey, "pt"));
  const t = await getTranslations("legal");
  if (!page) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
        <h1 className="text-5xl">{t(pageKey)}</h1>
        <p className="font-heading text-2xl italic text-muted-foreground">{t("soon")}</p>
      </div>
    );
  }
  const html = await renderMarkdown(page.content);
  const updated = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "long" }).format(page.updatedAt);
  return (
    <article lang={page.locale} className="mx-auto max-w-[68ch] space-y-10">
      <header className="space-y-4 border-b pb-8">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
        <h1 className="text-5xl leading-[1.02] sm:text-6xl">{page.title}</h1>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("updated", { date: updated })}</p>
      </header>
      <div className="article prose prose-lg max-w-none [&>p:first-of-type::first-letter]:float-none [&>p:first-of-type::first-letter]:text-[1em] [&>p:first-of-type::first-letter]:p-0 [&>p:first-of-type::first-letter]:text-inherit" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

export async function legalMetadata(pageKey: PageKey, locale: string) {
  const page = (await getPage(pageKey, locale)) ?? (await getPage(pageKey, "pt"));
  return { title: page?.title, alternates: sameAlternates(locale, `/${pageKey}`) };
}
