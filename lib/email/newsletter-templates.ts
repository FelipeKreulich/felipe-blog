// Newsletter email templates

interface NewsletterEmailData {
  language: 'pt' | 'en'
  posts: Array<{
    title: string
    excerpt: string
    slug: string
    coverImage?: string
    author: {
      name: string
    }
  }>
  customMessage?: string
  unsubscribeUrl: string
}

export function getNewsletterEmailTemplate(data: NewsletterEmailData) {
  const { language, posts, customMessage, unsubscribeUrl } = data

  const content = {
    pt: {
      subject: '📬 Newsletter Semanal - Kreulich Blog',
      greeting: 'Olá!',
      intro: customMessage || 'Aqui estão os melhores posts da semana:',
      readMore: 'Ler artigo completo',
      footer: 'Você está recebendo este email porque se inscreveu em nossa newsletter.',
      unsubscribe: 'Cancelar inscrição',
      team: 'Equipe Kreulich Blog',
    },
    en: {
      subject: '📬 Weekly Newsletter - Kreulich Blog',
      greeting: 'Hello!',
      intro: customMessage || "Here are this week's best posts:",
      readMore: 'Read full article',
      footer: "You're receiving this email because you subscribed to our newsletter.",
      unsubscribe: 'Unsubscribe',
      team: 'Kreulich Blog Team',
    },
  }

  const t = content[language]
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${t.greeting}
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                ${t.intro}
              </p>
            </td>
          </tr>

          <!-- Posts -->
          <tr>
            <td style="padding: 30px;">
              ${posts
                .map(
                  (post) => `
                <div style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e9ecef;">
                  ${
                    post.coverImage
                      ? `
                  <img src="${post.coverImage}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;" />
                  `
                      : ''
                  }
                  <h2 style="margin: 0 0 10px 0; color: #333333; font-size: 20px; font-weight: bold;">
                    <a href="${APP_URL}/blog/${post.slug}" style="color: #333333; text-decoration: none;">
                      ${post.title}
                    </a>
                  </h2>
                  <p style="margin: 0 0 15px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    ${post.excerpt}
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #999999;">
                    Por ${post.author.name}
                  </p>
                  <a href="${APP_URL}/blog/${post.slug}"
                     style="display: inline-block; margin-top: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                    ${t.readMore} →
                  </a>
                </div>
                `
                )
                .join('')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: 600;">
                ${t.team}
              </p>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px; line-height: 1.6;">
                ${t.footer}
              </p>
              <p style="margin: 0; color: #666666; font-size: 13px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">
                  ${t.unsubscribe}
                </a>
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
