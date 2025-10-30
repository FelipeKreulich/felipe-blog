import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: false, // Não expor email publicamente
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { published: true }
            },
            comments: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar profile adicional
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        title: true,
        company: true,
        website: true,
        location: true,
        socialLinks: true
      }
    })

    // Buscar posts publicados
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        published: true
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 6 // Primeiros 6 posts
    })

    // Calcular total de likes recebidos
    const totalLikes = await prisma.like.count({
      where: {
        post: {
          authorId: user.id,
          published: true
        }
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        profile
      },
      stats: {
        posts: user._count.posts,
        comments: user._count.comments,
        likes: totalLikes
      },
      posts
    })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}
