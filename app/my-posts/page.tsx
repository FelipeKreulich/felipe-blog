'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Heart,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  feature: boolean;
  createdAt: string;
  publishedAt: string | null;
  _count: {
    likes: number;
    comments: number;
  };
  categories: {
    category: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
}

interface Stats {
  total: number;
  published: number;
  draft: number;
}

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router, filterStatus, searchTerm]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/user/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setStats(data.stats);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast.error(t('myPosts.toast.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'unpublish' : 'publish';
      const response = await fetch(`/api/user/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar post');
      }

      toast.success(currentStatus ? t('myPosts.toast.unpublished') : t('myPosts.toast.published'));
      fetchPosts();
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      toast.error(t('myPosts.toast.error'));
    }
  };

  const handleToggleFeature = async (postId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'unfeature' : 'feature';
      const response = await fetch(`/api/user/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar post');
      }

      toast.success(currentStatus ? t('myPosts.toast.unfeatured') : t('myPosts.toast.featured'));
      fetchPosts();
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      toast.error(t('myPosts.toast.error'));
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/user/posts/${postToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar post');
      }

      toast.success(t('myPosts.toast.deleted'));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      toast.error(t('myPosts.toast.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: language === 'pt' ? ptBR : enUS
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t('myPosts.backToBlog')}
          </Button>
        </Link>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('myPosts.title')}</h1>
          <p className="text-muted-foreground">
            {t('myPosts.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('myPosts.stats.total')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('myPosts.stats.published')}</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('myPosts.stats.draft')}</CardTitle>
              <EyeOff className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              {t('myPosts.filter.all')}
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('published')}
            >
              {t('myPosts.filter.published')}
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('draft')}
            >
              {t('myPosts.filter.draft')}
            </Button>
          </div>

          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('myPosts.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Novo Post */}
          <Button onClick={() => router.push('/posts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('myPosts.newPost')}
          </Button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('myPosts.noPostsTitle')}</h3>
              <p className="text-muted-foreground mb-4">
                {filterStatus === 'all'
                  ? t('myPosts.noPostsAll')
                  : filterStatus === 'published'
                  ? t('myPosts.noPostsPublished')
                  : t('myPosts.noPostsDraft')}
              </p>
              <Button onClick={() => router.push('/posts/new')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('myPosts.createFirstPost')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col">
                {post.coverImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={post.published ? 'default' : 'secondary'}>
                        {post.published ? t('myPosts.badge.published') : t('myPosts.badge.draft')}
                      </Badge>
                      {post.feature && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {t('myPosts.badge.featured')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  {post.excerpt && (
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map(({ category }) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          style={{
                            borderColor: category.color || undefined,
                            color: category.color || undefined
                          }}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post._count.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post._count.comments}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {post.published && post.publishedAt
                      ? `${t('myPosts.publishedAt')} ${formatDate(post.publishedAt)}`
                      : `${t('myPosts.createdAt')} ${formatDate(post.createdAt)}`}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t('myPosts.button.edit')}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(post.id, post.published)}
                  >
                    {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeature(post.id, post.feature)}
                  >
                    <Star className={`h-4 w-4 ${post.feature ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPostToDelete(post.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myPosts.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myPosts.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('myPosts.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('myPosts.delete.deleting')}
                </>
              ) : (
                t('myPosts.delete.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
