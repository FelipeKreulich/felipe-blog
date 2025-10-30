import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { getWelcomeEmailTemplate } from '@/lib/email/templates'

// POST - Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, language = 'pt' } = body

    // Validar email
    if (!email || !email.includes('@')) {
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
      await resend.emails.send({
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
