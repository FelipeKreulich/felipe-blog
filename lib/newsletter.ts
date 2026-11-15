"use server";
import { z } from "zod";
import { Resend } from "resend";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export type SubscribeState = { status: "idle" | "ok" | "error"; message?: string };

const schema = z.object({
  email: z.email().max(254).transform((e) => e.trim().toLowerCase()),
  website: z.string().max(0).optional(), // honeypot: robôs preenchem, humanos não veem
});

export async function subscribe(_: SubscribeState, form: FormData): Promise<SubscribeState> {
  return subscribeEmail(form, null);
}

// linkUserId: pedido feito pelo perfil. O vínculo com a conta só acontece quando o dono do e-mail
// clicar no link; até lá nada muda, e a resposta é sempre a mesma (não revela se já assinava).
export async function subscribeEmail(form: FormData, linkUserId: string | null): Promise<SubscribeState> {
  const locale = (await getLocale()) as "pt" | "en";
  const t = await getTranslations({ locale, namespace: "newsletter" });
  const parsed = schema.safeParse({ email: form.get("email"), website: form.get("website") ?? "" });
  if (!parsed.success) return { status: "error", message: t("invalid") };

  const { email } = parsed.data;
  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing?.confirmedAt && !linkUserId) return { status: "ok", message: t("already") };

  const sub = existing
    ? (linkUserId ? await db.subscriber.update({ where: { id: existing.id }, data: { linkUserId } }) : existing)
    : await db.subscriber.create({ data: { email, locale, linkUserId } });
  const base = `${site.url}${locale === "pt" ? "" : "/en"}`;
  const link = `${base}/newsletter/confirm?token=${sub.token}`;

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
