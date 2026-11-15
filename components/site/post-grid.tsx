import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { PostCard } from "@/lib/posts";

export function PostGrid({ posts }: { posts: PostCard[] }) {
  return (
    <div className="grid border-l border-t sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((c) => (
        <Link key={c.id} href={c.href} className="group flex flex-col gap-3 border-b border-r p-6 transition-colors hover:bg-card">
          {c.cover && (
            <div className="relative -mx-6 -mt-6 mb-3 aspect-[3/2] overflow-hidden border-b">
              <Image src={c.cover} alt="" fill sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </div>
          )}
          {c.tag && <span className="font-mono text-[11px] uppercase tracking-wider text-accent">{c.tag}</span>}
          <h3 className="text-3xl leading-tight text-balance">{c.title}</h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.excerpt}</p>
          <p className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{c.meta}</p>
        </Link>
      ))}
    </div>
  );
}
