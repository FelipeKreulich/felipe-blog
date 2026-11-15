"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import { Link } from "@/i18n/routing";

// Consentimento guardado no cookie "cookie-consent" ("all" | "essential"), 1 ano.
// Hoje o site só usa cookies essenciais (login, idioma); qualquer script opcional futuro
// (analytics etc.) deve checar hasConsent() antes de rodar.
const NAME = "cookie-consent";
const OPEN_EVENT = "cookie-consent:open";

export const getConsent = () =>
  typeof document === "undefined" ? null : (document.cookie.match(/(?:^|; )cookie-consent=(all|essential)/)?.[1] ?? null);
export const hasConsent = () => getConsent() === "all";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (v: "all" | "essential") => {
    document.cookie = `${NAME}=${v}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cc-title"
      className="cookie-in fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl border-2 border-foreground bg-background shadow-[6px_6px_0_0_var(--foreground)] sm:inset-x-6">
      <div className="flex items-center justify-between border-b px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-2"><Cookie className="size-3.5 text-accent" /> {t("kicker")}</span>
        <span>{t("edition")}</span>
      </div>
      <div className="space-y-4 p-5">
        <h2 id="cc-title" className="text-3xl leading-tight">{t("title")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.rich("body", { link: (c) => <Link href="/privacy" className="text-foreground underline decoration-accent underline-offset-4">{c}</Link> })}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => choose("essential")}
            className="border border-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background">
            {t("essential")}
          </button>
          <button type="button" onClick={() => choose("all")}
            className="bg-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90">
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className }: { className?: string }) {
  const t = useTranslations("footer");
  return <button type="button" className={`uppercase ${className ?? ""}`} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>{t("cookies")}</button>;
}
