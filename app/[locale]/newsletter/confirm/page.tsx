import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";

export default async function Confirm({ params, searchParams }: PageProps<"/[locale]/newsletter/confirm">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const token = (await searchParams).token;
  const res = typeof token === "string"
    ? await db.subscriber.updateMany({ where: { token, confirmedAt: null }, data: { confirmedAt: new Date() } })
    : { count: 0 };
  const ok = res.count > 0 || (typeof token === "string" && !!(await db.subscriber.findFirst({ where: { token, confirmedAt: { not: null } } })));

  return (
    <div className="mx-auto max-w-xl space-y-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
      <h1 className="text-5xl">{ok ? t("confirmedTitle") : t("invalidTitle")}</h1>
      <p className="text-muted-foreground">{ok ? t("confirmedBody") : t("invalidBody")}</p>
      <Link href="/" className="inline-block border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">{t("back")}</Link>
    </div>
  );
}
