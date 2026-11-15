import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { NewsletterAction } from "@/components/site/newsletter-action";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Nada é gravado ao abrir a página: a ação só roda no clique do botão (server action).
export default async function Confirm({ params, searchParams }: PageProps<"/[locale]/newsletter/confirm">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const token = (await searchParams).token;
  const ok = typeof token === "string" && token.length > 0;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
      <h1 className="text-5xl">{ok ? t("confirmCta") : t("invalidTitle")}</h1>
      <p className="text-muted-foreground">{ok ? t("confirmPrompt") : t("invalidBody")}</p>
      {ok && <div><NewsletterAction token={token} kind="confirm" /></div>}
      <Link href="/" className="inline-block border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">{t("back")}</Link>
    </div>
  );
}
