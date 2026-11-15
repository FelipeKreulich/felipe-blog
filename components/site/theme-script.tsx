"use client";

// Aplica tema (e marca o pre-loader) antes da pintura, sem flash.
// No SSR o <script> sai executável; no cliente o React o re-renderiza como "text/plain"
// para não disparar o aviso "Encountered a script tag" (React 19.2+). Ele já rodou no HTML inicial.
const code = `try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}try{if(!sessionStorage.getItem("preloaded")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-preload","")}catch(e){}`;

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
