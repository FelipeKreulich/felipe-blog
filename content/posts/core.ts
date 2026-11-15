import type { ContentPost } from "../types";

export const posts: ContentPost[] = [
  {
    key: "agents",
    cover: "agents",
    tags: ["ai", "culture"],
    daysAgo: 0,
    pt: {
      slug: "agentes-que-escrevem-codigo",
      title: "Os agentes já escrevem código. E agora?",
      excerpt:
        "Ferramentas que planejam, executam e revisam mudanças inteiras mudam o papel de quem programa — de digitador para editor. O que muda no dia a dia, e o que não deveria mudar.",
      body: `Durante anos, a ajuda que as máquinas davam a quem programa cabia numa linha: um autocomplete mais esperto, uma sugestão de nome de variável, um trecho de código copiado de algum lugar. Isso mudou. Os agentes de código atuais leem o repositório, rodam comandos, executam testes, editam vários arquivos e voltam com uma proposta de mudança completa. A pergunta deixou de ser "a IA consegue escrever código?" e passou a ser outra, bem mais interessante: o que sobra para nós fazermos, e como fazer isso bem?

## Do autocomplete ao laço de execução

A diferença entre um assistente de sugestões e um agente não está na qualidade do modelo, e sim no laço. Um agente recebe um objetivo, decide um próximo passo, usa uma ferramenta (ler um arquivo, rodar um teste, buscar um símbolo), observa o resultado e repete. É o mesmo ciclo que fazemos mentalmente quando depuramos algo: hipótese, experimento, observação.

Isso tem uma consequência prática importante. Um agente é tão bom quanto o ambiente que você oferece para ele observar o mundo. Um projeto com testes rápidos, um linter configurado, tipos estritos e um comando único para rodar tudo dá ao agente sinais claros de "isso funcionou" ou "isso quebrou". Um projeto sem nada disso obriga o agente a adivinhar — e adivinhação em escala produz código plausível e errado.

~~~bash
# O tipo de contrato que ajuda humanos e agentes igualmente
npm run lint && npm run typecheck && npm test
~~~

Se essa linha não existe no seu projeto, ela é provavelmente o investimento de maior retorno que você pode fazer antes de adotar qualquer ferramenta de agente.

## De digitador a editor

A metáfora que mais me ajuda é a da redação de um jornal. O repórter escreve; o editor decide o que entra, corta o excesso, checa os fatos e assume a responsabilidade pelo que é publicado. Trabalhar com agentes empurra quem programa para o papel de editor.

Isso não é rebaixamento. Editar bem é difícil. Exige saber o que se quer antes de ver o texto, perceber o que está faltando e não apenas o que está escrito, e ter coragem de jogar fora um rascunho inteiro quando ele parte da premissa errada. Algumas habilidades ganham peso:

- **Especificar com precisão.** Um pedido vago gera uma solução genérica. Dizer quais arquivos importam, quais restrições existem e o que conta como "pronto" muda tudo.
- **Ler código com desconfiança.** Código gerado costuma ser bem formatado e confiante. Isso desarma a revisão. É preciso ler procurando o caso de borda esquecido, o erro engolido, a dependência desnecessária.
- **Decompor o problema.** Agentes lidam melhor com tarefas pequenas e verificáveis do que com "refatore o sistema de pagamentos". Quebrar o trabalho continua sendo trabalho humano.
- **Conhecer o domínio.** O agente não sabe que aquele campo "opcional" é obrigatório para um cliente específico. Você sabe.

> Revisar um diff de quinhentas linhas que você não escreveu é mais difícil do que escrever cinquenta linhas que você entende. Planeje o trabalho para que os diffs continuem pequenos.

## Onde os agentes brilham, e onde tropeçam

Na minha experiência, há um padrão bastante estável. Agentes vão bem em tarefas com especificação clara e verificação automática: escrever testes para um módulo existente, migrar chamadas de uma API antiga para uma nova, ajustar tipos depois de uma mudança de esquema, criar o esqueleto de um endpoint seguindo o padrão dos vizinhos. Nessas tarefas, o repositório já contém o exemplo e os testes dizem se deu certo.

Eles tropeçam em decisões que dependem de contexto que não está no código: escolher entre duas arquiteturas, entender por que algo "estranho" foi feito daquele jeito, avaliar implicações de segurança sutis, ou perceber que a tarefa pedida não resolve o problema real. Também tendem a resolver sintomas — silenciar um teste, adicionar um \`try/catch\` genérico, criar mais uma abstração — quando o certo seria parar e perguntar.

### Quando NÃO delegar

Há trabalhos que eu evito entregar a um agente, ao menos sem supervisão próxima:

1. Código de autenticação, autorização e criptografia, onde um erro silencioso custa caro.
2. Migrações de dados irreversíveis em produção.
3. Mudanças cujo critério de sucesso eu mesmo ainda não sei explicar.
4. Código que eu precisarei manter e não entendo — aceitar sem entender é dívida com juros altos.

Não é que o agente seja incapaz. É que o custo de um erro não detectado é desproporcional ao tempo economizado.

## Um fluxo de trabalho que funciona

O que tem funcionado para mim é tratar o agente como um colega júnior muito rápido, que nunca se cansa mas também nunca discorda espontaneamente. Algumas práticas concretas:

- **Comece pelo plano.** Peça primeiro um plano de alterações, revise-o, e só então autorize a execução. Corrigir um plano é barato; corrigir quinhentas linhas não é.
- **Mantenha instruções do projeto versionadas.** Um arquivo com convenções, comandos e armadilhas conhecidas evita repetir as mesmas correções a cada sessão.
- **Commits pequenos e frequentes.** Facilitam desfazer o que deu errado e tornam a revisão humana viável.
- **Os testes são o contrato.** Se o agente alterou um teste para fazê-lo passar, isso merece atenção redobrada.
- **Revise como se fosse de outra pessoa.** Porque é.

Também vale lembrar do custo. Agentes consomem tempo de máquina e, frequentemente, dinheiro por uso. Uma tarefa que você resolveria em dois minutos com um editor não precisa de um laço de vinte passos.

## O que não muda

Há uma tentação de concluir que, se a máquina escreve o código, aprender a programar perdeu valor. Acho o contrário. Para editar bem, é preciso saber escrever. Quem nunca depurou uma condição de corrida não vai reconhecê-la num diff gerado. Quem não entende como o banco executa uma consulta não vai perceber o índice que falta.

O que muda é onde gastamos a atenção. Menos tempo digitando código previsível, mais tempo decidindo o que construir, desenhando interfaces entre partes do sistema, conversando com quem usa o software e garantindo que o que vai para produção é correto. A responsabilidade continua sendo de quem aperta o botão de merge.

## Em resumo

- Agentes funcionam em laço: o ambiente de verificação (testes, tipos, lint) é o que os torna úteis.
- O papel de quem programa se desloca para especificar, decompor e revisar — trabalho de editor.
- Delegue tarefas claras e verificáveis; segure decisões de arquitetura, segurança e dados irreversíveis.
- Diffs pequenos, plano antes da execução e instruções do projeto versionadas.
- Saber programar continua essencial: não dá para editar o que você não sabe escrever.`,
    },
    en: {
      slug: "agents-that-write-code",
      title: "Agents already write code. Now what?",
      excerpt:
        "Tools that plan, execute and review entire changes shift the programmer's role — from typist to editor. What changes day to day, and what shouldn't.",
      body: `For years, the help machines gave programmers fit on a single line: a smarter autocomplete, a suggested variable name, a snippet lifted from somewhere. That has changed. Today's coding agents read the repository, run commands, execute tests, edit several files and come back with a complete proposed change. The question is no longer "can AI write code?" but a far more interesting one: what is left for us to do, and how do we do it well?

## From autocomplete to an execution loop

The difference between a suggestion tool and an agent isn't the quality of the model — it's the loop. An agent takes a goal, picks a next step, uses a tool (read a file, run a test, search for a symbol), observes the result and repeats. It's the same cycle we run in our heads while debugging: hypothesis, experiment, observation.

That has an important practical consequence. An agent is only as good as the environment you give it to observe the world. A project with fast tests, a configured linter, strict types and a single command to run everything gives the agent clear signals of "that worked" or "that broke". A project with none of that forces the agent to guess — and guessing at scale produces code that is plausible and wrong.

~~~bash
# The kind of contract that helps humans and agents alike
npm run lint && npm run typecheck && npm test
~~~

If that line doesn't exist in your project, it is probably the highest-return investment you can make before adopting any agent tooling at all.

## From typist to editor

The metaphor that helps me most is a newsroom. The reporter writes; the editor decides what runs, trims the excess, checks the facts and takes responsibility for what gets published. Working with agents pushes programmers into the editor's chair.

That is not a demotion. Editing well is hard. It requires knowing what you want before you see the draft, noticing what's missing rather than only what's there, and having the nerve to throw away an entire draft when it starts from the wrong premise. Some skills gain weight:

- **Specifying precisely.** A vague request yields a generic solution. Saying which files matter, what constraints exist and what counts as "done" changes everything.
- **Reading code with suspicion.** Generated code tends to be neatly formatted and confident. That disarms review. You have to read looking for the forgotten edge case, the swallowed error, the unnecessary dependency.
- **Breaking the problem down.** Agents handle small, verifiable tasks far better than "refactor the payments system". Decomposition is still human work.
- **Knowing the domain.** The agent doesn't know that the "optional" field is mandatory for one particular customer. You do.

> Reviewing a five-hundred-line diff you didn't write is harder than writing fifty lines you understand. Plan the work so the diffs stay small.

## Where agents shine, and where they stumble

In my experience the pattern is fairly stable. Agents do well on tasks with a clear spec and automatic verification: writing tests for an existing module, migrating calls from an old API to a new one, fixing types after a schema change, scaffolding an endpoint that follows the pattern of its neighbors. In those tasks the repository already contains the example, and the tests say whether it worked.

They stumble on decisions that depend on context that isn't in the code: choosing between two architectures, understanding why something "weird" was done that way, weighing subtle security implications, or realizing that the requested task doesn't solve the actual problem. They also tend to treat symptoms — silencing a test, adding a blanket \`try/catch\`, introducing one more abstraction — when the right move would be to stop and ask.

### When NOT to delegate

There is work I avoid handing to an agent, at least without close supervision:

1. Authentication, authorization and cryptography code, where a silent mistake is expensive.
2. Irreversible data migrations in production.
3. Changes whose success criteria I can't yet explain myself.
4. Code I will have to maintain but don't understand — accepting it unread is debt at a steep interest rate.

It's not that the agent is incapable. It's that the cost of an undetected error is out of proportion to the time saved.

## A workflow that holds up

What has worked for me is treating the agent like a very fast junior colleague who never gets tired but also never spontaneously disagrees. A few concrete practices:

- **Start with the plan.** Ask for a plan of changes first, review it, and only then let it execute. Fixing a plan is cheap; fixing five hundred lines is not.
- **Keep project instructions in version control.** A file with conventions, commands and known pitfalls saves you from repeating the same corrections every session.
- **Small, frequent commits.** They make it easy to undo what went wrong and keep human review feasible.
- **Tests are the contract.** If the agent edited a test to make it pass, that deserves extra scrutiny.
- **Review it as if someone else wrote it.** Because someone else did.

Cost is worth remembering, too. Agents burn machine time and often money per use. A task you'd finish in two minutes in your editor doesn't need a twenty-step loop.

## What doesn't change

There's a temptation to conclude that if the machine writes the code, learning to program has lost its value. I think the opposite is true. To edit well, you need to know how to write. Someone who has never chased a race condition won't recognize one in a generated diff. Someone who doesn't understand how the database executes a query won't notice the missing index.

What changes is where we spend our attention. Less time typing predictable code, more time deciding what to build, designing the seams between parts of the system, talking to the people who use the software and making sure what ships is correct. Responsibility still belongs to whoever clicks merge.

## In short

- Agents work in a loop: the verification environment (tests, types, lint) is what makes them useful.
- The programmer's role shifts toward specifying, decomposing and reviewing — an editor's job.
- Delegate clear, verifiable tasks; keep architecture, security and irreversible data decisions close.
- Small diffs, a plan before execution, and versioned project instructions.
- Knowing how to program still matters: you can't edit what you couldn't write.`,
    },
  },
  {
    key: "rust",
    cover: "rust",
    tags: ["languages", "security"],
    daysAgo: 2,
    pt: {
      slug: "rust-no-kernel",
      title: "Rust chega ao coração do sistema",
      excerpt:
        "Do kernel do Linux a drivers do Windows, a linguagem da segurança de memória deixou de ser experimento. O que ela resolve, o que custa e quando não vale a troca.",
      body: `Durante décadas, o código que roda mais perto do hardware foi escrito quase exclusivamente em C, com alguma ajuda de C++ e assembly. Não por falta de alternativas, mas porque poucas linguagens ofereciam controle total sobre memória, desempenho previsível e nenhum runtime pesando nas costas. Rust entrou nessa conversa prometendo as mesmas garantias de controle com uma diferença crucial: uma classe inteira de bugs passa a ser detectada pelo compilador, antes de o código rodar. Hoje a linguagem tem suporte oficial no kernel do Linux e aparece em componentes de sistemas operacionais de grandes fornecedores. Vale entender por que, e também o que isso não resolve.

## O problema que Rust ataca

Grande parte das vulnerabilidades graves em software de sistemas tem a mesma raiz: erros de segurança de memória. Usar um ponteiro depois de liberar a memória (use-after-free), escrever além do fim de um buffer, liberar a mesma região duas vezes, ler memória não inicializada, ou ter duas threads modificando o mesmo dado sem sincronização. Equipes de segurança de vários fornecedores grandes já relataram publicamente que esse tipo de falha responde por uma parcela majoritária das vulnerabilidades sérias que corrigem.

Em C, evitar esses erros depende de disciplina, revisão e ferramentas externas como sanitizers e fuzzers. Tudo isso ajuda, mas nada disso é garantia. Rust muda o padrão: o código seguro, por definição, não consegue cometer esses erros. O compilador recusa o programa.

## Propriedade e empréstimo, em poucas linhas

O coração da linguagem é o sistema de propriedade (ownership). Cada valor tem exatamente um dono; quando o dono sai de escopo, o valor é liberado. Você pode emprestar referências, mas com uma regra: ou várias referências somente leitura, ou uma única referência mutável, nunca as duas ao mesmo tempo.

~~~rust
fn main() {
    let mut buffer = vec![1, 2, 3];

    let primeiro = &buffer[0];   // empréstimo imutável
    // buffer.push(4);           // erro: não dá para mutar enquanto há empréstimo
    println!("primeiro = {primeiro}");

    buffer.push(4);              // ok: o empréstimo acabou
    println!("{buffer:?}");
}
~~~

A linha comentada é exatamente o bug clássico: \`push\` pode realocar o vetor e deixar \`primeiro\` apontando para memória liberada. Em C, isso compila e talvez funcione por meses. Em Rust, não compila.

A mesma regra, aplicada a threads, elimina corridas de dados no código seguro. Os traits \`Send\` e \`Sync\` dizem ao compilador o que pode atravessar ou ser compartilhado entre threads, e ele recusa o resto.

## Por que o kernel aceitou

O kernel do Linux é um dos projetos mais conservadores que existem em relação a linguagens, e por boas razões: ele precisa compilar para muitas arquiteturas, manter compatibilidade por muito tempo e ser revisado por pessoas que conhecem C profundamente. A entrada de Rust foi gradual e cercada de discussões, e o foco inicial foi em drivers — código relativamente isolado, escrito em grande quantidade e responsável por muitos bugs.

A lógica é pragmática. Ninguém propõe reescrever o kernel. A proposta é que código novo, em áreas onde faz sentido, possa ser escrito numa linguagem que impede certos erros. As partes em Rust conversam com o resto por meio de abstrações seguras construídas sobre as interfaces em C, e o trabalho difícil fica concentrado nessas camadas de ligação.

### O papel do \`unsafe\`

Rust não elimina o código perigoso; ele o isola. Operações que o compilador não consegue verificar — desreferenciar ponteiros crus, chamar funções em C, acessar registradores de hardware — exigem um bloco \`unsafe\`. A ideia é que esses blocos sejam pequenos, bem documentados e envoltos por uma API segura. Quando algo dá errado, você sabe onde procurar.

~~~rust
/// SAFETY: \`ptr\` deve ser não nulo, alinhado e apontar para um u32 válido.
unsafe fn ler_registrador(ptr: *const u32) -> u32 {
    core::ptr::read_volatile(ptr)
}
~~~

Isso é muito diferente de "o programa inteiro é unsafe", que é a situação padrão em C.

## Os custos reais

Seria desonesto vender Rust como almoço grátis. Os custos existem:

- **Curva de aprendizado.** O verificador de empréstimos recusa programas que parecem razoáveis. Leva tempo até o modelo mental se encaixar, e algumas estruturas (grafos, listas duplamente ligadas) exigem abordagens diferentes.
- **Tempo de compilação.** Projetos grandes compilam mais devagar do que equivalentes em C ou Go. Isso afeta o ciclo de desenvolvimento.
- **Interoperabilidade.** Conviver com uma base em C exige camadas de ligação cuidadosas, e é justamente ali que bugs ainda podem aparecer.
- **Pessoas.** Revisores precisam conhecer as duas linguagens. Em projetos com poucos mantenedores, isso é uma restrição concreta.
- **Ferramentas e plataformas.** O suporte a arquiteturas exóticas ainda é mais limitado do que o de compiladores C maduros.

## Quando NÃO trocar

Rust não é a resposta para todo código de sistemas. Eu pensaria duas vezes antes de adotá-lo quando:

1. A base existente em C é estável, bem testada e raramente muda. Reescrever introduz bugs novos para eliminar bugs que talvez nem existam mais.
2. A equipe não tem tempo para aprender. Rust mal escrito, cheio de \`clone()\` e \`unsafe\` por conveniência, entrega pouco da promessa.
3. O problema é de lógica, não de memória. Rust não impede que você calcule a coisa errada, trate mal um erro de negócio ou esqueça uma verificação de permissão.
4. Uma linguagem com coletor de lixo resolve. Para muitos serviços, Go, Java ou C# já são seguros em memória e mais simples.

O caminho que tenho visto funcionar melhor é incremental: componentes novos, isolados, com fronteira clara, onde o ganho de segurança é alto e o custo de integração é baixo.

## Em resumo

- Rust ataca erros de segurança de memória, raiz de boa parte das vulnerabilidades graves em software de sistemas.
- Propriedade e empréstimo tornam esses erros impossíveis no código seguro, verificados em tempo de compilação.
- \`unsafe\` não some, mas fica isolado e auditável.
- Os custos são reais: aprendizado, compilação, interoperabilidade e pessoas.
- Adote de forma incremental, em código novo e bem delimitado — não reescreva o que já funciona.`,
    },
    en: {
      slug: "rust-in-the-kernel",
      title: "Rust reaches the heart of the system",
      excerpt:
        "From the Linux kernel to Windows drivers, the memory-safe language is no longer an experiment. What it fixes, what it costs, and when the switch isn't worth it.",
      body: `For decades, the code that runs closest to the hardware was written almost entirely in C, with some help from C++ and assembly. Not for lack of alternatives, but because few languages offered full control over memory, predictable performance and no runtime weighing them down. Rust joined that conversation promising the same control with one crucial difference: an entire class of bugs gets caught by the compiler before the code ever runs. Today the language has official support in the Linux kernel and shows up in operating system components from major vendors. It's worth understanding why — and what it doesn't fix.

## The problem Rust goes after

A large share of serious vulnerabilities in systems software share a root cause: memory safety errors. Using a pointer after its memory was freed (use-after-free), writing past the end of a buffer, freeing the same region twice, reading uninitialized memory, or having two threads modify the same data without synchronization. Security teams at several large vendors have publicly reported that this kind of flaw accounts for the majority of the serious vulnerabilities they patch.

In C, avoiding these mistakes depends on discipline, review and external tools such as sanitizers and fuzzers. All of that helps; none of it is a guarantee. Rust flips the default: safe code, by definition, cannot make these errors. The compiler rejects the program.

## Ownership and borrowing, briefly

The heart of the language is its ownership system. Every value has exactly one owner; when the owner goes out of scope, the value is freed. You can lend references, under one rule: either many read-only references or a single mutable one, never both at once.

~~~rust
fn main() {
    let mut buffer = vec![1, 2, 3];

    let first = &buffer[0];   // immutable borrow
    // buffer.push(4);        // error: can't mutate while borrowed
    println!("first = {first}");

    buffer.push(4);           // fine: the borrow has ended
    println!("{buffer:?}");
}
~~~

The commented-out line is exactly the classic bug: \`push\` may reallocate the vector and leave \`first\` pointing at freed memory. In C, that compiles and might work for months. In Rust, it doesn't compile.

The same rule, applied to threads, eliminates data races in safe code. The \`Send\` and \`Sync\` traits tell the compiler what may cross or be shared between threads, and it refuses everything else.

## Why the kernel said yes

The Linux kernel is one of the most conservative projects around when it comes to languages, and for good reasons: it must build for many architectures, stay compatible for a very long time and be reviewed by people who know C inside out. Rust's arrival was gradual and heavily debated, and the initial focus was drivers — relatively isolated code, written in large volume and responsible for a lot of bugs.

The reasoning is pragmatic. Nobody is proposing to rewrite the kernel. The proposal is that new code, in areas where it makes sense, can be written in a language that prevents certain mistakes. The Rust parts talk to the rest through safe abstractions built on top of the C interfaces, and the hard work is concentrated in those binding layers.

### The role of \`unsafe\`

Rust doesn't eliminate dangerous code; it fences it in. Operations the compiler can't verify — dereferencing raw pointers, calling C functions, touching hardware registers — require an \`unsafe\` block. The idea is that those blocks stay small, well documented and wrapped in a safe API. When something goes wrong, you know where to look.

~~~rust
/// SAFETY: \`ptr\` must be non-null, aligned and point to a valid u32.
unsafe fn read_register(ptr: *const u32) -> u32 {
    core::ptr::read_volatile(ptr)
}
~~~

That is very different from "the whole program is unsafe", which is the default situation in C.

## The real costs

It would be dishonest to sell Rust as a free lunch. The costs are real:

- **Learning curve.** The borrow checker rejects programs that look reasonable. It takes time for the mental model to click, and some structures (graphs, doubly linked lists) call for different approaches.
- **Compile times.** Large projects build more slowly than their C or Go equivalents, and that shapes the development loop.
- **Interop.** Living alongside a C codebase requires careful binding layers, and that is precisely where bugs can still creep in.
- **People.** Reviewers need to know both languages. In projects with few maintainers, that's a concrete constraint.
- **Tooling and platforms.** Support for exotic architectures is still more limited than that of mature C compilers.

## When NOT to switch

Rust isn't the answer for all systems code. I'd think twice before adopting it when:

1. The existing C code is stable, well tested and rarely changes. A rewrite introduces new bugs to eliminate bugs that may no longer exist.
2. The team has no time to learn. Poorly written Rust, full of \`clone()\` and convenience \`unsafe\`, delivers little of the promise.
3. The problem is logic, not memory. Rust won't stop you from computing the wrong thing, mishandling a business error or forgetting a permission check.
4. A garbage-collected language will do. For many services, Go, Java or C# are already memory safe and simpler.

The path I've seen work best is incremental: new, isolated components with a clear boundary, where the safety gain is high and the integration cost is low.

## In short

- Rust targets memory safety errors, the root of a large share of serious vulnerabilities in systems software.
- Ownership and borrowing make those errors impossible in safe code, checked at compile time.
- \`unsafe\` doesn't disappear, but it becomes isolated and auditable.
- The costs are real: learning, compile times, interop and people.
- Adopt incrementally, in new and well-bounded code — don't rewrite what already works.`,
    },
  },
  {
    key: "rsc",
    cover: "rsc",
    tags: ["web"],
    daysAgo: 4,
    pt: {
      slug: "server-components-na-pratica",
      title: "Server Components, sem o hype",
      excerpt:
        "Menos JavaScript no cliente, dados buscados onde moram. Um guia honesto sobre como funcionam, quando valem a pena e onde complicam.",
      body: `Poucas mudanças no ecossistema React geraram tanta discussão quanto os Server Components. Para alguns, são a correção de uma década de excessos no cliente; para outros, uma complicação desnecessária que reinventa o PHP com mais passos. Como quase sempre, a verdade útil está no meio e depende do que você está construindo. Este texto tenta explicar o modelo sem slogans, mostrar onde ele ajuda de verdade e apontar os lugares onde ele cobra seu preço.

## O que muda no modelo mental

No React tradicional, todo componente é enviado ao navegador como JavaScript, executado lá e, se precisar de dados, faz uma requisição a uma API. Mesmo com renderização no servidor (SSR), o código de todos os componentes ainda vai para o cliente para a hidratação.

Server Components invertem o padrão. Um componente de servidor roda apenas no servidor, pode ser assíncrono, acessa diretamente o banco, o sistema de arquivos ou serviços internos, e envia ao cliente apenas o resultado renderizado — não o seu código. Componentes de cliente continuam existindo, marcados explicitamente, e são os únicos que carregam JavaScript para o navegador.

~~~tsx
// app/posts/page.tsx — componente de servidor (padrão)
import { db } from "@/lib/db";
import { LikeButton } from "./like-button";

export default async function PostsPage() {
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          {p.title} <LikeButton postId={p.id} />
        </li>
      ))}
    </ul>
  );
}
~~~

~~~tsx
// app/posts/like-button.tsx — componente de cliente
"use client";
import { useState } from "react";

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? "♥" : "♡"}</button>;
}
~~~

Repare no que desapareceu: não há rota de API para listar posts, nem \`useEffect\` buscando dados, nem estado de carregamento manual. A biblioteca do banco nunca chega ao navegador.

## Onde realmente ajuda

Os ganhos são concretos em alguns cenários:

- **Páginas ricas em conteúdo e pobres em interação.** Blogs, documentação, catálogos e painéis de leitura. A maior parte da página é estática do ponto de vista do cliente, e só pequenas ilhas precisam de JavaScript.
- **Dependências pesadas que só servem para renderizar.** Um parser de Markdown ou um realçador de sintaxe podem rodar no servidor sem custar um byte no bundle.
- **Acesso a dados sem camada intermediária.** Para aplicações em que o front e o back são do mesmo time, eliminar a API interna reduz código e pontos de falha.
- **Segredos ficam no servidor.** Chaves e credenciais usadas em componentes de servidor não são enviadas ao navegador — desde que você não as passe como props para um componente de cliente.

## Onde complica

O preço aparece em outros lugares, e é melhor conhecê-lo antes:

- **A fronteira é uma decisão de arquitetura.** Tudo o que atravessa do servidor para o cliente precisa ser serializável. Funções, instâncias de classes e datas exigem cuidado. Decidir onde colocar \`"use client"\` afeta o tamanho do bundle e o que pode ser importado de onde.
- **Cache e invalidação.** Frameworks que implementam o modelo costumam fazer cache agressivo de dados e de rotas. Entender quando algo é revalidado é essencial, e as regras podem surpreender.
- **Depuração em dois ambientes.** Um erro pode acontecer no servidor, no cliente ou na serialização entre os dois. As mensagens nem sempre deixam claro qual.
- **Dependência do framework.** Na prática, Server Components são usados por meio de um framework que implementa o empacotamento e o roteamento. Isso acopla mais sua aplicação àquele framework.
- **Bibliotecas que assumem o navegador.** Muitas bibliotecas de UI usam contexto, estado ou APIs do DOM e precisam viver em componentes de cliente.

### Um erro comum

Marcar \`"use client"\` no topo de um componente grande "para fazer funcionar" transforma toda a árvore abaixo dele em código de cliente. O resultado é o pior dos dois mundos: a complexidade do modelo novo com o bundle do modelo antigo. A regra prática é empurrar a fronteira de cliente o mais para baixo possível — para o botão, não para a página.

## Quando NÃO usar

Server Components não são obrigatórios, e há casos em que eu não os escolheria:

1. **Aplicações altamente interativas**, como editores, ferramentas de desenho ou dashboards em tempo real, em que quase tudo é estado de cliente. O ganho é pequeno e a fronteira vira atrito.
2. **Front-end consumindo uma API pública já existente**, mantida por outro time ou servindo também a aplicativos móveis. A API continua necessária; o acesso direto ao banco não se aplica.
3. **Hospedagem puramente estática** sem servidor disponível em tempo de requisição. Parte do modelo ainda funciona em build, mas boa parte da vantagem some.
4. **Times sem tempo para aprender as regras de cache** do framework escolhido. Um SPA simples e bem feito é melhor do que uma aplicação de servidor mal compreendida.

## Uma forma pragmática de adotar

Se você decidir experimentar, algumas práticas reduzem a dor:

- Comece com páginas de leitura, onde o ganho é óbvio e o risco é baixo.
- Mantenha componentes de cliente pequenos e folha da árvore.
- Centralize acesso a dados em funções de servidor bem nomeadas, em vez de espalhar consultas pelos componentes.
- Leia a documentação de cache do seu framework antes de ir para produção, não depois do primeiro bug de dado desatualizado.
- Meça: compare o JavaScript enviado e o tempo até a interação antes e depois.

## Em resumo

- Server Components rodam só no servidor e enviam resultado, não código; componentes de cliente continuam sendo a forma de ter interatividade.
- Brilham em páginas de conteúdo, dependências pesadas de renderização e times que controlam front e back.
- Cobram em fronteiras de serialização, regras de cache e acoplamento ao framework.
- Empurre \`"use client"\` para as folhas da árvore.
- Para aplicações muito interativas ou com API externa, o modelo clássico continua uma boa escolha.`,
    },
    en: {
      slug: "server-components-in-practice",
      title: "Server Components, minus the hype",
      excerpt:
        "Less client JavaScript, data fetched where it lives. An honest guide to how they work, when they pay off and where they get complicated.",
      body: `Few changes in the React ecosystem have sparked as much debate as Server Components. To some they're the correction for a decade of client-side excess; to others an unnecessary complication that reinvents PHP with extra steps. As usual, the useful truth sits in the middle and depends on what you're building. This piece tries to explain the model without slogans, show where it genuinely helps and point out where it charges its toll.

## What changes in the mental model

In traditional React, every component is shipped to the browser as JavaScript, executed there and, if it needs data, makes a request to an API. Even with server-side rendering (SSR), the code for every component still travels to the client for hydration.

Server Components flip the default. A server component runs only on the server, can be async, talks directly to the database, the file system or internal services, and sends the client only the rendered result — not its code. Client components still exist, explicitly marked, and they are the only ones that carry JavaScript to the browser.

~~~tsx
// app/posts/page.tsx — server component (the default)
import { db } from "@/lib/db";
import { LikeButton } from "./like-button";

export default async function PostsPage() {
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          {p.title} <LikeButton postId={p.id} />
        </li>
      ))}
    </ul>
  );
}
~~~

~~~tsx
// app/posts/like-button.tsx — client component
"use client";
import { useState } from "react";

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? "♥" : "♡"}</button>;
}
~~~

Notice what disappeared: no API route to list posts, no \`useEffect\` fetching data, no hand-rolled loading state. The database library never reaches the browser.

## Where it really helps

The gains are concrete in a few scenarios:

- **Content-heavy, interaction-light pages.** Blogs, documentation, catalogs and read-only dashboards. Most of the page is static from the client's point of view, and only small islands need JavaScript.
- **Heavy dependencies that exist only to render.** A Markdown parser or a syntax highlighter can run on the server without costing a single byte of bundle.
- **Data access without a middle layer.** For apps where front end and back end belong to the same team, dropping the internal API removes code and failure points.
- **Secrets stay on the server.** Keys and credentials used in server components are not sent to the browser — as long as you don't pass them as props into a client component.

## Where it gets complicated

The bill shows up elsewhere, and it's better to know it up front:

- **The boundary is an architectural decision.** Everything that crosses from server to client must be serializable. Functions, class instances and dates need care. Deciding where \`"use client"\` goes affects bundle size and what can be imported from where.
- **Caching and invalidation.** Frameworks that implement the model tend to cache data and routes aggressively. Understanding when something revalidates is essential, and the rules can surprise you.
- **Debugging across two environments.** An error can happen on the server, on the client or in the serialization between them. The messages don't always make it clear which.
- **Framework coupling.** In practice, Server Components are used through a framework that implements bundling and routing. That ties your application more tightly to that framework.
- **Libraries that assume a browser.** Many UI libraries rely on context, state or DOM APIs and must live in client components.

### A common mistake

Putting \`"use client"\` at the top of a large component "to make it work" turns the entire tree beneath it into client code. The result is the worst of both worlds: the complexity of the new model with the bundle of the old one. The rule of thumb is to push the client boundary as far down as possible — to the button, not the page.

## When NOT to use them

Server Components aren't mandatory, and there are cases where I wouldn't pick them:

1. **Highly interactive applications** such as editors, drawing tools or real-time dashboards, where nearly everything is client state. The gain is small and the boundary becomes friction.
2. **A front end consuming an existing public API**, owned by another team or also serving mobile apps. The API is still needed; direct database access doesn't apply.
3. **Purely static hosting** with no server available at request time. Part of the model still works at build time, but much of the advantage disappears.
4. **Teams without time to learn the caching rules** of their chosen framework. A simple, well-built SPA beats a poorly understood server app.

## A pragmatic way to adopt

If you decide to try them, a few practices reduce the pain:

- Start with read-heavy pages, where the gain is obvious and the risk is low.
- Keep client components small and at the leaves of the tree.
- Centralize data access in well-named server functions instead of scattering queries across components.
- Read your framework's caching documentation before going to production, not after the first stale-data bug.
- Measure: compare shipped JavaScript and time to interactive before and after.

## In short

- Server Components run only on the server and ship results, not code; client components remain the way to get interactivity.
- They shine on content pages, heavy render-only dependencies and teams that own both front and back end.
- They charge you in serialization boundaries, caching rules and framework coupling.
- Push \`"use client"\` down to the leaves of the tree.
- For highly interactive apps or ones backed by an external API, the classic model is still a fine choice.`,
    },
  },
  {
    key: "postgres",
    cover: "postgres",
    tags: ["databases", "infra"],
    daysAgo: 7,
    pt: {
      slug: "postgres-faz-tudo",
      title: "Postgres faz (quase) tudo",
      excerpt:
        "Filas, busca textual, JSON e vetores: antes de adicionar mais um serviço, olhe para o banco que você já tem — e saiba onde estão os limites.",
      body: `Toda arquitetura começa simples e vai acumulando caixinhas. Um banco relacional, depois um broker de mensagens para filas, um mecanismo de busca para o campo de pesquisa, um banco de documentos para os dados "flexíveis", um banco vetorial para a funcionalidade de IA. Cada caixinha é mais uma coisa para monitorar, versionar, fazer backup, proteger e pagar. Antes de adicionar a próxima, vale uma pergunta incômoda: o Postgres que você já tem não resolveria? Na maioria das vezes, para a escala da maioria dos projetos, a resposta é sim — com ressalvas que vale conhecer.

## Filas com SKIP LOCKED

Uma fila de trabalhos é, no fundo, uma tabela com linhas pendentes e vários trabalhadores querendo pegá-las sem pisar uns nos outros. O Postgres resolve isso com \`FOR UPDATE SKIP LOCKED\`: cada trabalhador trava as linhas que pegou e simplesmente pula as que outro já travou.

~~~sql
CREATE TABLE jobs (
  id          bigserial PRIMARY KEY,
  kind        text        NOT NULL,
  payload     jsonb       NOT NULL,
  run_at      timestamptz NOT NULL DEFAULT now(),
  attempts    int         NOT NULL DEFAULT 0,
  done_at     timestamptz
);
CREATE INDEX jobs_pending ON jobs (run_at) WHERE done_at IS NULL;

-- Cada trabalhador, dentro de uma transação:
WITH next AS (
  SELECT id FROM jobs
  WHERE done_at IS NULL AND run_at <= now()
  ORDER BY run_at
  LIMIT 10
  FOR UPDATE SKIP LOCKED
)
UPDATE jobs SET attempts = attempts + 1
FROM next WHERE jobs.id = next.id
RETURNING jobs.*;
~~~

A grande vantagem não é só ter um serviço a menos. É a transacionalidade: você pode inserir o pedido e o trabalho de "enviar e-mail de confirmação" na mesma transação. Ou os dois acontecem, ou nenhum. Com um broker externo, garantir isso exige padrões extras, como o outbox. Para notificar trabalhadores sem polling constante, \`LISTEN/NOTIFY\` complementa bem.

## Busca textual sem um cluster extra

O Postgres tem busca textual completa embutida: \`tsvector\` para o documento processado, \`tsquery\` para a consulta, dicionários por idioma com stemming e stop words, ranking com \`ts_rank\` e índices GIN para tornar tudo rápido.

~~~sql
ALTER TABLE posts ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(body,  '')), 'B')
  ) STORED;
CREATE INDEX posts_search ON posts USING gin (search);

SELECT id, title, ts_rank(search, q) AS rank
FROM posts, websearch_to_tsquery('portuguese', 'filas postgres') q
WHERE search @@ q
ORDER BY rank DESC
LIMIT 20;
~~~

Para tolerância a erros de digitação, a extensão \`pg_trgm\` adiciona busca por similaridade de trigramas. Para a caixa de busca de um blog, de um painel administrativo ou de um catálogo modesto, isso costuma ser mais do que suficiente.

## JSONB: o melhor dos dois mundos, com moderação

\`jsonb\` armazena documentos em formato binário, permite consultar campos internos, indexar com GIN e combinar tudo isso com colunas relacionais tradicionais na mesma consulta. É excelente para dados realmente variáveis: metadados de integrações, configurações por cliente, payloads de eventos.

O risco é usar \`jsonb\` como desculpa para não modelar. Campos que você filtra, ordena ou junta com frequência merecem ser colunas de verdade, com tipo e restrições. O banco não consegue garantir integridade dentro de um blob que ele não conhece.

## Vetores para busca semântica

Com a extensão pgvector, o Postgres armazena embeddings, calcula distâncias e cria índices aproximados (como HNSW e IVFFlat) para busca por vizinhos mais próximos. Para muitos casos de busca semântica e RAG, isso evita um banco vetorial dedicado — e permite filtrar por permissões, datas ou categorias na mesma consulta SQL, o que costuma ser a parte difícil em sistemas separados.

## Quando NÃO usar o Postgres para tudo

Concentrar tudo num banco também é uma escolha com custos. Eu buscaria uma ferramenta dedicada quando:

1. **O volume de mensagens é muito alto**, com requisitos de streaming, retenção longa e múltiplos consumidores relendo o histórico. Isso é território de logs distribuídos, não de tabelas.
2. **A busca é o produto.** Relevância sofisticada, facetas complexas, sinônimos por domínio e análise linguística avançada justificam um mecanismo de busca especializado.
3. **A carga de trabalhos disputa recursos com a carga transacional.** Uma fila agitada gera muitas atualizações e linhas mortas; o autovacuum precisa acompanhar. Se a fila começar a prejudicar as consultas principais, separe.
4. **Coleções vetoriais enormes** com exigência de latência muito baixa podem pedir sistemas desenhados só para isso.
5. **Times diferentes precisam escalar ou operar partes de forma independente.** Às vezes a separação é organizacional, não técnica.

A palavra-chave é "ainda". Começar no Postgres não impede migrar depois; muitas vezes torna a migração mais fácil, porque você saberá exatamente o que precisa.

## Algumas boas práticas

- Use índices parciais para filas e dados "quentes".
- Monitore inchaço de tabelas e o comportamento do autovacuum em tabelas com muitas atualizações.
- Tenha um pool de conexões; o Postgres não gosta de milhares de conexões diretas.
- Mantenha extensões atualizadas e verifique o suporte delas no seu provedor gerenciado.
- Documente por que cada responsabilidade está no banco — e qual é o sinal para tirá-la de lá.

## Em resumo

- Filas com \`SKIP LOCKED\` ganham transacionalidade de graça.
- Busca textual nativa e \`pg_trgm\` resolvem a maioria das caixas de pesquisa.
- \`jsonb\` é ótimo para dados variáveis, não para fugir da modelagem.
- pgvector cobre muitos casos de busca semântica com filtros em SQL.
- Separe quando volume, especialização ou isolamento de carga justificarem — não antes.`,
    },
    en: {
      slug: "postgres-does-everything",
      title: "Postgres does (almost) everything",
      excerpt:
        "Queues, full-text search, JSON and vectors: before adding another service, look at the database you already have — and know where its limits are.",
      body: `Every architecture starts simple and slowly accumulates boxes. A relational database, then a message broker for queues, a search engine for the search box, a document store for the "flexible" data, a vector database for the AI feature. Each box is one more thing to monitor, version, back up, secure and pay for. Before adding the next one, it's worth asking an uncomfortable question: wouldn't the Postgres you already run handle it? Most of the time, at the scale most projects actually operate, the answer is yes — with caveats worth knowing.

## Queues with SKIP LOCKED

A job queue is, at heart, a table of pending rows and several workers trying to grab them without stepping on each other. Postgres handles this with \`FOR UPDATE SKIP LOCKED\`: each worker locks the rows it took and simply skips the ones somebody else already locked.

~~~sql
CREATE TABLE jobs (
  id          bigserial PRIMARY KEY,
  kind        text        NOT NULL,
  payload     jsonb       NOT NULL,
  run_at      timestamptz NOT NULL DEFAULT now(),
  attempts    int         NOT NULL DEFAULT 0,
  done_at     timestamptz
);
CREATE INDEX jobs_pending ON jobs (run_at) WHERE done_at IS NULL;

-- Each worker, inside a transaction:
WITH next AS (
  SELECT id FROM jobs
  WHERE done_at IS NULL AND run_at <= now()
  ORDER BY run_at
  LIMIT 10
  FOR UPDATE SKIP LOCKED
)
UPDATE jobs SET attempts = attempts + 1
FROM next WHERE jobs.id = next.id
RETURNING jobs.*;
~~~

The big win isn't just one less service. It's transactionality: you can insert the order and the "send confirmation email" job in the same transaction. Either both happen or neither does. With an external broker, guaranteeing that takes extra patterns such as the outbox. To wake workers without constant polling, \`LISTEN/NOTIFY\` complements it nicely.

## Full-text search without another cluster

Postgres ships with full-text search: \`tsvector\` for the processed document, \`tsquery\` for the query, per-language dictionaries with stemming and stop words, ranking via \`ts_rank\`, and GIN indexes to make it all fast.

~~~sql
ALTER TABLE posts ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body,  '')), 'B')
  ) STORED;
CREATE INDEX posts_search ON posts USING gin (search);

SELECT id, title, ts_rank(search, q) AS rank
FROM posts, websearch_to_tsquery('english', 'postgres queues') q
WHERE search @@ q
ORDER BY rank DESC
LIMIT 20;
~~~

For typo tolerance, the \`pg_trgm\` extension adds trigram similarity search. For the search box of a blog, an admin panel or a modest catalog, that's usually more than enough.

## JSONB: the best of both worlds, in moderation

\`jsonb\` stores documents in a binary format, lets you query inner fields, index them with GIN and mix all of that with traditional relational columns in the same query. It's excellent for genuinely variable data: integration metadata, per-customer settings, event payloads.

The risk is using \`jsonb\` as an excuse not to model. Fields you frequently filter, sort or join on deserve to be real columns, with types and constraints. The database can't guarantee integrity inside a blob it knows nothing about.

## Vectors for semantic search

With the pgvector extension, Postgres stores embeddings, computes distances and builds approximate indexes (such as HNSW and IVFFlat) for nearest-neighbor search. For many semantic search and RAG use cases, that avoids a dedicated vector database — and lets you filter by permissions, dates or categories in the same SQL query, which tends to be the hard part when the systems are separate.

## When NOT to use Postgres for everything

Putting everything in one database is a choice with costs, too. I'd reach for a dedicated tool when:

1. **Message volume is very high**, with streaming requirements, long retention and multiple consumers replaying history. That's distributed-log territory, not tables.
2. **Search is the product.** Sophisticated relevance, complex facets, domain-specific synonyms and advanced linguistic analysis justify a specialized search engine.
3. **The job workload competes with the transactional workload.** A busy queue generates lots of updates and dead rows; autovacuum has to keep up. If the queue starts hurting your main queries, split it out.
4. **Huge vector collections** with very tight latency requirements may call for systems built only for that.
5. **Different teams need to scale or operate parts independently.** Sometimes the split is organizational, not technical.

The key word is "yet". Starting in Postgres doesn't stop you from migrating later; it often makes the migration easier, because by then you'll know exactly what you need.

## A few good practices

- Use partial indexes for queues and "hot" data.
- Watch table bloat and autovacuum behavior on update-heavy tables.
- Run a connection pooler; Postgres doesn't enjoy thousands of direct connections.
- Keep extensions up to date and check that your managed provider supports them.
- Write down why each responsibility lives in the database — and what signal means it's time to move it out.

## In short

- Queues built on \`SKIP LOCKED\` get transactionality for free.
- Native full-text search plus \`pg_trgm\` covers most search boxes.
- \`jsonb\` is great for variable data, not for dodging data modeling.
- pgvector handles many semantic search cases with filtering in plain SQL.
- Split things out when volume, specialization or workload isolation demand it — not before.`,
    },
  },
  {
    key: "edge",
    cover: "edge",
    tags: ["infra", "web"],
    daysAgo: 10,
    pt: {
      slug: "a-borda-da-rede",
      title: "Computação na borda: perto de quem usa",
      excerpt:
        "Rodar código a poucos quilômetros do usuário reduz latência — mas traz novas perguntas sobre dados, consistência e custo. Um guia para decidir o que vai para a borda.",
      body: `Existe um limite que nenhuma otimização de código consegue vencer: a velocidade da luz. Um pacote que atravessa um oceano até um data center e volta leva um tempo mínimo que nenhum framework, cache de aplicação ou linguagem mais rápida elimina. A computação na borda parte de uma ideia simples: se não dá para tornar a viagem mais rápida, encurte a viagem. Em vez de rodar o código num único lugar, rode-o em muitos pontos de presença espalhados pelo mundo, perto de quem faz a requisição. A ideia é poderosa, mas a borda não é uma versão mais rápida do servidor tradicional — é um ambiente diferente, com regras próprias.

## O que é a borda, na prática

As redes de distribuição de conteúdo (CDNs) já colocavam arquivos estáticos perto dos usuários há muito tempo. A novidade das plataformas de borda é permitir rodar código nesses mesmos pontos: funções que recebem uma requisição, fazem alguma lógica e devolvem uma resposta, sem passar pela origem.

Essas funções costumam rodar em runtimes leves, frequentemente baseados em isolates de motores JavaScript ou em WebAssembly, em vez de contêineres ou máquinas virtuais completas. Isso traz inicialização muito rápida e alta densidade, mas também restrições: APIs de sistema limitadas, tempo de CPU por requisição limitado, memória reduzida e, muitas vezes, compatibilidade parcial com bibliotecas que assumem um ambiente Node.js completo.

~~~ts
// Uma função de borda típica, no estilo das APIs Web padrão
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const country = request.headers.get("x-country") ?? "BR";

    if (url.pathname === "/") {
      const lang = country === "BR" || country === "PT" ? "pt" : "en";
      return Response.redirect(new URL("/" + lang, url), 302);
    }
    return fetch(request); // segue para a origem
  },
};
~~~

O cabeçalho de país é ilustrativo — cada plataforma expõe a geolocalização de um jeito. O ponto é o formato: \`Request\` entra, \`Response\` sai, usando APIs Web padrão.

## O problema dos dados

Aqui está a questão central que o marketing costuma pular: o código pode estar perto do usuário, mas os dados geralmente não estão. Se sua função de borda em São Paulo precisa consultar um banco que mora em outro continente, você trocou uma viagem longa por... uma viagem longa, agora iniciada de outro lugar. Pior: se a função faz várias consultas em sequência, cada uma paga a distância inteira. Nesse cenário, a borda pode deixar a aplicação mais lenta do que um servidor colocado ao lado do banco.

Existem algumas saídas, cada uma com seu custo:

- **Cache na borda.** Respostas que podem ficar um pouco desatualizadas são servidas do ponto mais próximo. Excelente para conteúdo público; exige uma estratégia clara de invalidação.
- **Réplicas de leitura distribuídas.** Leituras locais, escritas na região primária. Funciona bem para cargas de muita leitura, mas você passa a conviver com atraso de replicação.
- **Armazenamentos chave-valor globais.** Rápidos para ler em qualquer lugar, geralmente com consistência eventual. Bons para configurações, flags e sessões; ruins para saldo bancário.
- **Bancos distribuídos com consenso.** Oferecem consistência forte em várias regiões, mas cada escrita coordenada paga latência entre regiões.

> Não existe almoço grátis entre latência e consistência. Toda arquitetura de borda é, no fundo, uma decisão sobre quanto de desatualização você tolera e onde.

## Onde a borda brilha

Há usos em que a borda é claramente a ferramenta certa:

- **Redirecionamentos e reescritas** baseados em idioma, país, dispositivo ou testes A/B.
- **Autenticação leve**: validar um token assinado e rejeitar requisições inválidas antes que cheguem à origem.
- **Cabeçalhos e segurança**: aplicar políticas de segurança, CORS e limites de taxa simples.
- **Personalização de conteúdo cacheado**: montar uma página majoritariamente estática com pequenos trechos dinâmicos.
- **Transformação de imagens e respostas** perto do usuário.

O padrão comum: lógica rápida, que depende pouco ou nada de dados centralizados, ou que trabalha com dados que toleram ficar ligeiramente velhos.

## Quando NÃO ir para a borda

Na minha avaliação, a borda costuma ser a escolha errada quando:

1. **A lógica conversa muito com um banco central.** Mantenha esse código perto dos dados; uma região bem escolhida resolve a maioria dos públicos.
2. **Você depende de bibliotecas nativas ou APIs completas do Node.js.** A compatibilidade dos runtimes de borda melhora, mas ainda é parcial.
3. **O processamento é pesado.** Tarefas longas de CPU esbarram nos limites de execução e custam caro.
4. **A observabilidade importa mais do que alguns milissegundos.** Depurar algo que roda em dezenas de locais é mais difícil do que olhar logs de uma região.
5. **Seu público está concentrado numa região.** Se quase todos os usuários estão no mesmo país, um servidor bem posicionado já está "na borda" para eles.

## Uma arquitetura sensata

O desenho que vejo funcionar melhor é híbrido. A borda cuida do que é barato e local: cache, roteamento, autenticação superficial, cabeçalhos. A origem, colocada perto do banco, cuida do que envolve dados e regras de negócio. A fronteira entre as duas é explícita e simples.

Antes de mover qualquer coisa, meça. Descubra onde estão seus usuários, quanto tempo leva cada etapa da requisição e quantas idas ao banco cada página faz. Muitas vezes, reduzir de dez consultas para duas ganha mais do que mover o código para mais perto.

## Em resumo

- A borda encurta a distância entre o usuário e o código, mas não entre o código e os dados.
- Runtimes de borda são leves e rápidos, com limites de API, CPU e compatibilidade.
- Cache, réplicas e armazenamentos globais trocam consistência por latência — escolha conscientemente.
- Use a borda para roteamento, autenticação leve, cabeçalhos e conteúdo cacheável.
- Lógica muito dependente de dados centrais fica melhor numa região perto do banco.`,
    },
    en: {
      slug: "the-edge-of-the-network",
      title: "Edge computing: close to the user",
      excerpt:
        "Running code a few miles from the user cuts latency — but raises new questions about data, consistency and cost. A guide to deciding what belongs at the edge.",
      body: `There's a limit no code optimization can beat: the speed of light. A packet that crosses an ocean to a data center and back takes a minimum amount of time that no framework, application cache or faster language can remove. Edge computing starts from a simple idea: if you can't make the trip faster, make the trip shorter. Instead of running code in a single place, run it in many points of presence around the world, close to whoever is making the request. The idea is powerful, but the edge isn't a faster version of the traditional server — it's a different environment with rules of its own.

## What the edge is, in practice

Content delivery networks (CDNs) have long placed static files close to users. What edge platforms add is the ability to run code at those same locations: functions that receive a request, apply some logic and return a response without going back to the origin.

These functions usually run on lightweight runtimes, often built on JavaScript engine isolates or WebAssembly rather than full containers or virtual machines. That brings very fast startup and high density, but also constraints: limited system APIs, capped CPU time per request, less memory and, frequently, only partial compatibility with libraries that assume a full Node.js environment.

~~~ts
// A typical edge function, written against standard Web APIs
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const country = request.headers.get("x-country") ?? "US";

    if (url.pathname === "/") {
      const lang = country === "BR" || country === "PT" ? "pt" : "en";
      return Response.redirect(new URL("/" + lang, url), 302);
    }
    return fetch(request); // pass through to the origin
  },
};
~~~

The country header is illustrative — each platform exposes geolocation its own way. The point is the shape: a \`Request\` comes in, a \`Response\` goes out, using standard Web APIs.

## The data problem

Here is the central question that marketing tends to skip: the code may be close to the user, but the data usually isn't. If your edge function in São Paulo has to query a database living on another continent, you've traded a long trip for... a long trip, now starting from somewhere else. Worse, if the function makes several queries in sequence, each one pays the full distance. In that scenario, the edge can make the application slower than a server sitting right next to the database.

There are a few ways out, each with a cost:

- **Edge caching.** Responses that can be slightly stale are served from the nearest location. Excellent for public content; it demands a clear invalidation strategy.
- **Distributed read replicas.** Reads are local, writes go to the primary region. Works well for read-heavy loads, but you now live with replication lag.
- **Global key-value stores.** Fast to read anywhere, usually eventually consistent. Good for config, flags and sessions; bad for bank balances.
- **Consensus-based distributed databases.** They offer strong consistency across regions, but every coordinated write pays cross-region latency.

> There's no free lunch between latency and consistency. Every edge architecture is, at bottom, a decision about how much staleness you tolerate, and where.

## Where the edge shines

There are uses where the edge is clearly the right tool:

- **Redirects and rewrites** based on language, country, device or A/B tests.
- **Lightweight authentication**: validate a signed token and reject bad requests before they reach the origin.
- **Headers and security**: apply security policies, CORS and simple rate limits.
- **Personalizing cached content**: assemble a mostly static page with small dynamic fragments.
- **Image and response transformation** close to the user.

The common pattern: fast logic that depends little or not at all on centralized data, or that works with data that can tolerate being slightly old.

## When NOT to go to the edge

In my assessment, the edge tends to be the wrong choice when:

1. **The logic talks a lot to a central database.** Keep that code close to the data; one well-chosen region serves most audiences fine.
2. **You depend on native libraries or the full Node.js API.** Edge runtime compatibility keeps improving, but it's still partial.
3. **The work is CPU-heavy.** Long-running tasks hit execution limits and get expensive.
4. **Observability matters more than a few milliseconds.** Debugging something that runs in dozens of locations is harder than reading logs from one region.
5. **Your audience is concentrated in one region.** If nearly all your users are in the same country, a well-placed server is already "at the edge" for them.

## A sensible architecture

The design I see working best is hybrid. The edge handles what is cheap and local: caching, routing, shallow authentication, headers. The origin, placed near the database, handles anything involving data and business rules. The boundary between the two is explicit and simple.

Before moving anything, measure. Find out where your users are, how long each stage of a request takes and how many database round trips each page makes. Often, cutting ten queries down to two buys more than moving the code closer.

## In short

- The edge shortens the distance between user and code, not between code and data.
- Edge runtimes are light and fast, with limits on APIs, CPU and compatibility.
- Caches, replicas and global stores trade consistency for latency — choose deliberately.
- Use the edge for routing, lightweight auth, headers and cacheable content.
- Logic that leans heavily on central data belongs in a region next to the database.`,
    },
  },
  {
    key: "opensource",
    cover: "opensource",
    tags: ["culture", "security"],
    daysAgo: 14,
    pt: {
      slug: "quem-sustenta-o-open-source",
      title: "Quem sustenta o open source?",
      excerpt:
        "Bibliotecas usadas por milhões são mantidas por poucos, muitas vezes de graça. Um retrato da infraestrutura invisível — e do que cada um de nós pode fazer por ela.",
      body: `Abra o arquivo de dependências de qualquer projeto moderno e conte. Depois conte as dependências das dependências. Em pouco tempo você terá centenas, às vezes milhares, de pacotes escritos por pessoas que você nunca viu, mantidos em horários que você não paga, sob licenças que dizem, em letras maiúsculas, que o software é fornecido "como está", sem garantia. Essa é a fundação sobre a qual quase toda a indústria de software está construída. E a pergunta sobre quem a sustenta tem uma resposta desconfortável: muitas vezes, quase ninguém.

## A pirâmide invertida

O formato típico do ecossistema é uma pirâmide de cabeça para baixo. No topo, milhares de empresas e milhões de aplicações. Na ponta de baixo, apoiando tudo, um pacote de compressão, um parser, uma biblioteca de datas ou de criptografia mantida por uma ou duas pessoas, frequentemente no tempo livre.

Isso não é um problema hipotético. Ao longo dos anos, a comunidade viu repetidamente falhas graves de segurança aparecerem em componentes amplamente usados e pouco financiados, e viu também casos de mantenedores sobrecarregados entregarem o controle de um pacote a alguém que depois se revelou mal-intencionado. A lição não é que open source é inseguro — código fechado também tem falhas graves. A lição é que software crítico sem gente suficiente cuidando dele é um risco, independentemente da licença.

## O que um mantenedor realmente faz

Quem nunca manteve um projeto popular tende a imaginar que o trabalho é escrever código. Escrever código é a parte boa. O resto inclui:

- triar issues, muitas delas duplicadas, vagas ou pedidos de suporte disfarçados;
- revisar pull requests de qualidade variável, explicando com paciência por que não podem entrar;
- responder a relatos de segurança, muitas vezes sob prazo e em sigilo;
- manter compatibilidade com versões antigas de linguagens, sistemas e outras dependências;
- cuidar de CI, publicação de versões, documentação e notas de lançamento;
- lidar com cobranças, às vezes agressivas, de usuários que nunca contribuíram.

Esse trabalho é invisível quando bem feito. Só aparece quando falha.

## Os modelos de financiamento

Não existe uma solução única, mas há modelos que funcionam em graus diferentes:

1. **Patrocínio direto.** Plataformas de doação recorrente permitem que indivíduos e empresas paguem mantenedores. Ajuda, mas raramente chega a um salário para a maioria dos projetos.
2. **Emprego.** Empresas contratam mantenedores para trabalhar no projeto como parte do trabalho. É o modelo mais estável, mas cria dependência de uma única empresa.
3. **Fundações.** Organizações sem fins lucrativos hospedam projetos, cuidam de questões legais, marcas e, às vezes, financiam trabalho. Dão governança e continuidade.
4. **Open core e serviços.** O núcleo é aberto; recursos empresariais, hospedagem ou suporte são pagos. Sustenta muitos projetos, com tensões sobre o que fica de fora do núcleo.
5. **Mudanças de licença.** Alguns projetos migraram para licenças mais restritivas para impedir que terceiros lucrem sem contribuir. É uma decisão legítima, mas que costuma dividir a comunidade e gerar forks.

## O que você pode fazer, concretamente

A boa notícia é que dá para ajudar sem ser um grande patrocinador. Algumas ações práticas, da mais barata à mais cara:

- **Saiba o que você usa.** Gere uma lista das dependências do seu projeto e identifique quais são críticas e quem as mantém.
- **Relate bem.** Uma issue com passos de reprodução, versão e um exemplo mínimo economiza horas de quem mantém.
- **Contribua com o que é chato.** Documentação, testes, triagem de issues e revisão de PRs valem tanto quanto código novo.
- **Peça para a empresa pagar.** Um pequeno orçamento anual distribuído entre as dependências críticas custa menos do que um dia de incidente.
- **Dê tempo de trabalho.** Permitir que engenheiros contribuam com projetos dos quais a empresa depende é investimento em infraestrutura.

~~~bash
# Um começo honesto: quantas dependências você realmente tem?
npm ls --all --parseable | wc -l

# E quais pedem financiamento explicitamente
npm fund
~~~

Os comandos acima são do ecossistema npm, mas praticamente todo gerenciador de pacotes tem algo equivalente para listar a árvore completa.

## Quando NÃO adicionar uma dependência

Sustentar o ecossistema também passa por ser mais criterioso com o que puxamos para dentro. Antes de adicionar um pacote, vale perguntar:

1. **Dá para resolver com a biblioteca padrão ou com algumas linhas?** Cada dependência é código de terceiros rodando com as permissões do seu projeto.
2. **O projeto parece mantido?** Lançamentos recentes, issues respondidas e mais de um mantenedor ativo são bons sinais.
3. **Quantas dependências transitivas ele traz?** Um pacote pequeno que puxa cinquenta outros é um pacote grande.
4. **Se ele for abandonado amanhã, você consegue assumir ou substituir?**

Isso não é um argumento contra dependências — reinventar criptografia ou parsing é pior. É um argumento a favor de escolher com intenção.

## Em resumo

- Boa parte da infraestrutura de software depende de projetos mantidos por poucas pessoas.
- O trabalho de manutenção vai muito além de código: triagem, segurança, compatibilidade e paciência.
- Patrocínio, emprego, fundações e open core sustentam projetos de formas diferentes, nenhuma perfeita.
- Relatar bem, contribuir com o "chato" e fazer a empresa pagar são ações ao alcance de qualquer time.
- Seja criterioso ao adicionar dependências: cada uma é uma relação de confiança.`,
    },
    en: {
      slug: "who-sustains-open-source",
      title: "Who sustains open source?",
      excerpt:
        "Libraries used by millions are maintained by a handful of people, often for free. A portrait of invisible infrastructure — and what each of us can do about it.",
      body: `Open the dependency file of any modern project and start counting. Then count the dependencies of those dependencies. Before long you'll have hundreds, sometimes thousands, of packages written by people you've never met, maintained in hours you don't pay for, under licenses that state, in capital letters, that the software is provided "as is", without warranty. That is the foundation almost the entire software industry is built on. And the question of who sustains it has an uncomfortable answer: often, almost nobody.

## The inverted pyramid

The typical shape of the ecosystem is an upside-down pyramid. At the top, thousands of companies and millions of applications. At the narrow bottom, holding everything up, a compression package, a parser, a date or cryptography library maintained by one or two people, frequently in their spare time.

This isn't a hypothetical problem. Over the years, the community has repeatedly watched serious security flaws surface in widely used, poorly funded components, and has also seen overwhelmed maintainers hand control of a package to someone who later turned out to be malicious. The lesson isn't that open source is insecure — closed-source software has serious flaws too. The lesson is that critical software without enough people looking after it is a risk, whatever the license.

## What a maintainer actually does

People who have never maintained a popular project tend to imagine the job is writing code. Writing code is the fun part. The rest includes:

- triaging issues, many of them duplicates, vague, or support requests in disguise;
- reviewing pull requests of varying quality, patiently explaining why they can't be merged;
- handling security reports, often under deadline and in confidence;
- keeping compatibility with older versions of languages, systems and other dependencies;
- looking after CI, releases, documentation and changelogs;
- dealing with demands, sometimes aggressive ones, from users who have never contributed.

This work is invisible when done well. It only shows when it fails.

## Funding models

There's no single fix, but there are models that work to different degrees:

1. **Direct sponsorship.** Recurring donation platforms let individuals and companies pay maintainers. It helps, but for most projects it rarely adds up to a salary.
2. **Employment.** Companies hire maintainers to work on the project as part of their job. It's the most stable model, but it creates dependence on a single company.
3. **Foundations.** Non-profits host projects, handle legal matters and trademarks and sometimes fund work. They provide governance and continuity.
4. **Open core and services.** The core is open; enterprise features, hosting or support are paid. It sustains many projects, with ongoing tension over what stays out of the core.
5. **License changes.** Some projects have moved to more restrictive licenses to stop third parties from profiting without contributing. It's a legitimate decision, but it tends to split the community and spawn forks.

## What you can actually do

The good news is that you can help without being a big sponsor. A few practical actions, from cheapest to most expensive:

- **Know what you use.** Generate a list of your project's dependencies and identify which are critical and who maintains them.
- **Report well.** An issue with reproduction steps, a version and a minimal example saves the maintainer hours.
- **Contribute the boring stuff.** Documentation, tests, issue triage and PR review are worth as much as new code.
- **Ask your company to pay.** A small yearly budget spread across critical dependencies costs less than a single day of incident response.
- **Give work time.** Letting engineers contribute to projects the company depends on is an investment in infrastructure.

~~~bash
# An honest start: how many dependencies do you really have?
npm ls --all --parseable | wc -l

# And which ones explicitly ask for funding
npm fund
~~~

Those commands are from the npm ecosystem, but practically every package manager has an equivalent way to list the full tree.

## When NOT to add a dependency

Sustaining the ecosystem also means being more deliberate about what we pull in. Before adding a package, ask:

1. **Can the standard library or a few lines handle it?** Every dependency is third-party code running with your project's permissions.
2. **Does the project look maintained?** Recent releases, answered issues and more than one active maintainer are good signs.
3. **How many transitive dependencies does it bring?** A small package that drags in fifty others is a big package.
4. **If it's abandoned tomorrow, could you take it over or replace it?**

This isn't an argument against dependencies — reinventing cryptography or parsing is worse. It's an argument for choosing with intent.

## In short

- Much of our software infrastructure rests on projects maintained by very few people.
- Maintenance goes far beyond code: triage, security, compatibility and patience.
- Sponsorship, employment, foundations and open core sustain projects in different ways, none perfect.
- Reporting well, contributing the "boring" work and getting your company to pay are within reach of any team.
- Be deliberate when adding dependencies: each one is a relationship of trust.`,
    },
  },
  {
    key: "keyboard",
    cover: "keyboard",
    tags: ["culture"],
    daysAgo: 18,
    pt: {
      slug: "a-ferramenta-certa",
      title: "Em defesa da ferramenta que você gosta",
      excerpt:
        "Teclado, editor, tema de cores: detalhes que parecem fúteis, mas definem horas do seu dia. Por que vale cuidar deles — e quando isso vira distração.",
      body: `Existe um tipo de conversa entre programadores que parece não ter fim: qual editor é melhor, qual layout de teclado, qual fonte, tema claro ou escuro, abas ou espaços. Quem está de fora acha tudo isso uma perda de tempo, e muitas vezes é. Mas por trás das discussões há uma verdade simples que vale defender: passamos milhares de horas por ano com as mesmas ferramentas, e o atrito pequeno, repetido milhares de vezes, deixa de ser pequeno. Cuidar das suas ferramentas não é vaidade. É ergonomia, foco e, no fim, respeito pelo próprio trabalho.

## O custo do atrito invisível

Pense numa ação que você faz dezenas de vezes por dia: abrir um arquivo pelo nome, pular para a definição de uma função, rodar o teste do arquivo atual, alternar entre o terminal e o editor. Se cada uma dessas ações leva alguns segundos a mais do que precisaria, ou exige tirar a mão do teclado e procurar algo com o mouse, o custo não é só o tempo somado. É a interrupção do raciocínio.

Programar exige manter muita coisa na cabeça ao mesmo tempo. Cada pequena fricção na ferramenta compete por essa atenção. Quando a ferramenta some — quando você pensa "quero ir para aquela função" e já está lá —, sobra mais espaço mental para o problema de verdade. É por isso que pessoas experientes investem em atalhos, snippets e automações: não para parecer rápidas, mas para pensar sem interrupções.

## O editor: domínio vale mais que escolha

O melhor editor é, quase sempre, aquele que você domina. Editores modernos, sejam IDEs completas, editores extensíveis ou editores modais no terminal, convergiram muito graças a protocolos comuns de linguagem: autocompletar, ir para definição, renomear símbolo e diagnósticos funcionam de forma parecida em todos eles.

O que diferencia é o quanto você conhece a sua ferramenta. Algumas perguntas úteis:

- Você abre arquivos pelo nome sem usar a árvore de diretórios?
- Consegue buscar e substituir em todo o projeto, com expressões regulares, sem medo?
- Tem atalhos para rodar o teste mais próximo e ver o resultado sem mudar de janela?
- Sabe editar várias linhas ou ocorrências ao mesmo tempo?
- Suas configurações estão versionadas, para recriar o ambiente numa máquina nova em minutos?

Se a resposta para várias for "não", talvez o ganho não esteja em trocar de editor, mas em aprender melhor o atual.

## Configuração como código

Uma prática que recomendo sem reservas é manter suas configurações num repositório: os famosos dotfiles. Editor, terminal, shell, git. Além de permitir recriar o ambiente rapidamente, versionar obriga a entender o que cada linha faz — e torna fácil desfazer uma experiência que não deu certo.

~~~bash
# ~/.gitconfig ou via linha de comando: pequenos ajustes de alto retorno
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global init.defaultBranch main
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate -20"
~~~

Cinco linhas, e várias ações diárias ficam mais curtas e menos propensas a erro. O mesmo raciocínio vale para o editor: um arquivo de configuração enxuto, que você entende, é melhor do que uma distribuição gigante copiada de alguém.

## O corpo também é uma ferramenta

Teclado, cadeira, monitor e iluminação não são caprichos. Lesões por esforço repetitivo são reais e podem afastar alguém do trabalho por longos períodos. Não sou profissional de saúde, então o conselho é genérico e vale procurar orientação especializada se houver dor. Mas alguns cuidados são consenso:

- teclado e mouse numa altura que mantenha os punhos neutros;
- monitor na altura dos olhos, a uma distância confortável;
- pausas regulares para levantar, alongar e descansar a vista;
- prestar atenção a formigamentos e dores persistentes em vez de ignorá-los.

Teclados mecânicos, layouts alternativos e teclados divididos podem ajudar algumas pessoas. Também podem virar um hobby caro. As duas coisas são legítimas, desde que você saiba qual delas está fazendo.

## Quando NÃO otimizar

Toda essa defesa tem um limite claro, e é importante nomeá-lo. Ajustar ferramentas pode virar uma forma sofisticada de procrastinação. Alguns sinais de alerta:

1. **Você passa mais tempo configurando do que usando.** Se o fim de semana inteiro foi gasto no arquivo de configuração do editor, algo está fora de proporção.
2. **Você troca de ferramenta a cada poucas semanas.** Domínio exige tempo. Trocar sempre significa ser eternamente iniciante.
3. **Você impõe suas preferências ao time.** Gosto pessoal é pessoal. O que é compartilhado — formatação, lint, convenções — deve ser decidido pelo time e automatizado, não discutido em cada revisão.
4. **A otimização é para uma ação rara.** Automatizar algo que você faz duas vezes por ano raramente compensa.

Uma regra prática: otimize o que dói repetidamente. Se algo te irritou três vezes na mesma semana, vale investir quinze minutos em resolver. Se não, deixe para lá.

## Em resumo

- Atrito pequeno repetido milhares de vezes custa tempo e, principalmente, atenção.
- Dominar o editor que você já usa costuma valer mais do que trocar de editor.
- Versione suas configurações e entenda cada linha delas.
- Cuide do corpo: ergonomia não é luxo, e dor persistente merece atenção profissional.
- Otimize o que dói repetidamente; o resto é hobby — e tudo bem, desde que você saiba disso.`,
    },
    en: {
      slug: "the-right-tool",
      title: "In defense of the tool you love",
      excerpt:
        "Keyboard, editor, color theme: details that seem trivial but shape hours of your day. Why they're worth caring about — and when that turns into a distraction.",
      body: `There's a kind of conversation among programmers that never seems to end: which editor is best, which keyboard layout, which font, light theme or dark, tabs or spaces. From the outside it all looks like a waste of time, and often it is. But underneath the arguments lies a simple truth worth defending: we spend thousands of hours a year with the same tools, and a small friction, repeated thousands of times, stops being small. Caring for your tools isn't vanity. It's ergonomics, focus and, ultimately, respect for your own work.

## The cost of invisible friction

Think of something you do dozens of times a day: open a file by name, jump to a function's definition, run the test for the current file, switch between terminal and editor. If each of those takes a few seconds longer than it should, or forces you to leave the keyboard and hunt for something with the mouse, the cost isn't just the summed time. It's the interruption to your train of thought.

Programming means holding a lot in your head at once. Every small friction in the tool competes for that attention. When the tool disappears — when you think "I want to go to that function" and you're already there — more mental room is left for the actual problem. That's why experienced people invest in shortcuts, snippets and automation: not to look fast, but to think without interruptions.

## The editor: mastery beats choice

The best editor is almost always the one you've mastered. Modern editors, whether full IDEs, extensible editors or modal editors in the terminal, have converged a great deal thanks to shared language protocols: completion, go-to-definition, rename symbol and diagnostics work in much the same way across all of them.

What sets them apart is how well you know yours. A few useful questions:

- Do you open files by name without touching the file tree?
- Can you search and replace across the whole project, with regular expressions, without fear?
- Do you have a shortcut to run the nearest test and see the result without switching windows?
- Can you edit several lines or occurrences at once?
- Is your configuration in version control, so you can rebuild your setup on a new machine in minutes?

If the answer to several of those is "no", the gain may not lie in switching editors but in learning your current one better.

## Configuration as code

One practice I recommend without reservation is keeping your configuration in a repository: the famous dotfiles. Editor, terminal, shell, git. Besides letting you rebuild your environment quickly, versioning forces you to understand what each line does — and makes it easy to undo an experiment that didn't work out.

~~~bash
# ~/.gitconfig, or straight from the command line: small, high-return tweaks
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global init.defaultBranch main
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate -20"
~~~

Five lines, and several daily actions get shorter and less error-prone. The same reasoning applies to your editor: a lean config file that you understand beats a giant distribution copied from somebody else.

## Your body is a tool too

Keyboard, chair, monitor and lighting aren't whims. Repetitive strain injuries are real and can keep someone away from work for long stretches. I'm not a health professional, so this advice is generic, and it's worth seeing a specialist if something hurts. But a few precautions are widely agreed on:

- keyboard and mouse at a height that keeps your wrists neutral;
- monitor at eye level, at a comfortable distance;
- regular breaks to stand up, stretch and rest your eyes;
- paying attention to tingling and persistent pain instead of ignoring it.

Mechanical keyboards, alternative layouts and split keyboards can help some people. They can also become an expensive hobby. Both are legitimate, as long as you know which one you're doing.

## When NOT to optimize

All this has a clear limit, and it's important to name it. Tweaking tools can become a sophisticated form of procrastination. Some warning signs:

1. **You spend more time configuring than using.** If an entire weekend went into your editor config, something is out of proportion.
2. **You switch tools every few weeks.** Mastery takes time. Always switching means being a perpetual beginner.
3. **You impose your preferences on the team.** Personal taste is personal. What's shared — formatting, linting, conventions — should be decided by the team and automated, not argued in every review.
4. **The optimization targets a rare action.** Automating something you do twice a year rarely pays off.

A rule of thumb: optimize what hurts repeatedly. If something annoyed you three times in the same week, it's worth fifteen minutes to fix. If not, let it go.

## In short

- Small friction repeated thousands of times costs time and, above all, attention.
- Mastering the editor you already use is usually worth more than switching.
- Version your configuration and understand every line of it.
- Look after your body: ergonomics isn't a luxury, and persistent pain deserves professional attention.
- Optimize what hurts repeatedly; the rest is a hobby — which is fine, as long as you know it.`,
    },
  },
  {
    key: "terminal",
    cover: "terminal",
    tags: ["infra", "culture"],
    daysAgo: 23,
    pt: {
      slug: "o-terminal-nunca-morreu",
      title: "O terminal nunca morreu",
      excerpt:
        "Interfaces gráficas vêm e vão; a linha de comando continua sendo a forma mais direta de conversar com a máquina. Por que ela resiste, e como tirar mais dela.",
      body: `De tempos em tempos, alguém anuncia o fim da linha de comando. Interfaces gráficas mais bonitas, painéis web, assistentes que entendem linguagem natural: cada onda promete aposentar aquela tela preta com um cursor piscando. E, a cada onda, o terminal continua lá, no centro do trabalho de quem constrói e opera software. Não por nostalgia, mas porque ele resolve um problema que interfaces gráficas raramente resolvem tão bem: compor operações pequenas em operações grandes, de forma repetível, registrável e automatizável.

## A filosofia que envelheceu bem

A tradição Unix deixou uma ideia simples e duradoura: programas pequenos que fazem uma coisa bem, que leem texto da entrada padrão e escrevem texto na saída padrão. Com o pipe, a saída de um vira a entrada do outro. O resultado é uma linguagem de composição em que você monta, na hora, ferramentas que ninguém precisou prever.

~~~bash
# Os 10 endereços IP que mais fizeram requisições com erro 5xx
awk '$9 ~ /^5/ { print $1 }' access.log \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -10
~~~

Nenhum desses programas sabe nada sobre logs de servidor web. Juntos, respondem a uma pergunta específica em segundos. Se amanhã a pergunta mudar, você muda uma peça do encadeamento. Uma interface gráfica precisaria ter previsto exatamente esse relatório.

## Por que ele resiste

Há razões práticas para a longevidade do terminal, que vão além do gosto pessoal:

- **Repetibilidade.** Um comando pode ser copiado, colado, salvo no histórico, colocado num script e executado de novo, exatamente igual. Uma sequência de cliques não.
- **Automação.** Tudo o que roda no terminal pode rodar num pipeline de CI, num cron, num contêiner. A distância entre "fiz na mão" e "automatizei" é mínima.
- **Acesso remoto.** Servidores raramente têm interface gráfica. Uma conexão SSH funciona em redes lentas e consome quase nada.
- **Documentação executável.** Um README com os comandos para rodar o projeto é instrução e ferramenta ao mesmo tempo.
- **Ferramentas de desenvolvimento.** Compiladores, gerenciadores de pacotes, controle de versão e ferramentas de nuvem são, primeiro, programas de linha de comando. Interfaces gráficas costumam ser camadas por cima.

Curiosamente, os agentes de IA reforçaram isso. Eles operam muito bem no terminal justamente porque texto entra e texto sai, e o resultado de cada comando é observável.

## Ferramentas modernas, mesma ideia

O terminal não parou no tempo. Uma geração de ferramentas manteve a filosofia e melhorou a ergonomia. Alguns exemplos amplamente usados:

- \`rg\` (ripgrep) para buscar texto em projetos inteiros, respeitando o \`.gitignore\` e muito rápido;
- \`fd\` como alternativa mais amigável ao \`find\`;
- \`fzf\` para busca difusa interativa, que se integra ao histórico, a arquivos e a praticamente qualquer lista;
- \`jq\` para filtrar e transformar JSON, essencial na era das APIs;
- \`bat\` para ler arquivos com realce de sintaxe.

~~~bash
# Encontrar e abrir um arquivo com busca difusa
vim "$(fd --type f | fzf)"

# Extrair nomes de um JSON de API
curl -s https://api.example.com/users | jq -r '.[].name'
~~~

Nenhuma delas exige abandonar o que você já sabe. Elas se encaixam nos mesmos pipes.

## Scripts: o terminal com memória

O passo natural depois de repetir um comando três vezes é transformá-lo num script. Alguns hábitos tornam scripts de shell muito mais confiáveis:

~~~bash
#!/usr/bin/env bash
set -euo pipefail   # falha cedo: erro, variável indefinida ou falha no pipe

backup_dir="backups/$(date +%Y-%m-%d)"
mkdir -p "$backup_dir"
pg_dump --format=custom "$DATABASE_URL" > "$backup_dir/db.dump"
echo "Backup salvo em $backup_dir"
~~~

Use aspas em variáveis, prefira \`set -euo pipefail\`, e rode uma ferramenta como o ShellCheck para pegar armadilhas comuns. E, acima de tudo, reconheça o momento de parar.

## Quando NÃO usar o terminal

Defender o terminal não é dizer que ele serve para tudo. Eu escolheria outra ferramenta quando:

1. **O script de shell cresceu demais.** Passou de cem linhas, ganhou estruturas de dados, tratamento de erro complexo ou lógica de negócio? Reescreva numa linguagem de verdade, como Python, Go ou TypeScript.
2. **A tarefa é visual por natureza.** Revisar um diff grande com contexto, explorar um perfil de desempenho, ajustar um layout: uma boa interface gráfica ganha.
3. **A operação é destrutiva e rara.** Um comando digitado errado em produção pode ser catastrófico. Para operações perigosas e pouco frequentes, uma interface com confirmação e revisão pode ser mais segura.
4. **Outras pessoas precisam usar e não conhecem a linha de comando.** Uma ferramenta interna com interface simples pode valer mais do que um script brilhante que só você roda.

## Em resumo

- A composição de programas pequenos via pipes continua sendo uma das ideias mais poderosas da computação.
- O terminal resiste por repetibilidade, automação, acesso remoto e por ser a interface nativa das ferramentas de desenvolvimento.
- Ferramentas modernas como \`rg\`, \`fd\`, \`fzf\` e \`jq\` melhoram a ergonomia sem mudar a filosofia.
- Scripts com \`set -euo pipefail\`, aspas e ShellCheck são muito mais confiáveis.
- Quando o script vira programa, ou a tarefa é visual, escolha a ferramenta adequada.`,
    },
    en: {
      slug: "the-terminal-never-died",
      title: "The terminal never died",
      excerpt:
        "GUIs come and go; the command line remains the most direct way to talk to the machine. Why it endures, and how to get more out of it.",
      body: `Every so often, someone announces the end of the command line. Prettier graphical interfaces, web dashboards, assistants that understand natural language: each wave promises to retire that black screen with a blinking cursor. And with each wave, the terminal is still there, at the center of the work of people who build and operate software. Not out of nostalgia, but because it solves a problem graphical interfaces rarely solve as well: composing small operations into large ones in a way that is repeatable, recordable and automatable.

## A philosophy that aged well

The Unix tradition left behind a simple, durable idea: small programs that do one thing well, read text from standard input and write text to standard output. With the pipe, one program's output becomes another's input. The result is a composition language in which you assemble, on the spot, tools nobody had to anticipate.

~~~bash
# The 10 IP addresses that made the most requests ending in a 5xx error
awk '$9 ~ /^5/ { print $1 }' access.log \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -10
~~~

None of those programs knows anything about web server logs. Together, they answer a specific question in seconds. If the question changes tomorrow, you swap one piece of the chain. A GUI would have had to anticipate exactly that report.

## Why it endures

There are practical reasons for the terminal's longevity that go beyond personal taste:

- **Repeatability.** A command can be copied, pasted, kept in history, dropped into a script and run again exactly the same way. A sequence of clicks can't.
- **Automation.** Anything that runs in a terminal can run in a CI pipeline, a cron job or a container. The distance between "I did it by hand" and "I automated it" is tiny.
- **Remote access.** Servers rarely have a graphical interface. An SSH session works over slow networks and costs almost nothing.
- **Executable documentation.** A README listing the commands to run a project is instructions and tooling at the same time.
- **Developer tools.** Compilers, package managers, version control and cloud tooling are command-line programs first. GUIs tend to be layers on top.

Interestingly, AI agents have reinforced this. They operate very well in the terminal precisely because text goes in, text comes out, and the result of every command is observable.

## Modern tools, same idea

The terminal hasn't stood still. A generation of tools kept the philosophy and improved the ergonomics. A few widely used examples:

- \`rg\` (ripgrep) for searching text across whole projects, fast and respectful of \`.gitignore\`;
- \`fd\` as a friendlier alternative to \`find\`;
- \`fzf\` for interactive fuzzy finding that plugs into history, files and practically any list;
- \`jq\` for filtering and transforming JSON, essential in the age of APIs;
- \`bat\` for reading files with syntax highlighting.

~~~bash
# Find and open a file with fuzzy search
vim "$(fd --type f | fzf)"

# Pull names out of an API's JSON response
curl -s https://api.example.com/users | jq -r '.[].name'
~~~

None of them requires abandoning what you already know. They slot into the same pipes.

## Scripts: the terminal with a memory

The natural next step after repeating a command three times is turning it into a script. A few habits make shell scripts far more reliable:

~~~bash
#!/usr/bin/env bash
set -euo pipefail   # fail early: on errors, unset variables or pipe failures

backup_dir="backups/$(date +%Y-%m-%d)"
mkdir -p "$backup_dir"
pg_dump --format=custom "$DATABASE_URL" > "$backup_dir/db.dump"
echo "Backup saved to $backup_dir"
~~~

Quote your variables, prefer \`set -euo pipefail\`, and run a tool like ShellCheck to catch common traps. Above all, recognize when it's time to stop.

## When NOT to use the terminal

Defending the terminal doesn't mean it's right for everything. I'd pick another tool when:

1. **The shell script has grown too big.** Past a hundred lines, sprouting data structures, complex error handling or business logic? Rewrite it in a real language such as Python, Go or TypeScript.
2. **The task is visual by nature.** Reviewing a large diff in context, exploring a performance profile, tweaking a layout: a good GUI wins.
3. **The operation is destructive and rare.** A mistyped command in production can be catastrophic. For dangerous, infrequent operations, an interface with confirmation and review may be safer.
4. **Other people need to use it and don't know the command line.** An internal tool with a simple interface can be worth more than a brilliant script only you can run.

## In short

- Composing small programs through pipes is still one of the most powerful ideas in computing.
- The terminal endures thanks to repeatability, automation, remote access and being the native interface of developer tools.
- Modern tools like \`rg\`, \`fd\`, \`fzf\` and \`jq\` improve ergonomics without changing the philosophy.
- Scripts with \`set -euo pipefail\`, quoting and ShellCheck are far more reliable.
- When a script turns into a program, or the task is visual, pick the right tool.`,
    },
  },
];
