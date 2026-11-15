"use client";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

// Mostra uma vez por sessão. O script inline marca <html data-preload> antes da pintura,
// então quem já viu nunca enxerga o overlay (nem por um frame).
export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute("data-preload")) return setDone(true);
    try { sessionStorage.setItem("preloaded", "1"); } catch {}
    const t = setTimeout(() => { html.removeAttribute("data-preload"); setDone(true); }, 2000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;
  return (
    <div aria-hidden className="preloader fixed inset-0 z-50 grid place-items-center bg-background">
      <div className="w-[min(80vw,520px)] space-y-6">
        <Logo className="preloader-logo w-full text-foreground" />
        <div className="h-px w-full overflow-hidden bg-border">
          <div className="preloader-bar h-full bg-accent" />
        </div>
        <p className="preloader-meta text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          git commit -m &quot;today&apos;s edition&quot;
        </p>
      </div>
    </div>
  );
}
