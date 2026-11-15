import { db } from "@/lib/db";
import { PostEditor } from "@/components/admin/post-editor";

export default async function NewPost() {
  const tags = await db.tag.findMany({ orderBy: { namePt: "asc" } });
  return <PostEditor tags={tags} />;
}
