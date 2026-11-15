"use server";
import { z } from "zod";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin, slugify } from "@/lib/admin";
import { renderMarkdown } from "@/lib/markdown";
import { sniffImage } from "@/lib/image";
import { site } from "@/lib/site";
import { deleteUserAccount } from "@/lib/account";
import bcrypt from "bcryptjs";

export type AdminState = { ok?: string; error?: string };

const refresh = () => revalidatePath("/", "layout");

// ---------- posts ----------
const lang = z.object({
  title: z.string().trim().min(1, "título").max(160),
  slug: z.string().trim().max(80).transform(slugify),
  excerpt: z.string().trim().min(1, "resumo").max(400),
  content: z.string().min(1, "conteúdo").max(100_000),
});
const postSchema = z.object({
  id: z.string().optional(),
  coverImage: z.string().max(300).optional(),
  tags: z.array(z.string()).max(10),
  intent: z.enum(["draft", "publish", "save"]),
  pt: lang,
  en: lang.partial().optional(),
});

function readPost(form: FormData) {
  const l = (k: "pt" | "en") => ({
    title: String(form.get(`${k}.title`) ?? ""), slug: String(form.get(`${k}.slug`) ?? ""),
    excerpt: String(form.get(`${k}.excerpt`) ?? ""), content: String(form.get(`${k}.content`) ?? ""),
  });
  // EN opcional: campos vazios viram ausentes (senão o min(1) do schema reprova "")
  const en = Object.fromEntries(Object.entries(l("en")).filter(([, v]) => v.trim() !== ""));
  return {
    id: (form.get("id") as string) || undefined,
    coverImage: (form.get("coverImage") as string) || undefined,
    tags: form.getAll("tags").map(String),
    intent: form.get("intent"),
    pt: l("pt"),
    en,
  };
}

export async function savePost(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const parsed = postSchema.safeParse(readPost(form));
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { error: `Campo inválido: ${i.path.join(".")} ${i.message ? `(${i.message})` : ""}` };
  }
  const { id, coverImage, tags, intent, pt, en } = parsed.data;
  if (coverImage && !/^\/(covers|media)\//.test(coverImage)) return { error: "Capa inválida." };

  const ptRow = { ...pt, slug: pt.slug || slugify(pt.title) };
  // EN é opcional: só entra se título, resumo e conteúdo estiverem preenchidos.
  const enFull = en?.title && en.excerpt && en.content;
  const enRow = enFull ? { title: en.title!, excerpt: en.excerpt!, content: en.content!, slug: en.slug || slugify(en.title!) } : null;
  if (!ptRow.slug || (enRow && !enRow.slug)) return { error: "Slug inválido." };

  // slug é único por idioma
  for (const [locale, row] of [["pt", ptRow], ["en", enRow]] as const) {
    if (!row) continue;
    const clash = await db.postTranslation.findUnique({ where: { locale_slug: { locale, slug: row.slug } }, select: { postId: true } });
    if (clash && clash.postId !== id) return { error: `O slug "${row.slug}" já existe em ${locale.toUpperCase()}.` };
  }

  const current = id ? await db.post.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
  const publishedAt = intent === "publish" ? current?.publishedAt ?? new Date() : intent === "draft" ? null : current?.publishedAt ?? null;

  const translations = [{ locale: "pt" as const, ...ptRow }, ...(enRow ? [{ locale: "en" as const, ...enRow }] : [])];
  const post = await db.$transaction(async (tx) => {
    const p = id
      ? await tx.post.update({ where: { id }, data: { coverImage: coverImage ?? null, publishedAt, tags: { set: tags.map((t) => ({ id: t })) } } })
      : await tx.post.create({ data: { authorId: admin.id, coverImage, publishedAt, tags: { connect: tags.map((t) => ({ id: t })) } } });
    for (const t of translations) {
      await tx.postTranslation.upsert({
        where: { postId_locale: { postId: p.id, locale: t.locale } },
        update: { slug: t.slug, title: t.title, excerpt: t.excerpt, content: t.content },
        create: { postId: p.id, ...t },
      });
    }
    if (!enRow) await tx.postTranslation.deleteMany({ where: { postId: p.id, locale: "en" } });
    return p;
  });

  refresh();
  if (!id) redirect(`/admin/posts/${post.id}?saved=1`);
  return { ok: intent === "publish" ? "Publicado." : intent === "draft" ? "Salvo como rascunho." : "Alterações salvas." };
}

export async function deletePost(id: string) {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  refresh();
  redirect("/admin");
}

export async function previewMarkdown(md: string) {
  await requireAdmin();
  return renderMarkdown(md.slice(0, 100_000));
}

const MAX_COVER = 2 * 1024 * 1024;
export async function uploadCover(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Escolha uma imagem." };
  if (file.size > MAX_COVER) return { error: "Imagem acima de 2MB." };
  const data = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(data);
  if (!mime) return { error: "Formato não suportado (PNG, JPG ou WebP)." };
  const m = await db.media.create({ data: { data, mime } });
  return { url: `/media/${m.id}` };
}

// ---------- comentários ----------
export async function adminDeleteComment(id: string) {
  await requireAdmin();
  const c = await db.comment.findUnique({ where: { id }, select: { _count: { select: { replies: true } } } });
  if (!c) return;
  if (c._count.replies > 0) await db.comment.update({ where: { id }, data: { body: "", deletedAt: new Date() } });
  else await db.comment.delete({ where: { id } });
  refresh();
}

// ---------- tags ----------
const tagSchema = z.object({ namePt: z.string().trim().min(1).max(40), nameEn: z.string().trim().min(1).max(40) });

export async function createTag(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = tagSchema.safeParse({ namePt: form.get("namePt"), nameEn: form.get("nameEn") });
  if (!parsed.success) return { error: "Preencha o nome em PT e EN." };
  const slug = slugify(parsed.data.nameEn);
  if (await db.tag.findUnique({ where: { slug } })) return { error: `A tag "${slug}" já existe.` };
  await db.tag.create({ data: { ...parsed.data, slug } });
  refresh();
  return { ok: "Tag criada." };
}

export async function deleteTag(id: string) {
  await requireAdmin();
  await db.tag.delete({ where: { id } });
  refresh();
}

// ---------- newsletter ----------
export async function sendNewsletter(postId: string): Promise<AdminState> {
  await requireAdmin();
  const post = await db.post.findUnique({ where: { id: postId }, include: { translations: true } });
  if (!post?.publishedAt) return { error: "Só é possível enviar posts publicados." };
  if (post.newsletterSentAt) return { error: "Esta edição já foi enviada." };

  // Marca antes de enviar: se dois cliques chegarem juntos, só um passa.
  const claimed = await db.post.updateMany({ where: { id: postId, newsletterSentAt: null }, data: { newsletterSentAt: new Date() } });
  if (claimed.count === 0) return { error: "Esta edição já foi enviada." };

  const subs = await db.subscriber.findMany({ where: { confirmedAt: { not: null } } });
  if (subs.length === 0) return { ok: "Nenhum assinante confirmado ainda." };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const tr = (l: string) => post.translations.find((t) => t.locale === l) ?? post.translations.find((t) => t.locale === "pt")!;
  const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
  const emails = subs.map((s) => {
    const t = tr(s.locale);
    const base = `${site.url}${t.locale === "pt" ? "" : "/en"}`;
    const read = s.locale === "pt" ? "Ler a edição" : "Read the edition";
    const unsub = s.locale === "pt" ? "Cancelar assinatura" : "Unsubscribe";
    return {
      from: `${site.name} <${process.env.FROM_EMAIL}>`,
      to: s.email,
      subject: t.title,
      headers: { "List-Unsubscribe": `<${base}/newsletter/unsubscribe?token=${s.token}>` },
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2b2a28;background:#f3eee3;padding:32px">
        <p style="font-family:monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#a8341f;margin:0">${site.name}</p>
        <h1 style="font-weight:normal;font-size:30px;line-height:1.1;margin:12px 0">${esc(t.title)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#6b665c">${esc(t.excerpt)}</p>
        <p style="margin:28px 0"><a href="${base}/posts/${t.slug}" style="background:#2b2a28;color:#f3eee3;padding:12px 20px;text-decoration:none;font-family:monospace;text-transform:uppercase;font-size:12px;letter-spacing:1px">${read}</a></p>
        <p style="font-size:12px;color:#6b665c"><a href="${base}/newsletter/unsubscribe?token=${s.token}" style="color:#6b665c">${unsub}</a></p></div>`,
    };
  });

  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const { error } = await resend.batch.send(emails.slice(i, i + 100));
    if (error) {
      if (sent === 0) await db.post.update({ where: { id: postId }, data: { newsletterSentAt: null } }); // nada saiu: libera reenvio
      return { error: `Falha no envio após ${sent} e-mails: ${error.message}` };
    }
    sent += Math.min(100, emails.length - i);
  }
  return { ok: `Enviado para ${sent} assinante(s).` };
}

// ---------- páginas institucionais ----------
const pageSchema = z.object({
  key: z.enum(["terms", "privacy"]),
  locale: z.enum(["pt", "en"]),
  title: z.string().trim().min(1).max(160),
  content: z.string().min(1).max(100_000),
});

export async function savePage(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = pageSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Preencha título e conteúdo." };
  const { key, locale, title, content } = parsed.data;
  await db.page.upsert({ where: { key_locale: { key, locale } }, update: { title, content }, create: { key, locale, title, content } });
  refresh();
  return { ok: `Salvo (${locale.toUpperCase()}).` };
}

// ---------- usuários ----------
const userEditSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(60),
  email: z.email().max(254).transform((e) => e.trim().toLowerCase()),
  role: z.enum(["ADMIN", "READER"]),
});

export async function adminUpdateUser(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const parsed = userEditSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Verifique nome (2–60) e e-mail." };
  const { id, name, email, role } = parsed.data;
  const target = await db.user.findUnique({ where: { id }, select: { role: true, email: true } });
  if (!target) return { error: "Usuário não encontrado." };

  if (role !== "ADMIN" && target.role === "ADMIN") {
    if (id === admin.id) return { error: "Você não pode remover o seu próprio acesso de admin." };
    if ((await db.user.count({ where: { role: "ADMIN" } })) <= 1) return { error: "Precisa existir pelo menos um admin." };
  }
  if (email !== target.email && (await db.user.findUnique({ where: { email } }))) return { error: "Já existe uma conta com este e-mail." };

  await db.user.update({
    where: { id },
    // trocar cargo ou e-mail invalida as sessões da pessoa (o JWT guarda o estado antigo)
    data: { name, email, role, ...(role !== target.role || email !== target.email ? { sessionVersion: { increment: 1 } } : {}) },
  });
  refresh();
  return { ok: "Usuário atualizado." };
}

export async function adminSetPassword(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const password = z.string().min(8).max(128).safeParse(form.get("password"));
  if (!password.success) return { error: "A senha precisa ter de 8 a 128 caracteres." };
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password.data, 12), sessionVersion: { increment: 1 } } });
  return { ok: "Senha definida. As sessões da pessoa foram encerradas." };
}

export async function adminSignOutUser(id: string): Promise<AdminState> {
  await requireAdmin();
  await db.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
  return { ok: "Sessões encerradas." };
}

export async function adminDeleteUser(id: string): Promise<AdminState> {
  const admin = await requireAdmin();
  if (id === admin.id) return { error: "Você não pode excluir a sua própria conta por aqui." };
  const target = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { error: "Usuário não encontrado." };
  if (target.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN" } })) <= 1) return { error: "Precisa existir pelo menos um admin." };
  const owned = await db.post.count({ where: { authorId: id } });
  if (owned > 0) return { error: `Esta conta é autora de ${owned} post(s). Reatribua ou apague os posts antes.` };
  await deleteUserAccount(id);
  refresh();
  redirect("/admin/users?deleted=1");
}
