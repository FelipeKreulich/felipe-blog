import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { adminDeleteUser, adminSignOutUser } from "@/lib/admin-actions";
import { Avatar } from "@/components/site/avatar";
import { ActionButton } from "@/components/admin/action-button";
import { UserEditForm, UserPasswordForm } from "@/components/admin/user-forms";
import { Badge, btnGhost } from "@/components/admin/ui";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-8 md:grid-cols-[1fr_2fr] md:gap-14">
      <h2 className="text-2xl">{title}</h2>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export default async function AdminUser({ params }: PageProps<"/[locale]/admin/users/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      avatar: { select: { updatedAt: true } },
      _count: { select: { comments: true, likes: true, posts: true } },
      comments: { orderBy: { createdAt: "desc" }, take: 5, where: { deletedAt: null },
        include: { post: { select: { translations: { where: { locale: "pt" }, select: { title: true, slug: true } } } } } },
    },
  });
  if (!user) notFound();
  const isSelf = user.id === admin.id;
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <Link href="/admin/users" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Usuários
      </Link>
      <header className="flex flex-wrap items-center gap-6 pb-8">
        <Avatar userId={user.id} name={user.name} version={user.avatar?.updatedAt} size={72} />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl leading-none">{user.name ?? "(sem nome)"}</h2>
            {user.role === "ADMIN" && <Badge tone="accent">Admin</Badge>}
            {isSelf && <Badge>Você</Badge>}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {user.email} · desde {fmt.format(user.createdAt)} · 💬 {user._count.comments} · ♥ {user._count.likes} · posts {user._count.posts}
          </p>
        </div>
      </header>

      <Block title="Dados e cargo">
        <UserEditForm isSelf={isSelf} user={{ id: user.id, name: user.name ?? "", email: user.email, role: user.role }} />
      </Block>

      <Block title="Senha">
        <UserPasswordForm id={user.id} />
      </Block>

      <Block title="Sessões">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Desconecta a pessoa de todos os aparelhos. Ela pode entrar de novo com a senha atual.</p>
          <ActionButton action={adminSignOutUser.bind(null, user.id)} className={btnGhost}>Forçar logout</ActionButton>
        </div>
      </Block>

      <Block title="Comentários recentes">
        {user.comments.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum comentário.</p> : (
          <ul className="divide-y border-y">
            {user.comments.map((c) => (
              <li key={c.id} className="space-y-1 py-3">
                <p className="line-clamp-2 text-sm">{c.body}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {fmt.format(c.createdAt)} · em {c.post.translations[0]?.title}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Excluir conta">
        {isSelf ? <p className="text-sm text-muted-foreground">Você não pode excluir a sua própria conta.</p> : (
          <div className="space-y-3 border border-accent/50 p-5">
            <p className="text-sm text-muted-foreground">
              Permanente. Foto e curtidas são apagadas; comentários sem respostas somem e os com respostas ficam como “[removido]”.
            </p>
            <ActionButton action={adminDeleteUser.bind(null, user.id)}
              confirm={`Excluir a conta de ${user.email} para sempre?`}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-accent-foreground hover:opacity-90">
              Excluir conta
            </ActionButton>
          </div>
        )}
      </Block>
    </div>
  );
}
