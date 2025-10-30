import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookmarks/check?postId=xxx
 *
 * Verifica se um post está nos bookmarks do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        }
      },
      select: {
        id: true,
        note: true,
      }
    })

    return NextResponse.json({
      bookmarked: !!bookmark,
      bookmark: bookmark || null,
    })
  } catch (error) {
    console.error('Erro ao verificar bookmark:', error)
    const message = error instanceof Error ? error.message : 'Erro ao verificar bookmark'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
