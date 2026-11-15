import { getTranslations } from "next-intl/server";
import { Coffee, Rss } from "lucide-react";
import { Github, Linkedin } from "./brand-icons";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/logo";
import { LocaleSwitch } from "./locale-switch";
import { site } from "@/lib/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const social = [
    { href: site.github, label: "GitHub", Icon: Github },
    { href: site.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: "/feed.xml", label: "RSS", Icon: Rss },
  ].filter((s) => s.href);
  const col = "space-y-3 font-mono text-[11px] uppercase tracking-wider";
  const link = "text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6">
      <div className="border-t-2 border-foreground pt-10">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div className="space-y-4">
            <Logo className="h-8 w-auto" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t("about")}</p>
          </div>

          <nav aria-label={t("sections")} className={col}>
            <p>{t("sections")}</p>
            <ul className="space-y-2">
              <li><Link href="/" className={link}>{t("home")}</Link></li>
              <li><Link href="/posts" className={link}>{t("archive")}</Link></li>
              <li><a href="/feed.xml" className={link}>RSS</a></li>
            </ul>
          </nav>

          <div className={col}>
            <p>{t("follow")}</p>
            <ul className="space-y-2">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 ${link}`}>
                    <Icon className="size-3.5" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-wider">{t("support")}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("supportBody")}</p>
            <a href={site.buyMeACoffee} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90">
              <Coffee className="size-3.5 transition-transform group-hover:-rotate-12" /> {t("coffee")}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t py-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>{t.rich("printed", { heart: () => <span className="text-accent">♥</span> })}</span>
          <LocaleSwitch />
        </div>
      </div>
    </footer>
  );
}
