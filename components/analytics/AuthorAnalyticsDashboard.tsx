'use client';

import { useEffect, useState } from 'react';
import { Eye, Heart, MessageCircle, BookMarked, FileText, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { EngagementChart } from './EngagementChart';
import { TopPostsChart } from './TopPostsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
  user: {
    id: string;
    name: string;
    username: string;
    memberSince: string;
  };
  summary: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalBookmarks: number;
    averageViewsPerPost: number;
    averageLikesPerPost: number;
  };
  growth: {
    views: {
      current: number;
      previous: number;
      percentage: number;
    };
    likes: {
      current: number;
      previous: number;
      percentage: number;
    };
    comments: {
      current: number;
      previous: number;
      percentage: number;
    };
  };
  engagementTimeline: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
    publishedAt: string;
  }>;
  allPosts: Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: string;
    stats: {
      views: number;
      likes: number;
      comments: number;
      bookmarks: number;
    };
  }>;
}

interface AuthorAnalyticsDashboardProps {
  userId: string;
}

export function AuthorAnalyticsDashboard({ userId }: AuthorAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/authors/${userId}/analytics`);

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Você não tem permissão para ver estas estatísticas');
          }
          throw new Error('Erro ao carregar estatísticas');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>Nenhum dado disponível</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Visualizações"
          value={data.summary.totalViews}
          icon={Eye}
          description={`Média de ${data.summary.averageViewsPerPost} por post`}
          trend={{
            value: data.growth.views.percentage,
          }}
        />
        <StatsCard
          title="Total de Likes"
          value={data.summary.totalLikes}
          icon={Heart}
          description={`Média de ${data.summary.averageLikesPerPost} por post`}
          trend={{
            value: data.growth.likes.percentage,
          }}
        />
        <StatsCard
          title="Total de Comentários"
          value={data.summary.totalComments}
          icon={MessageCircle}
          description={`Em ${data.summary.totalPosts} posts`}
          trend={{
            value: data.growth.comments.percentage,
          }}
        />
        <StatsCard
          title="Posts Salvos"
          value={data.summary.totalBookmarks}
          icon={BookMarked}
          description="Total de bookmarks"
        />
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Posts Publicados
            </CardTitle>
            <CardDescription>Total de conteúdo criado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Desde {new Date(data.user.memberSince).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engajamento Médio
            </CardTitle>
            <CardDescription>Por post publicado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Visualizações</span>
                <span className="font-semibold">{data.summary.averageViewsPerPost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Likes</span>
                <span className="font-semibold">{data.summary.averageLikesPerPost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Comentários</span>
                <span className="font-semibold">
                  {data.summary.totalPosts > 0
                    ? Math.round(data.summary.totalComments / data.summary.totalPosts)
                    : 0
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Engajamento */}
      {data.engagementTimeline.length > 0 ? (
        <EngagementChart
          data={data.engagementTimeline}
          title="Engajamento ao Longo do Tempo"
          description="Últimos 30 dias de atividade"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Engajamento ao Longo do Tempo</CardTitle>
            <CardDescription>Últimos 30 dias de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Sem dados de engajamento nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
      )}

      {/* Posts Mais Populares */}
      {data.topPosts.length > 0 ? (
        <TopPostsChart
          posts={data.topPosts}
          title="Posts Mais Populares"
          description="Top 5 por engajamento (views + likes × 5 + comments × 3)"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Posts Mais Populares</CardTitle>
            <CardDescription>Nenhum post publicado ainda</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Tabela de Todos os Posts */}
      {data.allPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Todos os Posts</CardTitle>
            <CardDescription>Detalhamento completo de estatísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold text-sm">Título</th>
                    <th className="text-right py-3 px-2 font-semibold text-sm">Visualizações</th>
                    <th className="text-right py-3 px-2 font-semibold text-sm">Likes</th>
                    <th className="text-right py-3 px-2 font-semibold text-sm">Comentários</th>
                    <th className="text-right py-3 px-2 font-semibold text-sm">Bookmarks</th>
                    <th className="text-right py-3 px-2 font-semibold text-sm">Publicado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allPosts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <a
                          href={`/blog/${post.slug}`}
                          className="text-sm hover:underline hover:text-primary truncate max-w-[300px] block"
                        >
                          {post.title}
                        </a>
                      </td>
                      <td className="text-right py-3 px-2 text-sm">{post.stats.views}</td>
                      <td className="text-right py-3 px-2 text-sm">{post.stats.likes}</td>
                      <td className="text-right py-3 px-2 text-sm">{post.stats.comments}</td>
                      <td className="text-right py-3 px-2 text-sm">{post.stats.bookmarks}</td>
                      <td className="text-right py-3 px-2 text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
