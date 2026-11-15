"use client";
import { useActionState, useEffect, useRef } from "react";
import { createTag, type AdminState } from "@/lib/admin-actions";
import { btnSolid, input, label } from "./ui";

export function TagForm() {
  const [s, action, pending] = useActionState<AdminState, FormData>(createTag, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (s.ok) ref.current?.reset(); }, [s]);
  return (
    <form ref={ref} action={action} className="grid gap-4 border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="space-y-1"><span className={label}>Nome (PT)</span><input name="namePt" required maxLength={40} className={input} /></label>
      <label className="space-y-1"><span className={label}>Nome (EN)</span><input name="nameEn" required maxLength={40} className={input} /></label>
      <button disabled={pending} className={btnSolid}>Criar tag</button>
      <p role="status" className={`font-mono text-[11px] uppercase tracking-wider sm:col-span-3 ${s.error ? "text-accent" : "text-muted-foreground"}`}>{s.error ?? s.ok}</p>
    </form>
  );
}
