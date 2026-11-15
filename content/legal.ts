// Textos iniciais de Termos e Privacidade. Publicados uma única vez por scripts/publish-content.ts;
// depois disso, a fonte da verdade é o que estiver no admin (Admin → Páginas).
type Doc = { title: string; content: string };
export const legal: Record<"terms" | "privacy", { pt: Doc; en: Doc }> = {
  privacy: {
    pt: {
      title: "Política de privacidade",
      content: `O The Commit Times é um blog pessoal sobre tecnologia mantido por Felipe Kreulich. Esta política explica, em linguagem simples, quais dados são tratados, para quê e quais são os seus direitos. Ler o blog não exige conta e não envolve nenhum rastreamento.

## Quem é o responsável

O responsável pelo tratamento dos dados é Felipe Kreulich. Para qualquer questão sobre privacidade, escreva para **contacto.felipe.kreulich@gmail.com**.

## Que dados tratamos

- **Leitura do site:** nenhum dado pessoal é recolhido para ler os artigos. Não usamos analytics, pixels de anúncios nem ferramentas de rastreamento de terceiros.
- **Conta de leitor (opcional):** nome, e-mail e senha (guardada apenas como hash bcrypt, nunca em texto). Opcionalmente, uma foto de perfil que você envia.
- **Participação:** os comentários que você escreve e os artigos que você curte.
- **Newsletter (opcional):** e-mail, idioma preferido e um código para confirmar e cancelar a assinatura.
- **Segurança:** para limitar tentativas de login e de cadastro, o endereço IP é usado temporariamente como contador, guardado por no máximo uma hora.

## Para que usamos

- Manter a sua conta e permitir comentar e curtir (execução do serviço que você pediu).
- Enviar a newsletter, apenas se você se inscreveu e confirmou (consentimento).
- Proteger o site contra abuso, como força bruta e spam (interesse legítimo).

Não vendemos, alugamos nem partilhamos os seus dados para marketing.

## Cookies e armazenamento no navegador

Usamos apenas o essencial para o site funcionar:

- **Sessão:** mantém você conectado depois de entrar.
- **Idioma:** lembra se você prefere português ou inglês.
- **Consentimento:** guarda a sua escolha no aviso de cookies.

O tema (claro ou escuro) e o aviso de abertura usam o armazenamento local do navegador e não saem do seu dispositivo. Você pode rever a escolha de cookies a qualquer momento pelo link **Cookies** no rodapé.

## Prestadores de serviço

Para funcionar, o site usa prestadores que tratam dados em nosso nome, apenas para esse fim:

- **Vercel**: hospedagem do site.
- **Neon**: base de dados (PostgreSQL).
- **Resend**: envio dos e-mails da newsletter e de confirmação.

Alguns destes prestadores podem tratar dados fora do seu país, com as salvaguardas contratuais previstas na legislação de proteção de dados aplicável.

## Por quanto tempo guardamos

- **Conta, foto, comentários e curtidas:** enquanto a conta existir.
- **Newsletter:** até você cancelar a assinatura.
- **Contadores de tentativas (IP):** até uma hora.

Ao apagar a sua conta, a foto, as curtidas e os comentários são removidos. Comentários que já tinham respostas de outras pessoas ficam anónimos, como “[comentário removido]”, para não quebrar a conversa.

## Os seus direitos

Você pode, a qualquer momento:

- aceder aos seus dados e corrigi-los (nome e foto direto no perfil);
- pedir a alteração do e-mail ou uma cópia dos seus dados por e-mail;
- apagar a conta sozinho, em **Perfil → Apagar conta**;
- cancelar a newsletter pelo link presente em cada e-mail;
- opor-se a um tratamento ou retirar um consentimento.

Se considerar que os seus dados não foram tratados corretamente, também pode apresentar reclamação à autoridade de proteção de dados competente.

## Menores

O blog não se destina a menores de 16 anos, e não criamos contas de forma consciente para quem tem menos dessa idade.

## Alterações

Esta política pode ser atualizada. A data de atualização aparece no topo da página, e mudanças relevantes serão anunciadas no site.`,
    },
    en: {
      title: "Privacy policy",
      content: `The Commit Times is a personal technology blog run by Felipe Kreulich. This policy explains, in plain language, which data is processed, why, and what your rights are. Reading the blog requires no account and involves no tracking.

## Who is responsible

The data controller is Felipe Kreulich. For any privacy question, write to **contacto.felipe.kreulich@gmail.com**.

## What data we process

- **Reading the site:** no personal data is collected to read articles. We use no analytics, ad pixels or third-party tracking tools.
- **Reader account (optional):** name, email and password (stored only as a bcrypt hash, never in plain text). Optionally, a profile photo you upload.
- **Participation:** the comments you write and the articles you like.
- **Newsletter (optional):** email, preferred language and a code used to confirm and cancel the subscription.
- **Security:** to limit sign-in and sign-up attempts, your IP address is used temporarily as a counter, kept for at most one hour.

## Why we use it

- To run your account and let you comment and like (providing the service you asked for).
- To send the newsletter, only if you subscribed and confirmed (consent).
- To protect the site from abuse such as brute force and spam (legitimate interest).

We do not sell, rent or share your data for marketing.

## Cookies and browser storage

We only use what is essential for the site to work:

- **Session:** keeps you signed in.
- **Language:** remembers whether you prefer Portuguese or English.
- **Consent:** stores your choice in the cookie notice.

The theme (light or dark) and the opening animation use your browser's local storage and never leave your device. You can review your cookie choice at any time through the **Cookies** link in the footer.

## Service providers

To operate, the site relies on providers that process data on our behalf, for that purpose only:

- **Vercel**: website hosting.
- **Neon**: database (PostgreSQL).
- **Resend**: sending newsletter and confirmation emails.

Some of these providers may process data outside your country, under the contractual safeguards required by applicable data-protection law.

## How long we keep it

- **Account, photo, comments and likes:** while the account exists.
- **Newsletter:** until you unsubscribe.
- **Attempt counters (IP):** up to one hour.

When you delete your account, your photo, likes and comments are removed. Comments that already had replies from other people become anonymous, shown as “[comment removed]”, so the conversation doesn't break.

## Your rights

At any time you can:

- access and correct your data (name and photo directly in your profile);
- request an email change or a copy of your data by email;
- delete your account yourself under **Profile → Delete account**;
- unsubscribe from the newsletter using the link in every email;
- object to processing or withdraw consent.

If you believe your data was not handled properly, you may also lodge a complaint with the competent data-protection authority.

## Children

The blog is not intended for anyone under 16, and we do not knowingly create accounts for people under that age.

## Changes

This policy may be updated. The update date is shown at the top of the page, and relevant changes will be announced on the site.`,
    },
  },
  terms: {
    pt: {
      title: "Termos e condições",
      content: `Estes termos regem o uso do The Commit Times, um blog pessoal sobre tecnologia mantido por Felipe Kreulich. Ao usar o site ou criar uma conta, você concorda com eles. Se não concordar, por favor não use as funcionalidades que exigem conta.

## O serviço

O blog publica notícias, notas de estudo e ensaios sobre tecnologia. Ler é livre e não exige conta. A conta de leitor serve apenas para comentar, curtir e personalizar o perfil. O serviço é oferecido como está e pode mudar, ser suspenso ou encerrado a qualquer momento.

## A sua conta

- Você é responsável pelas informações que fornece e por manter a sua senha segura.
- Uma conta é pessoal; não a partilhe nem crie contas em nome de outras pessoas.
- É preciso ter pelo menos 16 anos para criar uma conta.
- Você pode apagar a sua conta a qualquer momento no perfil.

## Comentários e conduta

Os comentários devem contribuir para a conversa. Não são permitidos:

- conteúdo ilegal, difamatório, discriminatório, assediador ou violento;
- spam, publicidade não solicitada ou links maliciosos;
- dados pessoais de terceiros sem autorização;
- tentativas de explorar falhas, sobrecarregar o site ou contornar limites de segurança.

Comentários que violem estes termos podem ser removidos, e contas podem ser suspensas ou apagadas, sem aviso prévio.

Você continua a ser o autor dos seus comentários. Ao publicá-los, concede ao The Commit Times uma licença gratuita e não exclusiva para os exibir no site enquanto estiverem publicados.

## Conteúdo do blog

Os artigos, ilustrações e o design do site pertencem ao autor, salvo indicação em contrário. Pode citar trechos com atribuição e link para o artigo original. A reprodução integral exige autorização.

Os exemplos de código nos artigos podem ser usados livremente nos seus projetos, por sua conta e risco.

## Isenção de responsabilidade

O conteúdo tem fins informativos e educativos e reflete a opinião do autor. Apesar do cuidado, pode conter erros ou ficar desatualizado. Não constitui aconselhamento profissional, jurídico ou de segurança para o seu caso específico. Avalie sempre antes de aplicar qualquer técnica ou código em produção.

Na medida permitida pela lei, o The Commit Times não se responsabiliza por danos decorrentes do uso do site ou do seu conteúdo.

## Privacidade

O tratamento dos seus dados está descrito na [Política de privacidade](/privacy).

## Alterações e contacto

Estes termos podem ser atualizados; a data aparece no topo da página. Dúvidas? Escreva para **contacto.felipe.kreulich@gmail.com**.`,
    },
    en: {
      title: "Terms and conditions",
      content: `These terms govern the use of The Commit Times, a personal technology blog run by Felipe Kreulich. By using the site or creating an account, you agree to them. If you don't agree, please don't use the features that require an account.

## The service

The blog publishes news, study notes and essays about technology. Reading is free and requires no account. A reader account is only for commenting, liking and personalizing your profile. The service is provided as is and may change, be suspended or end at any time.

## Your account

- You are responsible for the information you provide and for keeping your password safe.
- An account is personal; don't share it or create accounts on behalf of other people.
- You must be at least 16 to create an account.
- You can delete your account at any time from your profile.

## Comments and conduct

Comments should add to the conversation. The following are not allowed:

- illegal, defamatory, discriminatory, harassing or violent content;
- spam, unsolicited advertising or malicious links;
- other people's personal data without permission;
- attempts to exploit vulnerabilities, overload the site or bypass security limits.

Comments that break these terms may be removed, and accounts may be suspended or deleted, without prior notice.

You remain the author of your comments. By posting them, you grant The Commit Times a free, non-exclusive license to display them on the site while they are published.

## Blog content

Articles, illustrations and the site's design belong to the author unless stated otherwise. You may quote excerpts with attribution and a link to the original article. Full reproduction requires permission.

Code examples in articles may be used freely in your own projects, at your own risk.

## Disclaimer

The content is informational and educational and reflects the author's opinion. Despite the care taken, it may contain errors or become outdated. It is not professional, legal or security advice for your specific situation. Always evaluate before applying any technique or code in production.

To the extent permitted by law, The Commit Times is not liable for damages arising from the use of the site or its content.

## Privacy

How your data is handled is described in the [Privacy policy](/en/privacy).

## Changes and contact

These terms may be updated; the date appears at the top of the page. Questions? Write to **contacto.felipe.kreulich@gmail.com**.`,
    },
  },
};
