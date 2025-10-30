import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// POST - Curtir/Descurtir post ou comentário
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { postId, commentId } = await req.json()

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Você deve curtir um post ou comentário' },
        { status: 400 }
      )
    }

    // Verificar se já curtiu
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    })

    if (existingLike) {
      // Descurtir
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      return NextResponse.json({
        liked: false,
        message: 'Curtida removida',
      })
    } else {
      // Curtir
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId || null,
          commentId: commentId || null,
        },
      })

      return NextResponse.json({
        liked: true,
        message: 'Curtida adicionada',
      })
    }
  } catch (error) {
    console.error('Erro ao processar curtida:', error)
    const message = error instanceof Error ? error.message : 'Erro ao processar curtida'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// GET - Verificar se usuário curtiu
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const commentId = searchParams.get('commentId')

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Você deve especificar um post ou comentário' },
        { status: 400 }
      )
    }

    const like = await prisma.like.findFirst({
      where: {
        userId: user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('Erro ao verificar curtida:', error)
    const message = error instanceof Error ? error.message : 'Erro ao verificar curtida'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
