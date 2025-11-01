'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
}

interface TopPostsChartProps {
  posts: TopPost[];
  title?: string;
  description?: string;
}

export function TopPostsChart({ posts, title = "Posts Mais Populares", description = "Top 5 por engajamento" }: TopPostsChartProps) {
  // Trunca título longo para melhor visualização
  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const chartData = posts.map(post => ({
    name: truncateTitle(post.title),
    fullTitle: post.title,
    slug: post.slug,
    Visualizações: post.views,
    Likes: post.likes,
    Comentários: post.comments,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.fullTitle}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar
              dataKey="Visualizações"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="Likes"
              fill="hsl(var(--destructive))"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="Comentários"
              fill="hsl(var(--chart-3))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Lista de links para os posts */}
        <div className="mt-4 space-y-2">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">#{index + 1}</span>
                <span className="truncate max-w-[300px]">{post.title}</span>
              </span>
              <span className="text-muted-foreground text-xs">
                {post.views + post.likes * 5 + post.comments * 3} pts
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
