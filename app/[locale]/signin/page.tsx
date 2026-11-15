import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";
import { Link, redirect } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { safePath } from "@/lib/safe-path";

export async function generateMetadata({ params }: PageProps<"/[locale]/signin">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "auth" });
  return { title: t("signinTitle"), robots: { index: false } };
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/signin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const n = (await searchParams).next;
  const next = safePath(n);
  if (await getCurrentUser()) redirect({ href: next, locale });
  const t = await getTranslations("auth");

  return (
    <AuthShell kicker={t("signinKicker")} title={t("signinTitle")} lead={t("signinLead")}>
      <AuthForm mode="signin" next={next} />
      <p className="text-sm text-muted-foreground">
        {t("signinSwitch")}{" "}
        <Link href={{ pathname: "/signup", query: next !== "/" ? { next } : {} }} className="text-foreground underline decoration-accent underline-offset-4">
          {t("signupLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
