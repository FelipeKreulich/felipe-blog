import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  await requireAdmin();
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Sala de redação</p>
          <h1 className="text-5xl leading-none">Admin</h1>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
