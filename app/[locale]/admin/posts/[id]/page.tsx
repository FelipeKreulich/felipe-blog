import { requireAdmin } from "@/lib/admin";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostEditor } from "@/components/admin/post-editor";

export default async function EditPost({ params, searchParams }: PageProps<"/[locale]/admin/posts/[id]">) {
  await requireAdmin(); // não depender só do layout: página e layout renderizam em paralelo
  const { id } = await params;
  const [post, tags] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { translations: true, tags: { select: { id: true } } } }),
    db.tag.findMany({ orderBy: { namePt: "asc" } }),
  ]);
  if (!post) notFound();
  const tr = (l: "pt" | "en") => post.translations.find((t) => t.locale === l);
  return (
    <PostEditor
      tags={tags}
      justCreated={(await searchParams).saved === "1"}
      post={{
        id: post.id, coverImage: post.coverImage, published: !!post.publishedAt, tagIds: post.tags.map((t) => t.id),
        pt: tr("pt") ?? null, en: tr("en") ?? null,
      }}
    />
  );
}
