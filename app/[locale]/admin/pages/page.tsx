import { requireAdmin } from "@/lib/admin";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { PAGE_KEYS, PAGE_LABEL } from "@/lib/pages";
import { Badge } from "@/components/admin/ui";

export default async function AdminPages() {
  await requireAdmin();
  const rows = await db.page.findMany({ select: { key: true, locale: true, updatedAt: true } });
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
  return (
    <ul className="divide-y border-y">
      {PAGE_KEYS.map((key) => {
        const mine = rows.filter((r) => r.key === key);
        return (
          <li key={key}>
            <Link href={`/admin/pages/${key}`} className="flex flex-wrap items-center justify-between gap-3 py-5 transition-colors hover:bg-card sm:px-3">
              <div className="space-y-1">
                <p className="font-heading text-2xl">{PAGE_LABEL[key]}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">/{key}</p>
              </div>
              <div className="flex gap-2">
                {(["pt", "en"] as const).map((l) => {
                  const r = mine.find((m) => m.locale === l);
                  return r ? <Badge key={l} tone="solid">{l.toUpperCase()} · {fmt.format(r.updatedAt)}</Badge> : <Badge key={l} tone="accent">{l.toUpperCase()} · vazio</Badge>;
                })}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
