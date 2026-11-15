"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { completeLink } from "@/lib/newsletter";

export function LinkConfirm({ token }: { token: string }) {
  const t = useTranslations("newsletter");
  const [done, setDone] = useState<null | boolean>(null);
  const [pending, start] = useTransition();
  if (done !== null) return <p role="status" className="font-heading text-2xl italic">{done ? t("linkDone") : t("invalidBody")}</p>;
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => setDone((await completeLink(token)).ok))}
      className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50">
      {pending && <Loader2 className="size-3.5 animate-spin" />}{t("linkCta")}
    </button>
  );
}
