import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientIp, hit, LIMITS, release } from "@/lib/rate-limit";

// Hash bcrypt real (mesmo custo) para comparar quando o e-mail não existe: tempo de resposta igual.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync(crypto.randomUUID(), 12));

export const credentialsSchema = z.object({
  email: z.email().max(254).transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

class InvalidLogin extends CredentialsSignin { code = "invalid"; }
class RateLimited extends CredentialsSignin {
  constructor(public retryAfter: number) { super(); this.code = `rate_limited:${retryAfter}`; }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidLogin();
        // Reserva a tentativa ATOMICAMENTE antes de checar a senha (sem corrida entre requests
        // paralelos) e devolve no login certo: na prática conta só falhas. O limite apertado é
        // por IP+e-mail, então ninguém trava a conta de outra pessoa errando a senha dela.
        const ip = await clientIp(), email = parsed.data.email;
        const keys = [
          { key: `login:ip:${ip}`, ...LIMITS.loginIp },
          { key: `login:ipemail:${ip}:${email}`, ...LIMITS.loginIpEmail },
          { key: `login:email:${email}`, ...LIMITS.loginEmail },
        ];
        const state = await Promise.all(keys.map((k) => hit(k.key, k.limit, k.window)));
        const blocked = state.filter((s) => !s.ok);
        if (blocked.length) throw new RateLimited(Math.max(...blocked.map((s) => s.retryAfter)));
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? getDummyHash());
        if (!user || !ok) throw new InvalidLogin(); // a tentativa reservada fica contada
        await Promise.all(keys.map((k) => release(k.key))); // login certo não conta
        return { id: user.id, name: user.name, email: user.email, role: user.role, sessionVersion: user.sessionVersion };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id!; token.role = user.role; token.sv = user.sessionVersion ?? 0; }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.sv = token.sv ?? 0;
      return session;
    },
  },
});
