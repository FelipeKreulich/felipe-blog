import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// GET - Estatísticas gerais do sistema (Admin only)
export async function GET() {
  try {
    await requireRole(Role.ADMIN)

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalReports,
      pendingReports,
      bannedUsers,
      usersByRole,
      recentUsers,
      recentPosts,
      topAuthors,
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),

      // Total de posts
      prisma.post.count(),

      // Total de comentários
      prisma.comment.count(),

      // Total de reports
      prisma.report.count(),

      // Reports pendentes
      prisma.report.count({
        where: { status: 'PENDING' },
      }),

      // Usuários banidos
      prisma.user.count({
        where: { isBanned: true },
      }),

      // Usuários por role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Usuários recentes (últimos 7 dias)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Posts recentes (últimos 7 dias)
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Top autores (mais posts)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ])

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalReports,
        pendingReports,
        bannedUsers,
        recentUsers,
        recentPosts,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count
        return acc
      }, {} as Record<string, number>),
      topAuthors,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    const message = error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
