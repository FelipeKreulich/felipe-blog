import { db } from "@/lib/db";
import { deleteTag } from "@/lib/admin-actions";
import { ActionButton } from "@/components/admin/action-button";
import { TagForm } from "@/components/admin/tag-form";

export default async function AdminTags() {
  const tags = await db.tag.findMany({ orderBy: { namePt: "asc" }, include: { _count: { select: { posts: true } } } });
  return (
    <div className="space-y-8">
      <TagForm />
      <ul className="divide-y border-y">
        {tags.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-heading text-2xl">{t.namePt} <span className="text-muted-foreground">/ {t.nameEn}</span></p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t.slug} · {t._count.posts} post(s)</p>
            </div>
            <ActionButton action={deleteTag.bind(null, t.id)} confirm={`Apagar a tag "${t.namePt}"? Os posts continuam, só perdem a tag.`}
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent">
              Apagar
            </ActionButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
