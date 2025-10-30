import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/search
 *
 * Busca posts com filtros avançados
 *
 * Query params:
 * - q: termo de busca
 * - category: slug da categoria
 * - tag: slug da tag
 * - author: username do autor
 * - dateFrom: data inicial (ISO)
 * - dateTo: data final (ISO)
 * - page: número da página (default: 1)
 * - limit: items por página (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const query = searchParams.get('q') || ''
    const categorySlug = searchParams.get('category')
    const tagSlug = searchParams.get('tag')
    const authorUsername = searchParams.get('author')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Build where clause
    const where: any = {
      published: true,
    }

    // Text search (case insensitive)
    if (query.trim()) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: categorySlug
          }
        }
      }
    }

    // Tag filter
    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      }
    }

    // Author filter
    if (authorUsername) {
      where.author = {
        username: authorUsername
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.publishedAt = {}
      if (dateFrom) {
        where.publishedAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.publishedAt.lte = new Date(dateTo)
      }
    }

    // Execute search
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where })
    ])

    // Add search highlights (simple version)
    const postsWithHighlights = posts.map(post => {
      let titleHighlight = post.title
      let excerptHighlight = post.excerpt || ''

      if (query.trim()) {
        const regex = new RegExp(`(${query})`, 'gi')
        titleHighlight = post.title.replace(regex, '<mark>$1</mark>')
        if (post.excerpt) {
          excerptHighlight = post.excerpt.replace(regex, '<mark>$1</mark>')
        }
      }

      return {
        ...post,
        titleHighlight,
        excerptHighlight,
      }
    })

    return NextResponse.json({
      posts: postsWithHighlights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query,
      filters: {
        category: categorySlug,
        tag: tagSlug,
        author: authorUsername,
        dateFrom,
        dateTo,
      }
    })
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar busca' },
      { status: 500 }
    )
  }
}
