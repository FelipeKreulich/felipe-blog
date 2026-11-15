"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { signIn, signOut, credentialsSchema } from "@/auth";
import { db } from "@/lib/db";
import { safePath } from "@/lib/safe-path";
import { clientIp, hit, LIMITS } from "@/lib/rate-limit";

// Devolve os campos digitados para o form não perder o que o leitor escreveu (React 19 reseta o form após a action).
export type AuthState = { error?: string; email?: string; name?: string };

// Só aceita caminhos internos como destino pós-login (evita open redirect) e mantém o idioma atual.
async function safeNext(v: FormDataEntryValue | null) {
  const path = safePath(v);
  const locale = await getLocale();
  if (locale === "pt" || path === `/${locale}` || path.startsWith(`/${locale}/`)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export async function signInAction(_: AuthState, form: FormData): Promise<AuthState> {
  const t = await getTranslations("auth");
  try {
    await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirectTo: await safeNext(form.get("next")) });
  } catch (e) {
    if (e instanceof AuthError) {
      const email = String(form.get("email") ?? "");
      const m = "code" in e && typeof e.code === "string" ? e.code.match(/^rate_limited:(\d+)$/) : null;
      if (m) return { error: t("tooMany", { minutes: Math.max(1, Math.ceil(Number(m[1]) / 60)) }), email };
      return { error: t("invalidLogin"), email };
    }
    throw e; // redirect do Next precisa propagar
  }
  return {};
}

const signUpSchema = credentialsSchema.extend({ name: z.string().trim().min(2).max(60) });

export async function signUpAction(_: AuthState, form: FormData): Promise<AuthState> {
  const t = await getTranslations("auth");
  const keep = { email: String(form.get("email") ?? ""), name: String(form.get("name") ?? "") };
  const limited = await hit(`signup:ip:${await clientIp()}`, LIMITS.signupIp.limit, LIMITS.signupIp.window);
  if (!limited.ok) return { ...keep, error: t("tooMany", { minutes: Math.max(1, Math.ceil(limited.retryAfter / 60)) }) };
  const parsed = signUpSchema.safeParse({ name: form.get("name"), email: form.get("email"), password: form.get("password") });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ...keep, error: field === "password" ? t("weakPassword") : field === "name" ? t("invalidName") : t("invalidEmail") };
  }
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { ...keep, error: t("emailTaken") };

  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  await signIn("credentials", { email, password, redirectTo: await safeNext(form.get("next")) });
  return {};
}

export async function signOutAction() {
  const locale = await getLocale();
  await signOut({ redirectTo: locale === "pt" ? "/" : `/${locale}` });
}
