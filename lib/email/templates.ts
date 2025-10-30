// Email templates para newsletter

interface WelcomeEmailData {
  language: 'pt' | 'en'
  unsubscribeUrl: string
}

export function getWelcomeEmailTemplate(data: WelcomeEmailData) {
  const { language, unsubscribeUrl } = data

  const content = {
    pt: {
      subject: '🎉 Bem-vindo à nossa Newsletter!',
      greeting: 'Olá!',
      title: 'Obrigado por se inscrever!',
      message1: 'Estamos muito felizes em tê-lo(a) conosco!',
      message2:
        'Agora você receberá os melhores artigos, tutoriais e novidades sobre tecnologia, desenvolvimento e muito mais diretamente no seu email.',
      whatExpect: 'O que você pode esperar:',
      feature1: '📚 Artigos exclusivos sobre tecnologia e desenvolvimento',
      feature2: '💡 Tutoriais práticos e dicas valiosas',
      feature3: '🚀 Novidades e atualizações da comunidade',
      feature4: '🎯 Conteúdo curado especialmente para você',
      cta: 'Visite o Blog',
      footer: 'Se você não deseja mais receber nossos emails, pode',
      unsubscribe: 'cancelar sua inscrição',
      footerEnd: 'a qualquer momento.',
      thanks: 'Obrigado por fazer parte da nossa comunidade!',
      team: 'Equipe Kreulich Blog',
    },
    en: {
      subject: '🎉 Welcome to our Newsletter!',
      greeting: 'Hello!',
      title: 'Thank you for subscribing!',
      message1: "We're so happy to have you with us!",
      message2:
        "Now you'll receive the best articles, tutorials and news about technology, development and much more directly in your email.",
      whatExpect: 'What you can expect:',
      feature1: '📚 Exclusive articles about technology and development',
      feature2: '💡 Practical tutorials and valuable tips',
      feature3: '🚀 News and community updates',
      feature4: '🎯 Content curated especially for you',
      cta: 'Visit the Blog',
      footer: "If you don't want to receive our emails anymore, you can",
      unsubscribe: 'unsubscribe',
      footerEnd: 'at any time.',
      thanks: 'Thank you for being part of our community!',
      team: 'Kreulich Blog Team',
    },
  }

  const t = content[language]

  return {
    subject: t.subject,
    html: `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                ${t.greeting}
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                ${t.title}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${t.message1}
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${t.message2}
              </p>

              <!-- Features box -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px; font-weight: bold;">
                  ${t.whatExpect}
                </h2>
                <ul style="margin: 0; padding: 0; list-style: none;">
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px; line-height: 1.6;">
                    ${t.feature1}
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px; line-height: 1.6;">
                    ${t.feature2}
                  </li>
                  <li style="margin-bottom: 12px; color: #555555; font-size: 15px; line-height: 1.6;">
                    ${t.feature3}
                  </li>
                  <li style="margin-bottom: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    ${t.feature4}
                  </li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog"
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  ${t.cta}
                </a>
              </div>

              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
                ${t.thanks}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: 600;">
                ${t.team}
              </p>
              <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.6;">
                ${t.footer}
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">
                  ${t.unsubscribe}
                </a>
                ${t.footerEnd}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}
