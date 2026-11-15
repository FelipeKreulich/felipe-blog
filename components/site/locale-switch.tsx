"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <nav aria-label={t("language")} className="flex items-center gap-1 font-mono text-xs uppercase">
      {(["pt", "en"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground aria-[current]:underline aria-[current]:decoration-accent aria-[current]:underline-offset-4"
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}
