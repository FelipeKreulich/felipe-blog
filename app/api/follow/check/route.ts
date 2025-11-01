import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/follow/check?userId=xxx
 *
 * Verifica se o usuário atual está seguindo outro usuário
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        }
      }
    })

    return NextResponse.json({
      isFollowing: !!isFollowing
    })
  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    const message = error instanceof Error ? error.message : 'Erro ao verificar follow'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
