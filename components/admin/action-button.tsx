"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

// Botão que chama uma server action, com confirmação opcional e mensagem de retorno.
export function ActionButton({ action, confirm, className, children }: {
  action: () => Promise<{ ok?: string; error?: string } | void>; confirm?: string; className?: string; children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" disabled={pending} className={className}
        onClick={() => { if (confirm && !window.confirm(confirm)) return; start(async () => setMsg((await action()) ?? {})); }}>
        {pending && <Loader2 className="size-3.5 animate-spin" />}{children}
      </button>
      {(msg.ok || msg.error) && (
        <span role="status" className={`font-mono text-[11px] uppercase tracking-wider ${msg.error ? "text-accent" : "text-muted-foreground"}`}>{msg.error ?? msg.ok}</span>
      )}
    </span>
  );
}
