import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyPostLike } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o post existe e buscar informações
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já curtiu
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId,
        commentId: null
      }
    })

    if (existingLike) {
      // Remover curtida
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      })

      return NextResponse.json({ liked: false })
    } else {
      // Adicionar curtida
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
          commentId: null
        }
      })

      // Criar notificação
      try {
        await notifyPostLike({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          postAuthorId: post.authorId,
          likerUserId: session.user.id,
          likerName: session.user.name || 'Usuário',
        })
      } catch (notifError) {
        console.error('Erro ao criar notificação de like:', notifError)
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Erro ao curtir post:', error)
    return NextResponse.json(
      { error: 'Erro ao curtir post' },
      { status: 500 }
    )
  }
}
