import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/notifications/mark-all-read
 *
 * Marca todas as notificações do usuário como lidas
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Marcar todas como lidas
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      }
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} notificação(ões) marcada(s) como lida(s)`
    })
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    const message = error instanceof Error ? error.message : 'Erro ao marcar notificações como lidas'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
