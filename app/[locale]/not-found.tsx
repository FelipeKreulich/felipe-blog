import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { StatusPage, btnGhost, btnSolid } from "@/components/site/status-page";

export default async function NotFound() {
  const t = await getTranslations("status");
  return (
    <StatusPage image="/illustrations/not-found.jpg" code={t("notFoundCode")} title={t("notFoundTitle")} lead={t("notFoundLead")}>
      <Link href="/" className={btnSolid}>{t("home")}</Link>
      <Link href="/posts" className={btnGhost}>{t("archive")}</Link>
    </StatusPage>
  );
}
