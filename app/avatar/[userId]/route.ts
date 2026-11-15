import { db } from "@/lib/db";

// Serve a foto de perfil. URL leva ?v=<updatedAt>, então pode ser cacheada por muito tempo.
export async function GET(_: Request, { params }: RouteContext<"/avatar/[userId]">) {
  const { userId } = await params;
  const a = await db.avatar.findUnique({ where: { userId } });
  if (!a) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(a.data), {
    headers: {
      "Content-Type": a.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
