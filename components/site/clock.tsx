"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

// Hora local do leitor, atualizada a cada minuto. Renderiza só após montar (evita mismatch de hidratação).
export function Clock() {
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    let id: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      setNow(new Date());
      id = setInterval(() => setNow(new Date()), 60_000);
    }, 60_000 - (Date.now() % 60_000)); // alinha na virada do minuto
    return () => { clearTimeout(t); clearInterval(id); };
  }, []);

  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
  return (
    <time suppressHydrationWarning dateTime={now?.toISOString()} className="tabular-nums">
      {now ? fmt.format(now) : "--:--"}
    </time>
  );
}
