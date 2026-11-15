import { headers } from "next/headers";
import { db } from "@/lib/db";

// IP do cliente. Na Vercel, x-real-ip / x-vercel-forwarded-for são definidos pela própria plataforma
// (o cliente não consegue forjar); x-forwarded-for fica como fallback para outros ambientes.
export async function clientIp() {
  const h = await headers();
  return (h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for"))?.split(",")[0]?.trim() || "unknown";
}

// Conta uma tentativa na chave. Atômico: um único upsert com lógica de janela no SQL.
// Retorna se ainda está dentro do limite e em quantos segundos a janela reabre.
export async function hit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSec}))
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN NOW() + make_interval(secs => ${windowSec}) ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const { count, resetAt } = rows[0];
  // limpeza oportunista das janelas vencidas (~1% das chamadas)
  if (Math.random() < 0.01) db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } }).catch(() => {});
  return { ok: count <= limit, retryAfter: Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000)) };
}

export const clear = (key: string) => db.rateLimit.deleteMany({ where: { key } });

// Devolve uma tentativa reservada com hit() (ex.: login certo), mantendo "conta só falhas" sem corrida.
export const release = (key: string) =>
  db.$executeRaw`UPDATE "RateLimit" SET "count" = GREATEST("count" - 1, 0) WHERE "key" = ${key}`;

export const LIMITS = {
  // falhas de login: por IP, por IP+e-mail (apertado, não trava a conta para os outros) e um teto
  // alto por conta, só alcançável com ataque distribuído
  loginIp: { limit: 10, window: 15 * 60 },
  loginIpEmail: { limit: 5, window: 15 * 60 },
  loginEmail: { limit: 30, window: 60 * 60 },
  signupIp: { limit: 5, window: 60 * 60 },
} as const;
