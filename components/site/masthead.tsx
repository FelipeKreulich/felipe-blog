import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { Clock } from "./clock";
import { UserMenu } from "./user-menu";

// ponytail: nº da edição = dias desde o lançamento; troque se quiser contar por post
const editionNumber = () => Math.floor((Date.now() - Date.UTC(2026, 10, 15)) / 864e5) + 1;

export async function Masthead() {
  const locale = await getLocale();
  const t = await getTranslations();
  const today = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
  const edition = editionNumber();

  return (
    <header className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex items-center justify-between py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="hidden items-center gap-2 sm:flex">{today}<span aria-hidden className="text-accent">·</span><Clock /></span>
        <span className="sm:hidden"><Clock /></span>
        <div className="flex items-center gap-3">
          <LocaleSwitch />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <div className="border-y border-foreground/80 py-5 sm:py-7">
        <Link href="/" aria-label="The Commit Times" className="mx-auto block w-fit">
          <Logo className="h-9 w-auto sm:h-16" />
        </Link>
      </div>
      <div className="flex items-center justify-between border-b py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="hidden sm:inline">{t("site.edition")} Nº {edition}</span>
        <span className="mx-auto sm:mx-0">{t("site.tagline")}</span>
        <span className="hidden sm:inline">PT · EN</span>
      </div>
    </header>
  );
}
