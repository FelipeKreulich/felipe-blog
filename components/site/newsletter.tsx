"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribe, type SubscribeState } from "@/lib/newsletter";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, { status: "idle" });

  return (
    <section aria-labelledby="nl-title" className="bg-foreground px-6 py-14 text-background sm:px-12">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1fr] md:items-end">
        <div className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider opacity-60">{t("kicker")}</p>
          <h2 id="nl-title" className="text-4xl leading-[1.05] text-balance sm:text-5xl">
            {t.rich("title", { em: (c) => <em className="text-accent">{c}</em> })}
          </h2>
          <p className="max-w-md leading-relaxed opacity-70">{t("lead")}</p>
        </div>

        <form action={action} className="space-y-3">
          <label htmlFor="nl-email" className="sr-only">{t("label")}</label>
          <div className="flex border-b border-background/40 transition-colors focus-within:border-accent">
            <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder={t("placeholder")}
              className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-background/40" />
            <button type="submit" disabled={pending}
              className="group inline-flex items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-wider disabled:opacity-50">
              {t("cta")}
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          <p role="status" aria-live="polite"
            className={`min-h-5 font-mono text-[11px] uppercase tracking-wider ${state.status === "error" ? "text-accent" : "opacity-60"}`}>
            {state.message ?? t("privacy")}
          </p>
        </form>
      </div>
    </section>
  );
}
