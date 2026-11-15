"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getCurrentUser as currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

const POST_PAGE = "/[locale]/posts/[slug]";


export async function toggleLike(postId: string): Promise<{ liked: boolean; count: number } | { error: "auth" | "not_found" }> {
  const user = await currentUser();
  if (!user) return { error: "auth" };
  if (!(await publishedPost(postId))) return { error: "not_found" };
  const key = { postId_userId: { postId, userId: user.id } };
  const existing = await db.like.findUnique({ where: key });
  if (existing) await db.like.delete({ where: key });
  else await db.like.create({ data: { postId, userId: user.id } });
  const count = await db.like.count({ where: { postId } });
  revalidatePath(POST_PAGE, "page");
  return { liked: !existing, count };
}

// Só posts existentes e publicados aceitam curtida/comentário (id ruim daria 500 pela FK; rascunho não é público).
const publishedPost = (id: string) =>
  db.post.findFirst({ where: { id, publishedAt: { not: null } }, select: { id: true } });

export type CommentState = { error?: string; ok?: number };

const commentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  body: z.string().trim().min(1).max(2000),
});

export async function addComment(_: CommentState, form: FormData): Promise<CommentState> {
  const t = await getTranslations("comments");
  const user = await currentUser();
  if (!user) return { error: t("needAuth") };

  const parsed = commentSchema.safeParse({
    postId: form.get("postId"), body: form.get("body"), parentId: form.get("parentId") || undefined,
  });
  if (!parsed.success) return { error: t("invalid") };

  // ponytail: limite simples por usuário (5/min) direto no banco; trocar por rate limit dedicado se virar alvo de spam
  const recent = await db.comment.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } } });
  if (recent >= 5) return { error: t("tooFast") };

  const { postId, parentId, body } = parsed.data;
  if (!(await publishedPost(postId))) return { error: t("postUnavailable") };
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId }, select: { postId: true, parentId: true } });
    if (!parent || parent.postId !== postId || parent.parentId) return { error: t("invalid") }; // só 1 nível de resposta
  }
  await db.comment.create({ data: { postId, parentId, body, userId: user.id } });
  revalidatePath(POST_PAGE, "page");
  return { ok: Date.now() };
}

export async function deleteComment(id: string) {
  const user = await currentUser();
  if (!user) return;
  const c = await db.comment.findUnique({ where: { id }, select: { userId: true, deletedAt: true, _count: { select: { replies: true } } } });
  if (!c || c.deletedAt || (c.userId !== user.id && user.role !== "ADMIN")) return;
  // Com respostas: soft delete (o delete em cascata levaria junto respostas de outras pessoas).
  if (c._count.replies > 0) await db.comment.update({ where: { id }, data: { body: "", deletedAt: new Date() } });
  else await db.comment.delete({ where: { id } });
  revalidatePath(POST_PAGE, "page");
}
