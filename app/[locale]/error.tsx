"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StatusPage, btnGhost, btnSolid } from "@/components/site/status-page";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("status");
  useEffect(() => { console.error(error); }, [error]);

  return (
    <StatusPage image="/illustrations/error.jpg" code={t("errorCode")} title={t("errorTitle")} lead={t("errorLead")}>
      <button type="button" onClick={reset} className={btnSolid}>{t("retry")}</button>
      <Link href="/" className={btnGhost}>{t("home")}</Link>
      {error.digest && <p className="w-full font-mono text-[11px] text-muted-foreground">ref: {error.digest}</p>}
    </StatusPage>
  );
}
