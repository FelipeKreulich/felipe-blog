import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/types/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { userId } = await params;

    // Verifica se o usuário pode ver as estatísticas
    // Pode ver próprias stats (WRITER+) ou todas (ADMIN)
    const canViewOwnStats = hasPermission(session.user.role, 'VIEW_OWN_STATS');
    const canViewAllStats = hasPermission(session.user.role, 'VIEW_ALL_STATS');

    if (userId !== session.user.id && !canViewAllStats) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    if (!canViewOwnStats && !canViewAllStats) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Busca estatísticas gerais
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Busca posts do autor com suas estatísticas
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
            bookmarks: true,
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Calcula totais
    const totalViews = posts.reduce((sum, post) => sum + post._count.views, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post._count.comments, 0);
    const totalBookmarks = posts.reduce((sum, post) => sum + post._count.bookmarks, 0);
    const totalPosts = posts.length;

    // Busca views ao longo do tempo (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsOverTime = await prisma.postView.groupBy({
      by: ['createdAt'],
      where: {
        post: {
          authorId: userId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Agrupa views por dia
    const viewsByDay = viewsOverTime.reduce((acc: Record<string, number>, view) => {
      const date = new Date(view.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + view._count.id;
      return acc;
    }, {});

    // Converte para array para gráfico
    const viewsTimeline = Object.entries(viewsByDay).map(([date, count]) => ({
      date,
      views: count
    }));

    // Busca engajamento ao longo do tempo (últimos 30 dias)
    const likesOverTime = await prisma.like.groupBy({
      by: ['createdAt'],
      where: {
        post: {
          authorId: userId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const likesByDay = likesOverTime.reduce((acc: Record<string, number>, like) => {
      const date = new Date(like.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + like._count.id;
      return acc;
    }, {});

    const likesTimeline = Object.entries(likesByDay).map(([date, count]) => ({
      date,
      likes: count
    }));

    const commentsOverTime = await prisma.comment.groupBy({
      by: ['createdAt'],
      where: {
        post: {
          authorId: userId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const commentsByDay = commentsOverTime.reduce((acc: Record<string, number>, comment) => {
      const date = new Date(comment.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + comment._count.id;
      return acc;
    }, {});

    const commentsTimeline = Object.entries(commentsByDay).map(([date, count]) => ({
      date,
      comments: count
    }));

    // Combina timelines
    const allDates = new Set([
      ...viewsTimeline.map(v => v.date),
      ...likesTimeline.map(l => l.date),
      ...commentsTimeline.map(c => c.date)
    ]);

    const engagementTimeline = Array.from(allDates).sort().map(date => ({
      date,
      views: viewsTimeline.find(v => v.date === date)?.views || 0,
      likes: likesTimeline.find(l => l.date === date)?.likes || 0,
      comments: commentsTimeline.find(c => c.date === date)?.comments || 0,
    }));

    // Posts mais populares (top 5)
    const topPosts = [...posts]
      .sort((a, b) => {
        const engagementA = a._count.views + (a._count.likes * 5) + (a._count.comments * 3);
        const engagementB = b._count.views + (b._count.likes * 5) + (b._count.comments * 3);
        return engagementB - engagementA;
      })
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post._count.views,
        likes: post._count.likes,
        comments: post._count.comments,
        bookmarks: post._count.bookmarks,
        publishedAt: post.publishedAt,
      }));

    // Estatísticas de crescimento (compara últimos 7 dias vs 7 anteriores)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentViews = await prisma.postView.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const previousViews = await prisma.postView.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });

    const viewsGrowth = previousViews > 0
      ? ((recentViews - previousViews) / previousViews) * 100
      : recentViews > 0 ? 100 : 0;

    const recentLikes = await prisma.like.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const previousLikes = await prisma.like.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });

    const likesGrowth = previousLikes > 0
      ? ((recentLikes - previousLikes) / previousLikes) * 100
      : recentLikes > 0 ? 100 : 0;

    const recentComments = await prisma.comment.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const previousComments = await prisma.comment.count({
      where: {
        post: { authorId: userId },
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });

    const commentsGrowth = previousComments > 0
      ? ((recentComments - previousComments) / previousComments) * 100
      : recentComments > 0 ? 100 : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        memberSince: user.createdAt,
      },
      summary: {
        totalPosts,
        totalViews,
        totalLikes,
        totalComments,
        totalBookmarks,
        averageViewsPerPost: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
        averageLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
      },
      growth: {
        views: {
          current: recentViews,
          previous: previousViews,
          percentage: Math.round(viewsGrowth * 10) / 10,
        },
        likes: {
          current: recentLikes,
          previous: previousLikes,
          percentage: Math.round(likesGrowth * 10) / 10,
        },
        comments: {
          current: recentComments,
          previous: previousComments,
          percentage: Math.round(commentsGrowth * 10) / 10,
        }
      },
      engagementTimeline,
      topPosts,
      allPosts: posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        stats: {
          views: post._count.views,
          likes: post._count.likes,
          comments: post._count.comments,
          bookmarks: post._count.bookmarks,
        }
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
