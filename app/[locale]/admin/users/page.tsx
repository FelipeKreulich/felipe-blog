import { requireAdmin } from "@/lib/admin";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { Avatar } from "@/components/site/avatar";
import { Badge, input } from "@/components/admin/ui";

export default async function AdminUsers({ searchParams }: PageProps<"/[locale]/admin/users">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const users = await db.user.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, role: true, createdAt: true, avatar: { select: { updatedAt: true } }, _count: { select: { comments: true, likes: true } } },
  });
  const total = await db.user.count();
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

  return (
    <div className="space-y-6">
      {sp.deleted === "1" && <p role="status" className="border-l-2 border-accent bg-card p-4 text-sm">Usuário excluído.</p>}
      <form className="flex flex-wrap items-end justify-between gap-4">
        <label className="w-full max-w-sm space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Buscar por nome ou e-mail</span>
          <input name="q" defaultValue={q} placeholder="ex.: maria ou @gmail.com" className={input} />
        </label>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {q ? `${users.length} resultado(s) · ` : ""}{total} usuário(s)
        </p>
      </form>
      <ul className="divide-y border-y">
        {users.map((u) => (
          <li key={u.id}>
            <Link href={`/admin/users/${u.id}`} className="flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:bg-card sm:px-3">
              <div className="flex items-center gap-4">
                <Avatar userId={u.id} name={u.name} version={u.avatar?.updatedAt} size={40} />
                <div>
                  <p className="font-heading text-2xl leading-tight">{u.name ?? "(sem nome)"}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {u.role === "ADMIN" && <Badge tone="accent">Admin</Badge>}
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  💬 {u._count.comments} · ♥ {u._count.likes} · desde {fmt.format(u.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {users.length === 0 && <li className="py-8 text-center font-heading text-2xl italic text-muted-foreground">Nenhum usuário encontrado.</li>}
      </ul>
    </div>
  );
}
