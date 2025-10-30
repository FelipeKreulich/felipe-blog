import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Unsubscribe from newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Buscar inscrição
    const subscriber = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!subscriber || !subscriber.isActive) {
      return NextResponse.json(
        { error: 'Email não encontrado na lista de inscritos' },
        { status: 404 }
      )
    }

    // Desativar inscrição
    await prisma.newsletter.update({
      where: { email: email.toLowerCase() },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Você foi removido da newsletter com sucesso'
    })
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição' },
      { status: 500 }
    )
  }
}
