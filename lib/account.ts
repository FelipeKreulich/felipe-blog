import { db } from "@/lib/db";

// Remove uma conta preservando a conversa: comentários sem respostas somem; os com respostas
// viram "[removido]" e ficam anônimos (userId -> null por onDelete: SetNull). Likes/avatar em cascata.
export function deleteUserAccount(userId: string) {
  return db.$transaction([
    db.comment.deleteMany({ where: { userId, replies: { none: {} } } }),
    db.comment.updateMany({ where: { userId }, data: { body: "", deletedAt: new Date() } }),
    db.user.delete({ where: { id: userId } }),
  ]);
}
