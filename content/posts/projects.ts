import type { ContentPost } from "../types";

// Projetos meus, contados em primeira pessoa. Estado do AXION: versão 0.19.0 (19/11/2026).
export const posts: ContentPost[] = [
  {
    key: "axion",
    cover: "axion",
    tags: ["ai", "infra"],
    daysAgo: 0,
    pt: {
      slug: "axion-um-escritorio-para-meu-time-de-agentes",
      title: "AXION: um escritório para o meu time de agentes de IA",
      excerpt:
        "Cansei de abrir cinco terminais e copiar contexto de um agente para o outro. Construí um canvas local onde cada agente é um terminal de verdade e eu decido quem fala com quem.",
      body: `Durante meses, meu dia de trabalho com agentes de IA teve a mesma cara: um terminal com o Claude Code, outro com o Codex, um terceiro com o Gemini, mais um shell comum para rodar testes. Cada um sabia uma parte da história. Eu era o cabo que ligava tudo: copiava a saída de um, colava no outro, explicava de novo o que já tinha explicado. Os pedidos de "posso apagar isso?" se perdiam no meio do rolar da tela. E sempre ficava a dúvida incômoda: o que esse agente fez enquanto eu olhava para o outro?

O AXION nasceu desse incômodo. É um canvas que roda na minha máquina, no navegador, onde o time de agentes mora. Eu desenho o time, ligo quem pode conversar com quem e fico no controle do que importa.

## A ideia: o canvas é o escritório

Em vez de terminais soltos, cada agente é um nó no canvas, e cada nó é um terminal real: Claude Code, Codex, Gemini, OpenCode ou um shell comum. Ligar dois nós com uma linha define que eles podem conversar. Sem linha, sem conversa.

Ao lado dos agentes ficam as coisas que um time de verdade usa: notas, um quadro de tarefas, um "cérebro" compartilhado onde o time guarda decisões e descobertas, nós de GitHub e portais de navegador. Os agentes mexem nisso tudo sozinhos, por um comando próprio, o \`axion\`. Com ele leem e escrevem notas, atualizam o cérebro, criam tarefas, criam outros agentes e me mandam mensagens.

Tudo roda localmente. Os projetos, as conversas e os dados ficam comigo, sem conta e sem telemetria.

## Como é usar, na prática

O caminho curto é assim:

1. **Montar o time.** Dá para partir de um time pronto (revisão de código, pesquisa, design de produto, esquadrão de bugs) ou usar o "Criar com IA": eu descrevo o que quero e o AXION monta uma proposta de time, que eu reviso antes de aplicar.
2. **Conversar.** Tem um chat com o grupo inteiro e uma conversa individual com cada agente, com @menções, áudio, imagens e arquivos. O detalhe que mais gosto: só aparece no chat o que o agente decide me dizer. Nada de saída de terminal poluindo a conversa.
3. **Ver o que está pendente.** A caixa de entrada (Alt+I) junta tudo que os agentes precisam de mim, ordenado por urgência, com ações em lote. Se eu passo um tempo fora, um cartão resume o que aconteceu enquanto eu não estava.
4. **Aprovar o que importa.** Ações sensíveis, como apagar algo, criar o cérebro ou mexer no GitHub, ficam esperando a minha decisão.

Para o bolso, há uma caixa de tokens com projeção mensal e limite de gasto por agente e por projeto, com alerta e pausa opcional.

## Quatro decisões técnicas

**Tudo local.** O servidor em Node/Next.js escuta só na minha máquina. Uma sessão protegida por token impede que outro site ou outra pessoa na rede controle os agentes. Foi a primeira decisão e a que menos me arrependo.

**O agente é identificado por token, nunca por texto.** Cada terminal recebe o seu próprio token, e é com ele que o comando \`axion\` fala com o servidor. Se um agente escrever "sou o revisor" numa mensagem, não muda nada: o servidor sabe quem enviou pelo token. Um agente não consegue se passar por outro.

**Aprovações de verdade.** Pedir confirmação no texto não basta, porque um agente pode simplesmente não perguntar. No AXION, as ações sensíveis passam pelo servidor e ficam paradas até eu aprovar. Sou honesto sobre o limite: sem isolamento, o agente ainda tem um shell com as minhas permissões. Por isso existe o isolamento opcional em container, e aí o caminho aprovado vira o único caminho.

**Permissões aplicadas no servidor.** Posso bloquear, por agente, coisas como criar notas, escrever no chat ou criar outros agentes. Quem decide é o servidor, em cada requisição, não a boa vontade do agente. E um agente criado por outro herda as restrições de quem o criou, então "contratar" um ajudante não serve de atalho.

## O que aprendi no caminho

Nem tudo foi tranquilo, e o AXION ainda está em evolução. Uso ele no meu dia a dia, e é justamente por isso que os problemas aparecem rápido.

- **Desempenho.** Terminais são pesados, e com vários abertos a interface sentia. Precisei agrupar a saída no servidor, trocar consultas repetidas por um único canal de eventos e desmontar os terminais quando o canvas está afastado.
- **Estabilidade.** Uma mensagem digitada num terminal parece simples até não chegar. Tive de garantir que cada mensagem enviada a um agente é realmente submetida, com fila por agente e nova tentativa até ele reagir.
- **Testes de interface.** Testar algo que depende de agentes de verdade é caro e imprevisível. A saída foi um teste de ponta a ponta com um servidor real e um agente falso, que confere mensagens, aprovações, GitHub e floors sem gastar um token.

Uma funcionalidade que nasceu dessas dores são os floors: branches git isolados para que vários agentes trabalhem em paralelo sem pisar no código um do outro. Outra é a retomada de contexto: o AXION guarda um resumo por agente e o entrega quando ele reinicia sem conseguir retomar a conversa.

> Agente bom não é o que faz tudo sozinho. É o que trabalha num lugar onde você enxerga o que ele está fazendo.

## O que vem a seguir

No que estou construindo agora, e que ainda não está pronto:

- vários projetos rodando ao mesmo tempo, sem parar os agentes;
- setas do canvas que desviam dos cartões;
- uma passada grande de fluidez e animação;
- atalhos personalizáveis;
- notas redesenhadas.

## Quer acompanhar?

O AXION é licenciado sob MIT, tem interface em português e mais 11 idiomas e funciona no celular e no tablet, com tema claro e escuro. Por enquanto o código ainda é privado. Se você também vive alternando entre terminais de agentes, me conte como é o seu fluxo: é desse tipo de conversa que saem as próximas versões.`,
    },
    en: {
      slug: "axion-an-office-for-my-team-of-ai-agents",
      title: "AXION: an office for my team of AI agents",
      excerpt:
        "I got tired of opening five terminals and copying context from one agent to another. So I built a local canvas where every agent is a real terminal and I decide who talks to whom.",
      body: `For months, my workday with AI agents looked the same: one terminal with Claude Code, another with Codex, a third with Gemini, plus a plain shell to run tests. Each one knew part of the story. I was the cable connecting everything: copying output from one, pasting it into another, explaining again what I had already explained. The "can I delete this?" questions got lost in the scrollback. And there was always that nagging doubt: what did this agent do while I was looking at the other one?

AXION was born from that annoyance. It is a canvas that runs on my machine, in the browser, where the team of agents lives. I design the team, connect who can talk to whom, and stay in control of what matters.

## The idea: the canvas is the office

Instead of loose terminals, each agent is a node on the canvas, and each node is a real terminal: Claude Code, Codex, Gemini, OpenCode or a plain shell. Drawing a line between two nodes means they can talk. No line, no conversation.

Next to the agents sit the things a real team uses: notes, a task board, a shared team "brain" where decisions and discoveries are kept, GitHub nodes and browser portals. Agents handle all of it themselves through their own command, \`axion\`. With it they read and write notes, update the brain, create tasks, create other agents and send me messages.

Everything runs locally. Projects, conversations and data stay with me, with no account and no telemetry.

## What using it looks like

The short path goes like this:

1. **Build the team.** Start from a ready-made team (code review, research, product design, bug squad) or use "Create with AI": I describe what I want and AXION drafts a team, which I review before applying.
2. **Talk.** There is a group chat with the whole team and a one-on-one conversation with each agent, with @mentions, audio, images and files. My favorite detail: the chat only shows what the agent chooses to tell me. No terminal output cluttering the conversation.
3. **See what's pending.** The inbox (Alt+I) gathers everything the agents need from me, sorted by urgency, with bulk actions. If I step away for a while, a card sums up what happened while I was gone.
4. **Approve what matters.** Sensitive actions, like deleting something, creating the brain or touching GitHub, wait for my decision.

For the wallet, there is a token box with a monthly projection and spending limits per agent and per project, with alerts and an optional pause.

## Four technical decisions

**Everything is local.** The Node/Next.js server only listens on my machine. A token-protected session keeps other websites, or other people on the network, from controlling the agents. It was the first decision and the one I regret the least.

**An agent is identified by a token, never by text.** Each terminal gets its own token, and that is how the \`axion\` command talks to the server. If an agent writes "I'm the reviewer" in a message, nothing changes: the server knows who sent it from the token. One agent cannot impersonate another.

**Real approvals.** Asking for confirmation in text is not enough, because an agent can simply not ask. In AXION, sensitive actions go through the server and stay on hold until I approve them. I'm honest about the limit: without isolation, the agent still has a shell with my permissions. That is why there is optional container isolation, and then the approved path becomes the only path.

**Permissions enforced on the server.** Per agent, I can block things like creating notes, writing in the chat or creating other agents. The server decides, on every request, not the agent's goodwill. And an agent created by another inherits its creator's restrictions, so "hiring" a helper is not a shortcut.

## What I learned along the way

Not everything went smoothly, and AXION is still evolving. I use it every day, which is exactly why problems show up fast.

- **Performance.** Terminals are heavy, and with several open the interface felt it. I had to batch output on the server, replace repeated polling with a single event channel and unmount terminals when the canvas is zoomed out.
- **Stability.** A message typed into a terminal seems simple until it doesn't arrive. I had to make sure every message sent to an agent is actually submitted, with a per-agent queue and retries until the agent reacts.
- **UI tests.** Testing something that depends on real agents is expensive and unpredictable. The answer was an end-to-end test with a real server and a fake agent, which checks messaging, approvals, GitHub and floors without spending a single token.

One feature born from these pains is floors: isolated git branches so several agents can work in parallel without stepping on each other's code. Another is context recovery: AXION keeps a summary per agent and hands it over when the agent restarts and can't resume its conversation.

> A good agent is not the one that does everything alone. It's the one working somewhere you can see what it's doing.

## What's next

What I'm building right now, and is not ready yet:

- several projects running at the same time, without stopping the agents;
- canvas arrows that route around the cards;
- a big pass on smoothness and animation;
- customizable shortcuts;
- redesigned notes.

## Want to follow along?

AXION is MIT licensed, has an interface in Portuguese plus 11 other languages, and works on phones and tablets, with light and dark themes. For now, the code is still private. If you also spend your days switching between agent terminals, tell me about your workflow: that kind of conversation is where the next versions come from.`,
    },
  },
];
