import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { LinkConfirm } from "@/components/site/link-confirm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Abrir o link NÃO vincula nada (scanners de e-mail abrem links sozinhos); só o botão, via POST.
export default async function LinkPage({ params, searchParams }: PageProps<"/[locale]/newsletter/link">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const token = (await searchParams).token;
  const sub = typeof token === "string" && token.length >= 20
    ? await db.subscriber.findUnique({ where: { linkToken: token }, select: { email: true, linkExpiresAt: true } })
    : null;
  const valid = !!sub?.linkExpiresAt && sub.linkExpiresAt > new Date();

  return (
    <div className="mx-auto max-w-xl space-y-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
      <h1 className="text-5xl">{valid ? t("linkTitle") : t("invalidTitle")}</h1>
      <p className="text-muted-foreground">{valid ? t("linkBody", { email: sub!.email }) : t("invalidBody")}</p>
      {valid
        ? <LinkConfirm token={token as string} />
        : <Link href="/" className="inline-block border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">{t("back")}</Link>}
    </div>
  );
}
