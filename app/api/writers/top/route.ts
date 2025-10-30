import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar top escritores
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar usuários que são writers ou superiores com suas estatísticas
    const writers = await prisma.user.findMany({
      where: {
        role: {
          in: ['WRITER', 'EDITOR', 'MODERATOR', 'ADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        role: true,
        updatedAt: true, // Para verificar atividade recente
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
        posts: {
          where: {
            published: true,
          },
          select: {
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        },
      },
    })

    // Calcular pontuação de cada escritor
    const writersWithStats = writers.map((writer) => {
      const totalPosts = writer._count.posts
      const totalComments = writer._count.comments

      // Calcular total de likes e visualizações dos posts
      const totalLikes = writer.posts.reduce(
        (sum, post) => sum + (post._count?.likes || 0),
        0
      )
      const totalViews = writer.posts.reduce(
        (sum, post) => sum + (post._count?.views || 0),
        0
      )
      const totalPostComments = writer.posts.reduce(
        (sum, post) => sum + (post._count?.comments || 0),
        0
      )

      // Fórmula de pontuação (pode ajustar os pesos)
      const score =
        totalPosts * 10 + // 10 pontos por post
        totalLikes * 5 + // 5 pontos por like
        totalPostComments * 3 + // 3 pontos por comentário no post
        totalComments * 2 + // 2 pontos por comentário feito
        Math.floor(totalViews / 10) // 1 ponto a cada 10 visualizações

      // Verificar se está online (ativo nos últimos 5 minutos)
      const isOnline =
        new Date().getTime() - new Date(writer.updatedAt).getTime() <
        5 * 60 * 1000

      return {
        id: writer.id,
        name: writer.name,
        username: writer.username,
        avatar: writer.avatar,
        role: writer.role,
        isOnline,
        stats: {
          posts: totalPosts,
          likes: totalLikes,
          comments: totalComments,
          views: totalViews,
        },
        score,
      }
    })

    // Ordenar por pontuação e pegar top N
    const topWriters = writersWithStats
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json({ writers: topWriters })
  } catch (error) {
    console.error('Erro ao buscar top escritores:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar escritores' },
      { status: 500 }
    )
  }
}
