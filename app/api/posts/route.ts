import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '6')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'

    // Calcular skip para paginação
    const skip = (page - 1) * pageSize

    // Construir filtros
    const where: any = {
      published: true, // Apenas posts publicados
    }

    if (featured) {
      where.feature = true
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          publishedAt: 'desc'
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
            }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      posts,
      total,
      page,
      pageSize,
      totalPages,
    })
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    )
  }
}

// POST - Criar novo post (Writer, Editor, Moderator, Admin)
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(Permission.CREATE_POST)
    const { title, content, excerpt, coverImage, categoryIds, tagIds, submitForReview } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar slug único
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let slug = baseSlug
    let counter = 1

    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Determinar status inicial
    // Editor, Moderator e Admin podem publicar diretamente
    // Writer precisa enviar para revisão
    const canPublishDirectly = ['EDITOR', 'MODERATOR', 'ADMIN'].includes(user.role)
    const status = submitForReview && !canPublishDirectly ? 'PENDING_REVIEW' : 'DRAFT'

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 160),
        coverImage,
        status,
        published: false,
        authorId: user.id,
        categories: categoryIds?.length ? {
          create: categoryIds.map((id: string) => ({
            categoryId: id,
          })),
        } : undefined,
        tags: tagIds?.length ? {
          create: tagIds.map((id: string) => ({
            tagId: id,
          })),
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
