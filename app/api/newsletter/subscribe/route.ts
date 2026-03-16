import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend, FROM_EMAIL } from '@/lib/email/resend'
import { getWelcomeEmailTemplate } from '@/lib/email/templates'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// POST - Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 subscriptions per IP per 10 minutes
    const ip = getClientIp(req)
    const rl = rateLimit(`newsletter:${ip}`, { limit: 3, windowSeconds: 600 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email, language = 'pt' } = body

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar idioma
    if (!['pt', 'en'].includes(language)) {
      return NextResponse.json(
        { error: 'Idioma inválido' },
        { status: 400 }
      )
    }

    // Verificar se já existe
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingSubscriber) {
      // Se já está ativo, retornar erro
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          {
            error: language === 'pt'
              ? 'Este email já está inscrito na newsletter'
              : 'This email is already subscribed to the newsletter'
          },
          { status: 400 }
        )
      }

      // Se estava inativo, reativar
      await prisma.newsletter.update({
        where: { email: email.toLowerCase() },
        data: {
          isActive: true,
          language,
          subscribedAt: new Date(),
          unsubscribedAt: null
        }
      })
    } else {
      // Criar nova inscrição
      await prisma.newsletter.create({
        data: {
          email: email.toLowerCase(),
          language
        }
      })
    }

    // Preparar URL de unsubscribe
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

    // Obter template de email
    const emailTemplate = getWelcomeEmailTemplate({
      language: language as 'pt' | 'en',
      unsubscribeUrl
    })

    // Enviar email de boas-vindas
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
      // Não falhar a subscription se o email falhar
      // O usuário está inscrito mesmo se o email falhar
    }

    return NextResponse.json({
      success: true,
      message: language === 'pt'
        ? 'Inscrição realizada com sucesso! Verifique seu email.'
        : 'Subscription successful! Check your email.'
    })
  } catch (error) {
    console.error('Erro ao processar inscrição:', error)
    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    )
  }
}
