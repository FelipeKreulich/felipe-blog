import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/feed?page=1&limit=10
 *
 * Feed personalizado com posts dos usuários que você segue
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Buscar IDs dos usuários que o usuário atual está seguindo
    const following = await prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      }
    })

    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        message: 'Você ainda não segue ninguém. Comece seguindo autores para ver posts no seu feed!'
      })
    }

    // Buscar posts dos usuários seguidos
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: {
            in: followingIds,
          },
          published: true,
          status: 'PUBLISHED',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
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
                  slug: true,
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({
        where: {
          authorId: {
            in: followingIds,
          },
          published: true,
          status: 'PUBLISHED',
        }
      })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Erro ao buscar feed:', error)
    const message = error instanceof Error ? error.message : 'Erro ao buscar feed'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
