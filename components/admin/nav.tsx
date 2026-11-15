"use client";
import { Link, usePathname } from "@/i18n/routing";

const items = [
  { href: "/admin", label: "Posts" },
  { href: "/admin/comments", label: "Comentários" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/pages", label: "Páginas" },
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 font-mono text-[11px] uppercase tracking-wider">
      {items.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" || path.startsWith("/admin/posts") : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
            className="px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background">
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
