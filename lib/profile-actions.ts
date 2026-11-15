"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { sniffImage as sniff } from "@/lib/image";
import { deleteUserAccount } from "@/lib/account";
import { subscribeEmail } from "@/lib/newsletter-core";
import { hit, LIMITS, release } from "@/lib/rate-limit";

export type ProfileState = { ok?: string; error?: string };

const me = getCurrentUser;

// Confere a senha atual com limite por usuário: reserva antes do bcrypt e devolve se acertar (conta só falhas).
async function checkPassword(userId: string, password: string, hash: string, t: (k: string, v?: Record<string, number>) => string): Promise<string | null> {
  const key = `pw:${userId}`;
  const r = await hit(key, LIMITS.pwReprompt.limit, LIMITS.pwReprompt.window);
  if (!r.ok) {
    await release(key, r.resetAt); // tentativa barrada não conta
    return t("tooManyAttempts", { minutes: Math.ceil(r.retryAfter / 60) });
  }
  if (!(await bcrypt.compare(password, hash))) return t("wrongPassword");
  await release(key, r.resetAt);
  return null;
}

export async function updateName(_: ProfileState, form: FormData): Promise<ProfileState> {
  const t = await getTranslations("profile");
  const user = await me();
  if (!user) return { error: t("needAuth") };
  const parsed = z.string().trim().min(2).max(60).safeParse(form.get("name"));
  if (!parsed.success) return { error: t("invalidName") };
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data } });
  revalidatePath("/", "layout");
  return { ok: t("nameSaved") };
}

const passwordSchema = z.object({
  current: z.string().min(1).max(128),
  next: z.string().min(8).max(128),
  confirm: z.string(),
}).refine((v) => v.next === v.confirm, { path: ["confirm"] });

export async function changePassword(_: ProfileState, form: FormData): Promise<ProfileState> {
  const t = await getTranslations("profile");
  const user = await me();
  if (!user?.passwordHash) return { error: t("needAuth") };
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { error: field === "confirm" ? t("passwordMismatch") : t("weakPassword") };
  }
  const pwError = await checkPassword(user.id, parsed.data.current, user.passwordHash, t);
  if (pwError) return { error: pwError };
  // Nova senha + nova versão de sessão: todos os outros aparelhos caem.
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12), sessionVersion: { increment: 1 } },
  });
  // Reemite a sessão deste aparelho com a versão nova (sem obrigar a entrar de novo) e redireciona:
  // a renderização dentro desta mesma request ainda leria o cookie antigo e pareceria deslogada.
  const locale = await getLocale();
  await signIn("credentials", {
    email: user.email, password: parsed.data.next,
    redirectTo: `${locale === "pt" ? "" : `/${locale}`}/profile?password=changed`,
  });
  return {};
}

const MAX_BYTES = 300 * 1024;

export async function uploadAvatar(_: ProfileState, form: FormData): Promise<ProfileState> {
  const t = await getTranslations("profile");
  const user = await me();
  if (!user) return { error: t("needAuth") };
  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: t("noFile") };
  if (file.size > MAX_BYTES) return { error: t("fileTooBig") };
  const data = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(data);
  // Só WebP: o cliente sempre reencoda via canvas (sem EXIF/GPS); outro formato aqui é chamada direta.
  if (mime !== "image/webp") return { error: t("badFile") };
  await db.avatar.upsert({ where: { userId: user.id }, update: { data, mime }, create: { userId: user.id, data, mime } });
  revalidatePath("/", "layout");
  return { ok: t("avatarSaved") };
}

export async function removeAvatar(): Promise<void> {
  const user = await me();
  if (!user) return;
  await db.avatar.deleteMany({ where: { userId: user.id } });
  revalidatePath("/", "layout");
}

// Apaga a conta. Comentários sem respostas somem; com respostas viram "[removido]" e ficam
// anônimos (userId -> null via onDelete: SetNull), preservando as respostas de outras pessoas.
export async function deleteAccount(_: ProfileState, form: FormData): Promise<ProfileState> {
  const t = await getTranslations("profile");
  const user = await me();
  if (!user?.passwordHash) return { error: t("needAuth") };
  if (user.role === "ADMIN") return { error: t("adminCantDelete") };
  if (form.get("confirm") !== "on") return { error: t("confirmRequired") };
  const password = form.get("password");
  if (typeof password !== "string" || !password) return { error: t("wrongPassword") };
  const pwError = await checkPassword(user.id, password, user.passwordHash, t);
  if (pwError) return { error: pwError };

  await deleteUserAccount(user.id);
  const locale = await getLocale();
  await signOut({ redirectTo: `${locale === "pt" ? "" : `/${locale}`}/?account=deleted` });
  return {};
}

// "Sair de todos os dispositivos": invalida todas as sessões (inclusive esta) e vai para o login.
export async function signOutEverywhere(): Promise<void> {
  const user = await me();
  if (!user) return;
  await db.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  const locale = await getLocale();
  await signOut({ redirectTo: `${locale === "pt" ? "" : `/${locale}`}/signin` });
}

// Newsletter pelo perfil. O e-mail da conta não é verificado, então o perfil só enxerga e cancela
// a assinatura VINCULADA a esta conta (vínculo feito quando o dono do e-mail clicou no link).
export async function profileNewsletter(subscribeIt: boolean): Promise<ProfileState> {
  const t = await getTranslations("profile");
  const user = await me();
  if (!user) return { error: t("needAuth") };
  if (!subscribeIt) {
    await db.subscriber.deleteMany({ where: { userId: user.id } });
    revalidatePath("/", "layout");
    return { ok: t("nlCancelled") };
  }
  const fd = new FormData();
  fd.set("email", user.email);
  const r = await subscribeEmail(fd, user.id);
  revalidatePath("/", "layout");
  return r.status === "error" ? { error: r.message } : { ok: t("nlCheckInbox") };
}
