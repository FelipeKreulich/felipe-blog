import Image from "next/image";

export function AuthShell({ kicker, title, lead, children }: { kicker: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="grid overflow-hidden border md:grid-cols-2">
      <div className="relative hidden aspect-[2/3] border-r md:block md:aspect-auto">
        <Image src="/illustrations/press-pass.jpg" alt="" fill priority sizes="576px" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center gap-8 p-8 sm:p-12">
        <header className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{kicker}</p>
          <h1 className="text-5xl leading-[1.02]">{title}</h1>
          <p className="leading-relaxed text-muted-foreground">{lead}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input {...props}
        className="w-full border-b border-border bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent" />
    </label>
  );
}

export const submitClass =
  "inline-flex w-full items-center justify-center gap-2 bg-foreground px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50";
