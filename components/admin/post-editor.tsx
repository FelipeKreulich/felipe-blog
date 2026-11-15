"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ExternalLink, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { deletePost, previewMarkdown, savePost, uploadCover, type AdminState } from "@/lib/admin-actions";
import { Badge, btnAccent, btnGhost, btnSolid, input, label } from "./ui";

type Lang = { title: string; slug: string; excerpt: string; content: string };
type Tag = { id: string; namePt: string };
type PostData = { id: string; coverImage: string | null; published: boolean; tagIds: string[]; pt: Lang | null; en: Lang | null };

const empty: Lang = { title: "", slug: "", excerpt: "", content: "" };
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Reduz a capa no navegador (máx. 1600px de largura, WebP): upload leve, sem lib.
async function toWebp(file: File, max = 1600): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / bmp.width);
  const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/webp", 0.85));
  return new File([blob], "cover.webp", { type: "image/webp" });
}

function LangFields({ k, value, onChange, required }: { k: "pt" | "en"; value: Lang; onChange: (v: Lang) => void; required: boolean }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [loading, start] = useTransition();
  // slug segue o título até ser editado à mão
  const [slugTouched, setSlugTouched] = useState(!!value.slug);
  const set = (patch: Partial<Lang>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <label className="block space-y-1">
        <span className={label}>Título</span>
        <input name={`${k}.title`} value={value.title} required={required} maxLength={160}
          onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
          className={`${input} font-heading text-3xl`} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Slug · /posts/{value.slug || "…"}</span>
        <input name={`${k}.slug`} value={value.slug} maxLength={80}
          onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }}
          className={`${input} font-mono text-sm`} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Resumo ({value.excerpt.length}/400)</span>
        <textarea name={`${k}.excerpt`} value={value.excerpt} required={required} maxLength={400} rows={2}
          onChange={(e) => set({ excerpt: e.target.value })} className={`${input} resize-y`} />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={label}>Conteúdo (Markdown)</span>
          <div className="flex gap-1 font-mono text-[11px] uppercase tracking-wider">
            {(["write", "preview"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={tab === t}
                onClick={() => { setTab(t); if (t === "preview") start(async () => setHtml(await previewMarkdown(value.content))); }}
                className="px-3 py-1 text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">
                {t === "write" ? "Escrever" : "Visualizar"}
              </button>
            ))}
          </div>
        </div>
        <textarea name={`${k}.content`} value={value.content} required={required} rows={22}
          onChange={(e) => set({ content: e.target.value })} hidden={tab !== "write"}
          className="w-full resize-y border bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus:border-accent" />
        {tab === "preview" && (
          <div className="min-h-64 border p-6">
            {loading ? <Loader2 className="size-4 animate-spin" />
              : <div className="article prose max-w-none" dangerouslySetInnerHTML={{ __html: html || "<p><em>Nada para visualizar.</em></p>" }} />}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostEditor({ post, tags, justCreated }: { post?: PostData; tags: Tag[]; justCreated?: boolean }) {
  // Submit manual (não <form action>): o React 19 faz form.reset() após a action, o que desmarca
  // checkboxes no DOM mesmo controlados e o próximo envio perderia as tags.
  const [state, setState] = useState<AdminState>(justCreated ? { ok: "Post criado." } : {});
  const [pending, startSave] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startSave(async () => setState(await savePost(state, fd)));
  };
  const [pt, setPt] = useState<Lang>(post?.pt ?? empty);
  const [en, setEn] = useState<Lang>(post?.en ?? empty);
  const [langTab, setLangTab] = useState<"pt" | "en">("pt");
  const [cover, setCover] = useState(post?.coverImage ?? "");
  const [tagIds, setTagIds] = useState<string[]>(post?.tagIds ?? []);
  const [coverErr, setCoverErr] = useState("");
  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    startUpload(async () => {
      setCoverErr("");
      try {
        const fd = new FormData();
        fd.set("file", await toWebp(f));
        const r = await uploadCover(fd);
        if (r.url) setCover(r.url); else setCoverErr(r.error ?? "Falha no upload.");
      } catch { setCoverErr("Não foi possível ler a imagem."); }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_300px]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="coverImage" value={cover} />

      <div className="space-y-6">
        <div className="flex gap-1 border-b font-mono text-[11px] uppercase tracking-wider">
          {(["pt", "en"] as const).map((l) => (
            <button key={l} type="button" aria-pressed={langTab === l} onClick={() => setLangTab(l)}
              className="-mb-px border-b-2 border-transparent px-4 py-2 text-muted-foreground aria-pressed:border-accent aria-pressed:text-foreground">
              {l === "pt" ? "Português" : "English"} {l === "en" && <span className="opacity-60">(opcional)</span>}
            </button>
          ))}
        </div>
        {/* os dois idiomas ficam montados (só um visível) para os dois irem no submit */}
        <div hidden={langTab !== "pt"}><LangFields k="pt" value={pt} onChange={setPt} required /></div>
        <div hidden={langTab !== "en"}><LangFields k="en" value={en} onChange={setEn} required={false} /></div>
      </div>

      <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-3 border p-4">
          <div className="flex items-center justify-between">
            <span className={label}>Status</span>
            {post?.published ? <Badge tone="solid">Publicado</Badge> : <Badge tone="accent">Rascunho</Badge>}
          </div>
          <p role="status" aria-live="polite" className={`min-h-5 font-mono text-[11px] uppercase tracking-wider ${state.error ? "text-accent" : "text-muted-foreground"}`}>
            {state.error ?? state.ok}
          </p>
          <div className="grid gap-2">
            {post?.published ? (
              <>
                <button name="intent" value="save" disabled={pending} className={btnSolid}>{pending && <Loader2 className="size-3.5 animate-spin" />}Salvar alterações</button>
                <button name="intent" value="draft" disabled={pending} className={btnGhost}>Despublicar</button>
              </>
            ) : (
              <>
                <button name="intent" value="publish" disabled={pending} className={btnAccent}>{pending && <Loader2 className="size-3.5 animate-spin" />}Publicar</button>
                <button name="intent" value="draft" disabled={pending} className={btnGhost}>Salvar rascunho</button>
              </>
            )}
          </div>
          {post?.published && post.pt?.slug && (
            <Link href={`/posts/${post.pt.slug}`} target="_blank" className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Ver no site <ExternalLink className="size-3" />
            </Link>
          )}
        </div>

        <div className="space-y-3">
          <span className={label}>Capa</span>
          <div className="relative aspect-[3/2] overflow-hidden border bg-card">
            {cover ? <Image src={cover} alt="" fill sizes="300px" loading="eager" className="object-cover" />
              : <div className="grid h-full place-items-center font-mono text-[11px] uppercase text-muted-foreground">Sem capa</div>}
            {uploading && <div className="absolute inset-0 grid place-items-center bg-background/70"><Loader2 className="size-5 animate-spin" /></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onCover} aria-label="Enviar capa" />
          <div className="flex gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btnGhost}><ImagePlus className="size-3.5" /> Enviar</button>
            {cover && <button type="button" onClick={() => setCover("")} className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent">Remover</button>}
          </div>
          {coverErr && <p className="font-mono text-[11px] uppercase text-accent">{coverErr}</p>}
        </div>

        <fieldset className="space-y-3">
          <legend className={label}>Tags</legend>
          {tags.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tag. <Link href="/admin/tags" className="underline">Criar</Link></p>}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input type="checkbox" name="tags" value={t.id} checked={tagIds.includes(t.id)} className="peer sr-only"
                  onChange={(e) => setTagIds((ids) => (e.target.checked ? [...ids, t.id] : ids.filter((i) => i !== t.id)))} />
                <span className="inline-block border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors peer-checked:border-accent peer-checked:text-accent peer-focus-visible:ring-1 peer-focus-visible:ring-accent">
                  {t.namePt}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {post && (
          <button type="button" disabled={deleting}
            onClick={() => { if (window.confirm("Apagar este post para sempre? Comentários e curtidas também serão apagados.")) startDelete(() => deletePost(post.id)); }}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent">
            <Trash2 className="size-3.5" /> Apagar post
          </button>
        )}
      </aside>
    </form>
  );
}
