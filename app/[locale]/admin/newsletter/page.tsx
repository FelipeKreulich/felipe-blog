import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendNewsletter } from "@/lib/admin-actions";
import { ActionButton } from "@/components/admin/action-button";
import { Badge, btnAccent } from "@/components/admin/ui";

export default async function AdminNewsletter() {
  await requireAdmin(); // não depender só do layout: página e layout renderizam em paralelo
  const [confirmed, pending, posts] = await Promise.all([
    db.subscriber.count({ where: { confirmedAt: { not: null } } }),
    db.subscriber.count({ where: { confirmedAt: null } }),
    db.post.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: { translations: { where: { locale: "pt" }, select: { title: true } } },
    }),
  ]);
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
  const fromTest = process.env.FROM_EMAIL === "onboarding@resend.dev";

  return (
    <div className="space-y-8">
      <div className="grid gap-px border bg-border sm:grid-cols-2">
        {[["Assinantes confirmados", confirmed], ["Aguardando confirmação", pending]].map(([l, n]) => (
          <div key={l as string} className="bg-background p-6">
            <p className="font-heading text-5xl">{n}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      {fromTest && (
        <p className="border-l-2 border-accent bg-card p-4 text-sm">
          O remetente ainda é <code>onboarding@resend.dev</code>: o Resend só entrega para o e-mail da sua conta. Verifique um domínio no Resend e troque <code>FROM_EMAIL</code> antes de enviar para leitores.
        </p>
      )}
      <ul className="divide-y border-y">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-heading text-2xl leading-tight">{p.translations[0]?.title}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Publicado em {fmt.format(p.publishedAt!)}</p>
            </div>
            {p.newsletterSentAt
              ? <Badge>Enviado em {fmt.format(p.newsletterSentAt)}</Badge>
              : <ActionButton action={sendNewsletter.bind(null, p.id)} className={btnAccent}
                  confirm={`Enviar "${p.translations[0]?.title}" para ${confirmed} assinante(s)? Não dá para desfazer.`}>
                  Enviar edição
                </ActionButton>}
          </li>
        ))}
      </ul>
    </div>
  );
}
