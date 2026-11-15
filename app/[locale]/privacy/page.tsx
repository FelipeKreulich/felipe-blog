import { setRequestLocale } from "next-intl/server";
import { LegalPage, legalMetadata } from "@/components/site/legal-page";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  return legalMetadata("privacy", (await params).locale);
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage pageKey="privacy" locale={locale} />;
}
