import { db } from "@/lib/db";

// RFC 8058: cancelamento em um clique. O cliente de e-mail faz POST com corpo
// "List-Unsubscribe=One-Click" e o token vem na query string.
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const body = await req.text();
  if (!new URLSearchParams(body).has("List-Unsubscribe") || !token || token.length < 20 || token.length > 64) {
    return new Response("Bad Request", { status: 400 });
  }
  await db.subscriber.deleteMany({ where: { token } });
  return new Response(null, { status: 200 }); // sempre 200: não revela se o token existia
}
