import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "@/i18n/routing";
import { Avatar } from "@/components/site/avatar";
import { AvatarForm, DeleteAccountForm, NameForm, PasswordForm, SignOutEverywhere } from "@/components/profile/forms";

const CONTACT = "contacto.felipe.kreulich@gmail.com";

export async function generateMetadata({ params }: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "profile" });
  return { title: t("title"), robots: { index: false } };
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-10 md:grid-cols-[1fr_2fr] md:gap-14">
      <h2 className="flex items-baseline gap-4 text-3xl">
        <span className="font-heading text-accent tabular-nums">{n}</span>{title}
      </h2>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/[locale]/profile">) {
  const { locale } = await params;
  const passwordChanged = (await searchParams).password === "changed";
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) return redirect({ href: { pathname: "/signin", query: { next: "/profile" } }, locale });

  const t = await getTranslations("profile");
  const since = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { month: "long", year: "numeric" }).format(user.createdAt);
  const subject = encodeURIComponent(t("emailSubject"));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div className="flex items-center gap-6">
          <Avatar userId={user.id} name={user.name} version={user.avatar?.updatedAt} size={88} />
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t("kicker")}</p>
            <h1 className="text-5xl leading-none sm:text-6xl">{user.name ?? user.email}</h1>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("since", { date: since })}</p>
          </div>
        </div>
      </header>

      <Section n="01" title={t("photo")}>
        <AvatarForm hasAvatar={!!user.avatar}
          preview={<Avatar userId={user.id} name={user.name} version={user.avatar?.updatedAt} size={96} />} />
      </Section>

      <Section n="02" title={t("details")}>
        <div className="space-y-8">
          <NameForm name={user.name ?? ""} />
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("email")}</span>
            <p className="border-b border-dashed py-2 text-lg text-muted-foreground">{user.email}</p>
            <p className="flex gap-3 border-l-2 border-accent bg-card p-4 text-sm leading-relaxed">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                {t.rich("emailNotice", {
                  mail: () => <a href={`mailto:${CONTACT}?subject=${subject}`} className="underline decoration-accent underline-offset-4">{CONTACT}</a>,
                })}
              </span>
            </p>
          </div>
        </div>
      </Section>

      <Section n="03" title={t("security")}>
        <div className="space-y-8">
          {passwordChanged && <p role="status" className="border-l-2 border-accent bg-card p-4 text-sm">{t("passwordSaved")}</p>}
          <PasswordForm />
          <SignOutEverywhere />
        </div>
      </Section>

      <Section n="04" title={t("dangerZone")}>
        {user.role === "ADMIN"
          ? <p className="text-sm text-muted-foreground">{t("adminCantDelete")}</p>
          : <DeleteAccountForm />}
      </Section>
    </div>
  );
}
