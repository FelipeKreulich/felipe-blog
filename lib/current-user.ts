import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Fonte única de "quem está logado": o JWT pode estar velho (conta apagada, nome/papel alterados),
// então sempre confere no banco. cache() = 1 consulta por request mesmo chamada várias vezes.
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, passwordHash: true, avatar: { select: { updatedAt: true } } },
  });
});
