import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/notifications/[id]
 *
 * Marca uma notificação como lida/não lida
 *
 * Body:
 * - read: boolean (required)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { read } = await req.json()

    if (typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo "read" é obrigatório e deve ser boolean' },
        { status: 400 }
      )
    }

    // Verificar se a notificação existe e pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar esta notificação' },
        { status: 403 }
      )
    }

    // Atualizar notificação
    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar notificação'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 *
 * Deleta uma notificação
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Verificar se a notificação existe e pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta notificação' },
        { status: 403 }
      )
    }

    // Deletar notificação
    await prisma.notification.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deletar notificação'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
