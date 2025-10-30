import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            profile: {
              select: {
                title: true,
                company: true
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
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

    // Se o post não está publicado, só o autor ou editores podem ver
    if (!post.published) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Post não encontrado' },
          { status: 404 }
        )
      }

      const isAuthor = post.authorId === session.user.id
      const isEditor = ['EDITOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)

      if (!isAuthor && !isEditor) {
        return NextResponse.json(
          { error: 'Post não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se o usuário atual curtiu o post
    let hasLiked = false
    if (session?.user) {
      const like = await prisma.like.findFirst({
        where: {
          userId: session.user.id,
          postId: post.id,
          commentId: null
        }
      })
      hasLiked = !!like
    }

    return NextResponse.json({ post, hasLiked })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    )
  }
}
