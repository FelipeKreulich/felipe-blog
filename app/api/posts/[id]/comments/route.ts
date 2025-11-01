import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNewComment, notifyCommentReply } from '@/lib/notifications'

// GET - Listar comentários de um post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
        approved: true, // Apenas comentários aprovados
        parentId: null // Apenas comentários principais (não respostas)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comentários' },
      { status: 500 }
    )
  }
}

// POST - Criar comentário
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o post existe e buscar informações para notificação
    const post = await prisma.post.findUnique({
      where: { id },
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

    // Se for uma resposta, verificar se o comentário pai existe
    let parentComment = null
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Comentário pai não encontrado' },
          { status: 404 }
        )
      }
    }

    // Criar comentário (automaticamente aprovado para simplificar)
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        approved: true, // Auto-aprovação
        authorId: session.user.id,
        postId: id,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    // Criar notificação
    try {
      if (parentComment) {
        // É uma resposta - notificar autor do comentário pai
        await notifyCommentReply({
          commentId: parentComment.id,
          postTitle: post.title,
          postSlug: post.slug,
          commentAuthorId: parentComment.authorId,
          replierUserId: session.user.id,
          replierName: session.user.name || 'Usuário',
        })
      } else {
        // É um comentário novo - notificar autor do post
        await notifyNewComment({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          postAuthorId: post.authorId,
          commenterUserId: session.user.id,
          commenterName: session.user.name || 'Usuário',
        })
      }
    } catch (notifError) {
      // Não falhar a requisição se a notificação falhar
      console.error('Erro ao criar notificação:', notifError)
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar comentário' },
      { status: 500 }
    )
  }
}
