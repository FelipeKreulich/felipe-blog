import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Confirm({ params, searchParams }: PageProps<"/[locale]/newsletter/confirm">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const token = (await searchParams).token;
  // Só confirma a assinatura (double opt-in). Vincular a uma conta é outro fluxo (/newsletter/link).
  const sub = typeof token === "string" ? await db.subscriber.findUnique({ where: { token } }) : null;
  if (sub && !sub.confirmedAt) await db.subscriber.update({ where: { id: sub.id }, data: { confirmedAt: new Date() } });
  const ok = !!sub;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
      <h1 className="text-5xl">{ok ? t("confirmedTitle") : t("invalidTitle")}</h1>
      <p className="text-muted-foreground">{ok ? t("confirmedBody") : t("invalidBody")}</p>
      <Link href="/" className="inline-block border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">{t("back")}</Link>
    </div>
  );
}
