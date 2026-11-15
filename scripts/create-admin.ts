// Cria (ou promove) a conta de admin. A senha é pedida no terminal, sem eco e sem ir pro histórico.
// Uso: npm run admin:create -- voce@email.com
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";
import { PrismaClient } from "@prisma/client";

function askHidden(q: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    out._writeToOutput = (s) => { if (s.includes(q)) out.output.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Uso: npm run admin:create -- voce@email.com");
  const password = await askHidden("Senha (mín. 8): ");
  if (password.length < 8) throw new Error("Senha muito curta.");
  if ((await askHidden("Confirme a senha: ")) !== password) throw new Error("As senhas não conferem.");

  const db = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name: "Felipe Kreulich", role: "ADMIN", passwordHash },
  });
  console.log(`Admin pronto: ${user.email}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
