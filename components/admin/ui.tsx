export const btn = "inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50";
export const btnSolid = `${btn} bg-foreground text-background hover:opacity-90`;
export const btnGhost = `${btn} border border-foreground hover:bg-foreground hover:text-background`;
export const btnAccent = `${btn} bg-accent text-accent-foreground hover:opacity-90`;
export const label = "font-mono text-[11px] uppercase tracking-wider text-muted-foreground";
export const input = "w-full border-b bg-transparent py-2 outline-none transition-colors focus:border-accent";

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" | "solid" }) {
  const c = { muted: "border text-muted-foreground", accent: "border border-accent text-accent", solid: "bg-foreground text-background" }[tone];
  return <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${c}`}>{children}</span>;
}
