import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/search/suggestions
 *
 * Retorna sugestões de busca (autocomplete)
 *
 * Query params:
 * - q: termo de busca (mínimo 2 caracteres)
 * - limit: número de sugestões (default: 5)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search for matching posts
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        author: {
          select: {
            name: true,
            username: true,
          }
        },
        _count: {
          select: {
            views: true,
          }
        }
      },
      orderBy: [
        { views: { _count: 'desc' } }, // Most viewed first
        { publishedAt: 'desc' }
      ],
      take: limit,
    })

    // Get matching authors
    const authors = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
        posts: {
          some: {
            published: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        _count: {
          select: {
            posts: true,
          }
        }
      },
      take: 3,
    })

    // Get matching tags
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true,
          }
        }
      },
      orderBy: {
        posts: { _count: 'desc' }
      },
      take: 3,
    })

    return NextResponse.json({
      suggestions: {
        posts,
        authors,
        tags,
      },
      query,
    })
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sugestões' },
      { status: 500 }
    )
  }
}
