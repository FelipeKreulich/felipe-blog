import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { getNewsletterEmailTemplate } from '@/lib/email/newsletter-templates'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * POST /api/admin/newsletter/send
 *
 * Envia newsletter para todos os inscritos ativos
 *
 * Body:
 * {
 *   postIds: string[] - IDs dos posts a incluir
 *   customMessage?: string - Mensagem personalizada
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    // Validar acesso admin
    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { postIds, customMessage } = body

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Post IDs são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar posts selecionados
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        published: true,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        coverImage: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      take: 10, // Máximo 10 posts por newsletter
    })

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum post encontrado' },
        { status: 404 }
      )
    }

    // Buscar todos os inscritos ativos
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: {
        email: true,
        language: true,
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum inscrito ativo encontrado' },
        { status: 404 }
      )
    }

    // Agrupar por idioma
    const subscribersByLanguage = subscribers.reduce((acc, sub) => {
      const lang = sub.language as 'pt' | 'en'
      if (!acc[lang]) acc[lang] = []
      acc[lang].push(sub.email)
      return acc
    }, {} as Record<'pt' | 'en', string[]>)

    let successCount = 0
    let errorCount = 0

    // Enviar emails por idioma
    for (const [language, emails] of Object.entries(subscribersByLanguage)) {
      const lang = language as 'pt' | 'en'

      // Preparar template
      const emailTemplate = getNewsletterEmailTemplate({
        language: lang,
        posts: posts.map((post) => ({
          title: post.title,
          excerpt: post.excerpt || '',
          slug: post.slug,
          coverImage: post.coverImage || undefined,
          author: {
            name: post.author.name,
          },
        })),
        customMessage,
        unsubscribeUrl: `${APP_URL}/newsletter/unsubscribe`,
      })

      // Enviar em lotes de 50 (limite do Resend)
      const batchSize = 50
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize)

        try {
          // Enviar para cada email do lote
          await Promise.all(
            batch.map((email) =>
              resend.emails.send({
                from: FROM_EMAIL,
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              })
            )
          )

          successCount += batch.length
        } catch (error) {
          console.error(`Erro ao enviar lote ${i / batchSize + 1}:`, error)
          errorCount += batch.length
        }

        // Delay entre lotes para não sobrecarregar
        if (i + batchSize < emails.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter enviada com sucesso`,
      stats: {
        totalSubscribers: subscribers.length,
        successCount,
        errorCount,
        postsIncluded: posts.length,
      },
    })
  } catch (error) {
    console.error('Erro ao enviar newsletter:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar newsletter' },
      { status: 500 }
    )
  }
}
