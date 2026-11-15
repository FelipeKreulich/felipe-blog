import { setRequestLocale } from "next-intl/server";
import { LegalPage, legalMetadata } from "@/components/site/legal-page";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">) {
  return legalMetadata("terms", (await params).locale);
}

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage pageKey="terms" locale={locale} />;
}
