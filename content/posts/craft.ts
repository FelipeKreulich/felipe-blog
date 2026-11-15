import type { ContentPost } from "../types";

export const posts: ContentPost[] = [
  {
    key: "accessibility",
    cover: "accessibility",
    tags: ["web", "culture"],
    daysAgo: 42,
    pt: {
      slug: "acessibilidade-como-oficio",
      title: "Acessibilidade é ofício, não checklist",
      excerpt:
        "HTML semântico, teclado, foco, rótulos, contraste e movimento: acessibilidade não é uma auditoria no fim do projeto, é a forma como se constrói uma interface bem-feita.",
      body: `Existe um jeito de tratar acessibilidade que garante resultados ruins: deixá-la para o fim, como uma auditoria que alguém roda antes do lançamento e que devolve uma planilha de problemas. Nesse modelo, acessibilidade vira conformidade, uma lista de itens a riscar, e a equipe passa a odiar o assunto. O outro jeito é tratá-la como parte do ofício, do mesmo modo que tratamos legibilidade de código ou desempenho. Uma interface que só funciona com mouse, que não anuncia o que faz e que some quando alguém aumenta o zoom não está quase pronta. Está quebrada para uma parte real das pessoas que vão usá-la. A boa notícia é que a maior parte do trabalho é barata quando feita desde o começo, e cara quando feita depois.

## Comece pelo HTML, não pelo ARIA

O navegador já entrega muita acessibilidade de graça, desde que você use os elementos certos. Um \`<button>\` recebe foco, responde a Enter e Espaço e é anunciado como botão por leitores de tela. Uma \`<div>\` com \`onClick\` não faz nada disso. O padrão que mais vejo em revisões de código é a reconstrução manual, e incompleta, de elementos que já existem.

\`\`\`html
<!-- Ruim: parece um botão, mas não é -->
<div class="btn" onclick="salvar()">Salvar</div>

<!-- Bom: foco, teclado e semântica de graça -->
<button type="button" onclick="salvar()">Salvar</button>

<!-- Ruim: link que não leva a lugar nenhum -->
<a href="#" onclick="abrirMenu()">Menu</a>

<!-- Bom: ação é botão; navegação é link -->
<button type="button" aria-expanded="false" aria-controls="menu">Menu</button>
\`\`\`

A regra prática é simples: se leva a outra página ou âncora, é link; se executa uma ação, é botão. Use \`<nav>\`, \`<main>\`, \`<header>\` e \`<footer>\` para criar marcos que leitores de tela permitem pular. Mantenha a hierarquia de títulos coerente, sem saltar de \`h1\` para \`h4\` só porque o tamanho da fonte agradou. ARIA existe para preencher lacunas que o HTML não cobre, como o estado \`aria-expanded\` acima, e não para corrigir uma \`div\` que deveria ser outra coisa. ARIA mal aplicado costuma piorar a experiência, porque promete ao leitor de tela um comportamento que o componente não entrega.

## Teclado e foco

Um teste que qualquer pessoa pode fazer agora: desconecte o mouse e tente usar a sua aplicação apenas com Tab, Shift+Tab, Enter, Espaço e as setas. Em geral aparecem três problemas.

- **Foco invisível.** Alguém escreveu \`outline: none\` num reset de CSS e nunca colocou nada no lugar. Use \`:focus-visible\` para mostrar um indicador claro na navegação por teclado sem incomodar quem usa mouse.
- **Ordem ilógica.** O foco pula pela tela porque a ordem visual foi feita com CSS e não corresponde à ordem do DOM. Evite \`tabindex\` positivo; ele quase sempre cria mais problemas do que resolve.
- **Armadilhas e vazamentos.** Um modal abre e o foco continua na página de trás, ou o modal fecha e o foco vai parar no topo do documento. Ao abrir, mova o foco para dentro; ao fechar, devolva-o ao elemento que abriu. O elemento \`<dialog>\` nativo, aberto com \`showModal()\`, resolve boa parte disso.

\`\`\`css
:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
\`\`\`

## Rótulos, contraste e movimento

Todo campo de formulário precisa de um rótulo associado. Placeholder não é rótulo: some quando a pessoa começa a digitar e costuma ter contraste baixo. Botões com apenas um ícone precisam de um nome acessível, seja por texto visualmente oculto, seja por \`aria-label\`. Imagens informativas precisam de \`alt\` que descreva a função; imagens decorativas, de \`alt=""\` para serem ignoradas.

\`\`\`html
<!-- Ruim -->
<input type="email" placeholder="E-mail">
<button><svg>...</svg></button>

<!-- Bom -->
<label for="email">E-mail</label>
<input id="email" type="email" autocomplete="email">
<button type="button" aria-label="Fechar"><svg aria-hidden="true">...</svg></button>
\`\`\`

Contraste é a parte mais fácil de medir e uma das mais ignoradas. As diretrizes WCAG definem razões mínimas entre texto e fundo, e as ferramentas de desenvolvedor dos navegadores mostram essa razão ao inspecionar um elemento. Cinza-claro sobre branco pode ficar elegante no Figma e ser ilegível no sol, num monitor barato ou para quem tem baixa visão. Também não comunique estado só por cor: um campo com erro deve ter uma mensagem em texto, não apenas uma borda vermelha.

Por fim, movimento. Algumas pessoas sentem tontura ou náusea com animações grandes, parallax e transições de página. O sistema operacional permite pedir menos movimento, e o CSS expõe essa preferência:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`

Esse reset agressivo é um ponto de partida. O ideal é decidir caso a caso: um fade discreto pode ficar; um zoom de tela inteira deveria sair.

## Teste com um leitor de tela de verdade

Ferramentas automáticas pegam uma fração dos problemas: contraste, \`alt\` ausente, campos sem rótulo. Elas não dizem se a experiência faz sentido. Para isso, use um leitor de tela. No macOS e no iOS há o VoiceOver; no Windows, o NVDA é gratuito; no Android, o TalkBack. Não é preciso virar especialista. Aprenda os comandos básicos de navegação por títulos, marcos e formulários, e percorra os fluxos principais: cadastro, login, a ação mais importante do produto.

Você vai ouvir coisas que nunca viu: um botão anunciado como "botão" sem nome, uma lista de cards em que cada um diz "leia mais", uma mensagem de erro que aparece na tela mas nunca é anunciada. Essas descobertas valem mais do que qualquer relatório. E quando for possível, observe pessoas que usam tecnologia assistiva no dia a dia; elas usam essas ferramentas de formas que um iniciante não imagina.

Quando não vale a pena se preocupar? Quase nunca, mas há proporção. Um script interno que só você roda não precisa de auditoria. Um protótipo descartável pode esperar. Tudo o que vai para usuários reais, porém, merece pelo menos HTML semântico, teclado funcionando e contraste decente, porque isso custa quase nada quando é hábito.

## Em resumo

- Use o elemento HTML certo antes de recorrer a ARIA; botão é botão, link é link.
- Navegue pela sua aplicação só com teclado e garanta foco visível e ordem lógica.
- Todo campo tem rótulo, todo ícone tem nome, e estado nunca é comunicado só por cor.
- Respeite \`prefers-reduced-motion\` e meça o contraste em vez de confiar no olho.
- Ferramentas automáticas ajudam, mas só um leitor de tela mostra se a experiência faz sentido.`,
    },
    en: {
      slug: "accessibility-as-craft",
      title: "Accessibility Is Craft, Not a Checklist",
      excerpt:
        "Semantic HTML, keyboard, focus, labels, contrast and motion: accessibility isn't an audit at the end of a project, it's how a well-made interface gets built.",
      body: `There is a reliable way to get accessibility wrong: leave it for the end, as an audit someone runs right before launch that returns a spreadsheet of problems. In that model accessibility becomes compliance, a list of boxes to tick, and the team learns to resent the whole subject. The alternative is to treat it as part of the craft, the same way we treat readable code or performance. An interface that only works with a mouse, that never tells you what it does, and that falls apart when someone zooms in is not nearly done. It is broken for a real share of the people who will use it. The good news is that most of the work is cheap when you do it from the start and expensive when you bolt it on later.

## Start with HTML, not ARIA

Browsers hand you a lot of accessibility for free, as long as you use the right elements. A \`<button>\` is focusable, responds to Enter and Space, and is announced as a button by screen readers. A \`<div>\` with an \`onClick\` does none of that. The pattern I see most in code review is the manual, and incomplete, reconstruction of elements that already exist.

\`\`\`html
<!-- Bad: looks like a button, isn't one -->
<div class="btn" onclick="save()">Save</div>

<!-- Good: focus, keyboard and semantics for free -->
<button type="button" onclick="save()">Save</button>

<!-- Bad: a link that goes nowhere -->
<a href="#" onclick="openMenu()">Menu</a>

<!-- Good: actions are buttons; navigation is a link -->
<button type="button" aria-expanded="false" aria-controls="menu">Menu</button>
\`\`\`

The rule of thumb is simple: if it takes you to another page or anchor, it's a link; if it does something, it's a button. Use \`<nav>\`, \`<main>\`, \`<header>\` and \`<footer>\` to create landmarks that screen reader users can jump between. Keep the heading hierarchy coherent instead of leaping from \`h1\` to \`h4\` because the font size looked right. ARIA exists to fill the gaps HTML doesn't cover, like the \`aria-expanded\` state above, not to patch a \`div\` that should have been something else. Misapplied ARIA often makes things worse, because it promises the screen reader behavior the component doesn't deliver.

## Keyboard and focus

Here's a test anyone can run today: unplug the mouse and try to use your app with only Tab, Shift+Tab, Enter, Space and the arrow keys. Three problems usually show up.

- **Invisible focus.** Someone wrote \`outline: none\` in a CSS reset and never replaced it. Use \`:focus-visible\` to show a clear indicator for keyboard users without bothering mouse users.
- **Illogical order.** Focus jumps around the screen because the visual layout was built with CSS and doesn't match DOM order. Avoid positive \`tabindex\`; it nearly always creates more problems than it solves.
- **Traps and leaks.** A modal opens and focus stays on the page behind it, or the modal closes and focus lands at the top of the document. On open, move focus inside; on close, return it to whatever opened the modal. The native \`<dialog>\` element, opened with \`showModal()\`, handles much of this for you.

\`\`\`css
:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
\`\`\`

## Labels, contrast and motion

Every form field needs an associated label. A placeholder is not a label: it disappears as soon as someone types and is often low contrast to begin with. Icon-only buttons need an accessible name, either visually hidden text or an \`aria-label\`. Informative images need \`alt\` text that describes their purpose; decorative ones need \`alt=""\` so they're skipped.

\`\`\`html
<!-- Bad -->
<input type="email" placeholder="Email">
<button><svg>...</svg></button>

<!-- Good -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email">
<button type="button" aria-label="Close"><svg aria-hidden="true">...</svg></button>
\`\`\`

Contrast is the easiest thing to measure and one of the most ignored. The WCAG guidelines define minimum ratios between text and background, and browser dev tools show that ratio when you inspect an element. Light grey on white may look refined in a design file and be unreadable in sunlight, on a cheap monitor, or for someone with low vision. And don't communicate state through color alone: a field with an error should carry a text message, not just a red border.

Finally, motion. Some people get dizzy or nauseous from large animations, parallax and page transitions. Operating systems let users ask for reduced motion, and CSS exposes that preference:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`

That blunt reset is a starting point. Better to decide case by case: a subtle fade can stay; a full-screen zoom should go.

## Test with a real screen reader

Automated tools catch a fraction of the problems: contrast, missing \`alt\`, unlabeled fields. They can't tell you whether the experience makes sense. For that, use a screen reader. macOS and iOS ship VoiceOver; on Windows, NVDA is free; Android has TalkBack. You don't need to become an expert. Learn the basic commands for moving by headings, landmarks and form controls, and walk through your main flows: sign-up, login, the single most important action in the product.

You will hear things you never saw: a button announced as just "button," a list of cards where every one says "read more," an error message that appears on screen but is never announced. Those discoveries are worth more than any report. And whenever you can, watch people who use assistive technology every day; they use these tools in ways a beginner wouldn't guess.

When is it not worth the effort? Almost never, but proportion matters. An internal script only you run doesn't need an audit. A throwaway prototype can wait. Anything that reaches real users, though, deserves at least semantic HTML, a working keyboard path and decent contrast, because those cost almost nothing once they're habit.

## In short

- Reach for the right HTML element before reaching for ARIA; buttons are buttons, links are links.
- Use your app with only a keyboard and make sure focus is visible and in a logical order.
- Every field has a label, every icon has a name, and state is never conveyed by color alone.
- Respect \`prefers-reduced-motion\` and measure contrast instead of eyeballing it.
- Automated checkers help, but only a screen reader tells you whether the experience makes sense.`,
    },
  },
  {
    key: "kubernetes",
    cover: "kubernetes",
    tags: ["infra"],
    daysAgo: 47,
    pt: {
      slug: "voce-precisa-mesmo-de-kubernetes",
      title: "Você precisa mesmo de Kubernetes?",
      excerpt:
        "Kubernetes resolve problemas reais, mas cobra caro em operação e em carga cognitiva. Um guia honesto sobre o que ele entrega, o que custa e quando uma alternativa mais simples basta.",
      body: `Kubernetes virou uma espécie de sobrenome de infraestrutura séria. Em entrevistas, em vagas e em conversas de corredor, a pergunta raramente é se a equipe deveria usá-lo, e sim quando vai migrar. É uma ferramenta notável, que resolve problemas difíceis de verdade. Mas ela resolve problemas específicos, e cobra por isso em moedas que não aparecem na fatura da nuvem: horas de operação, conhecimento especializado e atenção da equipe. Antes de adotar, vale perguntar com honestidade quais desses problemas você tem hoje, e não quais imagina ter daqui a alguns anos.

## O que o Kubernetes realmente resolve

No fundo, o Kubernetes é um sistema de controle declarativo para executar contêineres num conjunto de máquinas. Você descreve o estado desejado e controladores trabalham continuamente para aproximar a realidade dessa descrição. Daí vêm as capacidades que as pessoas valorizam:

- **Agendamento** de cargas de trabalho num cluster, levando em conta CPU, memória e restrições.
- **Autorrecuperação**: contêineres que caem são reiniciados, e réplicas perdidas são recriadas em outro nó.
- **Implantações graduais** e rollback, com verificações de prontidão e de vida.
- **Descoberta de serviço** e balanceamento interno de carga.
- **Escalonamento horizontal** com base em métricas.
- **Uma API comum** e extensível, sobre a qual existe um ecossistema enorme de operadores, ferramentas e padrões.

Esse último ponto é subestimado. O valor do Kubernetes não está só no que ele faz, mas no fato de ser uma interface padronizada. Uma organização com dezenas de equipes e centenas de serviços ganha muito quando todos implantam do mesmo jeito, com as mesmas abstrações e os mesmos controles de acesso.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: registry.example.com/api:1.0.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
\`\`\`

E isso é só o começo: ainda faltam Service, Ingress, configuração, segredos, limites de recursos, políticas de rede e um caminho para colocar tudo isso no cluster.

## Os custos que não aparecem na fatura

O primeiro custo é operacional. Mesmo com um serviço gerenciado, que cuida do plano de controle, alguém precisa atualizar versões do cluster e dos nós, acompanhar APIs depreciadas, manter controladores de ingress, gerenciadores de certificados, coleta de logs e métricas, e entender por que um pod está preso em estado pendente às três da manhã. Cada componente do ecossistema é mais uma coisa com ciclo de lançamentos e falhas próprias.

O segundo custo é cognitivo, e costuma ser maior. Kubernetes tem muitos conceitos, e eles interagem de formas sutis: requests e limits influenciam agendamento e despejo, probes mal configuradas derrubam serviços saudáveis, redes de contêiner adicionam camadas à depuração. Uma equipe pequena que adota Kubernetes muitas vezes descobre que alguém virou, sem querer, a pessoa de plataforma em tempo integral. Esse tempo deixou de ir para o produto.

O terceiro custo é de oportunidade. Toda semana gasta montando pipelines, escrevendo charts e ajustando autoscalers é uma semana em que nenhum usuário viu algo novo. Para uma empresa grande, é um investimento que se paga em padronização. Para um produto procurando tração, pode ser a diferença entre aprender rápido e não aprender.

## Alternativas mais simples

Entre "um script de deploy por SSH" e "Kubernetes" existe um espectro grande de opções maduras.

- **PaaS.** Plataformas em que você aponta para um repositório ou imagem e recebe um serviço rodando, com HTTPS, logs e escalonamento básico. Você troca controle fino por quase nenhuma operação. Para a maioria das aplicações web, é um ponto de partida excelente.
- **Contêineres numa VM.** Uma ou duas máquinas virtuais rodando Docker Compose, com um proxy reverso na frente, backups automáticos e um processo de deploy simples. É surpreendentemente robusto para muitas cargas, fácil de entender por inteiro e barato.
- **Serviços gerenciados de contêiner.** Várias nuvens oferecem execução de contêineres sem que você administre um cluster. Você ganha escalonamento e implantações graduais sem lidar com nós.
- **Serverless.** Funções ou contêineres que escalam até zero, cobrados por uso. Ótimo para tráfego irregular e tarefas orientadas a eventos; pede cuidado com latência de inicialização, limites de execução e dependência do provedor.

Nenhuma dessas opções é inferior por definição. Elas são escolhas diferentes no eixo entre controle e responsabilidade. E elas não fecham portas: uma aplicação conteinerizada, configurada por variáveis de ambiente e sem estado no processo migra para Kubernetes sem grande drama quando chegar a hora.

## Uma lista para decidir

Antes de adotar, responda com franqueza:

1. Quantos serviços você roda hoje, e quantas equipes implantam de forma independente? Se a resposta é "poucos" e "uma", o ganho de padronização é pequeno.
2. Existe alguém com experiência real em operar Kubernetes, e tempo reservado para isso?
3. Você precisa de algo que plataformas mais simples não oferecem, como controle fino de rede, cargas com estado específicas, hardware especial ou portabilidade entre nuvens exigida por contrato?
4. Seus problemas atuais de confiabilidade vêm da orquestração, ou de coisas como falta de testes, observabilidade fraca e deploys manuais? Kubernetes não resolve as segundas.
5. O custo de operar o cluster, somado em horas de pessoas, cabe no orçamento sem tirar foco do produto?

Se a maioria das respostas aponta para "não", uma alternativa mais simples provavelmente serve melhor agora. Se a maioria aponta para "sim", Kubernetes pode ser exatamente a ferramenta certa, e nesse caso prefira um serviço gerenciado e um conjunto pequeno e bem escolhido de componentes, em vez de instalar metade do ecossistema no primeiro mês.

## Em resumo

- Kubernetes é uma plataforma declarativa poderosa; seu maior valor aparece em escala organizacional.
- Os custos reais são operação contínua, carga cognitiva e tempo desviado do produto.
- PaaS, contêineres numa VM, contêineres gerenciados e serverless cobrem muitas aplicações com muito menos esforço.
- Aplicações conteinerizadas e sem estado no processo mantêm a migração futura barata.
- Decida pelos problemas que você tem hoje, não pelos que imagina ter.`,
    },
    en: {
      slug: "do-you-really-need-kubernetes",
      title: "Do You Really Need Kubernetes?",
      excerpt:
        "Kubernetes solves real problems, but it charges heavily in operations and cognitive load. An honest look at what it gives you, what it costs, and when something simpler is enough.",
      body: `Kubernetes has become a kind of surname for serious infrastructure. In interviews, job posts and hallway conversations, the question is rarely whether a team should use it, only when they'll migrate. It is a remarkable tool that solves genuinely hard problems. But it solves specific problems, and it charges for them in currencies that never show up on the cloud bill: operational hours, specialist knowledge and team attention. Before adopting it, ask honestly which of those problems you have today, not which ones you imagine having a few years from now.

## What Kubernetes actually solves

At its core, Kubernetes is a declarative control system for running containers across a pool of machines. You describe the state you want, and controllers work continuously to make reality match that description. That's where the capabilities people value come from:

- **Scheduling** workloads across a cluster, taking CPU, memory and constraints into account.
- **Self-healing**: crashed containers are restarted, and lost replicas are recreated on another node.
- **Rolling deployments** and rollbacks, gated by readiness and liveness checks.
- **Service discovery** and internal load balancing.
- **Horizontal scaling** driven by metrics.
- **A common, extensible API**, with an enormous ecosystem of operators, tools and patterns built on top.

That last point is underrated. Kubernetes isn't valuable only for what it does but for being a standard interface. An organization with dozens of teams and hundreds of services gains a lot when everyone deploys the same way, with the same abstractions and the same access controls.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: registry.example.com/api:1.0.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
\`\`\`

And that's just the start: you still need a Service, an Ingress, config, secrets, resource limits, network policies, and some way to get all of it into the cluster.

## The costs that aren't on the bill

The first cost is operational. Even with a managed offering that runs the control plane for you, someone has to upgrade cluster and node versions, track deprecated APIs, maintain ingress controllers, certificate managers, log and metric pipelines, and figure out why a pod is stuck in Pending at three in the morning. Every component from the ecosystem is one more thing with its own release cycle and its own failure modes.

The second cost is cognitive, and it's usually bigger. Kubernetes has a lot of concepts, and they interact in subtle ways: requests and limits affect scheduling and eviction, badly tuned probes take down healthy services, container networking adds layers to every debugging session. A small team that adopts Kubernetes often finds that someone has quietly become the full-time platform person. That time no longer goes into the product.

The third cost is opportunity. Every week spent wiring pipelines, writing charts and tuning autoscalers is a week in which no user saw anything new. For a large company, that's an investment that pays off in standardization. For a product still looking for traction, it can be the difference between learning fast and not learning at all.

## Simpler alternatives

Between "a deploy script over SSH" and "Kubernetes" there's a wide range of mature options.

- **PaaS.** Platforms where you point at a repository or image and get a running service with HTTPS, logs and basic scaling. You trade fine-grained control for almost no operations. For most web apps, it's an excellent starting point.
- **Containers on a VM.** One or two virtual machines running Docker Compose behind a reverse proxy, with automated backups and a simple deploy process. It's surprisingly robust for many workloads, easy to understand end to end, and cheap.
- **Managed container services.** Several clouds will run containers for you without you administering a cluster. You get scaling and rolling deploys without thinking about nodes.
- **Serverless.** Functions or containers that scale to zero and bill per use. Great for spiky traffic and event-driven jobs; watch out for cold-start latency, execution limits and provider lock-in.

None of these is inferior by definition. They're different points on the axis between control and responsibility. And they don't close doors: a containerized app that reads config from environment variables and keeps no state in the process moves to Kubernetes without much drama when the time comes.

## A checklist for deciding

Before adopting it, answer frankly:

1. How many services do you run today, and how many teams deploy independently? If the answer is "a few" and "one," the standardization payoff is small.
2. Is there someone with real experience operating Kubernetes, and dedicated time for it?
3. Do you need something simpler platforms don't offer, such as fine-grained network control, specific stateful workloads, special hardware, or cloud portability required by contract?
4. Do your current reliability problems come from orchestration, or from missing tests, weak observability and manual deploys? Kubernetes fixes none of the latter.
5. Does the cost of running the cluster, counted in people-hours, fit the budget without pulling focus from the product?

If most answers point to "no," a simpler option will probably serve you better right now. If most point to "yes," Kubernetes may be exactly the right tool, and in that case prefer a managed offering and a small, carefully chosen set of components over installing half the ecosystem in month one.

## In short

- Kubernetes is a powerful declarative platform whose biggest payoff shows up at organizational scale.
- The real costs are ongoing operations, cognitive load and time diverted from the product.
- PaaS, containers on a VM, managed containers and serverless cover many apps with far less effort.
- Containerized, stateless apps keep a future migration cheap.
- Decide based on the problems you have today, not the ones you imagine having.`,
    },
  },
  {
    key: "typescript",
    cover: "typescript",
    tags: ["languages", "web"],
    daysAgo: 52,
    pt: {
      slug: "tipos-typescript-que-pagam-aluguel",
      title: "Tipos em TypeScript que pagam aluguel",
      excerpt:
        "Uniões discriminadas, narrowing, satisfies, tipos marcados e validação na fronteira: os recursos de tipo que evitam bugs de verdade, e quando a ginástica de tipos atrapalha mais do que ajuda.",
      body: `Todo tipo que você escreve ocupa espaço: na tela, na revisão de código, na cabeça de quem vai manter aquilo depois. A pergunta útil sobre um tipo não é se ele é correto ou elegante, mas se ele paga aluguel, isto é, se impede bugs reais ou documenta algo que de outra forma ficaria implícito. O TypeScript oferece um sistema de tipos muito expressivo, e é fácil se perder nele. Neste texto quero falar dos recursos que, na minha experiência, dão o maior retorno pelo menor custo, e também de quando é melhor parar.

## Uniões discriminadas e narrowing

O padrão mais valioso do TypeScript é provavelmente a união discriminada: um conjunto de formas possíveis, cada uma marcada por um campo literal. Ela substitui o objeto cheio de campos opcionais em que metade das combinações não faz sentido.

\`\`\`ts
// Antes: estados impossíveis são representáveis
type RequestStateLoose = {
  loading: boolean;
  data?: User[];
  error?: string;
};

// Depois: cada estado carrega só o que faz sentido nele
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };

type User = { id: string; name: string };

function render(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Nada carregado ainda";
    case "loading":
      return "Carregando...";
    case "success":
      return state.data.map((u) => u.name).join(", ");
    case "error":
      return "Erro: " + state.error;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
\`\`\`

Dentro de cada \`case\`, o compilador estreita o tipo: só em \`"success"\` existe \`data\`. O ramo \`default\` com \`never\` é uma verificação de exaustividade. Se amanhã alguém adicionar um estado \`"cancelled"\`, esse trecho deixa de compilar e aponta exatamente o lugar a atualizar. Esse é o tipo de tipo que paga aluguel: ele transforma uma regra de negócio em um erro de compilação.

Narrowing também acontece com \`typeof\`, \`instanceof\`, o operador \`in\` e funções predicado do tipo \`value is Foo\`. Use predicados com moderação: o compilador confia cegamente neles, então um predicado errado é uma mentira com aparência oficial.

## satisfies e tipos marcados

O operador \`satisfies\` resolve um incômodo antigo. Ao anotar uma constante com um tipo, você perde a informação mais precisa que o TypeScript inferiria. Com \`satisfies\`, você verifica que o valor obedece ao tipo e mantém a inferência estreita.

\`\`\`ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: "/", auth: false },
  settings: { path: "/settings", auth: true },
} satisfies Record<string, Route>;

// As chaves continuam conhecidas: "home" | "settings"
type RouteName = keyof typeof routes;
\`\`\`

Se alguém escrever \`auth: "sim"\`, o erro aparece na hora; e \`routes.settings\` continua autocompletando.

Tipos marcados, ou branded types, atacam outro problema: valores com o mesmo formato primitivo e significados diferentes. Um \`string\` que é um ID de usuário e um \`string\` que é um ID de pedido são intercambiáveis para o compilador, e trocá-los é um bug clássico.

\`\`\`ts
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function toUserId(raw: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(raw)) throw new Error("UserId inválido");
  return raw as UserId;
}

declare function getOrder(id: OrderId): Promise<unknown>;

const id = toUserId("usr_abc123");
// getOrder(id); // erro de compilação: UserId não é OrderId
\`\`\`

A marca não existe em tempo de execução; é só uma etiqueta para o compilador. O ponto é que o único caminho para obter um \`UserId\` passa por uma função que valida. Funciona bem para IDs, valores monetários em centavos, strings já sanitizadas. Não marque tudo: se ninguém nunca confundiu dois valores, a marca é burocracia.

## Valide na fronteira

Tipos do TypeScript desaparecem na compilação. Quando dados chegam de fora, de uma requisição HTTP, de um arquivo, de variáveis de ambiente, de \`JSON.parse\`, o compilador não sabe nada sobre eles. Escrever \`const body = await req.json() as CreateUser\` é declarar uma esperança. A prática que mais evita bugs em produção é validar na fronteira, com uma biblioteca de schemas como Zod, e deixar o tipo derivar do schema.

\`\`\`ts
import { z } from "zod";

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
});

type CreateUser = z.infer<typeof CreateUser>;

export async function handler(req: Request): Promise<Response> {
  const parsed = CreateUser.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.issues }, { status: 400 });
  }
  const input: CreateUser = parsed.data; // confiável daqui em diante
  return Response.json({ ok: true, email: input.email });
}
\`\`\`

O schema é a fonte única de verdade: valida em tempo de execução e gera o tipo estático. Depois da fronteira, o código interno pode confiar nos tipos sem verificações defensivas espalhadas. É a ideia de "parse, não valide": transformar dados não confiáveis em um tipo mais preciso uma única vez, na entrada.

## Quando tipos avançados atrapalham

TypeScript permite tipos condicionais, mapeados, recursivos e template literal types. São ferramentas legítimas, essenciais para quem escreve bibliotecas. No código de aplicação, porém, costumam cobrar mais do que entregam. Alguns sinais de alerta:

- A mensagem de erro do compilador ocupa a tela inteira e ninguém da equipe consegue lê-la.
- O tipo precisa de um comentário maior do que a função que ele descreve.
- Você está modelando no sistema de tipos uma regra que muda toda semana.
- A verificação de tipos ficou visivelmente lenta no editor.

Nesses casos, prefira tipos simples e explícitos, mesmo que um pouco repetitivos, e um teste que cubra a regra. Duplicação legível ganha de abstração indecifrável. Um tipo que só o autor entende não é segurança; é dívida.

## Em resumo

- Uniões discriminadas com verificação \`never\` transformam regras de negócio em erros de compilação.
- \`satisfies\` valida a forma de um valor sem perder a inferência precisa.
- Tipos marcados evitam trocar valores de mesmo formato e significados diferentes; use onde já houve confusão.
- Valide dados externos na fronteira com um schema e derive o tipo dele.
- Se um tipo exige um tutorial para ser lido, simplifique e escreva um teste.`,
    },
    en: {
      slug: "typescript-types-that-pay-rent",
      title: "TypeScript Types That Pay Rent",
      excerpt:
        "Discriminated unions, narrowing, satisfies, branded types and parsing at the boundary: the type features that prevent real bugs, and when type gymnastics hurt more than they help.",
      body: `Every type you write takes up space: on screen, in code review, in the head of whoever maintains it later. The useful question about a type isn't whether it's correct or clever, but whether it pays rent, meaning it prevents real bugs or documents something that would otherwise stay implicit. TypeScript has a very expressive type system, and it's easy to get lost in it. Here I want to cover the features that, in my experience, give the biggest return for the smallest cost, and also when it's time to stop.

## Discriminated unions and narrowing

TypeScript's most valuable pattern is probably the discriminated union: a set of possible shapes, each tagged by a literal field. It replaces the object full of optional fields where half the combinations make no sense.

\`\`\`ts
// Before: impossible states are representable
type RequestStateLoose = {
  loading: boolean;
  data?: User[];
  error?: string;
};

// After: each state carries only what makes sense for it
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };

type User = { id: string; name: string };

function render(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Nothing loaded yet";
    case "loading":
      return "Loading...";
    case "success":
      return state.data.map((u) => u.name).join(", ");
    case "error":
      return "Error: " + state.error;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
\`\`\`

Inside each \`case\`, the compiler narrows the type: only under \`"success"\` does \`data\` exist. The \`default\` branch with \`never\` is an exhaustiveness check. If someone adds a \`"cancelled"\` state tomorrow, this code stops compiling and points at exactly the place to update. That's a type paying rent: it turns a business rule into a compile error.

Narrowing also works with \`typeof\`, \`instanceof\`, the \`in\` operator, and predicate functions of the form \`value is Foo\`. Use predicates sparingly: the compiler trusts them blindly, so a wrong predicate is a lie with an official stamp on it.

## satisfies and branded types

The \`satisfies\` operator fixes an old annoyance. When you annotate a constant with a type, you lose the more precise information TypeScript would otherwise infer. With \`satisfies\`, you check that the value conforms to the type and keep the narrow inference.

\`\`\`ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: "/", auth: false },
  settings: { path: "/settings", auth: true },
} satisfies Record<string, Route>;

// The keys stay known: "home" | "settings"
type RouteName = keyof typeof routes;
\`\`\`

If someone writes \`auth: "yes"\`, the error shows up immediately, and \`routes.settings\` still autocompletes.

Branded types tackle a different problem: values with the same primitive shape but different meanings. A \`string\` that's a user ID and a \`string\` that's an order ID are interchangeable to the compiler, and swapping them is a classic bug.

\`\`\`ts
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function toUserId(raw: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(raw)) throw new Error("Invalid UserId");
  return raw as UserId;
}

declare function getOrder(id: OrderId): Promise<unknown>;

const id = toUserId("usr_abc123");
// getOrder(id); // compile error: UserId is not OrderId
\`\`\`

The brand doesn't exist at runtime; it's only a label for the compiler. The point is that the only way to get a \`UserId\` is through a function that validates. It works well for IDs, money amounts in cents, strings that have already been sanitized. Don't brand everything: if nobody has ever mixed up two values, the brand is just paperwork.

## Parse at the boundary

TypeScript types vanish at compile time. When data comes from outside, from an HTTP request, a file, environment variables, \`JSON.parse\`, the compiler knows nothing about it. Writing \`const body = await req.json() as CreateUser\` is declaring a hope. The practice that prevents the most production bugs is validating at the boundary with a schema library such as Zod, and deriving the type from the schema.

\`\`\`ts
import { z } from "zod";

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
});

type CreateUser = z.infer<typeof CreateUser>;

export async function handler(req: Request): Promise<Response> {
  const parsed = CreateUser.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.issues }, { status: 400 });
  }
  const input: CreateUser = parsed.data; // trustworthy from here on
  return Response.json({ ok: true, email: input.email });
}
\`\`\`

The schema is the single source of truth: it validates at runtime and produces the static type. Past the boundary, internal code can trust its types without defensive checks scattered everywhere. This is the "parse, don't validate" idea: turn untrusted data into a more precise type once, at the entrance.

## When advanced types hurt

TypeScript supports conditional, mapped, recursive and template literal types. They're legitimate tools and essential for library authors. In application code, though, they tend to cost more than they deliver. Some warning signs:

- The compiler's error message fills the whole screen and nobody on the team can read it.
- The type needs a comment longer than the function it describes.
- You're encoding in the type system a rule that changes every week.
- Type checking has become noticeably slow in the editor.

In those cases, prefer simple, explicit types, even if a bit repetitive, plus a test that covers the rule. Readable duplication beats an indecipherable abstraction. A type only its author understands isn't safety; it's debt.

## In short

- Discriminated unions with a \`never\` check turn business rules into compile errors.
- \`satisfies\` validates a value's shape without losing precise inference.
- Branded types stop you from swapping same-shaped values with different meanings; use them where confusion has actually happened.
- Parse external data at the boundary with a schema and derive the type from it.
- If a type needs a tutorial to read, simplify it and write a test instead.`,
    },
  },
  {
    key: "green-software",
    cover: "green-software",
    tags: ["culture", "infra"],
    daysAgo: 58,
    pt: {
      slug: "software-verde-energia-e-carbono",
      title: "Software verde: energia e carbono como requisitos de engenharia",
      excerpt:
        "Todo software roda em hardware que consome energia. Eficiência como objetivo de design, agendamento consciente de carbono e medir antes de otimizar: o que desenvolvedores podem fazer de concreto.",
      body: `É fácil esquecer que software tem um corpo. Uma função é uma abstração elegante, mas ela executa num processador que consome eletricidade, numa máquina que foi fabricada, transportada e um dia será descartada, num data center que precisa ser resfriado. Cada requisição atravessa redes, roteadores e discos. Nada disso é gratuito, nem em dinheiro nem em emissões. Software verde é a prática de levar esse corpo a sério: tratar energia e carbono como propriedades do sistema, ao lado de latência, custo e confiabilidade. Não é uma causa separada da boa engenharia. Na maior parte do tempo, é boa engenharia com mais um motivo para fazê-la.

## Energia, carbono e hardware

Vale separar três ideias que costumam se misturar.

- **Eficiência energética** é fazer o mesmo trabalho gastando menos energia: algoritmos melhores, menos processamento desnecessário, menos bytes transferidos.
- **Consciência de carbono** é reconhecer que a mesma quantidade de energia pode emitir mais ou menos carbono dependendo de onde e quando é consumida. A matriz elétrica varia por região e ao longo do dia, conforme a participação de fontes renováveis e fósseis.
- **Eficiência de hardware** é lembrar que fabricar equipamentos também emite carbono. Usar bem as máquinas que já existem, com boa utilização em vez de servidores ociosos, e prolongar a vida útil de dispositivos, inclusive os dos usuários, faz parte da conta.

Essa última é subestimada no software de consumo. Quando uma aplicação web fica tão pesada que só roda bem em aparelhos recentes, ela empurra pessoas para trocar de equipamento antes da hora. Um site leve é também um site que funciona num telefone antigo.

## Eficiência como objetivo de design

A maior parte das decisões com impacto energético acontece cedo, na arquitetura, e não em micro-otimizações. Algumas perguntas que mudam o resultado:

- **Esse trabalho precisa ser feito?** O código mais eficiente é o que não roda. Relatórios que ninguém lê, jobs que reprocessam tudo quando só uma parte mudou, polling a cada segundo quando um evento bastaria.
- **Precisa ser feito agora?** Tarefas sem urgência podem ser agrupadas e executadas em lote, o que geralmente usa melhor os recursos.
- **Precisa trafegar tantos dados?** Cada byte transferido passa por infraestrutura que consome energia. Imagens no tamanho e formato adequados, compressão, cache HTTP bem configurado, paginação em vez de devolver tabelas inteiras, e APIs que retornam só os campos necessários.
- **Precisa guardar para sempre?** Armazenamento também tem custo contínuo. Políticas de retenção para logs, backups e dados analíticos são boas para privacidade, para o orçamento e para o consumo.

Menos código ajuda de forma indireta, mas real. Cada dependência adicionada ao frontend é baixada, interpretada e executada em todos os dispositivos de todos os usuários, a cada visita sem cache. Cada camada de abstração no backend é mais trabalho por requisição. Remover uma biblioteca que você usa para uma única função raramente aparece num painel de métricas, mas multiplicado por todos os acessos é trabalho que deixa de existir.

\`\`\`ts
// Em vez de buscar a lista inteira e filtrar no cliente...
const all = await fetch("/api/orders").then((r) => r.json());
const recent = all.filter((o: { status: string }) => o.status === "open").slice(0, 20);

// ...peça ao servidor só o que vai ser exibido
const params = new URLSearchParams({ status: "open", limit: "20", fields: "id,total,createdAt" });
const page = await fetch("/api/orders?" + params.toString()).then((r) => r.json());
\`\`\`

O segundo trecho trafega menos dados, exige menos memória no cliente e, com um índice adequado, menos trabalho no banco. Ele também é simplesmente uma API melhor. É essa a convergência que torna o tema prático: quase sempre, o que economiza energia também economiza dinheiro e melhora a experiência.

## Agendamento consciente de carbono

Como a intensidade de carbono da eletricidade varia, cargas flexíveis podem ser deslocadas no tempo ou no espaço. Treinar um modelo, recalcular índices, gerar relatórios mensais, rodar uma bateria pesada de testes: muitas tarefas não precisam acontecer num horário exato. Se for possível adiar algumas horas, ou escolher uma região com matriz mais limpa, a mesma energia emite menos.

Existem serviços e APIs públicas que estimam a intensidade de carbono de redes elétricas por região, e alguns provedores de nuvem publicam informações sobre a matriz de suas regiões. Uma implementação simples pode ser assim:

\`\`\`ts
type Forecast = { start: Date; gramsPerKwh: number };

// Escolhe a janela de menor intensidade dentro de um prazo aceitável.
function pickWindow(forecast: Forecast[], deadline: Date): Date {
  const candidates = forecast.filter((f) => f.start <= deadline);
  if (candidates.length === 0) return new Date(); // sem dados: roda agora
  return candidates.reduce((best, f) => (f.gramsPerKwh < best.gramsPerKwh ? f : best)).start;
}
\`\`\`

O cuidado aqui é não deixar a otimização virar fragilidade. Defina sempre um prazo máximo, tenha um comportamento padrão quando a previsão não estiver disponível e não aplique isso a nada que tenha usuário esperando. E lembre que mover cargas entre regiões envolve questões de latência, de residência de dados e de custo que podem pesar mais.

## Meça antes de otimizar

O erro mais comum em software verde é o mesmo da otimização de desempenho: agir por intuição. Antes de reescrever um serviço, descubra onde a energia de fato vai. Na prática, raramente se mede energia diretamente; usam-se aproximações razoáveis.

1. **Utilização de recursos.** CPU, memória e rede por serviço. Máquinas ociosas consomem energia sem entregar nada; superdimensionamento é desperdício silencioso.
2. **Custo da nuvem.** Imperfeito, mas correlacionado com recursos consumidos e disponível em qualquer lugar.
3. **Peso das páginas e das respostas.** Bytes transferidos e tempo de CPU no cliente, medidos pelas ferramentas de desenvolvedor e por testes de desempenho.
4. **Ferramentas de estimativa de carbono.** Alguns provedores e projetos abertos oferecem estimativas de emissões por serviço. Trate os números como aproximação e acompanhe a tendência, não o valor absoluto.

Com dados na mão, as prioridades ficam evidentes, e quase sempre são as mesmas que já estavam no backlog de desempenho e custo.

Quando não exagerar? Quando a otimização torna o sistema muito mais complexo para um ganho marginal. Um serviço interno com poucos acessos não justifica uma semana de trabalho. Concentre o esforço onde há escala: os caminhos mais acessados, os jobs mais pesados, os ativos baixados por todos.

## Em resumo

- Software consome energia e hardware; eficiência, carbono e vida útil dos equipamentos fazem parte do design.
- A maior alavanca é não fazer trabalho desnecessário e não trafegar dados desnecessários.
- Cargas flexíveis podem ser agendadas para horários ou regiões com eletricidade mais limpa, sempre com prazo e plano B.
- Meça com aproximações como utilização, custo e peso das respostas antes de otimizar.
- Na maioria das vezes, o que é mais verde também é mais barato, mais rápido e mais simples.`,
    },
    en: {
      slug: "green-software-energy-and-carbon",
      title: "Green Software: Energy and Carbon as Engineering Requirements",
      excerpt:
        "All software runs on hardware that draws power. Efficiency as a design goal, carbon-aware scheduling and measuring before optimizing: what developers can concretely do.",
      body: `It's easy to forget that software has a body. A function is an elegant abstraction, but it runs on a processor that draws electricity, in a machine that was manufactured, shipped and will one day be thrown away, inside a data center that has to be cooled. Every request crosses networks, routers and disks. None of it is free, in money or in emissions. Green software is the practice of taking that body seriously: treating energy and carbon as properties of the system, alongside latency, cost and reliability. It isn't a cause separate from good engineering. Most of the time, it's good engineering with one more reason to do it.

## Energy, carbon and hardware

It helps to separate three ideas that often get blurred together.

- **Energy efficiency** means doing the same work with less energy: better algorithms, less unnecessary computation, fewer bytes moved around.
- **Carbon awareness** means recognizing that the same amount of energy can emit more or less carbon depending on where and when it's used. The electricity mix varies by region and over the course of a day, depending on the share of renewable and fossil sources.
- **Hardware efficiency** means remembering that building equipment also emits carbon. Making good use of the machines that already exist, with high utilization instead of idle servers, and extending the life of devices, including your users' devices, is part of the math.

That last one is underrated in consumer software. When a web app gets so heavy it only runs well on recent phones, it pushes people to replace their hardware early. A lightweight site is also a site that works on an old phone.

## Efficiency as a design goal

Most decisions with an energy impact happen early, in architecture, not in micro-optimizations. A few questions that change the outcome:

- **Does this work need to happen?** The most efficient code is code that doesn't run. Reports nobody reads, jobs that reprocess everything when only a slice changed, polling every second when an event would do.
- **Does it need to happen now?** Non-urgent tasks can be grouped and run in batches, which usually uses resources better.
- **Does it need to move this much data?** Every byte transferred passes through infrastructure that consumes power. Images in the right size and format, compression, well-configured HTTP caching, pagination instead of returning whole tables, and APIs that return only the fields you need.
- **Does it need to be kept forever?** Storage has an ongoing cost too. Retention policies for logs, backups and analytics data are good for privacy, for the budget and for consumption.

Less code helps indirectly but genuinely. Every dependency you add to the frontend is downloaded, parsed and executed on every device of every user, on every uncached visit. Every abstraction layer on the backend is more work per request. Dropping a library you use for a single function rarely shows up on a dashboard, but multiplied across all traffic it's work that simply stops existing.

\`\`\`ts
// Instead of fetching the whole list and filtering on the client...
const all = await fetch("/api/orders").then((r) => r.json());
const recent = all.filter((o: { status: string }) => o.status === "open").slice(0, 20);

// ...ask the server for only what you'll display
const params = new URLSearchParams({ status: "open", limit: "20", fields: "id,total,createdAt" });
const page = await fetch("/api/orders?" + params.toString()).then((r) => r.json());
\`\`\`

The second version moves less data, needs less memory on the client and, with a suitable index, less work in the database. It's also just a better API. That convergence is what makes the topic practical: nearly always, what saves energy also saves money and improves the experience.

## Carbon-aware scheduling

Because the carbon intensity of electricity varies, flexible workloads can be shifted in time or space. Training a model, rebuilding indexes, generating monthly reports, running a heavy test suite: many tasks don't need to happen at an exact time. If you can delay a few hours, or pick a region with a cleaner grid, the same energy emits less.

There are services and public APIs that estimate the carbon intensity of power grids by region, and some cloud providers publish information about the energy mix of their regions. A simple implementation might look like this:

\`\`\`ts
type Forecast = { start: Date; gramsPerKwh: number };

// Pick the lowest-intensity window within an acceptable deadline.
function pickWindow(forecast: Forecast[], deadline: Date): Date {
  const candidates = forecast.filter((f) => f.start <= deadline);
  if (candidates.length === 0) return new Date(); // no data: run now
  return candidates.reduce((best, f) => (f.gramsPerKwh < best.gramsPerKwh ? f : best)).start;
}
\`\`\`

The thing to watch is that the optimization doesn't turn into fragility. Always set a hard deadline, have a default behavior when the forecast is unavailable, and never apply this to anything a user is waiting on. Also remember that moving workloads between regions brings latency, data residency and cost questions that may outweigh the gain.

## Measure before you optimize

The most common mistake in green software is the same one people make with performance: acting on intuition. Before rewriting a service, find out where the energy actually goes. In practice you rarely measure energy directly; you use reasonable proxies.

1. **Resource utilization.** CPU, memory and network per service. Idle machines draw power while delivering nothing; overprovisioning is silent waste.
2. **Cloud spend.** Imperfect, but correlated with resources consumed and available everywhere.
3. **Page and response weight.** Bytes transferred and client CPU time, measured with browser dev tools and performance tests.
4. **Carbon estimation tools.** Some providers and open-source projects offer per-service emissions estimates. Treat the numbers as approximations and track the trend, not the absolute value.

With data in hand, priorities become obvious, and they're usually the same ones already sitting in the performance and cost backlog.

When shouldn't you overdo it? When the optimization makes the system much more complex for a marginal gain. A low-traffic internal service doesn't justify a week of work. Focus effort where there's scale: the hottest paths, the heaviest jobs, the assets everyone downloads.

## In short

- Software consumes energy and hardware; efficiency, carbon and device lifespan belong in the design.
- The biggest lever is not doing unnecessary work and not moving unnecessary data.
- Flexible workloads can be scheduled for times or regions with cleaner electricity, always with a deadline and a fallback.
- Measure with proxies like utilization, spend and response weight before optimizing.
- More often than not, the greener option is also cheaper, faster and simpler.`,
    },
  },
];
