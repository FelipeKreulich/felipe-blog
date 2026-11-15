// Seed de demonstração — só para desenvolvimento local.
// Rodar: npm run db:seed   (recria apenas os posts do autor de seed)
import { PrismaClient } from "../lib/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  console.error("Seed bloqueado: NODE_ENV=production.");
  process.exit(1);
}

const db = new PrismaClient();
const SEED_EMAIL = "redacao@commit-times.local";

const tags = [
  { slug: "ai", namePt: "IA", nameEn: "AI" },
  { slug: "languages", namePt: "Linguagens", nameEn: "Languages" },
  { slug: "web", namePt: "Web", nameEn: "Web" },
  { slug: "databases", namePt: "Bancos de dados", nameEn: "Databases" },
  { slug: "infra", namePt: "Infraestrutura", nameEn: "Infrastructure" },
  { slug: "culture", namePt: "Cultura", nameEn: "Culture" },
];

type Lang = { slug: string; title: string; excerpt: string; body: string };
type SeedPost = { cover: string; tag: string; daysAgo: number; pt: Lang; en: Lang };

const code = (lang: string, src: string) => "```" + lang + "\n" + src.trim() + "\n```";

const posts: SeedPost[] = [
  {
    cover: "agents", tag: "ai", daysAgo: 0,
    pt: {
      slug: "agentes-que-escrevem-codigo",
      title: "Os agentes já escrevem código. E agora?",
      excerpt: "Ferramentas que planejam, executam e revisam mudanças inteiras mudam o papel de quem programa — de digitador para editor.",
      body: `Há dois anos, autocompletar uma linha parecia mágica. Hoje, agentes abrem o repositório, leem o contexto, rodam os testes e entregam um diff pronto para revisão.

## O programador como editor

A habilidade que mais valoriza não é digitar rápido, é **saber o que pedir** e **reconhecer quando a resposta está errada**. Revisar virou o trabalho principal.

${code("ts", `
// O que muda não é a sintaxe, é quem escreve o primeiro rascunho
const diff = await agent.run("migrar auth para o novo provider");
await review(diff); // ainda é seu
`)}

## O que não muda

Testes, nomes claros e módulos pequenos continuam sendo o que separa um projeto saudável de um caos — agora com a vantagem de que o agente também se beneficia deles.`,
    },
    en: {
      slug: "agents-that-write-code",
      title: "Agents already write code. Now what?",
      excerpt: "Tools that plan, execute and review entire changes shift the programmer's role — from typist to editor.",
      body: `Two years ago, completing a single line felt like magic. Today, agents open the repository, read the context, run the tests and hand you a diff ready for review.

## The programmer as editor

The most valuable skill isn't typing fast, it's **knowing what to ask for** and **spotting when the answer is wrong**. Reviewing became the main job.

${code("ts", `
// What changes isn't the syntax, it's who writes the first draft
const diff = await agent.run("migrate auth to the new provider");
await review(diff); // still yours
`)}

## What stays the same

Tests, clear names and small modules still separate a healthy project from chaos — with the bonus that the agent benefits from them too.`,
    },
  },
  {
    cover: "rust", tag: "languages", daysAgo: 2,
    pt: {
      slug: "rust-no-kernel",
      title: "Rust chega ao coração do sistema",
      excerpt: "Do kernel do Linux a drivers do Windows, a linguagem da segurança de memória deixou de ser experimento.",
      body: `O que começou como curiosidade virou política: novos drivers e subsistemas críticos já nascem em Rust.

## Por que agora

Segurança de memória sem coletor de lixo resolve uma classe inteira de vulnerabilidades que custa bilhões por ano.

${code("rust", `
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}
`)}

O compilador é exigente — e é justamente por isso que os bugs aparecem antes do deploy, não depois.`,
    },
    en: {
      slug: "rust-in-the-kernel",
      title: "Rust reaches the heart of the system",
      excerpt: "From the Linux kernel to Windows drivers, the memory-safe language is no longer an experiment.",
      body: `What began as curiosity became policy: new drivers and critical subsystems are now born in Rust.

## Why now

Memory safety without a garbage collector eliminates an entire class of vulnerabilities that costs billions a year.

${code("rust", `
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}
`)}

The compiler is demanding — which is exactly why bugs show up before deploy, not after.`,
    },
  },
  {
    cover: "rsc", tag: "web", daysAgo: 4,
    pt: {
      slug: "server-components-na-pratica",
      title: "Server Components, sem o hype",
      excerpt: "Menos JavaScript no cliente, dados buscados onde moram. Um guia honesto sobre quando vale a pena.",
      body: `Server Components não são uma moda: são a volta do servidor como lugar natural para buscar dados — com a interatividade do React onde ela importa.

## A regra prática

Comece tudo no servidor. Só marque \`"use client"\` quando precisar de estado, efeitos ou eventos do navegador.

${code("tsx", `
export default async function Page() {
  const posts = await db.post.findMany();
  return <PostList posts={posts} />;
}
`)}

O resultado é menos código enviado e menos camadas de API para manter.`,
    },
    en: {
      slug: "server-components-in-practice",
      title: "Server Components, minus the hype",
      excerpt: "Less client JavaScript, data fetched where it lives. An honest guide on when it pays off.",
      body: `Server Components aren't a fad: they're the server returning as the natural place to fetch data — with React's interactivity where it matters.

## The rule of thumb

Start everything on the server. Only mark \`"use client"\` when you need state, effects or browser events.

${code("tsx", `
export default async function Page() {
  const posts = await db.post.findMany();
  return <PostList posts={posts} />;
}
`)}

The result is less shipped code and fewer API layers to maintain.`,
    },
  },
  {
    cover: "postgres", tag: "databases", daysAgo: 7,
    pt: {
      slug: "postgres-faz-tudo",
      title: "Postgres faz (quase) tudo",
      excerpt: "Filas, busca textual, JSON e vetores: antes de adicionar mais um serviço, olhe para o banco que você já tem.",
      body: `Cada novo serviço na arquitetura é mais uma coisa para monitorar, versionar e pagar. O Postgres moderno cobre muito mais do que parece.

## Exemplos

- **Busca textual** com \`tsvector\`
- **Filas** com \`SELECT ... FOR UPDATE SKIP LOCKED\`
- **Vetores** com \`pgvector\`

${code("sql", `
SELECT id FROM jobs
WHERE status = 'pending'
FOR UPDATE SKIP LOCKED
LIMIT 1;
`)}

Comece simples. Troque quando os números pedirem — não antes.`,
    },
    en: {
      slug: "postgres-does-everything",
      title: "Postgres does (almost) everything",
      excerpt: "Queues, full-text search, JSON and vectors: before adding another service, look at the database you already have.",
      body: `Every new service in the architecture is one more thing to monitor, version and pay for. Modern Postgres covers far more than it seems.

## Examples

- **Full-text search** with \`tsvector\`
- **Queues** with \`SELECT ... FOR UPDATE SKIP LOCKED\`
- **Vectors** with \`pgvector\`

${code("sql", `
SELECT id FROM jobs
WHERE status = 'pending'
FOR UPDATE SKIP LOCKED
LIMIT 1;
`)}

Start simple. Switch when the numbers demand it — not before.`,
    },
  },
  {
    cover: "edge", tag: "infra", daysAgo: 10,
    pt: {
      slug: "a-borda-da-rede",
      title: "Computação na borda: perto de quem usa",
      excerpt: "Rodar código a poucos quilômetros do usuário reduz latência — mas traz novas perguntas sobre dados e consistência.",
      body: `A promessa é simples: em vez de um servidor em um continente, centenas de pontos espalhados pelo mundo.

## O porém

Código perto do usuário só ajuda se os **dados** também estiverem perto. Caso contrário, você só moveu a espera de lugar.

Use a borda para o que é leve e cacheável — autenticação, redirecionamentos, personalização simples — e mantenha a lógica pesada perto do banco.`,
    },
    en: {
      slug: "the-edge-of-the-network",
      title: "Edge computing: close to the user",
      excerpt: "Running code a few miles from the user cuts latency — but raises new questions about data and consistency.",
      body: `The promise is simple: instead of one server on one continent, hundreds of points around the world.

## The catch

Code near the user only helps if the **data** is near too. Otherwise you've just moved the wait somewhere else.

Use the edge for what is light and cacheable — auth, redirects, simple personalization — and keep heavy logic close to the database.`,
    },
  },
  {
    cover: "opensource", tag: "culture", daysAgo: 14,
    pt: {
      slug: "quem-sustenta-o-open-source",
      title: "Quem sustenta o open source?",
      excerpt: "Bibliotecas usadas por milhões são mantidas por poucos, muitas vezes de graça. Um retrato da infraestrutura invisível.",
      body: `Abra o \`package.json\` de qualquer projeto e conte as dependências. Agora pense em quantas pessoas mantêm cada uma.

## A conta não fecha

Empresas dependem de projetos mantidos por voluntários. Patrocínios ajudam, mas raramente pagam um salário.

Contribuir não exige código: documentação, triagem de issues e reprodução de bugs são trabalho valioso — e escasso.`,
    },
    en: {
      slug: "who-sustains-open-source",
      title: "Who sustains open source?",
      excerpt: "Libraries used by millions are maintained by a handful of people, often for free. A portrait of invisible infrastructure.",
      body: `Open any project's \`package.json\` and count the dependencies. Now think about how many people maintain each one.

## The math doesn't add up

Companies depend on volunteer-maintained projects. Sponsorships help, but rarely pay a salary.

Contributing doesn't require code: documentation, issue triage and bug reproduction are valuable work — and scarce.`,
    },
  },
  {
    cover: "keyboard", tag: "culture", daysAgo: 18,
    pt: {
      slug: "a-ferramenta-certa",
      title: "Em defesa da ferramenta que você gosta",
      excerpt: "Teclado, editor, tema de cores: detalhes que parecem fúteis, mas definem horas do seu dia.",
      body: `Você passa mais tempo com o teclado e o editor do que com quase qualquer outra coisa. Faz sentido que eles sejam bons.

## Sem culpa

Ajustar o ambiente não é procrastinação quando reduz atrito real. O truque é parar quando o ajuste vira o trabalho.

Escolha, configure, e esqueça — até a próxima vez que algo realmente incomodar.`,
    },
    en: {
      slug: "the-right-tool",
      title: "In defense of the tool you love",
      excerpt: "Keyboard, editor, color theme: details that seem trivial but shape hours of your day.",
      body: `You spend more time with your keyboard and editor than with almost anything else. It makes sense for them to be good.

## No guilt

Tuning your environment isn't procrastination when it removes real friction. The trick is to stop when tuning becomes the job.

Choose, configure, and forget — until something genuinely bothers you again.`,
    },
  },
  {
    cover: "terminal", tag: "infra", daysAgo: 23,
    pt: {
      slug: "o-terminal-nunca-morreu",
      title: "O terminal nunca morreu",
      excerpt: "Interfaces gráficas vêm e vão; a linha de comando continua sendo a forma mais direta de conversar com a máquina.",
      body: `Cinquenta anos depois, o cursor piscando ainda é a interface mais composável que existe.

## Composição

Programas pequenos que fazem uma coisa bem, ligados por pipes, resolvem problemas que nenhum botão previu.

${code("bash", `
git log --since="1 week" --pretty=%an | sort | uniq -c | sort -rn
`)}

Uma linha. Quem mais commitou na semana. Sem dashboard.`,
    },
    en: {
      slug: "the-terminal-never-died",
      title: "The terminal never died",
      excerpt: "GUIs come and go; the command line remains the most direct way to talk to the machine.",
      body: `Fifty years on, the blinking cursor is still the most composable interface there is.

## Composition

Small programs that do one thing well, joined by pipes, solve problems no button ever anticipated.

${code("bash", `
git log --since="1 week" --pretty=%an | sort | uniq -c | sort -rn
`)}

One line. Who committed most this week. No dashboard.`,
    },
  },
];

async function main() {
  const author = await db.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: { email: SEED_EMAIL, name: "Redação", role: "ADMIN" }, // sem senha: não loga
  });

  await db.post.deleteMany({ where: { authorId: author.id } });
  for (const t of tags) await db.tag.upsert({ where: { slug: t.slug }, update: t, create: t });

  for (const p of posts) {
    await db.post.create({
      data: {
        authorId: author.id,
        coverImage: `/covers/${p.cover}.jpg`,
        publishedAt: new Date(Date.now() - p.daysAgo * 864e5),
        tags: { connect: { slug: p.tag } },
        translations: {
          create: [
            { locale: "pt", slug: p.pt.slug, title: p.pt.title, excerpt: p.pt.excerpt, content: p.pt.body },
            { locale: "en", slug: p.en.slug, title: p.en.title, excerpt: p.en.excerpt, content: p.en.body },
          ],
        },
      },
    });
  }
  console.log(`Seed ok: ${posts.length} posts, ${tags.length} tags.`);
}

main().finally(() => db.$disconnect());
