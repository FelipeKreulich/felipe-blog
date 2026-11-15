"use server";
import { db } from "@/lib/db";
import { subscribeEmail, type SubscribeState } from "@/lib/newsletter-core";

export type { SubscribeState };

// Formulário público: sem vínculo com conta.
export async function subscribe(_: SubscribeState, form: FormData): Promise<SubscribeState> {
  return subscribeEmail(form, null);
}

// Conclui o vínculo assinatura↔conta. Só via POST (botão na página), nunca ao abrir o link:
// scanners de e-mail que "clicam" em links não conseguem vincular nada.
export async function completeLink(token: string): Promise<{ ok: boolean }> {
  if (typeof token !== "string" || token.length < 20) return { ok: false };
  const sub = await db.subscriber.findUnique({ where: { linkToken: token } });
  if (!sub?.linkUserId || !sub.linkExpiresAt || sub.linkExpiresAt < new Date()) return { ok: false };
  await db.$transaction([
    db.subscriber.updateMany({ where: { userId: sub.linkUserId, NOT: { id: sub.id } }, data: { userId: null } }),
    db.subscriber.update({
      where: { id: sub.id },
      data: { confirmedAt: sub.confirmedAt ?? new Date(), userId: sub.linkUserId, linkUserId: null, linkToken: null, linkExpiresAt: null },
    }),
  ]);
  return { ok: true };
}
