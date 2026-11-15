import type { ContentPost } from "../types";

export const posts: ContentPost[] = [
  {
    key: "ransomware",
    cover: "ransomware",
    tags: ["security", "infra"],
    daysAgo: 20,
    pt: {
      slug: "resiliencia-a-ransomware-para-times-pequenos",
      title: "Resiliência a ransomware para times pequenos",
      excerpt:
        "Você não precisa de um SOC para sobreviver a um ataque. Precisa de backups que o invasor não alcança, restaurações testadas e um plano escrito antes do incêndio.",
      body: `Times pequenos costumam tratar ransomware como problema de empresa grande, até o dia em que uma planilha compartilhada vira um arquivo com extensão estranha e uma nota pedindo pagamento. A verdade incômoda é que o atacante não escolhe o alvo pelo tamanho, e sim pela facilidade. Uma senha reaproveitada, um painel exposto sem MFA ou um servidor sem atualização há meses bastam. A boa notícia é que a defesa que realmente importa é barata, chata e totalmente ao alcance de duas ou três pessoas com disciplina. Este texto é sobre essa defesa: menos sobre impedir toda invasão e mais sobre garantir que, quando ela acontecer, você se recupere sem negociar com criminosos.

## Backups que sobrevivem ao ataque

A regra clássica é a 3-2-1: três cópias dos dados, em dois tipos de mídia diferentes, com uma delas fora do local. Ela continua válida, mas foi pensada para incêndio e disco queimado, não para um adversário que entra na rede, encontra o servidor de backup e apaga tudo antes de criptografar a produção. Por isso a versão moderna ganhou dois dígitos extras: 3-2-1-1-0.

- **1 cópia imutável ou offline**: um backup que não pode ser alterado nem apagado durante um período de retenção, mesmo por quem tem credencial de administrador. Pode ser um bucket com bloqueio de objetos em modo de conformidade, uma fita guardada numa gaveta ou um disco externo desconectado após a cópia.
- **0 erros na verificação**: backup que nunca foi restaurado é uma hipótese, não um backup. O zero significa que você verificou a integridade e restaurou de verdade.

O ponto central é a separação de credenciais. Se a mesma conta que administra os servidores também pode apagar os backups, o atacante que rouba essa conta leva tudo. Use uma conta separada, idealmente em outro provedor ou outra conta de nuvem, com MFA própria e sem acesso a partir das máquinas do dia a dia. O servidor de produção deve conseguir *escrever* backups, nunca *apagá-los*.

## Testar restaurações como rotina

A maioria das histórias tristes de ransomware não termina em "não tínhamos backup", e sim em "o backup existia, mas faltava o banco", "a chave de criptografia estava no servidor que foi criptografado" ou "a restauração levaria duas semanas". Só um teste revela isso. Agende uma restauração periódica, num ambiente isolado, e meça quanto tempo leva. Um script simples ajuda a transformar o teste em hábito:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

# Restaura o dump mais recente num banco temporário e roda uma checagem básica
LATEST=$(ls -1t /mnt/backups/db-*.sql.gz | head -n 1)
createdb restore_test
gunzip -c "$LATEST" | psql --quiet restore_test
psql -t -c "SELECT count(*) FROM users;" restore_test
dropdb restore_test
echo "Restauração de $LATEST concluída"
\`\`\`

Rode algo assim automaticamente e alerte quando falhar. Anote o tempo total: ele é o seu tempo real de recuperação, não aquele que está na apresentação. E guarde as chaves de criptografia dos backups num lugar que não dependa da infraestrutura que pode cair junto, como um cofre de senhas com acesso de emergência para mais de uma pessoa.

## Reduzir a superfície e o raio de explosão

Backups garantem a volta; o resto da defesa serve para que o ataque seja mais difícil e cause menos estrago. Para um time pequeno, a lista curta que resolve a maior parte é:

1. **MFA em tudo que importa**: e-mail, provedor de nuvem, repositórios de código, VPN e painel de DNS. Prefira chaves de segurança ou aplicativos autenticadores a SMS.
2. **Privilégio mínimo**: ninguém usa conta de administrador para trabalho diário. Contas de serviço têm só as permissões necessárias. Acesso que não é usado há meses é removido.
3. **Atualizações sem drama**: atualizações automáticas nas estações de trabalho, uma janela fixa para servidores e prioridade máxima para o que está exposto à internet, como VPNs, firewalls e gateways de e-mail.
4. **Menos coisa exposta**: RDP e SSH não ficam abertos para o mundo. Coloque atrás de VPN ou de um proxy com autenticação.
5. **Segmentação básica**: a máquina do financeiro não precisa enxergar o servidor de build.

Nada disso é sofisticado. O valor está em fazer de forma consistente, e em revisar a lista a cada trimestre, porque permissões e serviços expostos crescem silenciosamente.

## Um playbook antes do incidente

No meio de um ataque ninguém pensa bem. Por isso o plano precisa existir no papel, de preferência impresso ou fora da infraestrutura principal. Ele não precisa ser longo; precisa responder a perguntas óbvias que, sob pressão, viram discussão.

> Quem decide desligar a produção? Para quem ligamos primeiro? Onde estão as credenciais de emergência?

Um playbook mínimo contém: contatos (time, provedor de nuvem, jurídico, seguradora, se houver), os passos de contenção, como isolar máquinas da rede em vez de desligá-las, para preservar evidências, a ordem de restauração dos sistemas por criticidade e as obrigações de notificação que se aplicam ao seu negócio, como as da LGPD quando há dados pessoais envolvidos. Faça um exercício de mesa uma vez por ano: alguém narra um cenário e o time percorre o documento. Os buracos aparecem em minutos.

Também vale decidir com antecedência a posição sobre pagamento. Pagar não garante a devolução dos dados, pode financiar novos ataques e, em algumas situações, traz problemas legais. Ter backups testados é o que transforma essa decisão em algo que você nem precisa considerar.

Quando *não* exagerar: se o seu produto é um site estático e os dados vivem num SaaS que já faz backup, gastar semanas montando uma infraestrutura própria de fitas é desperdício. Nesse caso, o trabalho é garantir MFA, entender a política de retenção do fornecedor e exportar periodicamente o que seria irrecuperável.

## Em resumo

- Siga a regra 3-2-1-1-0: inclua uma cópia imutável ou offline e verifique as restaurações.
- Separe as credenciais de backup das de produção; quem escreve backups não deve poder apagá-los.
- Teste restaurações com frequência e meça o tempo real de recuperação.
- MFA, privilégio mínimo, atualizações e pouca exposição resolvem a maior parte do risco.
- Escreva o playbook antes do incidente e ensaie pelo menos uma vez por ano.`,
    },
    en: {
      slug: "ransomware-resilience-for-small-teams",
      title: "Ransomware resilience for small teams",
      excerpt:
        "You don't need a security operations center to survive an attack. You need backups the attacker can't reach, tested restores and a plan written before the fire.",
      body: `Small teams tend to file ransomware under "big company problems", right up until a shared spreadsheet turns into a file with a weird extension and a note demanding payment. The uncomfortable truth is that attackers don't pick targets by size; they pick them by ease. A reused password, an admin panel exposed without MFA, or a server that hasn't been patched in months is enough. The good news is that the defense that actually matters is cheap, boring and entirely within reach of two or three disciplined people. This column is about that defense: less about stopping every intrusion and more about making sure that, when one happens, you recover without negotiating with criminals.

## Backups that survive the attack

The classic rule is 3-2-1: three copies of your data, on two different types of media, with one of them off-site. It still holds, but it was designed for fires and dead disks, not for an adversary who gets into the network, finds the backup server and wipes it before encrypting production. That's why the modern version picked up two extra digits: 3-2-1-1-0.

- **1 immutable or offline copy**: a backup that cannot be changed or deleted for a retention period, even by someone holding admin credentials. It can be a bucket with object lock in compliance mode, a tape in a drawer, or an external drive that gets unplugged after each run.
- **0 errors on verification**: a backup that has never been restored is a hypothesis, not a backup. The zero means you checked integrity and actually restored.

The key idea is credential separation. If the same account that runs your servers can also delete your backups, an attacker who steals that account gets everything. Use a separate account, ideally with another provider or in another cloud account, with its own MFA and no access from everyday machines. Production should be able to *write* backups, never *delete* them.

## Testing restores as a routine

Most sad ransomware stories don't end with "we had no backups". They end with "the backup existed but the database wasn't in it", "the encryption key lived on the server that got encrypted", or "the restore would take two weeks". Only a test reveals that. Schedule a periodic restore into an isolated environment and time it. A small script helps turn the test into a habit:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

# Restore the latest dump into a scratch database and run a sanity check
LATEST=$(ls -1t /mnt/backups/db-*.sql.gz | head -n 1)
createdb restore_test
gunzip -c "$LATEST" | psql --quiet restore_test
psql -t -c "SELECT count(*) FROM users;" restore_test
dropdb restore_test
echo "Restore of $LATEST finished"
\`\`\`

Run something like this automatically and alert when it fails. Write down the total time: that is your real recovery time, not the one on the slide deck. And keep backup encryption keys somewhere that doesn't depend on the infrastructure that might go down with them, such as a password manager with emergency access for more than one person.

## Shrinking the surface and the blast radius

Backups guarantee the way back; the rest of the defense makes the attack harder and the damage smaller. For a small team, the short list that covers most of the risk is:

1. **MFA on everything that matters**: email, cloud provider, code hosting, VPN and the DNS dashboard. Prefer security keys or authenticator apps over SMS.
2. **Least privilege**: nobody uses an admin account for daily work. Service accounts get only the permissions they need. Access nobody has used in months gets removed.
3. **Drama-free patching**: automatic updates on laptops, a fixed window for servers, and top priority for anything facing the internet, such as VPNs, firewalls and mail gateways.
4. **Less exposed stuff**: RDP and SSH are not open to the world. Put them behind a VPN or an authenticating proxy.
5. **Basic segmentation**: the finance laptop has no business reaching the build server.

None of this is sophisticated. The value comes from doing it consistently and reviewing the list every quarter, because permissions and exposed services grow quietly.

## A playbook before the incident

Nobody thinks clearly in the middle of an attack. So the plan has to exist on paper, ideally printed or stored outside your main infrastructure. It doesn't need to be long; it needs to answer the obvious questions that turn into arguments under pressure.

> Who decides to take production down? Who do we call first? Where are the break-glass credentials?

A minimal playbook covers contacts (team, cloud provider, legal counsel, insurer if you have one), containment steps such as isolating machines from the network instead of powering them off so evidence is preserved, the restore order of systems by criticality, and whatever notification obligations apply to your business under privacy law when personal data is involved. Run a tabletop exercise once a year: someone narrates a scenario and the team walks through the document. The gaps show up within minutes.

It's also worth deciding your stance on paying ahead of time. Paying doesn't guarantee you get the data back, may fund the next attack and, in some situations, creates legal trouble. Tested backups are what turn that decision into one you never have to consider.

When *not* to overdo it: if your product is a static site and your data lives in a SaaS that already handles backups, spending weeks building your own tape setup is waste. There the job is to enforce MFA, understand the vendor's retention policy and periodically export whatever would be irreplaceable.

## In short

- Follow 3-2-1-1-0: keep one immutable or offline copy and verify your restores.
- Separate backup credentials from production; whoever writes backups shouldn't be able to delete them.
- Test restores regularly and measure your real recovery time.
- MFA, least privilege, patching and minimal exposure handle most of the risk.
- Write the playbook before the incident and rehearse it at least once a year.`,
    },
  },
  {
    key: "owasp",
    cover: "owasp",
    tags: ["security", "web"],
    daysAgo: 26,
    pt: {
      slug: "seguranca-web-no-code-review",
      title: "Segurança web no dia a dia: um checklist para o code review",
      excerpt:
        "Controle de acesso quebrado, injeção, falhas de autenticação, SSRF e configuração ruim: como reconhecer cada classe de risco num pull request, com exemplos vulneráveis e corrigidos.",
      body: `Listas de riscos como a do OWASP são ótimas para dar nome aos problemas, mas ninguém abre um pull request pensando em categorias. A pessoa revisando vê um handler novo, uma query, uma chamada HTTP, e precisa decidir em poucos minutos se aquilo é seguro. Este texto tenta fazer a ponte: pegar as classes de risco que mais aparecem em aplicações web e traduzi-las em perguntas concretas para o code review, com exemplos em TypeScript e SQL do que costuma passar despercebido e de como corrigir.

## Controle de acesso: a pergunta que mais falta

O erro mais comum não é técnico, é de omissão: o endpoint verifica *se* o usuário está logado, mas não *se ele pode* mexer naquele recurso. Basta trocar o id na URL para ler a fatura de outra pessoa.

\`\`\`ts
// Vulnerável: qualquer usuário autenticado lê qualquer fatura
app.get("/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });
  res.json(invoice);
});

// Corrigido: o dono faz parte da consulta
app.get("/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await db.invoice.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });
  if (!invoice) return res.status(404).end();
  res.json(invoice);
});
\`\`\`

Colocar o dono dentro da consulta é melhor do que buscar e comparar depois, porque não há caminho em que o dado alheio chegue a ser carregado. Responder 404 em vez de 403 evita confirmar que o recurso existe. No review, pergunte:

- Todo endpoint que recebe um id filtra pelo usuário ou pela organização?
- A checagem está no servidor, e não só escondendo um botão no front-end?
- Ações administrativas verificam o papel do usuário em cada chamada?

## Injeção: dados nunca viram código

SQL concatenado ainda aparece, geralmente em relatórios, filtros dinâmicos e scripts "temporários". A regra é simples: valor do usuário entra como parâmetro, nunca como texto da query.

\`\`\`sql
-- Vulnerável: montado com concatenação
-- "SELECT * FROM users WHERE email = '" + email + "'"

-- Corrigido: consulta parametrizada
SELECT id, email FROM users WHERE email = $1;
\`\`\`

Em TypeScript, isso significa usar os placeholders do driver ou o ORM, e desconfiar de qualquer método com "raw" ou "unsafe" no nome. Partes que não podem ser parâmetros, como nome de coluna para ordenação, devem vir de uma lista fixa:

\`\`\`ts
const SORTABLE = { created: "created_at", name: "name" } as const;
type SortKey = keyof typeof SORTABLE;

function orderBy(input: string): string {
  return input in SORTABLE ? SORTABLE[input as SortKey] : "created_at";
}
\`\`\`

A mesma lógica vale para comandos de shell, consultas a bancos NoSQL e templates HTML: escapar no ponto de saída e preferir APIs que separam dado de instrução.

## Autenticação e sessões

Falhas de autenticação raramente estão no formulário de login em si; estão em volta dele. O que procurar:

1. Senhas guardadas com um algoritmo lento feito para isso, como bcrypt, scrypt ou Argon2, nunca com hash rápido ou criptografia reversível.
2. Limite de tentativas no login, no cadastro e na recuperação de senha.
3. Cookies de sessão com \`HttpOnly\`, \`Secure\` e \`SameSite\` adequados.
4. Sessões invalidadas quando a senha muda, e um jeito de sair de todos os dispositivos.
5. Tokens de recuperação de uso único, com expiração curta, e mensagens que não revelam se o e-mail existe.

Se o projeto puder usar um provedor de identidade ou uma biblioteca madura, melhor. Autenticação caseira é onde os detalhes mais doem. E quando um pull request mexe em login, sessões ou recuperação de senha, peça uma segunda revisão: esses fluxos são pequenos, mas um erro neles expõe todas as contas de uma vez.

## SSRF e configuração: o servidor como arma

SSRF acontece quando o servidor faz uma requisição para uma URL que o usuário controla, como em pré-visualização de links, webhooks ou importação de imagem. O atacante aponta para endereços internos, serviços de metadados da nuvem ou o painel administrativo que só escuta na rede privada.

\`\`\`ts
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivate(ip: string): boolean {
  return /^(10\\.|127\\.|169\\.254\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|::1$|f[cd])/i.test(ip);
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("only https");
  const { address } = await lookup(url.hostname);
  if (!isIP(address) || isPrivate(address)) throw new Error("blocked address");
  return url;
}
\`\`\`

Isso é um começo, não uma solução completa: redirecionamentos e DNS que muda entre a checagem e a requisição podem contornar a validação. Por isso, a defesa mais sólida é de rede, com o serviço que busca URLs externas rodando sem acesso à rede interna e sem rota para o endpoint de metadados. Quando der, troque URL livre por uma lista de domínios permitidos.

Configuração ruim é a classe mais prosaica e mais frequente: modo debug ligado em produção, stack trace na resposta, CORS com curinga junto de credenciais, bucket público por engano, cabeçalhos de segurança ausentes, segredos no repositório. No review, desconfie de qualquer mudança em arquivo de configuração que "só destrava" algo.

Quando *não* transformar isso em burocracia: um checklist com cinquenta itens vira ritual e ninguém lê. Escolha poucas perguntas que pegam a maior parte dos problemas do seu sistema, automatize o que der com linters, varredura de dependências e de segredos, e guarde a atenção humana para lógica de autorização, que ferramenta nenhuma entende bem.

## Em resumo

- Em todo endpoint com id, pergunte: o usuário pode acessar *este* recurso?
- Valores do usuário entram como parâmetros; o que não pode ser parâmetro vem de lista fixa.
- Use hash de senha lento, limite tentativas e invalide sessões na troca de senha.
- Trate URLs vindas do usuário como perigosas e isole na rede quem as busca.
- Automatize o mecânico e reserve o review humano para autorização e configuração.`,
    },
    en: {
      slug: "web-security-in-code-review",
      title: "Everyday web security: a code review checklist",
      excerpt:
        "Broken access control, injection, auth failures, SSRF and misconfiguration: how to spot each risk class in a pull request, with vulnerable and fixed examples.",
      body: `Risk lists like OWASP's are great for naming problems, but nobody opens a pull request thinking in categories. The reviewer sees a new handler, a query, an outbound HTTP call, and has a few minutes to decide whether it's safe. This column tries to bridge that gap: take the risk classes that show up most in web applications and turn them into concrete code review questions, with TypeScript and SQL examples of what usually slips through and how to fix it.

## Access control: the question most often missing

The most common mistake isn't technical, it's an omission: the endpoint checks *whether* the user is logged in, but not *whether they may* touch that resource. Change the id in the URL and you're reading someone else's invoice.

\`\`\`ts
// Vulnerable: any authenticated user can read any invoice
app.get("/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });
  res.json(invoice);
});

// Fixed: the owner is part of the query
app.get("/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await db.invoice.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });
  if (!invoice) return res.status(404).end();
  res.json(invoice);
});
\`\`\`

Putting the owner inside the query beats fetching and comparing afterwards, because there's no path where someone else's data even gets loaded. Returning 404 instead of 403 avoids confirming the resource exists. In review, ask:

- Does every endpoint that takes an id filter by user or organization?
- Is the check on the server, not just a hidden button in the front end?
- Do admin actions verify the user's role on every call?

## Injection: data never becomes code

Concatenated SQL still shows up, usually in reports, dynamic filters and "temporary" scripts. The rule is simple: user values go in as parameters, never as query text.

\`\`\`sql
-- Vulnerable: built by concatenation
-- "SELECT * FROM users WHERE email = '" + email + "'"

-- Fixed: parameterized query
SELECT id, email FROM users WHERE email = $1;
\`\`\`

In TypeScript that means using the driver's placeholders or the ORM, and being suspicious of any method with "raw" or "unsafe" in its name. Pieces that can't be parameters, like a sort column, should come from a fixed list:

\`\`\`ts
const SORTABLE = { created: "created_at", name: "name" } as const;
type SortKey = keyof typeof SORTABLE;

function orderBy(input: string): string {
  return input in SORTABLE ? SORTABLE[input as SortKey] : "created_at";
}
\`\`\`

The same logic applies to shell commands, NoSQL queries and HTML templates: escape at the output and prefer APIs that keep data and instructions apart.

## Authentication and sessions

Authentication failures rarely live in the login form itself; they live around it. What to look for:

1. Passwords stored with a deliberately slow algorithm such as bcrypt, scrypt or Argon2, never a fast hash or reversible encryption.
2. Rate limits on login, sign-up and password reset.
3. Session cookies with \`HttpOnly\`, \`Secure\` and a sensible \`SameSite\`.
4. Sessions invalidated on password change, plus a way to sign out everywhere.
5. Single-use reset tokens with short expiry, and messages that don't reveal whether an email exists.

If the project can use an identity provider or a mature library, do it. Home-grown auth is where details hurt the most. And when a pull request touches login, sessions or password reset, ask for a second reviewer: these flows are small, but a mistake in them exposes every account at once.

## SSRF and misconfiguration: the server as a weapon

SSRF happens when the server makes a request to a URL the user controls, as in link previews, webhooks or image imports. The attacker points it at internal addresses, cloud metadata services, or the admin panel that only listens on the private network.

\`\`\`ts
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivate(ip: string): boolean {
  return /^(10\\.|127\\.|169\\.254\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|::1$|f[cd])/i.test(ip);
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("only https");
  const { address } = await lookup(url.hostname);
  if (!isIP(address) || isPrivate(address)) throw new Error("blocked address");
  return url;
}
\`\`\`

That's a start, not a complete answer: redirects and DNS that changes between the check and the request can get around it. The sturdier defense is at the network level, with the service that fetches external URLs running without access to the internal network and with no route to the metadata endpoint. Where you can, replace free-form URLs with an allowlist of domains.

Misconfiguration is the most mundane class and the most frequent: debug mode on in production, stack traces in responses, wildcard CORS combined with credentials, a bucket made public by accident, missing security headers, secrets committed to the repo. In review, be wary of any config change that "just unblocks" something.

When *not* to turn this into bureaucracy: a fifty-item checklist becomes ritual and nobody reads it. Pick a few questions that catch most of the problems in your system, automate what you can with linters, dependency scanning and secret scanning, and save human attention for authorization logic, which no tool understands well.

## In short

- For every endpoint with an id, ask: can this user access *this* resource?
- User values go in as parameters; anything that can't be a parameter comes from a fixed list.
- Use slow password hashing, rate-limit attempts and invalidate sessions on password change.
- Treat user-supplied URLs as dangerous and isolate whatever fetches them on the network.
- Automate the mechanical parts and keep human review for authorization and configuration.`,
    },
  },
  {
    key: "wasm",
    cover: "wasm",
    tags: ["web", "infra"],
    daysAgo: 30,
    pt: {
      slug: "webassembly-fora-do-navegador",
      title: "WebAssembly fora do navegador",
      excerpt:
        "Sandbox por padrão, binário portátil e inicialização rápida fizeram do Wasm uma opção séria para plugins, edge e serverless. Mas ele não é um substituto universal para contêineres.",
      body: `O WebAssembly nasceu para rodar código rápido dentro do navegador, mas as propriedades que o tornaram seguro ali acabaram sendo úteis em lugares bem diferentes. Um módulo Wasm é um binário compacto, independente de arquitetura, que não consegue tocar em nada fora da sua própria memória a menos que o hospedeiro entregue essa capacidade explicitamente. Junte isso a uma inicialização muito rápida e você tem algo interessante para plataformas de edge, funções serverless e sistemas de plugins. Neste texto quero separar o que já funciona bem do que ainda é promessa, e principalmente apontar quando não vale a pena.

## O que o Wasm oferece de verdade

Três propriedades explicam quase todo o interesse:

- **Sandbox por construção**: o módulo enxerga uma memória linear própria e só pode chamar as funções que o hospedeiro importar para ele. Não há acesso implícito a arquivos, rede ou relógio. Segurança aqui não é uma camada adicionada depois, é o modelo de execução.
- **Portabilidade**: o mesmo arquivo \`.wasm\` roda em x86 ou ARM, em Linux, macOS ou Windows, desde que exista um runtime. Você compila uma vez a partir de Rust, C, C++, Go, Zig e outras linguagens.
- **Partida rápida e leve**: instanciar um módulo costuma ser muito mais barato do que subir um processo ou um contêiner, o que permite criar uma instância isolada por requisição.

Nenhuma dessas propriedades é inédita isoladamente. Máquinas virtuais, contêineres e linguagens com sandbox já existiam. O diferencial é ter as três juntas num formato padronizado e suportado por várias linguagens.

## WASI: falando com o mundo lá fora

Fora do navegador não há DOM nem \`fetch\` do browser, então o módulo precisa de outra forma de ler arquivos, variáveis de ambiente ou o relógio. É isso que a WASI, a interface de sistema do WebAssembly, define: um conjunto padronizado de funções que o runtime oferece ao módulo. O ponto importante é o modelo baseado em capacidades. O módulo não recebe "o sistema de arquivos"; recebe acesso a diretórios específicos que o hospedeiro decidiu abrir.

Um exemplo pequeno em Rust, compilado para o alvo WASI, mostra que o código em si parece comum:

\`\`\`rust
use std::fs;

fn main() {
    // Só funciona se o runtime tiver concedido acesso a este diretório
    match fs::read_to_string("data/config.txt") {
        Ok(text) => println!("config: {}", text.trim()),
        Err(e) => eprintln!("sem acesso: {}", e),
    }
}
\`\`\`

\`\`\`bash
rustup target add wasm32-wasip1
cargo build --release --target wasm32-wasip1
# O diretório precisa ser concedido explicitamente ao módulo
wasmtime run --dir=data target/wasm32-wasip1/release/app.wasm
\`\`\`

Sem o \`--dir\`, a leitura falha. Esse é o comportamento desejado: o padrão é negar. A especificação da WASI continua evoluindo, com um modelo de componentes que busca permitir que módulos escritos em linguagens diferentes conversem por interfaces tipadas. Vale acompanhar, mas convém checar o suporte do seu runtime antes de depender de recursos mais novos.

## Onde ele brilha: plugins, edge e serverless

**Plugins** talvez sejam o caso de uso mais convincente. Se você quer permitir que usuários ou terceiros estendam seu produto com código próprio, executar esse código no mesmo processo é arriscado e executar em processos separados é caro. Com Wasm, você embute um runtime, define exatamente quais funções o plugin pode chamar e impõe limites de memória e de tempo de execução. Bancos de dados, proxies, editores e ferramentas de build já usam essa abordagem para extensões.

**Edge e serverless** se beneficiam da partida rápida. Uma plataforma que roda código de muitos clientes em muitos pontos de presença precisa de isolamento forte e de densidade alta. Instâncias Wasm leves permitem atender uma requisição com uma instância nova sem pagar o custo de inicialização típico de um contêiner frio.

Outros usos que fazem sentido:

1. Compartilhar a mesma lógica de validação ou cálculo entre navegador, servidor e mobile.
2. Executar código não confiável em pipelines de dados, como transformações definidas por usuários.
3. Distribuir ferramentas de linha de comando que rodam em qualquer sistema com um runtime.

## Limites e quando não usar

O entusiasmo às vezes esconde os custos. Antes de adotar, considere:

- **Ecossistema desigual**: linguagens com runtime pesado ou coleta de lixo própria geram binários maiores e nem sempre têm suporte completo. Bibliotecas que dependem de threads, sockets ou chamadas de sistema específicas podem não compilar.
- **Interface com o hospedeiro**: passar dados complexos entre o hospedeiro e o módulo exige serialização ou cópia de memória. Para chamadas pequenas e muito frequentes, esse custo pode dominar.
- **Desempenho**: costuma ficar próximo do nativo em código de computação, mas não é garantido, e recursos como SIMD e threads dependem do runtime.
- **Depuração e observabilidade**: as ferramentas melhoraram, mas ainda são menos maduras do que as de processos nativos ou contêineres.

> Wasm é ótimo para isolar pedaços de lógica. Não é uma forma mais moderna de empacotar uma aplicação inteira.

Se você tem um serviço web comum, com banco de dados, filas e dependências nativas, um contêiner continua sendo a escolha mais simples e mais bem suportada. Wasm compensa quando você precisa de isolamento fino, de muitas instâncias baratas ou de executar código de terceiros com segurança. Fora disso, é complexidade a mais para resolver um problema que você não tem.

Um jeito sensato de experimentar é começar pequeno e reversível: escolha um pedaço bem delimitado, como uma função de transformação pura ou uma regra definida pelo usuário, compile para Wasm, embuta um runtime e meça inicialização, memória e o custo de cruzar a fronteira. Se os números e a experiência de desenvolvimento se sustentarem, expanda a partir daí. Se não, você perdeu uma semana, não uma arquitetura.

## Em resumo

- Wasm combina sandbox por padrão, portabilidade e inicialização rápida num formato padronizado.
- A WASI dá acesso ao sistema por capacidades: o módulo só vê o que o hospedeiro concede.
- Os casos mais fortes são plugins, edge, serverless e execução de código não confiável.
- Ecossistema, custo da fronteira com o hospedeiro e ferramentas ainda impõem limites.
- Para um serviço tradicional, contêiner continua sendo a resposta mais simples.`,
    },
    en: {
      slug: "webassembly-outside-the-browser",
      title: "WebAssembly outside the browser",
      excerpt:
        "Sandboxed by default, portable and quick to start, Wasm has become a serious option for plugins, edge and serverless. It is not, however, a universal replacement for containers.",
      body: `WebAssembly was born to run fast code inside the browser, but the properties that made it safe there turned out to be useful in very different places. A Wasm module is a compact, architecture-independent binary that cannot touch anything outside its own memory unless the host explicitly hands it that capability. Add very fast startup and you have something interesting for edge platforms, serverless functions and plugin systems. In this column I want to separate what already works well from what's still a promise, and above all point out when it isn't worth it.

## What Wasm actually gives you

Three properties explain most of the interest:

- **Sandboxed by construction**: a module sees its own linear memory and can only call the functions the host imports into it. There's no implicit access to files, network or clock. Security isn't a layer bolted on later; it's the execution model.
- **Portability**: the same \`.wasm\` file runs on x86 or ARM, on Linux, macOS or Windows, as long as there's a runtime. You compile once from Rust, C, C++, Go, Zig and other languages.
- **Fast, lightweight startup**: instantiating a module is usually far cheaper than starting a process or a container, which makes a fresh isolated instance per request practical.

None of these is new on its own. Virtual machines, containers and sandboxed languages existed long before. What's different is getting all three together in a standardized format supported by many languages.

## WASI: talking to the outside world

Outside the browser there's no DOM and no browser \`fetch\`, so a module needs another way to read files, environment variables or the clock. That's what WASI, the WebAssembly System Interface, defines: a standardized set of functions the runtime offers to the module. The important part is the capability-based model. The module doesn't get "the file system"; it gets access to specific directories the host decided to open.

A small Rust example compiled for the WASI target shows that the code itself looks ordinary:

\`\`\`rust
use std::fs;

fn main() {
    // Only works if the runtime granted access to this directory
    match fs::read_to_string("data/config.txt") {
        Ok(text) => println!("config: {}", text.trim()),
        Err(e) => eprintln!("no access: {}", e),
    }
}
\`\`\`

\`\`\`bash
rustup target add wasm32-wasip1
cargo build --release --target wasm32-wasip1
# The directory must be granted to the module explicitly
wasmtime run --dir=data target/wasm32-wasip1/release/app.wasm
\`\`\`

Without \`--dir\`, the read fails. That's the point: the default is deny. The WASI specification keeps evolving, including a component model that aims to let modules written in different languages talk through typed interfaces. It's worth following, but check your runtime's support before relying on newer features.

## Where it shines: plugins, edge and serverless

**Plugins** may be the most convincing use case. If you want users or third parties to extend your product with their own code, running that code in-process is risky and running it in separate processes is expensive. With Wasm you embed a runtime, define exactly which functions the plugin may call, and enforce memory and execution-time limits. Databases, proxies, editors and build tools already use this approach for extensions.

**Edge and serverless** benefit from fast startup. A platform running code from many customers across many points of presence needs strong isolation and high density. Lightweight Wasm instances let you serve a request with a brand-new instance without paying the typical cold-start cost of a container.

Other uses that make sense:

1. Sharing the same validation or calculation logic across browser, server and mobile.
2. Running untrusted code in data pipelines, such as user-defined transformations.
3. Shipping command-line tools that run on any system with a runtime.

## Limits, and when not to use it

Enthusiasm sometimes hides the costs. Before adopting it, consider:

- **Uneven ecosystem**: languages with heavy runtimes or their own garbage collector produce bigger binaries and don't always have full support. Libraries that depend on threads, sockets or specific system calls may not compile.
- **The host boundary**: passing complex data between host and module requires serialization or memory copies. For small, very frequent calls, that cost can dominate.
- **Performance**: usually close to native for compute-heavy code, but not guaranteed, and features like SIMD and threads depend on the runtime.
- **Debugging and observability**: tooling has improved but is still less mature than for native processes or containers.

> Wasm is great for isolating pieces of logic. It is not a more modern way to package an entire application.

If you have a regular web service with a database, queues and native dependencies, a container remains the simpler and better-supported choice. Wasm pays off when you need fine-grained isolation, lots of cheap instances, or a safe way to run third-party code. Outside of that, it's extra complexity solving a problem you don't have.

A sensible way to try it is small and reversible: pick one well-bounded piece, such as a pure transformation function or a user-defined rule, compile it to Wasm, embed a runtime and measure startup, memory and the cost of crossing the boundary. If the numbers and the developer experience hold up, expand from there. If they don't, you've lost a week, not an architecture.

## In short

- Wasm combines default sandboxing, portability and fast startup in a standardized format.
- WASI grants system access by capability: the module only sees what the host hands over.
- The strongest cases are plugins, edge, serverless and running untrusted code.
- Ecosystem gaps, host-boundary costs and tooling still impose real limits.
- For a traditional service, a container is still the simpler answer.`,
    },
  },
  {
    key: "observability",
    cover: "observability",
    tags: ["infra"],
    daysAgo: 34,
    pt: {
      slug: "observabilidade-com-opentelemetry",
      title: "Observabilidade com OpenTelemetry, sem afogar em dados",
      excerpt:
        "Logs, métricas e traces respondem perguntas diferentes. Como instrumentar um serviço Node, propagar contexto, amostrar com critério e alertar só no que importa.",
      body: `Todo sistema em produção acaba fazendo a mesma pergunta às três da manhã: por que isso está lento, e onde? Observabilidade é a capacidade de responder a perguntas que você não previu, olhando para o que o sistema emite, sem precisar subir uma versão nova com mais prints. O OpenTelemetry se tornou o padrão aberto para gerar e transportar esses sinais sem prender você a um fornecedor. Mas instrumentar tudo e mandar tudo para algum lugar é o caminho mais rápido para uma conta alta e um painel que ninguém entende. Este texto é sobre fazer o suficiente, do jeito certo.

## Logs, métricas e traces: perguntas diferentes

Os três sinais não são redundantes; cada um é bom numa coisa.

- **Métricas** são números agregados ao longo do tempo: taxa de requisições, latência por percentil, uso de memória. São baratas de guardar e ótimas para alertas e tendências. Respondem "algo está errado?".
- **Traces** mostram o caminho de uma requisição específica pelos serviços, dividido em spans com duração e atributos. Respondem "onde está o tempo e qual etapa falhou?".
- **Logs** são eventos discretos com detalhe livre. Respondem "o que exatamente aconteceu neste caso?".

O fluxo típico de investigação passa pelos três: a métrica dispara o alerta, o trace mostra que o tempo está numa chamada ao banco, o log daquele span traz a query e o erro. O que costura tudo é ter o mesmo identificador de trace nos três sinais.

## Propagação de contexto

Um trace só é útil se atravessa fronteiras. Quando o serviço A chama o serviço B, A precisa enviar o identificador do trace e do span atual, e B precisa continuá-lo em vez de começar outro. O OpenTelemetry usa por padrão o cabeçalho \`traceparent\` do W3C Trace Context para isso. As instrumentações automáticas de HTTP já fazem a injeção e a extração; o cuidado fica com o que não é HTTP. Filas, jobs agendados e eventos precisam carregar o contexto nos metadados da mensagem, ou o trace se parte em pedaços desconexos.

Dentro do processo, o Node mantém o contexto ativo através de chamadas assíncronas. Isso funciona na maioria dos casos, mas pode se perder com bibliotecas que gerenciam callbacks de forma própria. Se spans aparecem órfãos, é o primeiro lugar para olhar.

## Instrumentando um serviço Node

O caminho mais curto é carregar o SDK antes de qualquer outro módulo e ligar as instrumentações automáticas, que cobrem HTTP, frameworks populares e drivers de banco.

\`\`\`ts
// instrumentation.ts — carregado antes da aplicação
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  serviceName: "checkout-api",
  traceExporter: new OTLPTraceExporter(), // usa OTEL_EXPORTER_OTLP_ENDPOINT
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});
\`\`\`

A instrumentação automática mostra a casca: a requisição chegou, chamou o banco, chamou outro serviço. O valor de negócio vem dos spans manuais em volta das operações que importam, com atributos que ajudam a filtrar:

\`\`\`ts
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout");

export async function chargeOrder(orderId: string, amountCents: number) {
  return tracer.startActiveSpan("charge-order", async (span) => {
    span.setAttribute("order.id", orderId);
    span.setAttribute("order.amount_cents", amountCents);
    try {
      return await paymentGateway.charge(orderId, amountCents);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
\`\`\`

Cuidado com o que vira atributo: nada de dados pessoais, tokens ou corpos de requisição inteiros. E evite atributos de alta cardinalidade em métricas, como id de usuário, porque cada valor distinto cria uma nova série e o custo explode.

Na maioria dos casos vale colocar um OpenTelemetry Collector entre os serviços e o backend. Ele recebe os dados, aplica filtros, remove campos sensíveis, faz amostragem e exporta para onde você quiser. Trocar de fornecedor passa a ser uma mudança de configuração no Collector, não em cada serviço.

## Amostragem, custo e alertas

Guardar cem por cento dos traces de um serviço com muito tráfego raramente compensa. Há duas famílias de amostragem:

1. **Na origem (head sampling)**: a decisão é tomada no início do trace, por exemplo mantendo uma fração fixa. É simples e barata, mas descarta às cegas, inclusive os traces com erro.
2. **No fim (tail sampling)**: o Collector espera o trace terminar e decide com base no resultado, mantendo todos os erros e as requisições lentas e só uma amostra das normais. É mais útil e mais cara de operar, porque exige guardar traces em memória até a decisão.

Para controlar custo, além da amostragem: defina retenção curta para dados detalhados, prefira métricas a logs para contar coisas, reduza logs verbosos em produção e revise periodicamente quais atributos e séries ninguém consulta.

Sobre alertas, a regra que mais economiza noites é alertar em sintomas que o usuário sente, não em causas internas. Taxa de erro e latência dos endpoints importantes, idealmente expressas como objetivos de nível de serviço, merecem acordar alguém. CPU alta, por si só, não; se ela não afeta o usuário, é informação para o painel.

> Se um alerta dispara e a resposta certa é "ignorar", ele não é um alerta, é ruído treinando o time a ignorar alertas.

Quando *não* ir longe: um serviço pequeno, com pouco tráfego e um único processo, pode viver bem com logs estruturados e algumas métricas. Traces distribuídos brilham quando há várias peças conversando. Comece pelo que responde as perguntas que você faz hoje.

## Em resumo

- Métricas detectam, traces localizam, logs explicam; ligue os três pelo id do trace.
- Propague contexto também em filas e jobs, não só em HTTP.
- Use instrumentação automática como base e spans manuais nas operações de negócio.
- Amostre com critério, de preferência mantendo erros e requisições lentas, e vigie a cardinalidade.
- Alerte em sintomas que o usuário sente; o resto vai para o painel.`,
    },
    en: {
      slug: "observability-with-opentelemetry",
      title: "Observability with OpenTelemetry, without drowning in data",
      excerpt:
        "Logs, metrics and traces answer different questions. How to instrument a Node service, propagate context, sample sensibly and alert only on what matters.",
      body: `Every production system eventually asks the same question at three in the morning: why is this slow, and where? Observability is the ability to answer questions you didn't anticipate by looking at what the system emits, without shipping a new build full of print statements. OpenTelemetry has become the open standard for producing and shipping those signals without locking you into a vendor. But instrumenting everything and sending everything somewhere is the fastest route to a big bill and a dashboard nobody understands. This column is about doing enough, the right way.

## Logs, metrics and traces: different questions

The three signals aren't redundant; each is good at one thing.

- **Metrics** are numbers aggregated over time: request rate, latency percentiles, memory usage. They're cheap to store and great for alerts and trends. They answer "is something wrong?".
- **Traces** show the path of one specific request through your services, broken into spans with durations and attributes. They answer "where is the time going and which step failed?".
- **Logs** are discrete events with free-form detail. They answer "what exactly happened in this case?".

A typical investigation touches all three: a metric fires the alert, a trace shows the time is spent in a database call, and the log attached to that span holds the query and the error. What stitches them together is having the same trace id on all three signals.

## Context propagation

A trace is only useful if it crosses boundaries. When service A calls service B, A has to send the current trace and span ids, and B has to continue that trace instead of starting a new one. OpenTelemetry uses the W3C Trace Context \`traceparent\` header for this by default. The automatic HTTP instrumentations already inject and extract it; the care goes into what isn't HTTP. Queues, scheduled jobs and events need to carry the context in message metadata, or the trace breaks into disconnected fragments.

Inside the process, Node keeps the active context across async calls. That works in most cases but can get lost with libraries that manage callbacks in their own way. If spans show up orphaned, that's the first place to look.

## Instrumenting a Node service

The shortest path is to load the SDK before any other module and turn on the automatic instrumentations, which cover HTTP, popular frameworks and database drivers.

\`\`\`ts
// instrumentation.ts — loaded before the application
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  serviceName: "checkout-api",
  traceExporter: new OTLPTraceExporter(), // reads OTEL_EXPORTER_OTLP_ENDPOINT
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});
\`\`\`

Automatic instrumentation shows you the shell: the request came in, hit the database, called another service. Business value comes from manual spans around the operations that matter, with attributes that help you filter:

\`\`\`ts
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout");

export async function chargeOrder(orderId: string, amountCents: number) {
  return tracer.startActiveSpan("charge-order", async (span) => {
    span.setAttribute("order.id", orderId);
    span.setAttribute("order.amount_cents", amountCents);
    try {
      return await paymentGateway.charge(orderId, amountCents);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
\`\`\`

Be careful about what becomes an attribute: no personal data, tokens or whole request bodies. And avoid high-cardinality attributes on metrics, such as user ids, because every distinct value creates a new series and costs explode.

In most setups it's worth putting an OpenTelemetry Collector between your services and the backend. It receives the data, filters it, strips sensitive fields, samples and exports wherever you like. Switching vendors becomes a Collector config change instead of a change in every service.

## Sampling, cost and alerts

Keeping one hundred percent of traces from a high-traffic service rarely pays off. There are two families of sampling:

1. **Head sampling**: the decision is made when the trace starts, for example keeping a fixed fraction. It's simple and cheap, but it discards blindly, error traces included.
2. **Tail sampling**: the Collector waits for the trace to finish and decides based on the outcome, keeping every error and slow request and only a sample of the normal ones. It's more useful and more expensive to run, since traces must be held in memory until the decision.

To control cost beyond sampling: set short retention for detailed data, prefer metrics over logs for counting things, turn down verbose logging in production, and periodically review which attributes and series nobody queries.

On alerting, the rule that saves the most nights is to alert on symptoms users feel, not on internal causes. Error rate and latency on the endpoints that matter, ideally expressed as service level objectives, deserve to wake someone up. High CPU on its own doesn't; if it isn't hurting users, it belongs on a dashboard.

> If an alert fires and the right response is "ignore it", it isn't an alert. It's noise training your team to ignore alerts.

When *not* to go far: a small, low-traffic, single-process service can live happily with structured logs and a handful of metrics. Distributed tracing shines when several pieces are talking to each other. Start with whatever answers the questions you're actually asking today.

## In short

- Metrics detect, traces locate, logs explain; link all three through the trace id.
- Propagate context through queues and jobs too, not only HTTP.
- Use automatic instrumentation as a base and manual spans for business operations.
- Sample deliberately, ideally keeping errors and slow requests, and watch cardinality.
- Alert on symptoms users feel; everything else goes on a dashboard.`,
    },
  },
  {
    key: "local-first",
    cover: "local-first",
    tags: ["web", "databases"],
    daysAgo: 38,
    pt: {
      slug: "software-local-first",
      title: "Software local-first: o dado mora com o usuário",
      excerpt:
        "Apps que funcionam offline, respondem instantaneamente e sincronizam depois. Como CRDTs resolvem conflitos, quais trade-offs vêm junto e quando a ideia compensa.",
      body: `A maior parte dos aplicativos web trata o servidor como a única fonte da verdade e o dispositivo do usuário como uma janela para ela. Cada clique vira uma requisição, cada tela espera uma resposta, e sem conexão não há aplicativo. Software local-first inverte essa relação: o dado principal vive no dispositivo, as operações acontecem localmente e a sincronização com outros dispositivos e com o servidor acontece em segundo plano, quando dá. O resultado é uma interface que responde na hora e funciona num avião. O preço é que você passa a lidar com um problema que o modelo tradicional escondia: o que fazer quando duas cópias divergem.

## Offline-first como experiência

O argumento mais forte para local-first não é técnico, é de experiência. Quando a escrita vai direto para um banco local, como IndexedDB ou SQLite, não existe spinner. Salvar é instantâneo, a busca é instantânea, e uma conexão ruim deixa de ser um estado de erro para virar um detalhe. Isso muda o desenho da interface:

- Não há mais "salvando..." bloqueando o usuário; no máximo um indicador discreto de sincronização pendente.
- Erros de rede deixam de interromper o fluxo; a operação fica numa fila e é reenviada depois.
- O usuário tem uma cópia dos próprios dados, o que melhora privacidade e reduz a dependência de o serviço continuar existindo.

Em contrapartida, a interface precisa comunicar com honestidade o estado da sincronização. Mostrar algo como salvo quando ainda não chegou a nenhum outro lugar é aceitável, desde que o usuário consiga descobrir isso quando importa.

## Sincronização e o problema dos conflitos

Se dois dispositivos editam o mesmo dado sem se falar, em algum momento eles vão se reencontrar com versões diferentes. As estratégias mais comuns, da mais simples para a mais sofisticada:

1. **Última escrita vence**: cada alteração tem um carimbo de tempo e a mais recente prevalece. É fácil e serve para muitos campos simples, mas descarta trabalho em silêncio e depende de relógios que podem estar errados.
2. **Resolução manual**: o sistema detecta o conflito e pergunta ao usuário. É correto, mas cansativo se acontece com frequência.
3. **Fusão automática por estrutura de dados**: a própria representação do dado garante que todas as cópias, ao receberem as mesmas operações, cheguem ao mesmo resultado. É aqui que entram os CRDTs.

## CRDTs explicados de forma simples

CRDT significa tipo de dado replicado livre de conflitos. A ideia é desenhar o dado de modo que a operação de juntar duas versões seja comutativa, associativa e idempotente: não importa a ordem em que as atualizações chegam, nem se chegam duplicadas, todas as réplicas convergem para o mesmo estado sem coordenação.

O exemplo mais simples é um contador que só cresce. Em vez de guardar um número, cada réplica guarda quanto *ela* incrementou. Juntar é pegar o maior valor de cada réplica; o total é a soma.

\`\`\`ts
type GCounter = Record<string, number>; // id da réplica -> incrementos dela

function increment(c: GCounter, replica: string, by = 1): GCounter {
  return { ...c, [replica]: (c[replica] ?? 0) + by };
}

function merge(a: GCounter, b: GCounter): GCounter {
  const out: GCounter = { ...a };
  for (const [id, n] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, n);
  return out;
}

const value = (c: GCounter) => Object.values(c).reduce((s, n) => s + n, 0);

// Dois dispositivos offline
let phone = increment({}, "phone");        // { phone: 1 }
let laptop = increment({}, "laptop", 2);   // { laptop: 2 }
phone = merge(phone, laptop);
laptop = merge(laptop, phone);
console.log(value(phone), value(laptop));  // 3 3
\`\`\`

Repare que \`merge\` pode ser aplicado em qualquer ordem, repetidas vezes, e o resultado não muda. Essa é toda a mágica. Estruturas mais ricas seguem o mesmo princípio: registros em que a última escrita vence por campo, conjuntos que suportam adição e remoção, listas e textos que preservam a intenção de inserções concorrentes. Você raramente vai implementar isso à mão; bibliotecas maduras como Automerge e Yjs oferecem documentos inteiros com essas garantias.

## Trade-offs e quando vale a pena

CRDTs garantem convergência, não garantem que o resultado faça sentido para o negócio. Se duas pessoas reservam a última vaga de um evento offline, ambas as réplicas vão concordar que há duas reservas, e isso continua sendo um problema. Algumas restrições só podem ser verificadas por uma autoridade central.

Outros custos a considerar:

- **Metadados**: guardar histórico e identificadores de operação aumenta o tamanho dos documentos, e compactar esse histórico tem suas próprias complicações.
- **Permissões**: num modelo em que cada cliente tem os dados, controlar quem pode ver e alterar o quê exige cuidado; o servidor ainda precisa validar o que aceita.
- **Migrações de esquema**: clientes antigos podem ficar offline por semanas e voltar com dados em formato antigo.
- **Consultas e volume**: nem todo conjunto de dados cabe ou deve caber no dispositivo.

> Local-first troca a complexidade de esperar o servidor pela complexidade de concordar depois.

Vale a pena em editores de documentos e notas, ferramentas de design, aplicativos de campo usados com conexão instável, apps pessoais de produtividade e qualquer coisa colaborativa em tempo real. Não vale a pena quando a operação depende intrinsecamente de uma decisão central: pagamentos, estoque, reservas, saldos. Nesses casos, um modelo tradicional com uma boa experiência otimista na interface entrega a maior parte do benefício com uma fração do custo.

## Em resumo

- Local-first coloca o dado no dispositivo e sincroniza em segundo plano, trazendo respostas instantâneas e suporte offline.
- Conflitos são inevitáveis; escolha entre última escrita, resolução manual ou CRDTs conforme o dado.
- CRDTs convergem porque a fusão é comutativa, associativa e idempotente.
- Convergência não substitui regras de negócio que exigem uma autoridade central.
- Use em editores, notas e colaboração; evite em pagamentos, estoque e reservas.`,
    },
    en: {
      slug: "local-first-software",
      title: "Local-first software: the data lives with the user",
      excerpt:
        "Apps that work offline, respond instantly and sync later. How CRDTs resolve conflicts, what trade-offs come with them and when the idea pays off.",
      body: `Most web apps treat the server as the single source of truth and the user's device as a window onto it. Every click becomes a request, every screen waits for a response, and without a connection there is no app. Local-first software flips that relationship: the primary copy of the data lives on the device, operations happen locally, and syncing with other devices and the server happens in the background, whenever it can. The result is an interface that responds immediately and works on a plane. The price is that you now face a problem the traditional model kept hidden: what to do when two copies diverge.

## Offline-first as an experience

The strongest argument for local-first isn't technical, it's experiential. When writes go straight to a local database such as IndexedDB or SQLite, there's no spinner. Saving is instant, search is instant, and a bad connection stops being an error state and becomes a detail. That changes how you design the interface:

- No more "saving..." blocking the user; at most a subtle pending-sync indicator.
- Network errors stop interrupting the flow; the operation waits in a queue and gets retried.
- Users hold a copy of their own data, which helps privacy and reduces dependence on the service sticking around.

In exchange, the interface has to be honest about sync state. Showing something as saved when it hasn't reached anywhere else yet is fine, as long as the user can find that out when it matters.

## Sync and the conflict problem

If two devices edit the same data without talking, at some point they'll meet again holding different versions. The common strategies, from simplest to most sophisticated:

1. **Last write wins**: each change carries a timestamp and the newest one prevails. It's easy and fine for many simple fields, but it silently throws work away and relies on clocks that may be wrong.
2. **Manual resolution**: the system detects the conflict and asks the user. Correct, but tiring if it happens often.
3. **Automatic merge by data structure**: the data representation itself guarantees that every replica, given the same operations, reaches the same result. This is where CRDTs come in.

## CRDTs, simply

CRDT stands for conflict-free replicated data type. The idea is to design the data so that merging two versions is commutative, associative and idempotent: no matter what order updates arrive in, or whether they arrive twice, every replica converges to the same state without coordination.

The simplest example is a grow-only counter. Instead of storing one number, each replica stores how much *it* has incremented. Merging takes the larger value per replica; the total is the sum.

\`\`\`ts
type GCounter = Record<string, number>; // replica id -> its increments

function increment(c: GCounter, replica: string, by = 1): GCounter {
  return { ...c, [replica]: (c[replica] ?? 0) + by };
}

function merge(a: GCounter, b: GCounter): GCounter {
  const out: GCounter = { ...a };
  for (const [id, n] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, n);
  return out;
}

const value = (c: GCounter) => Object.values(c).reduce((s, n) => s + n, 0);

// Two devices, both offline
let phone = increment({}, "phone");        // { phone: 1 }
let laptop = increment({}, "laptop", 2);   // { laptop: 2 }
phone = merge(phone, laptop);
laptop = merge(laptop, phone);
console.log(value(phone), value(laptop));  // 3 3
\`\`\`

Notice that \`merge\` can be applied in any order, any number of times, and the result doesn't change. That's the whole trick. Richer structures follow the same principle: records where the last write wins per field, sets that support both adding and removing, lists and text that preserve the intent of concurrent inserts. You'll rarely build these by hand; mature libraries such as Automerge and Yjs give you whole documents with these guarantees.

## Trade-offs, and when it's worth it

CRDTs guarantee convergence, not that the result makes business sense. If two people book the last seat at an event while offline, both replicas will happily agree there are two bookings, and that's still a problem. Some constraints can only be checked by a central authority.

Other costs to weigh:

- **Metadata**: keeping history and operation ids grows document size, and compacting that history has complications of its own.
- **Permissions**: when every client holds the data, controlling who may see and change what takes care; the server still has to validate what it accepts.
- **Schema migrations**: old clients can stay offline for weeks and come back with data in an old shape.
- **Queries and volume**: not every dataset fits, or should fit, on the device.

> Local-first trades the complexity of waiting for the server for the complexity of agreeing later.

It pays off for document and note editors, design tools, field apps used on flaky connections, personal productivity apps and anything collaborative in real time. It doesn't pay off when the operation inherently depends on a central decision: payments, inventory, reservations, balances. There, a traditional model with a good optimistic UI delivers most of the benefit at a fraction of the cost.

## In short

- Local-first keeps data on the device and syncs in the background, giving instant responses and offline support.
- Conflicts are inevitable; pick last-write-wins, manual resolution or CRDTs depending on the data.
- CRDTs converge because merging is commutative, associative and idempotent.
- Convergence doesn't replace business rules that need a central authority.
- Use it for editors, notes and collaboration; avoid it for payments, inventory and bookings.`,
    },
  },
];
