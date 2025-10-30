import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar posts em destaque (featured OU mais curtidos)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    // Primeiro, tentar buscar posts marcados como featured
    let posts = await prisma.post.findMany({
      where: {
        published: true,
        feature: true,
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    // Se não houver posts featured, buscar todos e ordenar por likes
    if (posts.length === 0) {
      const allPosts = await prisma.post.findMany({
        where: {
          published: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      // Ordenar por número de likes (do maior para o menor)
      posts = allPosts
        .sort((a, b) => (b._count?.likes || 0) - (a._count?.likes || 0))
        .slice(0, limit)
    }

    // Se ainda não houver, buscar os mais recentes
    if (posts.length === 0) {
      posts = await prisma.post.findMany({
        where: {
          published: true,
        },
        take: limit,
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Erro ao buscar posts em destaque:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar posts em destaque' },
      { status: 500 }
    )
  }
}
