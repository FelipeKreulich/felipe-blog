import { db } from "@/lib/db";

// Imagens enviadas pelo admin. O id muda a cada upload, então o cache pode ser eterno.
export async function GET(_: Request, { params }: RouteContext<"/media/[id]">) {
  const m = await db.media.findUnique({ where: { id: (await params).id } });
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(m.data), {
    headers: { "Content-Type": m.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
