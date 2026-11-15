import Image from "next/image";

// Layout comum de 404 e erro: ilustração + "manchete" do problema.
export function StatusPage({ image, code, title, lead, children }: {
  image: string; code: string; title: string; lead: string; children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 py-6 md:grid-cols-2 md:gap-14">
      <div className="relative aspect-[3/2] overflow-hidden border">
        <Image src={image} alt="" fill priority sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
      </div>
      <div className="space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{code}</p>
        <h1 className="text-5xl leading-[1.02] text-balance sm:text-6xl">{title}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{lead}</p>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </div>
  );
}

export const btnSolid = "inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90";
export const btnGhost = "inline-flex items-center gap-2 border border-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background";
