"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { previewMarkdown, savePage, type AdminState } from "@/lib/admin-actions";
import { btnSolid, input, label } from "./ui";

type Doc = { title: string; content: string };

// Um formulário por idioma; submit manual (sem o reset automático do React 19 após a action).
function LocaleForm({ pageKey, locale, initial }: { pageKey: string; locale: "pt" | "en"; initial: Doc }) {
  const [doc, setDoc] = useState(initial);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [state, setState] = useState<AdminState>({});
  const [pending, start] = useTransition();

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(async () => setState(await savePage(state, fd))); }}>
      <input type="hidden" name="key" value={pageKey} />
      <input type="hidden" name="locale" value={locale} />
      <label className="block space-y-1">
        <span className={label}>Título</span>
        <input name="title" value={doc.title} required maxLength={160} onChange={(e) => setDoc({ ...doc, title: e.target.value })} className={`${input} font-heading text-3xl`} />
      </label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={label}>Conteúdo (Markdown)</span>
          <div className="flex gap-1 font-mono text-[11px] uppercase tracking-wider">
            {(["write", "preview"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={tab === t}
                onClick={() => { setTab(t); if (t === "preview") start(async () => setHtml(await previewMarkdown(doc.content))); }}
                className="px-3 py-1 text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">
                {t === "write" ? "Escrever" : "Visualizar"}
              </button>
            ))}
          </div>
        </div>
        <textarea name="content" value={doc.content} required rows={24} hidden={tab !== "write"}
          onChange={(e) => setDoc({ ...doc, content: e.target.value })}
          className="w-full resize-y border bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus:border-accent" />
        {tab === "preview" && <div className="article prose max-w-none border p-6" dangerouslySetInnerHTML={{ __html: html }} />}
      </div>
      <div className="flex items-center justify-between gap-4">
        <p role="status" className={`font-mono text-[11px] uppercase tracking-wider ${state.error ? "text-accent" : "text-muted-foreground"}`}>{state.error ?? state.ok}</p>
        <button disabled={pending} className={btnSolid}>{pending && <Loader2 className="size-3.5 animate-spin" />}Salvar {locale.toUpperCase()}</button>
      </div>
    </form>
  );
}

export function PageEditor({ pageKey, pt, en }: { pageKey: string; pt: Doc; en: Doc }) {
  const [lang, setLang] = useState<"pt" | "en">("pt");
  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b font-mono text-[11px] uppercase tracking-wider">
        {(["pt", "en"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}
            className="-mb-px border-b-2 border-transparent px-4 py-2 text-muted-foreground aria-pressed:border-accent aria-pressed:text-foreground">
            {l === "pt" ? "Português" : "English"}
          </button>
        ))}
      </div>
      <div hidden={lang !== "pt"}><LocaleForm pageKey={pageKey} locale="pt" initial={pt} /></div>
      <div hidden={lang !== "en"}><LocaleForm pageKey={pageKey} locale="en" initial={en} /></div>
    </div>
  );
}
