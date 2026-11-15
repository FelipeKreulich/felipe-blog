"use client";
import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

// Hora local do leitor, atualizada na virada de cada minuto. useSyncExternalStore: no servidor
// (e na hidratação) devolve null, no cliente o minuto atual, sem setState dentro de efeito.
function subscribe(onChange: () => void) {
  let id: ReturnType<typeof setInterval>;
  const t = setTimeout(() => { onChange(); id = setInterval(onChange, 60_000); }, 60_000 - (Date.now() % 60_000));
  return () => { clearTimeout(t); clearInterval(id); };
}
const minute = () => Math.floor(Date.now() / 60_000);

export function Clock() {
  const locale = useLocale();
  const m = useSyncExternalStore(subscribe, minute, () => null);
  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
  const now = m === null ? null : new Date(m * 60_000);
  return (
    <time suppressHydrationWarning dateTime={now?.toISOString()} className="tabular-nums">
      {now ? fmt.format(now) : "--:--"}
    </time>
  );
}
