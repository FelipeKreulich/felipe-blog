import "server-only";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { hit, clientIp } from "@/lib/rate-limit";

// Núcleo da inscrição. Fica FORA de arquivos "use server" de propósito: lá, toda função exportada
// vira endpoint chamável pelo navegador, e linkUserId não pode vir do cliente.
export type SubscribeState = { status: "idle" | "ok" | "error"; message?: string };

const schema = z.object({
  email: z.email().max(254).transform((e) => e.trim().toLowerCase()),
  website: z.string().max(0).optional(), // honeypot: robôs preenchem, humanos não veem
});

// linkUserId: pedido feito pelo perfil. O vínculo com a conta só acontece quando o dono do e-mail
// clicar no link; até lá nada muda, e a resposta é sempre a mesma (não revela se já assinava).
export async function subscribeEmail(form: FormData, linkUserId: string | null): Promise<SubscribeState> {
  const locale = (await getLocale()) as "pt" | "en";
  const t = await getTranslations({ locale, namespace: "newsletter" });
  const parsed = schema.safeParse({ email: form.get("email"), website: form.get("website") ?? "" });
  if (!parsed.success) return { status: "error", message: t("invalid") };

  const { email } = parsed.data;
  // limite por IP (principal) em toda tentativa; mensagem genérica, não revela nada sobre o endereço
  if (!(await hit(`nl:ip:${await clientIp()}`, 5, 3600)).ok) return { status: "error", message: t("rateLimited") };

  const existing = await db.subscriber.findUnique({ where: { email } });
  // já confirmado: mesma resposta de sempre e nenhum e-mail novo (evita enumeração)
  if (existing?.confirmedAt && !linkUserId) return { status: "ok", message: t("checkInbox") };

  // limite por destinatário só quando um e-mail vai mesmo sair (protege a vítima de bombardeio).
  // Pedido do próprio perfil usa chave separada: tentativas anônimas não bloqueiam o dono logado.
  const emailKey = linkUserId ? `nl:email:${email}:user:${linkUserId}` : `nl:email:${email}`;
  if (!(await hit(emailKey, 3, 3600)).ok) return { status: "error", message: t("rateLimited") };

  // Pedido de vínculo (perfil): token próprio, de uso único, que expira em 24h. Um pedido novo
  // substitui o anterior (o token velho deixa de valer). Nunca reusa o token de confirmar/cancelar.
  const linkData = linkUserId
    ? { linkUserId, linkToken: randomBytes(24).toString("base64url"), linkExpiresAt: new Date(Date.now() + 864e5) }
    : {};
  const sub = existing
    ? (linkUserId ? await db.subscriber.update({ where: { id: existing.id }, data: linkData }) : existing)
    : await db.subscriber.create({ data: { email, locale, token: randomBytes(24).toString("base64url"), ...linkData } });
  const base = `${site.url}${locale === "pt" ? "" : "/en"}`;
  const link = sub.linkToken && linkUserId
    ? `${base}/newsletter/link?token=${sub.linkToken}`
    : `${base}/newsletter/confirm?token=${sub.token}`;

  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: `${site.name} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: t("emailSubject"),
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;color:#2b2a28;background:#f3eee3;padding:32px">
        <h1 style="font-weight:normal;font-size:28px;margin:0 0 16px">${site.name}</h1>
        <p style="font-size:16px;line-height:1.6">${t("emailBody")}</p>
        <p style="margin:28px 0"><a href="${link}" style="background:#2b2a28;color:#f3eee3;padding:12px 20px;text-decoration:none;font-family:monospace;text-transform:uppercase;font-size:12px;letter-spacing:1px">${t("emailCta")}</a></p>
        <p style="font-size:12px;color:#6b665c">${t("emailIgnore")}</p></div>`,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[newsletter] falha ao enviar:", e);
    return { status: "error", message: t("sendFailed") };
  }
  return { status: "ok", message: t("checkInbox") };
}

