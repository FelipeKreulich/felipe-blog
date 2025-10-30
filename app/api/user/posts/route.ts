import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'all', 'published', 'draft'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // Build where clause
    const where: any = {
      authorId: session.user.id
    }

    if (status === 'published') {
      where.published = true
    } else if (status === 'draft') {
      where.published = false
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
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
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.post.count({ where })
    ])

    // Get stats
    const stats = await prisma.post.groupBy({
      by: ['published'],
      where: {
        authorId: session.user.id
      },
      _count: {
        id: true
      }
    })

    const totalPosts = stats.reduce((acc, stat) => acc + stat._count.id, 0)
    const publishedPosts = stats.find(s => s.published)?._count.id || 0
    const draftPosts = stats.find(s => !s.published)?._count.id || 0

    return NextResponse.json({
      posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      stats: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts
      }
    })
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    )
  }
}
