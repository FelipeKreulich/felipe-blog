import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

/**
 * POST /api/follow
 *
 * Seguir um usuário
 *
 * Body:
 * - userId: ID do usuário a seguir (required)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Não pode seguir a si mesmo
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Você não pode seguir a si mesmo' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já está seguindo
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Você já segue este usuário' },
        { status: 400 }
      )
    }

    // Criar follow
    const follow = await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: userId,
      }
    })

    // Criar notificação
    try {
      await createNotification({
        userId: userId,
        type: 'FOLLOW',
        title: 'Novo seguidor',
        message: `${user.name || 'Um usuário'} começou a seguir você`,
        actionUrl: `/profile/${user.username}`,
        actorId: user.id,
      })
    } catch (notifError) {
      console.error('Erro ao criar notificação de follow:', notifError)
    }

    return NextResponse.json({
      success: true,
      follow,
      message: `Você está seguindo ${targetUser.name}`
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao seguir usuário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao seguir usuário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/follow
 *
 * Deixar de seguir um usuário
 *
 * Body:
 * - userId: ID do usuário a deixar de seguir (required)
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se está seguindo
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        }
      }
    })

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Você não segue este usuário' },
        { status: 400 }
      )
    }

    // Deletar follow
    await prisma.follow.delete({
      where: {
        id: existingFollow.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Você deixou de seguir este usuário'
    })
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deixar de seguir usuário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
