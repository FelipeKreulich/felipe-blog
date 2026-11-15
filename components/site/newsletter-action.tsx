"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { confirmSubscription, unsubscribe } from "@/lib/newsletter";

// Botão de confirmar/cancelar: a escrita só acontece no clique (POST), nunca ao abrir o link.
export function NewsletterAction({ token, kind }: { token: string; kind: "confirm" | "unsubscribe" }) {
  const t = useTranslations("newsletter");
  const [done, setDone] = useState<null | boolean>(null);
  const [pending, start] = useTransition();
  const action = kind === "confirm" ? confirmSubscription : unsubscribe;
  if (done !== null) {
    const ok = kind === "confirm" ? t("confirmedBody") : t("unsubBody");
    return <p role="status" className="font-heading text-2xl italic">{done ? ok : t("invalidBody")}</p>;
  }
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => setDone((await action(token)).ok))}
      className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50">
      {pending && <Loader2 className="size-3.5 animate-spin" />}{kind === "confirm" ? t("confirmCta") : t("unsubCta")}
    </button>
  );
}
