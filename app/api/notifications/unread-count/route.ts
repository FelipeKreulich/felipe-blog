import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/notifications/unread-count
 *
 * Retorna o número de notificações não lidas do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error)
    const message = error instanceof Error ? error.message : 'Erro ao contar notificações não lidas'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
