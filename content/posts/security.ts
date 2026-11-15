import type { ContentPost } from "../types";

export const posts: ContentPost[] = [
  {
    key: "passkeys",
    cover: "passkeys",
    tags: ["security", "web"],
    daysAgo: 1,
    pt: {
      slug: "passkeys-e-o-fim-das-senhas",
      title: "Passkeys e o fim das senhas: como o WebAuthn funciona de verdade",
      excerpt:
        "Passkeys trocam o segredo compartilhado por um par de chaves amarrado ao domínio. Entenda o desafio-resposta, o que muda na recuperação de conta e como migrar sem trancar seus usuários do lado de fora.",
      body: `Toda senha é um segredo compartilhado. O usuário sabe, o servidor guarda um hash dela, e qualquer pessoa que consiga convencer o usuário a digitá-la no lugar errado passa a saber também. Décadas de regras de complexidade, rotação obrigatória e cofres de senha tentaram remendar esse modelo, mas o defeito está na fundação: o segredo viaja. Passkeys, construídas sobre o padrão WebAuthn, mudam a fundação. O segredo nunca sai do dispositivo, e o que vai para o servidor é só uma chave pública, que não serve para nada nas mãos de um atacante.

## Como o desafio-resposta funciona

No cadastro, o navegador pede ao autenticador (o chip seguro do celular, o gerenciador de senhas do sistema ou uma chave física) que gere um par de chaves para aquele site. A chave privada fica no autenticador; a pública, junto com um identificador de credencial, vai para o seu backend. Daí em diante, cada login segue o mesmo roteiro:

1. O servidor gera um desafio aleatório, de uso único, e o envia ao navegador.
2. O navegador repassa o desafio ao autenticador, junto com a origem que está pedindo a assinatura.
3. O autenticador verifica o usuário localmente (biometria ou PIN), assina os dados e devolve a assinatura.
4. O servidor valida a assinatura com a chave pública guardada, confere o desafio e a origem, e abre a sessão.

No lado do cliente, o código é curto:

\`\`\`ts
const options = await fetch("/auth/passkey/options", { method: "POST" }).then((r) => r.json());

const credential = await navigator.credentials.get({
  publicKey: {
    challenge: base64urlToBuffer(options.challenge),
    rpId: "example.com",
    userVerification: "preferred",
    allowCredentials: [],
  },
});

await fetch("/auth/passkey/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(serializeCredential(credential)),
});
\`\`\`

A parte delicada está no servidor: decodificar o CBOR, checar o \`rpIdHash\`, a origem dentro do \`clientDataJSON\`, os flags de presença e verificação do usuário. Não escreva isso à mão. Use uma biblioteca madura do seu ecossistema, que já trata os casos de borda e os formatos de atestação.

## Por que isso resiste a phishing

A propriedade mais importante das passkeys não é a criptografia em si, é o vínculo com a origem. A credencial é criada para um \`rpId\` específico, e o navegador, não o usuário, informa ao autenticador de onde o pedido está vindo. Um site falso em \`examp1e.com\` pode copiar o layout pixel por pixel; o autenticador simplesmente não encontra credencial para aquele domínio. Não há nada para digitar, logo não há nada para roubar.

Compare com códigos de uso único por SMS ou aplicativo: eles melhoram muito sobre senha pura, mas um proxy de phishing pode repassar o código em tempo real. Com WebAuthn, a assinatura cobre a origem, e o servidor recusa uma assinatura feita para outro lugar. Some a isso o fato de que o banco de dados passa a guardar só chaves públicas: um vazamento deixa de ser uma lista de credenciais reutilizáveis.

## Sincronizadas ou presas ao dispositivo

Existem dois sabores, e a escolha tem consequências.

- **Passkeys sincronizadas** vivem no gerenciador de credenciais da plataforma ou de um fornecedor de cofre e aparecem em todos os dispositivos da conta do usuário. A experiência é ótima e a perda de um celular não é uma tragédia. Em troca, a segurança passa a depender da conta que faz a sincronização.
- **Passkeys presas ao dispositivo**, como as de uma chave de segurança física, nunca saem do hardware. São o padrão-ouro para administradores e contas de alto risco, mas exigem que o usuário cadastre mais de uma chave, ou fique sem acesso quando perder a única.

Para a maioria dos produtos de consumo, sincronizadas são a escolha sensata. Para painéis internos e contas privilegiadas, vale exigir chaves de hardware, ou ao menos oferecê-las.

## Recuperação de conta é o novo elo fraco

Aqui mora a armadilha. Você pode implementar um login à prova de phishing e anular tudo com um fluxo de "esqueci meu acesso" que manda um link por e-mail para qualquer um que peça. O atacante não precisa quebrar a passkey se puder simplesmente recuperá-la.

> A segurança de uma conta é a segurança do seu caminho de recuperação mais fraco.

Algumas práticas ajudam:

- Incentive o cadastro de mais de uma passkey, em dispositivos diferentes, logo após o primeiro login.
- Trate a recuperação como evento sensível: notifique todos os canais conhecidos, aplique um atraso quando fizer sentido e revogue sessões antigas ao concluir.
- Mostre ao usuário a lista de passkeys cadastradas, com nome do dispositivo e data de último uso, e permita revogar cada uma.
- Não remova a senha da noite para o dia; mas, quando o usuário tiver passkeys, considere permitir que ele desative a senha.

## Implantação sem drama

O caminho mais seguro é incremental. Comece oferecendo passkey como segundo fator ou como opção de login ao lado da senha. Depois de um login bem-sucedido com senha, sugira criar uma passkey, com uma frase clara e sem jargão. Use o autopreenchimento condicional (\`mediation: "conditional"\` com \`autocomplete="username webauthn"\` no campo) para que as passkeys apareçam junto das sugestões de usuário, sem botão extra.

Escolha o \`rpId\` com cuidado, porque mudá-lo depois invalida todas as credenciais: em geral, o domínio registrável principal, para que subdomínios possam compartilhá-lo. Guarde vários registros de credencial por usuário, não um só. Registre métricas de adoção e de falha por plataforma, porque os problemas aparecem em combinações específicas de navegador e sistema. E escreva o texto de interface pensando em quem nunca ouviu a palavra "passkey": "entre com o desbloqueio do seu celular" comunica mais que qualquer sigla.

## Em resumo

- Passkeys substituem o segredo compartilhado por um par de chaves; o servidor guarda apenas a chave pública.
- O vínculo com a origem é o que torna o login resistente a phishing, e isso é imposto pelo navegador.
- Sincronizadas favorecem a usabilidade; presas ao dispositivo servem às contas de maior risco.
- O fluxo de recuperação define a segurança real da conta: projete-o com o mesmo cuidado do login.
- Implante aos poucos, use uma biblioteca de verificação madura e escolha o \`rpId\` uma vez só.`,
    },
    en: {
      slug: "passkeys-and-the-end-of-passwords",
      title: "Passkeys and the End of Passwords: How WebAuthn Actually Works",
      excerpt:
        "Passkeys replace the shared secret with a key pair bound to your domain. Here is how the challenge-response works, what changes for account recovery, and how to roll it out without locking users out.",
      body: `Every password is a shared secret. The user knows it, the server stores a hash of it, and anyone who can talk the user into typing it in the wrong place knows it too. Decades of complexity rules, forced rotation and password managers have tried to patch that model, but the flaw is in the foundation: the secret travels. Passkeys, built on the WebAuthn standard, replace the foundation. The secret never leaves the device, and what reaches your server is a public key that is useless in an attacker's hands.

## How the challenge-response works

At registration, the browser asks an authenticator (the phone's secure enclave, the operating system's credential manager, or a hardware key) to generate a key pair for your site. The private key stays in the authenticator; the public key and a credential ID go to your backend. From then on, every sign-in follows the same script:

1. The server generates a random, single-use challenge and sends it to the browser.
2. The browser hands the challenge to the authenticator, along with the origin requesting the signature.
3. The authenticator verifies the user locally (biometrics or PIN), signs the data and returns the signature.
4. The server checks the signature against the stored public key, confirms the challenge and origin, and starts a session.

The client side is short:

\`\`\`ts
const options = await fetch("/auth/passkey/options", { method: "POST" }).then((r) => r.json());

const credential = await navigator.credentials.get({
  publicKey: {
    challenge: base64urlToBuffer(options.challenge),
    rpId: "example.com",
    userVerification: "preferred",
    allowCredentials: [],
  },
});

await fetch("/auth/passkey/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(serializeCredential(credential)),
});
\`\`\`

The tricky part lives on the server: decoding CBOR, checking the \`rpIdHash\`, the origin inside \`clientDataJSON\`, the user-presence and user-verification flags. Do not hand-roll this. Use a mature library for your stack that already handles the edge cases and attestation formats.

## Why this resists phishing

The most important property of passkeys is not the cryptography itself; it is origin binding. A credential is created for a specific \`rpId\`, and the browser, not the user, tells the authenticator where the request comes from. A fake site at \`examp1e.com\` can copy your layout pixel for pixel; the authenticator simply has no credential for that domain. There is nothing to type, so there is nothing to steal.

Compare that with one-time codes over SMS or an authenticator app. They are a big step up from bare passwords, but a phishing proxy can relay the code in real time. With WebAuthn, the signature covers the origin, and your server rejects a signature made for somewhere else. Add the fact that your database now holds only public keys, and a breach stops being a list of reusable credentials.

## Synced or device-bound

There are two flavors, and the choice matters.

- **Synced passkeys** live in the platform's credential manager or a third-party vault and show up on every device tied to the user's account. The experience is excellent, and losing a phone is not a disaster. The trade-off is that security now leans on the account doing the syncing.
- **Device-bound passkeys**, such as those on a hardware security key, never leave the hardware. They are the gold standard for administrators and high-risk accounts, but users must register more than one key or risk losing access with the only one they had.

For most consumer products, synced passkeys are the sensible default. For internal dashboards and privileged accounts, require hardware keys, or at least offer them.

## Account recovery is the new weak link

Here is the trap. You can ship phishing-resistant sign-in and undo all of it with a "lost access" flow that emails a magic link to anyone who asks. An attacker doesn't need to break the passkey if they can simply recover the account.

> An account is only as secure as its weakest recovery path.

A few practices help:

- Nudge users to register more than one passkey, on different devices, right after their first sign-in.
- Treat recovery as a sensitive event: notify every known channel, add a delay where it makes sense, and revoke old sessions once it completes.
- Show users their registered passkeys, with device name and last-used date, and let them revoke each one.
- Don't remove passwords overnight; but once a user has passkeys, consider letting them turn the password off.

## Rolling it out without drama

The safest path is incremental. Start by offering passkeys as a second factor or as a sign-in option next to the password. After a successful password login, suggest creating a passkey, in plain words with no jargon. Use conditional UI (\`mediation: "conditional"\` with \`autocomplete="username webauthn"\` on the field) so passkeys appear alongside username suggestions, with no extra button.

Pick your \`rpId\` carefully, because changing it later invalidates every credential: usually the main registrable domain, so subdomains can share it. Store many credential records per user, not one. Track adoption and failure metrics per platform, because problems show up in specific browser and OS combinations. And write the UI copy for someone who has never heard the word "passkey": "sign in with your phone's screen lock" says more than any acronym.

## In short

- Passkeys replace the shared secret with a key pair; your server stores only the public key.
- Origin binding is what makes sign-in phishing-resistant, and the browser enforces it.
- Synced passkeys favor usability; device-bound ones suit the highest-risk accounts.
- Your recovery flow sets the account's real security, so design it with the same care as sign-in.
- Roll out gradually, rely on a mature verification library, and choose your \`rpId\` once.`,
    },
  },
  {
    key: "supply-chain",
    cover: "supply-chain",
    tags: ["security", "languages"],
    daysAgo: 5,
    pt: {
      slug: "ataques-a-cadeia-de-suprimentos-de-software",
      title: "A dependência que você não escreveu: ataques à cadeia de suprimentos de software",
      excerpt:
        "Typosquatting, confusão de dependências, mantenedores comprometidos e scripts de instalação maliciosos. Um guia prático para endurecer um projeto JavaScript/TypeScript sem parar de entregar.",
      body: `Abra o \`node_modules\` de um projeto web comum e conte as pastas. Você declarou algumas dezenas de dependências; instalou centenas, às vezes milhares. Cada uma é código de um estranho, executado com as mesmas permissões que o seu, muitas vezes na sua máquina de desenvolvimento, onde moram chaves SSH, tokens de nuvem e acesso ao repositório. Atacantes perceberam há tempos que é mais barato envenenar uma biblioteca popular do que invadir mil empresas uma a uma. A cadeia de suprimentos de software virou superfície de ataque, e tratá-la como detalhe de infraestrutura é um erro caro.

## Como os ataques acontecem

Os vetores se repetem, ecossistema após ecossistema:

- **Typosquatting**: um pacote com nome quase idêntico a um popular, esperando um erro de digitação ou uma sugestão automática apressada.
- **Confusão de dependências**: sua empresa usa um pacote interno, digamos \`@acme/utils\` ou um nome sem escopo, e alguém publica um pacote com o mesmo nome no registro público, com versão mais alta. Um gerenciador mal configurado pode preferir o público.
- **Mantenedor comprometido**: a conta de quem publica um pacote legítimo é tomada, ou o projeto muda de mãos, e uma versão nova traz código malicioso. Esse é o mais perigoso, porque o nome é exatamente o que você confia.
- **Scripts de instalação**: hooks como \`preinstall\` e \`postinstall\` rodam automaticamente no \`npm install\`. Um pacote malicioso não precisa nem ser importado pelo seu código; basta ser instalado.

O denominador comum é a confiança implícita. Você não revisou aquele código, mas deu a ele acesso a tudo.

## Lockfiles e instalação reprodutível

O primeiro controle é o mais simples e o mais negligenciado. O lockfile fixa a versão exata e o hash de integridade de cada pacote da árvore. Sem ele, cada \`install\` pode resolver versões diferentes, e uma versão maliciosa recém-publicada entra no seu build sem ninguém perceber.

Versione o lockfile, sempre. No CI, use o comando de instalação que respeita o lockfile e falha se ele estiver desatualizado, em vez de reescrevê-lo:

\`\`\`bash
# npm: instala exatamente o que está no package-lock.json, sem scripts
npm ci --ignore-scripts

# pnpm: falha se o lockfile não corresponder ao package.json
pnpm install --frozen-lockfile
\`\`\`

E revise diffs de lockfile em pull requests. É tedioso, mas uma dependência transitiva nova aparecendo do nada numa atualização de patch é exatamente o tipo de sinal que você quer ver.

## Desligue o que você não usa

Scripts de instalação são convenientes para pacotes que compilam binários nativos, e um risco para todo o resto. Uma postura razoável é desativá-los por padrão e liberar apenas os que você conhece. No npm, isso começa com um \`.npmrc\`:

\`\`\`ini
ignore-scripts=true
save-exact=true
\`\`\`

O pnpm vai além e, nas versões recentes, não executa scripts de dependências a menos que você os aprove explicitamente numa lista. Seja qual for a ferramenta, o princípio é o mesmo: código só roda na instalação se alguém decidiu que deve rodar.

Para a confusão de dependências, a defesa é configurar escopos. Se seus pacotes internos vivem sob \`@acme\`, aponte esse escopo para o registro privado e garanta que o nome do escopo também esteja reservado no registro público. Nunca deixe pacotes internos sem escopo.

## Proveniência, assinatura e SBOM

Lockfile garante que você instala sempre a mesma coisa. Não garante que a coisa é legítima. É aí que entram proveniência e assinatura.

Atestados de proveniência ligam um pacote publicado ao repositório e ao pipeline de CI que o gerou. No npm, pacotes publicados de pipelines compatíveis podem carregar esse atestado, e o comando \`npm audit signatures\` verifica assinaturas e atestados das dependências instaladas. Não é bala de prata, porque um pipeline comprometido gera atestados válidos, mas eleva bastante o custo de publicar algo por fora do processo normal. Se você mantém pacotes, publique com proveniência a partir do CI, não do seu notebook.

Um SBOM (Software Bill of Materials) é o inventário: quais componentes, em quais versões, entram no seu artefato. Formatos como CycloneDX e SPDX são legíveis por máquina, e várias ferramentas geram SBOMs a partir do lockfile. O valor aparece no dia em que alguém anuncia uma vulnerabilidade grave numa biblioteca: em vez de sair perguntando time por time, você consulta o inventário e sabe em minutos onde ela está.

## O que fazer na segunda-feira

Endurecer a cadeia não exige um projeto de seis meses. Uma lista curta, em ordem de custo:

1. Versione o lockfile e use instalação congelada no CI.
2. Desative scripts de instalação por padrão e libere só os necessários.
3. Configure escopos para pacotes internos e reserve o nome no registro público.
4. Ative atualizações automatizadas de dependências, mas com revisão humana e, se possível, um pequeno atraso antes de adotar versões recém-publicadas.
5. Rode \`npm audit signatures\` e uma ferramenta de análise de vulnerabilidades no pipeline.
6. Gere um SBOM a cada release e guarde junto do artefato.
7. Exija 2FA nas contas que publicam pacotes e use tokens de publicação com escopo mínimo.

E, antes de adicionar uma dependência, faça a pergunta antiquada: preciso mesmo disso? Uma função de dez linhas escrita por você não tem mantenedor para ser comprometido.

> Cada dependência é uma decisão de confiança. Tome essa decisão de propósito.

## Em resumo

- Seu código roda junto de centenas de pacotes que você não revisou; trate isso como superfície de ataque.
- Lockfile versionado e instalação congelada no CI são o mínimo inegociável.
- Scripts de instalação desativados por padrão eliminam uma classe inteira de ataques.
- Proveniência e assinatura elevam o custo de publicações fraudulentas; SBOMs aceleram a resposta.
- Menos dependências significam menos confiança delegada.`,
    },
    en: {
      slug: "software-supply-chain-attacks",
      title: "The Dependency You Didn't Write: Software Supply Chain Attacks",
      excerpt:
        "Typosquatting, dependency confusion, compromised maintainers and malicious install scripts. A practical guide to hardening a JavaScript/TypeScript project without slowing delivery to a crawl.",
      body: `Open the \`node_modules\` folder of a typical web project and count the directories. You declared a few dozen dependencies; you installed hundreds, sometimes thousands. Each one is a stranger's code, running with the same permissions as yours, often on your development machine, where SSH keys, cloud tokens and repository access live. Attackers figured out long ago that poisoning one popular library is cheaper than breaking into a thousand companies one at a time. The software supply chain is attack surface, and treating it as an infrastructure footnote is an expensive mistake.

## How the attacks work

The vectors repeat across ecosystems:

- **Typosquatting**: a package whose name is nearly identical to a popular one, waiting for a typo or a hasty autocomplete.
- **Dependency confusion**: your company uses an internal package, say \`@acme/utils\` or an unscoped name, and someone publishes a package with the same name to the public registry with a higher version. A misconfigured package manager may prefer the public one.
- **Compromised maintainers**: the account that publishes a legitimate package is taken over, or the project changes hands, and a new release ships malicious code. This is the most dangerous one, because the name is exactly the one you trust.
- **Install scripts**: hooks like \`preinstall\` and \`postinstall\` run automatically on \`npm install\`. A malicious package doesn't even need to be imported by your code; installing it is enough.

The common thread is implicit trust. You never reviewed that code, yet you gave it access to everything.

## Lockfiles and reproducible installs

The first control is the simplest and the most neglected. A lockfile pins the exact version and integrity hash of every package in the tree. Without it, each \`install\` may resolve different versions, and a freshly published malicious release slips into your build unnoticed.

Commit the lockfile, always. In CI, use the install command that honors the lockfile and fails when it is out of date, instead of rewriting it:

\`\`\`bash
# npm: install exactly what package-lock.json says, with no scripts
npm ci --ignore-scripts

# pnpm: fail if the lockfile doesn't match package.json
pnpm install --frozen-lockfile
\`\`\`

And review lockfile diffs in pull requests. It's tedious, but a brand-new transitive dependency appearing out of nowhere in a patch bump is exactly the kind of signal you want to catch.

## Turn off what you don't use

Install scripts are handy for packages that compile native binaries, and a liability for everything else. A sensible stance is to disable them by default and allow only the ones you know. With npm, that starts with an \`.npmrc\`:

\`\`\`ini
ignore-scripts=true
save-exact=true
\`\`\`

pnpm goes further: recent versions don't run dependency scripts unless you explicitly approve them in an allowlist. Whatever the tool, the principle holds: code runs at install time only if someone decided it should.

For dependency confusion, the defense is scoping. If your internal packages live under \`@acme\`, route that scope to your private registry and make sure the scope name is also claimed on the public registry. Never leave internal packages unscoped.

## Provenance, signing and SBOMs

A lockfile guarantees you install the same thing every time. It doesn't guarantee the thing is legitimate. That's where provenance and signing come in.

Provenance attestations link a published package to the repository and CI pipeline that built it. On npm, packages published from supported pipelines can carry such an attestation, and \`npm audit signatures\` verifies signatures and attestations for installed dependencies. It isn't a silver bullet, since a compromised pipeline produces valid attestations, but it raises the cost of publishing something outside the normal process. If you maintain packages, publish with provenance from CI, not from your laptop.

An SBOM (Software Bill of Materials) is the inventory: which components, at which versions, go into your artifact. Formats like CycloneDX and SPDX are machine-readable, and several tools generate SBOMs from the lockfile. The payoff comes the day a serious vulnerability is announced in some library: instead of asking team after team, you query the inventory and know within minutes where it lives.

## What to do on Monday

Hardening the chain doesn't take a six-month program. A short list, roughly in order of cost:

1. Commit the lockfile and use frozen installs in CI.
2. Disable install scripts by default and allow only the ones you need.
3. Scope internal packages and claim the scope on the public registry.
4. Turn on automated dependency updates, with human review and, if possible, a short delay before adopting freshly published versions.
5. Run \`npm audit signatures\` and a vulnerability scanner in the pipeline.
6. Generate an SBOM for every release and store it next to the artifact.
7. Require 2FA on accounts that publish packages and use minimally scoped publish tokens.

None of this replaces judgment. Tools flag known problems; they rarely catch a clever new one on the day it ships. The habits above work because they shrink the window in which a bad release can reach you and the damage it can do once it does.

And before adding a dependency, ask the old-fashioned question: do I actually need this? A ten-line function you wrote has no maintainer account to compromise.

> Every dependency is a trust decision. Make it on purpose.

## In short

- Your code runs alongside hundreds of packages you never reviewed; treat that as attack surface.
- A committed lockfile and frozen installs in CI are the non-negotiable baseline.
- Disabling install scripts by default removes a whole class of attacks.
- Provenance and signing raise the cost of rogue releases; SBOMs speed up your response.
- Fewer dependencies mean less delegated trust.`,
    },
  },
  {
    key: "prompt-injection",
    cover: "prompt-injection",
    tags: ["security", "ai"],
    daysAgo: 8,
    pt: {
      slug: "prompt-injection-em-agentes-de-llm",
      title: "Prompt injection: quando os dados do seu agente começam a dar ordens",
      excerpt:
        "Em um LLM, instruções e dados chegam pelo mesmo canal. Por que isso torna prompt injection tão difícil de resolver, e como projetar agentes que continuam seguros mesmo quando o modelo é enganado.",
      body: `Durante décadas, aprendemos a separar código de dados. Consultas parametrizadas acabaram com boa parte da injeção de SQL porque o banco passou a saber, sem ambiguidade, o que era comando e o que era valor. Modelos de linguagem desfazem essa separação por design. Para um LLM, o prompt do sistema, a pergunta do usuário, o conteúdo de uma página web e o resultado de uma ferramenta são todos texto na mesma janela de contexto. Quando um desses textos diz "ignore as instruções anteriores", o modelo pode obedecer. Isso é prompt injection, e ela fica muito mais séria quando o modelo deixa de só conversar e passa a agir.

## Direta e indireta

Na **injeção direta**, o próprio usuário tenta subverter o sistema: convencer o assistente a revelar o prompt interno, ignorar políticas ou fazer algo fora do escopo. É um problema real, mas o atacante é quem está na conversa, e o dano costuma se limitar ao que aquele usuário já poderia fazer.

A **injeção indireta** é mais traiçoeira. O texto malicioso chega por um canal que o agente consome como dado: um e-mail que ele resume, uma página que ele lê, um comentário num ticket, um arquivo num repositório, até texto invisível num PDF. O usuário legítimo pede algo inocente, "resuma minha caixa de entrada", e um dos e-mails contém instruções endereçadas ao modelo. Agora quem dá ordens é um terceiro que nunca teve acesso ao sistema.

## Por que é tão difícil de resolver

A tentação é tratar isso como filtragem: detectar frases suspeitas, pedir educadamente ao modelo que não obedeça a instruções vindas de documentos, envolver o conteúdo externo em delimitadores. Tudo isso ajuda um pouco e nada disso resolve. O modelo não tem um mecanismo confiável que separe instrução de dado; ele tem uma tendência estatística, que pode ser contornada com reformulação, outro idioma, codificação ou simples insistência.

> Trate o modelo como um componente que pode ser persuadido por qualquer texto que ele leia.

Essa frase muda a pergunta de "como impedir que o modelo seja enganado" para "o que acontece quando ele for enganado". A segunda pergunta tem respostas de engenharia.

## O risco está nas ferramentas

Um chatbot enganado escreve algo constrangedor. Um agente enganado age. O perigo cresce com a combinação de três capacidades no mesmo agente:

- acesso a dados privados (e-mails, documentos, banco de dados);
- exposição a conteúdo não confiável (web, mensagens de terceiros, uploads);
- um canal para enviar dados para fora (requisições HTTP, envio de e-mail, até renderizar uma imagem de URL externa).

Com as três juntas, uma instrução escondida numa página pode fazer o agente ler algo sigiloso e mandá-lo para o atacante. Remover qualquer uma das três quebra essa cadeia. Por isso, o primeiro exercício de segurança é olhar para a lista de ferramentas, não para o prompt.

## Defesas que funcionam em camadas

Nenhuma medida isolada basta; a combinação reduz bastante o risco.

**Privilégio mínimo.** Cada ferramenta deve fazer o mínimo necessário, com credenciais do próprio usuário e escopo restrito. Um agente que lê o calendário não precisa de permissão para apagar eventos. Prefira ferramentas específicas (\`criar_rascunho\`) a genéricas (\`executar_http\`).

**Confirmação humana para ações com efeito.** Leitura pode ser automática; enviar, pagar, apagar, publicar ou alterar permissões deve passar por uma confirmação que mostre exatamente o que será feito, com os parâmetros reais.

**Isolamento de conteúdo não confiável.** Um padrão útil é separar papéis: um modelo "em quarentena" processa o texto externo e só devolve dados estruturados; o modelo que tem acesso às ferramentas nunca vê o texto bruto. Também vale bloquear a renderização de imagens e links para domínios arbitrários na saída.

**Validação da saída.** Trate cada chamada de ferramenta proposta pelo modelo como entrada não confiável vinda de um cliente. Valide esquema, limites e autorização no servidor, exatamente como faria com uma requisição HTTP:

\`\`\`ts
import { z } from "zod";

const SendEmail = z.object({
  to: z.string().email(),
  subject: z.string().max(200),
  body: z.string().max(10_000),
});

export async function handleToolCall(call: { name: string; args: unknown }, user: User) {
  if (call.name !== "send_email") throw new Error("ferramenta não permitida");
  const args = SendEmail.parse(call.args);
  if (!user.contacts.includes(args.to)) {
    return { status: "needs_confirmation", preview: args };
  }
  return sendEmail(user, args);
}
\`\`\`

O modelo propõe; o seu código decide. Registre tudo: prompts, documentos recuperados, chamadas de ferramenta e respostas. Sem esse rastro, investigar um incidente vira adivinhação.

## Modelando ameaças de um agente

Antes de liberar um agente, sente com o time e responda por escrito:

1. Quais fontes de texto entram no contexto, e quem controla cada uma?
2. Quais ferramentas o agente tem, e qual o pior efeito possível de cada uma se for chamada com parâmetros escolhidos por um atacante?
3. Existe algum caminho para dados privados saírem do sistema?
4. Quais ações exigem confirmação humana, e a confirmação mostra o suficiente para o usuário decidir?
5. Como detectamos e revertemos uma ação indevida?

Se a resposta à pergunta 2 for "catastrófico" e à 4 for "nenhuma", o problema não é o prompt.

## Em resumo

- Em LLMs, instruções e dados compartilham o mesmo canal; não há separação confiável dentro do modelo.
- A injeção indireta, vinda de conteúdo que o agente lê, é a ameaça mais séria.
- Dados privados, conteúdo não confiável e um canal de saída juntos formam a combinação perigosa.
- Privilégio mínimo, confirmação humana, isolamento e validação no servidor funcionam em camadas.
- Projete assumindo que o modelo será enganado e limite o que ele pode fazer quando for.`,
    },
    en: {
      slug: "prompt-injection-in-llm-agents",
      title: "Prompt Injection: When Your Agent's Data Starts Giving Orders",
      excerpt:
        "In an LLM, instructions and data arrive through the same channel. Why that makes prompt injection so hard to fix, and how to design agents that stay safe even when the model is fooled.",
      body: `For decades we learned to keep code and data apart. Parameterized queries ended much of SQL injection because the database finally knew, unambiguously, what was a command and what was a value. Language models undo that separation by design. To an LLM, the system prompt, the user's question, the contents of a web page and a tool's output are all text in the same context window. When one of those texts says "ignore previous instructions", the model may comply. That's prompt injection, and it gets far more serious once the model stops merely chatting and starts acting.

## Direct and indirect

In **direct injection**, the user is the one trying to subvert the system: coaxing the assistant into revealing its hidden prompt, ignoring policy, or doing something out of scope. It's a real problem, but the attacker is the person in the conversation, and the damage is usually bounded by what that user could already do.

**Indirect injection** is more insidious. The malicious text arrives through a channel the agent consumes as data: an email it summarizes, a page it browses, a ticket comment, a file in a repository, even invisible text in a PDF. The legitimate user asks for something harmless, "summarize my inbox", and one of the emails contains instructions addressed to the model. Now the one giving orders is a third party who never had access to the system.

## Why it's so hard to fix

The temptation is to treat this as filtering: detect suspicious phrases, politely ask the model not to follow instructions found in documents, wrap external content in delimiters. All of that helps a little and none of it solves the problem. The model has no reliable mechanism that separates instruction from data; it has a statistical tendency, which can be sidestepped by rephrasing, switching languages, encoding, or plain persistence.

> Treat the model as a component that can be persuaded by any text it reads.

That sentence turns the question from "how do we stop the model from being fooled" into "what happens when it is fooled". The second question has engineering answers.

## The risk lives in the tools

A fooled chatbot writes something embarrassing. A fooled agent acts. The danger grows when three capabilities meet in the same agent:

- access to private data (email, documents, databases);
- exposure to untrusted content (the web, third-party messages, uploads);
- a channel to send data out (HTTP requests, sending email, even rendering an image from an external URL).

With all three present, an instruction hidden in a web page can get the agent to read something confidential and ship it to the attacker. Remove any one of the three and the chain breaks. That's why the first security exercise is to look at the tool list, not the prompt.

## Defenses that work in layers

No single measure is enough; the combination cuts the risk substantially.

**Least privilege.** Each tool should do the minimum, with the user's own credentials and a narrow scope. An agent that reads the calendar doesn't need permission to delete events. Prefer specific tools (\`create_draft\`) over generic ones (\`http_request\`).

**Human confirmation for side effects.** Reads can be automatic; sending, paying, deleting, publishing or changing permissions should go through a confirmation that shows exactly what will happen, with the real parameters.

**Isolate untrusted content.** One useful pattern is splitting roles: a "quarantined" model processes external text and returns only structured data; the model that holds the tools never sees the raw text. It's also worth blocking image and link rendering to arbitrary domains in the output.

**Validate the output.** Treat every tool call the model proposes as untrusted input from a client. Validate schema, limits and authorization on the server, just as you would an HTTP request:

\`\`\`ts
import { z } from "zod";

const SendEmail = z.object({
  to: z.string().email(),
  subject: z.string().max(200),
  body: z.string().max(10_000),
});

export async function handleToolCall(call: { name: string; args: unknown }, user: User) {
  if (call.name !== "send_email") throw new Error("tool not allowed");
  const args = SendEmail.parse(call.args);
  if (!user.contacts.includes(args.to)) {
    return { status: "needs_confirmation", preview: args };
  }
  return sendEmail(user, args);
}
\`\`\`

The model proposes; your code decides. Log everything: prompts, retrieved documents, tool calls and responses. Without that trail, investigating an incident turns into guesswork.

## Threat-modeling an agent

Before shipping an agent, sit down with the team and answer in writing:

1. Which text sources enter the context, and who controls each one?
2. Which tools does the agent have, and what is the worst outcome of each if called with attacker-chosen parameters?
3. Is there any path for private data to leave the system?
4. Which actions require human confirmation, and does the confirmation show enough for the user to decide?
5. How do we detect and roll back an improper action?

Revisit these answers every time you add a tool or a new data source. Agents tend to accumulate capabilities quietly, one convenient integration at a time, and the dangerous combination often appears without anyone deciding on it.

If the answer to question 2 is "catastrophic" and to question 4 is "none", the problem isn't the prompt.

## In short

- In LLMs, instructions and data share one channel; there is no reliable separation inside the model.
- Indirect injection, arriving through content the agent reads, is the most serious threat.
- Private data, untrusted content and an outbound channel together form the dangerous combination.
- Least privilege, human confirmation, isolation and server-side validation work as layers.
- Design assuming the model will be fooled, and limit what it can do when it is.`,
    },
  },
  {
    key: "zero-trust",
    cover: "zero-trust",
    tags: ["security", "infra"],
    daysAgo: 12,
    pt: {
      slug: "zero-trust-alem-do-jargao",
      title: "Zero trust além do jargão: um roteiro para times pequenos",
      excerpt:
        "Zero trust não é um produto, é parar de confiar na rede. Acesso baseado em identidade, credenciais de vida curta, mTLS, segmentação e postura de dispositivo, adotados um passo de cada vez.",
      body: `O modelo antigo de segurança de rede parecia um castelo: muralha grossa, fosso, ponte levadiça. Quem estava dentro da VPN ou da rede do escritório era, por definição, confiável. O problema é que, uma vez dentro, um invasor também era confiável, e podia andar livremente de servidor em servidor. Zero trust é a admissão de que a muralha não basta. A ideia central é simples de enunciar: nenhuma requisição ganha confiança por causa de onde vem. Cada acesso precisa provar quem é, de qual dispositivo, para fazer o quê, e essa prova vale por pouco tempo.

O termo virou etiqueta de marketing, colada em qualquer coisa que tenha um painel de login. Vale tirar a etiqueta e olhar para as peças.

## Identidade no lugar do endereço IP

O primeiro princípio é trocar "esse IP está na lista permitida" por "essa pessoa, autenticada agora, tem permissão para esse recurso". Na prática, isso significa colocar um proxy com reconhecimento de identidade na frente das aplicações internas: o painel de administração, o Grafana, o banco de dados de staging. O proxy autentica no seu provedor de identidade, com SSO e MFA, verifica o grupo do usuário e só então encaminha a requisição.

O ganho imediato é que acesso passa a ter dono, motivo e registro. Desligar alguém da empresa vira desativar uma conta, não caçar chaves espalhadas. E a aplicação interna não precisa mais ficar exposta numa rede "confiável"; ela só aceita tráfego do proxy.

## Credenciais de vida curta

Chaves de longa duração são o combustível da maioria dos incidentes: uma chave de acesso esquecida num repositório, um token de deploy que ninguém lembra de onde veio, uma chave SSH copiada para o notebook pessoal. Zero trust prefere credenciais que expiram sozinhas.

- Para pessoas: sessões curtas emitidas após SSO, e certificados SSH assinados por uma autoridade interna com validade de horas, em vez de \`authorized_keys\` permanentes.
- Para pipelines: federação de identidade (OIDC) entre o CI e a nuvem, que troca um token assinado do job por credenciais temporárias, sem nenhum segredo guardado.
- Para serviços: identidades de workload emitidas pela plataforma e renovadas automaticamente.

Um exemplo de CI que assume um papel na nuvem sem segredo estático:

\`\`\`yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/deploy-prod
          aws-region: us-east-1
      - run: ./scripts/deploy.sh
\`\`\`

Do lado da nuvem, a política de confiança do papel restringe qual repositório e qual branch podem assumi-lo. Se o token vazar, ele expira em minutos.

## mTLS e segmentação

Entre serviços, o equivalente do SSO é o TLS mútuo. Os dois lados apresentam certificados, e cada um verifica a identidade do outro antes de trocar um byte de aplicação. Isso dá criptografia em trânsito e, mais importante, autenticação: o serviço de pagamentos aceita chamadas do serviço de pedidos, e de mais ninguém, mesmo que estejam na mesma rede.

Gerenciar certificados à mão é sofrimento; é aqui que service meshes e plataformas de identidade de workload ganham o seu lugar, emitindo e rotacionando certificados de vida curta automaticamente. Se a sua infraestrutura é pequena, nem sempre vale o peso operacional de uma mesh. Políticas de rede no orquestrador e grupos de segurança bem fechados já entregam segmentação útil: cada serviço fala apenas com o que precisa.

O objetivo da segmentação é limitar o raio de explosão. Quando algo for comprometido, e um dia será, o invasor deve encontrar portas fechadas, não um corredor.

## Postura do dispositivo

Uma credencial válida num notebook infectado continua sendo um problema. Por isso, sistemas zero trust maduros consideram o estado do dispositivo na decisão de acesso: disco criptografado, sistema atualizado, bloqueio de tela ativo, aparelho gerenciado pela empresa. Um acesso ao painel financeiro pode exigir dispositivo gerenciado; a wiki pode aceitar qualquer navegador com MFA.

Comece modesto. Muitos provedores de identidade já conseguem checar sinais básicos do dispositivo. Exigir criptografia de disco e atualizações automáticas cobre uma fatia grande do risco com pouco atrito.

## Adoção incremental para um time pequeno

Ninguém precisa reescrever a infraestrutura num trimestre. Um roteiro realista:

1. **Centralize identidade.** Um provedor de SSO com MFA resistente a phishing para tudo que suportar.
2. **Coloque um proxy de identidade na frente das ferramentas internas** e tire-as da VPN, uma a uma, começando pelas mais sensíveis.
3. **Elimine segredos estáticos do CI** com federação OIDC.
4. **Troque chaves SSH permanentes** por certificados de curta duração ou acesso via sessão gerenciada.
5. **Feche a rede** com políticas que permitam só o tráfego necessário entre serviços.
6. **Adicione mTLS e postura de dispositivo** quando as bases estiverem estáveis.

> Zero trust não é um destino que se compra; é uma direção que se segue, um acesso de cada vez.

Cada etapa entrega valor sozinha, e nenhuma depende de comprar uma plataforma inteira de uma vez. Prefira terminar uma etapa a começar três; um time pequeno ganha mais fechando de verdade o acesso a um sistema crítico do que espalhando meias medidas por todos.

Meça o progresso por perguntas concretas: quantos segredos de longa duração ainda existem? Quantos sistemas ainda confiam em IP? Quanto tempo leva para revogar todo o acesso de uma pessoa?

## Em resumo

- Zero trust significa que a localização na rede não concede confiança; cada acesso se autentica.
- Proxies com reconhecimento de identidade substituem VPN e listas de IP para ferramentas internas.
- Credenciais de vida curta, via OIDC e certificados, eliminam a maior fonte de vazamentos.
- mTLS e segmentação limitam o raio de explosão de um comprometimento.
- Adote em etapas pequenas e meça pelo que deixou de existir: segredos estáticos e confiança implícita.`,
    },
    en: {
      slug: "zero-trust-beyond-the-buzzword",
      title: "Zero Trust Beyond the Buzzword: A Roadmap for Small Teams",
      excerpt:
        "Zero trust isn't a product; it's no longer trusting the network. Identity-aware access, short-lived credentials, mTLS, segmentation and device posture, adopted one step at a time.",
      body: `The old network security model looked like a castle: thick walls, a moat, a drawbridge. Anyone inside the VPN or the office network was, by definition, trusted. The problem is that once inside, an intruder was trusted too, free to wander from server to server. Zero trust is the admission that the wall isn't enough. The core idea is easy to state: no request earns trust because of where it comes from. Every access has to prove who it is, from which device, to do what, and that proof is valid only briefly.

The term has become a marketing sticker, slapped on anything with a login screen. It's worth peeling the sticker off and looking at the parts.

## Identity instead of IP addresses

The first principle is replacing "this IP is on the allowlist" with "this person, authenticated just now, is allowed to use this resource". In practice, that means putting an identity-aware proxy in front of internal apps: the admin panel, Grafana, the staging database. The proxy authenticates against your identity provider, with SSO and MFA, checks the user's group, and only then forwards the request.

The immediate win is that access gets an owner, a reason and a log. Offboarding someone becomes disabling an account, not hunting for scattered keys. And the internal app no longer has to sit on a "trusted" network; it only accepts traffic from the proxy.

## Short-lived credentials

Long-lived keys fuel most incidents: an access key forgotten in a repository, a deploy token nobody remembers creating, an SSH key copied to a personal laptop. Zero trust prefers credentials that expire on their own.

- For people: short sessions issued after SSO, and SSH certificates signed by an internal authority with validity measured in hours, instead of permanent \`authorized_keys\`.
- For pipelines: identity federation (OIDC) between CI and your cloud, exchanging the job's signed token for temporary credentials, with no stored secret at all.
- For services: workload identities issued by the platform and rotated automatically.

Here is CI assuming a cloud role with no static secret:

\`\`\`yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/deploy-prod
          aws-region: us-east-1
      - run: ./scripts/deploy.sh
\`\`\`

On the cloud side, the role's trust policy restricts which repository and branch may assume it. If the token leaks, it expires in minutes.

## mTLS and segmentation

Between services, the equivalent of SSO is mutual TLS. Both sides present certificates, and each verifies the other's identity before a single application byte flows. That gives you encryption in transit and, more importantly, authentication: the payments service accepts calls from the orders service and nobody else, even on the same network.

Managing certificates by hand is misery; this is where service meshes and workload identity platforms earn their keep, issuing and rotating short-lived certificates automatically. If your infrastructure is small, a mesh isn't always worth its operational weight. Orchestrator network policies and tight security groups already deliver useful segmentation: each service talks only to what it needs.

The point of segmentation is limiting blast radius. When something gets compromised, and one day something will, the intruder should find locked doors, not a hallway.

## Device posture

A valid credential on an infected laptop is still a problem. That's why mature zero trust systems factor device state into the access decision: encrypted disk, up-to-date OS, screen lock on, company-managed hardware. Access to the finance dashboard might require a managed device; the wiki might accept any browser with MFA.

Start modest. Many identity providers can already check basic device signals. Requiring disk encryption and automatic updates covers a big slice of the risk with little friction.

## Incremental adoption for a small team

Nobody needs to rebuild their infrastructure in a quarter. A realistic roadmap:

1. **Centralize identity.** One SSO provider with phishing-resistant MFA for everything that supports it.
2. **Put an identity-aware proxy in front of internal tools** and take them off the VPN one by one, starting with the most sensitive.
3. **Remove static secrets from CI** with OIDC federation.
4. **Replace permanent SSH keys** with short-lived certificates or managed session access.
5. **Lock down the network** with policies that allow only necessary service-to-service traffic.
6. **Add mTLS and device posture** once the foundations are stable.

> Zero trust isn't a destination you buy; it's a direction you follow, one access path at a time.

Each step delivers value on its own, and none of them depends on buying an entire platform up front. Prefer finishing one step to starting three; a small team gains more by truly locking down access to one critical system than by spreading half-measures across all of them.

The usual objection is friction: engineers worry that every extra check will slow them down. In practice, a well-run setup often feels smoother than the VPN it replaces. Single sign-on removes a pile of separate passwords, short-lived credentials remove the ritual of rotating keys, and nobody has to remember to connect to anything before opening an internal dashboard. Where friction does appear, treat it as a bug in the rollout, not as the price of security.

Measure progress with concrete questions: how many long-lived secrets still exist? How many systems still trust an IP? How long does it take to revoke all of one person's access?

## In short

- Zero trust means network location grants no trust; every access authenticates.
- Identity-aware proxies replace VPNs and IP allowlists for internal tools.
- Short-lived credentials, via OIDC and certificates, remove the biggest source of leaks.
- mTLS and segmentation limit the blast radius of a compromise.
- Adopt in small steps and measure by what's gone: static secrets and implicit trust.`,
    },
  },
  {
    key: "post-quantum",
    cover: "post-quantum",
    tags: ["security"],
    daysAgo: 16,
    pt: {
      slug: "criptografia-pos-quantica-para-desenvolvedores",
      title: "Criptografia pós-quântica para desenvolvedores: o que muda e o que fazer hoje",
      excerpt:
        "Computadores quânticos capazes de quebrar RSA ainda não existem, mas dados capturados hoje podem ser decifrados amanhã. Troca de chaves, assinaturas, esquemas híbridos e agilidade criptográfica, sem pânico.",
      body: `Ninguém sabe quando, ou se, existirá um computador quântico grande e estável o bastante para quebrar a criptografia de chave pública que usamos hoje. Mas sabemos, desde os anos 1990, que um computador assim, rodando o algoritmo de Shor, resolveria de forma eficiente os problemas matemáticos por trás de RSA, Diffie-Hellman e curvas elípticas. Essa incerteza no prazo, somada à certeza na matemática, é o que torna a criptografia pós-quântica um assunto de engenharia agora, e não um exercício de futurologia.

## Colha agora, decifre depois

O argumento mais forte para agir cedo tem nome: "harvest now, decrypt later". Um adversário com recursos pode gravar tráfego cifrado hoje, guardar e esperar. Se um dia a troca de chaves daquelas sessões puder ser quebrada, todo o conteúdo se abre retroativamente.

A pergunta prática, então, não é "quando chegam os computadores quânticos?", e sim "por quanto tempo os meus dados precisam continuar secretos?". Prontuários médicos, documentos jurídicos, segredos comerciais e dados pessoais muitas vezes precisam de confidencialidade por décadas. Se esse horizonte, somado ao tempo que você leva para migrar, ultrapassa o momento em que a ameaça se concretiza, você já está atrasado. Como ninguém conhece esse momento, a postura prudente é começar pela confidencialidade de longo prazo.

## O que quebra e o que não quebra

Nem tudo está em risco do mesmo jeito.

- **Criptografia simétrica e hashes** (AES, SHA-2, SHA-3) são afetados de forma bem mais branda. O algoritmo de Grover oferece uma aceleração quadrática para busca, o que, na prática, se compensa com chaves maiores: AES-256 é a recomendação comum para quem quer margem.
- **Troca de chaves** (RSA, ECDH) é o ponto crítico, e é o alvo do "colha agora". É aqui que a migração começa.
- **Assinaturas digitais** (RSA, ECDSA, Ed25519) também quebram, mas o risco é diferente: uma assinatura só precisa resistir enquanto alguém confiar nela. A ameaça é falsificação futura, não leitura retroativa, o que dá um pouco mais de tempo, exceto para chaves de raiz e firmware com vida útil longa.

Os substitutos padronizados pelo NIST se baseiam em problemas matemáticos diferentes. Para encapsulamento de chaves, o ML-KEM (derivado do Kyber), baseado em reticulados. Para assinaturas, o ML-DSA (derivado do Dilithium), também de reticulados, e o SLH-DSA (derivado do SPHINCS+), baseado apenas em funções de hash. A mudança mais visível para quem opera sistemas é o tamanho: chaves públicas, textos cifrados e assinaturas são consideravelmente maiores que os equivalentes em curvas elípticas, o que afeta handshakes, certificados e protocolos com limites apertados de pacote.

## Esquemas híbridos

Algoritmos pós-quânticos são relativamente jovens. A matemática é estudada há bastante tempo, mas as implementações ainda acumulam menos anos de escrutínio que as clássicas. A resposta da indústria foi o modo híbrido: combinar uma troca de chaves clássica (como X25519) com uma pós-quântica (como ML-KEM) e derivar o segredo final das duas. Um atacante precisa quebrar ambas. Se o algoritmo novo tiver uma falha inesperada, a segurança clássica continua de pé; se um computador quântico aparecer, a parte pós-quântica protege.

Navegadores modernos e bibliotecas TLS já oferecem grupos híbridos de troca de chaves. Em muitos casos, o seu tráfego HTTPS pode já estar negociando um deles sem que você tenha feito nada. Vale verificar, por exemplo com uma versão recente do OpenSSL que suporte esses grupos:

\`\`\`bash
# Tenta negociar o grupo híbrido X25519 + ML-KEM-768 com o servidor
openssl s_client -connect example.com:443 -groups X25519MLKEM768 </dev/null 2>/dev/null \\
  | grep -i "group"
\`\`\`

Se o handshake falhar ou cair para um grupo clássico, o servidor ou a biblioteca ainda não suporta. Os nomes dos grupos variam entre versões de bibliotecas, então confira a documentação da sua.

## Agilidade criptográfica

A lição mais duradoura desta transição não é sobre algoritmos específicos; é sobre conseguir trocá-los. Muitos sistemas têm o algoritmo de assinatura gravado no esquema do banco, no formato do token, no firmware, em tamanhos fixos de coluna. Trocar vira um projeto de anos.

Agilidade criptográfica significa:

- saber onde a criptografia é usada: um inventário de certificados, chaves, bibliotecas e protocolos;
- identificar algoritmos nos dados (um campo \`alg\`, um prefixo de versão) em vez de presumir;
- não fixar tamanhos de chave ou assinatura em colunas, buffers e limites de cabeçalho;
- concentrar operações criptográficas em poucas bibliotecas bem mantidas, nunca em implementações próprias;
- conseguir rotacionar chaves e certificados de forma rotineira, não heroica.

> Se trocar um algoritmo exige uma migração de emergência, o problema não é o algoritmo.

## O que fazer hoje

1. **Faça o inventário.** Liste onde há troca de chaves, assinaturas e certificados, e quanto tempo cada dado precisa permanecer confidencial.
2. **Atualize bibliotecas TLS e runtimes** para versões que suportam grupos híbridos e habilite-os onde for possível.
3. **Priorize a confidencialidade de longo prazo**: tráfego e dados com vida útil longa vêm primeiro.
4. **Use AES-256 e hashes de 256 bits ou mais** em projetos novos.
5. **Remova suposições de tamanho** de esquemas, protocolos e formatos.
6. **Acompanhe os seus fornecedores**: nuvem, CDN, HSMs e provedores de identidade terão seus próprios cronogramas.

Não troque nada por conta própria, nem implemente algoritmos à mão. Esta é uma migração para fazer com bibliotecas maduras e padrões publicados.

## Em resumo

- "Colha agora, decifre depois" torna a troca de chaves o ponto mais urgente da migração.
- Criptografia simétrica e hashes resistem com chaves maiores; troca de chaves e assinaturas precisam de novos algoritmos.
- Esquemas híbridos combinam clássico e pós-quântico, protegendo contra falhas de ambos os lados.
- Agilidade criptográfica é o investimento que vale para esta e para as próximas transições.
- Comece pelo inventário e pelas atualizações de bibliotecas; deixe a matemática para quem a padroniza.`,
    },
    en: {
      slug: "post-quantum-cryptography-for-developers",
      title: "Post-Quantum Cryptography for Developers: What Changes and What to Do Today",
      excerpt:
        "Quantum computers that can break RSA don't exist yet, but data captured today could be decrypted tomorrow. Key exchange, signatures, hybrid schemes and crypto-agility, without the panic.",
      body: `Nobody knows when, or whether, a quantum computer large and stable enough to break today's public-key cryptography will exist. But we have known since the 1990s that such a machine, running Shor's algorithm, would efficiently solve the math problems behind RSA, Diffie-Hellman and elliptic curves. That uncertainty about timing, combined with certainty about the math, is what makes post-quantum cryptography an engineering topic now rather than an exercise in futurology.

## Harvest now, decrypt later

The strongest argument for acting early has a name: "harvest now, decrypt later". A well-resourced adversary can record encrypted traffic today, store it and wait. If the key exchange behind those sessions can one day be broken, all the content opens up retroactively.

So the practical question isn't "when do quantum computers arrive?" but "how long does my data need to stay secret?". Medical records, legal documents, trade secrets and personal data often need confidentiality for decades. If that horizon, plus the time it takes you to migrate, extends past the moment the threat materializes, you're already late. Since nobody knows that moment, the prudent stance is to start with long-term confidentiality.

## What breaks and what doesn't

Not everything is at risk in the same way.

- **Symmetric encryption and hashes** (AES, SHA-2, SHA-3) are affected far more mildly. Grover's algorithm gives a quadratic speedup for search, which in practice is offset by larger keys: AES-256 is the common recommendation for anyone wanting headroom.
- **Key exchange** (RSA, ECDH) is the critical point and the target of "harvest now". This is where migration starts.
- **Digital signatures** (RSA, ECDSA, Ed25519) break too, but the risk is different: a signature only has to hold up as long as someone relies on it. The threat is future forgery, not retroactive reading, which buys a bit more time, except for root keys and long-lived firmware.

The replacements standardized by NIST rest on different math problems. For key encapsulation, ML-KEM (derived from Kyber), based on lattices. For signatures, ML-DSA (derived from Dilithium), also lattice-based, and SLH-DSA (derived from SPHINCS+), built only on hash functions. The most visible change for anyone operating systems is size: public keys, ciphertexts and signatures are considerably larger than their elliptic-curve counterparts, which affects handshakes, certificates and protocols with tight packet limits.

## Hybrid schemes

Post-quantum algorithms are relatively young. The math has been studied for a long time, but the implementations have fewer years of scrutiny than the classical ones. The industry's answer is hybrid mode: combine a classical key exchange (such as X25519) with a post-quantum one (such as ML-KEM) and derive the final secret from both. An attacker has to break both. If the new algorithm has an unexpected flaw, classical security still stands; if a quantum computer shows up, the post-quantum part protects you.

Modern browsers and TLS libraries already offer hybrid key exchange groups. In many cases your HTTPS traffic may already be negotiating one without you lifting a finger. It's worth checking, for instance with a recent OpenSSL build that supports these groups:

\`\`\`bash
# Try to negotiate the hybrid X25519 + ML-KEM-768 group with the server
openssl s_client -connect example.com:443 -groups X25519MLKEM768 </dev/null 2>/dev/null \\
  | grep -i "group"
\`\`\`

If the handshake fails or falls back to a classical group, the server or library doesn't support it yet. Group names vary between library versions, so check your library's documentation.

## Crypto-agility

The most lasting lesson of this transition isn't about specific algorithms; it's about being able to swap them. Many systems have their signature algorithm baked into the database schema, the token format, the firmware, fixed column widths. Changing it becomes a multi-year project.

Crypto-agility means:

- knowing where cryptography is used: an inventory of certificates, keys, libraries and protocols;
- tagging algorithms in the data (an \`alg\` field, a version prefix) instead of assuming;
- not hard-coding key or signature sizes into columns, buffers and header limits;
- concentrating crypto operations in a few well-maintained libraries, never home-grown implementations;
- rotating keys and certificates as routine, not heroics.

> If swapping an algorithm requires an emergency migration, the algorithm isn't the problem.

## What to do today

1. **Take inventory.** List where key exchange, signatures and certificates live, and how long each piece of data must stay confidential.
2. **Upgrade TLS libraries and runtimes** to versions that support hybrid groups, and enable them where you can.
3. **Prioritize long-term confidentiality**: long-lived traffic and data go first.
4. **Use AES-256 and hashes of 256 bits or more** in new designs.
5. **Remove size assumptions** from schemas, protocols and formats.
6. **Track your vendors**: cloud, CDN, HSMs and identity providers will have their own timelines.

None of this calls for alarm. The transition will play out over years, and most of the heavy lifting will happen inside libraries, operating systems and cloud platforms. Your job is to make sure your own systems can follow along when those defaults change.

Don't swap things on your own, and never implement the algorithms by hand. This is a migration to carry out with mature libraries and published standards.

## In short

- "Harvest now, decrypt later" makes key exchange the most urgent part of the migration.
- Symmetric crypto and hashes survive with larger keys; key exchange and signatures need new algorithms.
- Hybrid schemes combine classical and post-quantum, guarding against failure on either side.
- Crypto-agility is the investment that pays off for this transition and the next.
- Start with inventory and library upgrades; leave the math to the people who standardize it.`,
    },
  },
];
