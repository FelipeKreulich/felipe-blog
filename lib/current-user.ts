import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Fonte única de "quem está logado": o JWT pode estar velho (conta apagada, nome/papel alterados,
// senha trocada), então sempre confere no banco. cache() = 1 consulta por request.
// sessionVersion: se o JWT foi emitido antes da última troca de senha / "sair de todos", é rejeitado.
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, passwordHash: true, sessionVersion: true, avatar: { select: { updatedAt: true } } },
  });
  if (!user || user.sessionVersion !== (session.user.sv ?? 0)) return null;
  return user;
});
