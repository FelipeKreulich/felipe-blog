import Image from "next/image";
import { getTranslations } from "next-intl/server";

const ILLUSTRATION = "/editor/desk.jpg";

export async function EditorNote() {
  const t = await getTranslations("editor");
  const items = [t("item1"), t("item2"), t("item3")];

  return (
    <section aria-labelledby="editor-title" className="border-t-2 border-foreground pt-3">
      <div className="flex justify-between border-b pb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{t("kicker")}</span>
        <span>Est. 2026</span>
      </div>

      <div className="grid gap-10 pt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
        <figure className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden border">
            <Image src={ILLUSTRATION} alt={t("illustrationAlt")} fill sizes="(min-width: 768px) 460px, 100vw" className="object-cover" />
          </div>
          <figcaption className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="text-foreground">{t("captionLeft")}</span>
            <span>{t("captionRight")}</span>
          </figcaption>
        </figure>

        <div className="flex flex-col">
          <h2 id="editor-title" className="text-4xl leading-[1.05] text-balance sm:text-6xl">
            {t.rich("title", { em: (c) => <em className="text-accent">{c}</em> })}
          </h2>
          <hr className="my-8 w-16 border-foreground" />
          <p className="drop-cap text-lg leading-relaxed text-pretty">{t("intro")}</p>
          <ol className="mt-8 divide-y border-y">
            {items.map((it, i) => (
              <li key={i} className="flex gap-5 py-4">
                <span className="w-9 shrink-0 font-heading text-3xl leading-none tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-relaxed text-muted-foreground">{it}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-lg leading-relaxed text-pretty">{t("closing")}</p>
          <p className="mt-6 self-end font-heading text-4xl italic">— Felipe</p>
        </div>
      </div>
    </section>
  );
}
