import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getPage, PAGE_KEYS, PAGE_LABEL, type PageKey } from "@/lib/pages";
import { PageEditor } from "@/components/admin/page-editor";

export default async function EditPage({ params }: PageProps<"/[locale]/admin/pages/[key]">) {
  await requireAdmin();
  const { key } = await params;
  if (!PAGE_KEYS.includes(key as PageKey)) notFound();
  const [pt, en] = await Promise.all([getPage(key as PageKey, "pt"), getPage(key as PageKey, "en")]);
  const doc = (p: typeof pt, fallback: string) => ({ title: p?.title ?? fallback, content: p?.content ?? "" });
  return (
    <div className="space-y-6">
      <h2 className="text-3xl">{PAGE_LABEL[key as PageKey]}</h2>
      <PageEditor pageKey={key} pt={doc(pt, PAGE_LABEL[key as PageKey])} en={doc(en, key === "terms" ? "Terms and conditions" : "Privacy policy")} />
    </div>
  );
}
