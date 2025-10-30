import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookmarks
 *
 * Lista todos os bookmarks do usuário autenticado
 *
 * Query params:
 * - page: número da página (default: 1)
 * - limit: items por página (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId: user.id,
        },
        include: {
          post: {
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
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  views: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bookmark.count({
        where: {
          userId: user.id,
        }
      })
    ])

    return NextResponse.json({
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Erro ao listar bookmarks:', error)
    const message = error instanceof Error ? error.message : 'Erro ao listar bookmarks'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

/**
 * POST /api/bookmarks
 *
 * Cria um novo bookmark
 *
 * Body:
 * - postId: ID do post (required)
 * - note: Nota pessoal sobre o bookmark (optional)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { postId, note } = await req.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o post existe e está publicado
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado ou não publicado' },
        { status: 404 }
      )
    }

    // Verificar se já existe bookmark
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Post já está nos bookmarks' },
        { status: 400 }
      )
    }

    // Criar bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        postId,
        note: note || null,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json({ bookmark }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar bookmark:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar bookmark'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
