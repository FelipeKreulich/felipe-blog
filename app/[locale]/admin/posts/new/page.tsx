import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { PostEditor } from "@/components/admin/post-editor";

export default async function NewPost() {
  await requireAdmin(); // não depender só do layout: página e layout renderizam em paralelo
  const tags = await db.tag.findMany({ orderBy: { namePt: "asc" } });
  return <PostEditor tags={tags} />;
}
