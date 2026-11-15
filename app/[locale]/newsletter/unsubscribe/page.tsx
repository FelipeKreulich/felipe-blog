import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";

export default async function Unsubscribe({ params, searchParams }: PageProps<"/[locale]/newsletter/unsubscribe">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const token = (await searchParams).token;
  if (typeof token === "string") await db.subscriber.deleteMany({ where: { token } });

  return (
    <div className="mx-auto max-w-xl space-y-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
      <h1 className="text-5xl">{t("unsubTitle")}</h1>
      <p className="text-muted-foreground">{t("unsubBody")}</p>
      <Link href="/" className="inline-block border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">{t("back")}</Link>
    </div>
  );
}
