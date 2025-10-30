import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    // Buscar estatísticas
    const [
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalTags,
      totalComments,
      approvedComments,
      pendingComments,
      totalLikes
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: true } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.like.count()
    ])

    // Posts por dia (últimos 7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentPosts = await prisma.post.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Usuários por role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })

    // Top 5 autores por posts
    const topAuthors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Posts mais curtidos
    const topPosts = await prisma.post.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        author: {
          select: {
            name: true,
            username: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        likes: {
          _count: 'desc'
        }
      },
      take: 5
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCategories,
        totalTags,
        totalComments,
        approvedComments,
        pendingComments,
        totalLikes
      },
      charts: {
        recentPosts,
        usersByRole
      },
      topAuthors,
      topPosts
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
