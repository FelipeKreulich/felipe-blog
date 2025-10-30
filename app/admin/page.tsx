'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Loader2,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Folder,
  Tag,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Star,
  Search,
  Plus,
  Shield,
  AlertTriangle,
  Terminal,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewsletterTab } from '@/components/admin/NewsletterTab';

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // States para gerenciamento
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6'
  });

  // Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [logLevel, setLogLevel] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [clearLogsDialogOpen, setClearLogsDialogOpen] = useState(false);
  const [clearLogsType, setClearLogsType] = useState<'all' | 'filtered'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (!hash) {
      toast.error('Hash não fornecida');
      router.push('/blog');
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      toast.error('Acesso negado - você não é um administrador');
      router.push('/blog');
      return;
    }

    fetchData();
  }, [status, session, hash]);

  // Buscar logs quando filtros mudarem
  useEffect(() => {
    if (activeTab === 'logs' && hash) {
      fetchLogs();
    }
  }, [logLevel, logSearch, activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Buscar stats
      const statsResponse = await fetch(`/api/admin/stats?hash=${hash}`);
      if (!statsResponse.ok) throw new Error('Erro ao buscar estatísticas');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Buscar users
      const usersResponse = await fetch(`/api/admin/users?hash=${hash}&pageSize=100`);
      if (!usersResponse.ok) throw new Error('Erro ao buscar usuários');
      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Buscar posts
      const postsResponse = await fetch(`/api/admin/posts?hash=${hash}&pageSize=100`);
      if (!postsResponse.ok) throw new Error('Erro ao buscar posts');
      const postsData = await postsResponse.json();
      setPosts(postsData.posts);

      // Buscar categories
      const categoriesResponse = await fetch(`/api/admin/categories?hash=${hash}`);
      if (!categoriesResponse.ok) throw new Error('Erro ao buscar categorias');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories);

      // Buscar logs (inicialmente)
      await fetchLogs();

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados');
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        hash: hash || '',
        pageSize: '100'
      });

      if (logLevel) params.append('level', logLevel);
      if (logSearch) params.append('search', logSearch);

      const logsResponse = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!logsResponse.ok) throw new Error('Erro ao buscar logs');
      const logsData = await logsResponse.json();
      setLogs(logsData.logs);
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Erro ao carregar logs');
    }
  };

  const handleClearLogs = async () => {
    try {
      setIsDeleting(true);

      const body: { deleteAll: boolean; level?: string } = { deleteAll: clearLogsType === 'all' };

      if (clearLogsType === 'filtered') {
        if (logLevel) body.level = logLevel;
      }

      const response = await fetch(`/api/admin/logs?hash=${hash}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Erro ao limpar logs');

      const data = await response.json();
      toast.success(`${data.deletedCount} log(s) deletado(s)`);
      await fetchLogs();
    } catch (error) {
      toast.error('Erro ao limpar logs');
    } finally {
      setIsDeleting(false);
      setClearLogsDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      const endpoint = `/api/admin/${itemToDelete.type}/${itemToDelete.id}?hash=${hash}`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar');
      }

      toast.success('Deletado com sucesso');
      fetchData();
    } catch {
      toast.error('Erro ao deletar');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleTogglePost = async (postId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}?hash=${hash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      toast.success('Atualizado com sucesso');
      fetchData();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleChangeUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}?hash=${hash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (!response.ok) throw new Error('Erro ao atualizar role');

      toast.success('Role atualizada com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar role');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/categories?hash=${hash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar categoria');
      }

      toast.success('Categoria criada com sucesso');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', slug: '', description: '', color: '#3b82f6' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', {
      locale: language === 'pt' ? ptBR : enUS
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  if (!stats) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie todos os aspectos do blog</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Usuários ({stats.overview.totalUsers})
          </Button>
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Posts ({stats.overview.totalPosts})
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="gap-2"
          >
            <Folder className="h-4 w-4" />
            Categorias ({stats.overview.totalCategories})
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('logs')}
            className="gap-2"
          >
            <Terminal className="h-4 w-4" />
            Logs ({logs.length})
          </Button>
          <Button
            variant={activeTab === 'newsletter' ? 'default' : 'outline'}
            onClick={() => setActiveTab('newsletter')}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Newsletter
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overview.publishedPosts} publicados, {stats.overview.draftPosts} rascunhos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overview.totalLikes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comentários</CardTitle>
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.overview.totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overview.pendingComments} pendentes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Authors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Autores</CardTitle>
                <CardDescription>Usuários com mais posts publicados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topAuthors.map((author: any, index: number) => (
                    <div key={author.id} className="flex items-center gap-4">
                      <div className="font-bold text-muted-foreground w-6">#{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={author.avatar || undefined} />
                        <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{author.name}</p>
                        <p className="text-sm text-muted-foreground">@{author.username}</p>
                      </div>
                      <Badge>{author._count.posts} posts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Posts Mais Curtidos</CardTitle>
                <CardDescription>Top 5 posts com mais engajamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topPosts.map((post: any, index: number) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <div className="font-bold text-muted-foreground w-6">#{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground">por {post.author.name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <Heart className="h-4 w-4" />
                        {post._count.likes}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(user =>
                      searchTerm === '' ||
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.username.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(role) => handleChangeUserRole(user.id, role)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">User</SelectItem>
                              <SelectItem value="WRITER">Writer</SelectItem>
                              <SelectItem value="EDITOR">Editor</SelectItem>
                              <SelectItem value="MODERATOR">Moderator</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{user._count.posts}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setItemToDelete({ type: 'users', id: user.id });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts
                    .filter(post =>
                      searchTerm === '' ||
                      post.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            {post.categories.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.categories.slice(0, 2).map(({ category }: any) => (
                                  <Badge key={category.id} variant="outline" className="text-xs">
                                    {category.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.author.avatar || undefined} />
                              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{post.author.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={post.published ? 'default' : 'secondary'}>
                              {post.published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            {post.feature && (
                              <Badge variant="outline">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post._count.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post._count.comments}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePost(post.id, post.published ? 'unpublish' : 'publish')}
                            >
                              {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePost(post.id, post.feature ? 'unfeature' : 'feature')}
                            >
                              <Star className={`h-4 w-4 ${post.feature ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ type: 'posts', id: post.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowCategoryForm(!showCategoryForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </div>

            {showCategoryForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Nova Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="Tecnologia"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          placeholder="tecnologia"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Input
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Artigos sobre tecnologia..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cor</label>
                      <Input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Criar</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: category.color || '#ccc' }}
                          />
                          <span className="text-sm">{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category._count.posts}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete({ type: 'categories', id: category.id });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-2">
                  <Select value={logLevel || undefined} onValueChange={(value) => setLogLevel(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Todos os níveis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEBUG">DEBUG</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                      <SelectItem value="WARN">WARN</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                    </SelectContent>
                  </Select>
                  {logLevel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogLevel('')}
                    >
                      Limpar filtro
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setClearLogsType('all');
                    setClearLogsDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Logs
                </Button>
              </div>
            </div>

            {/* Tabela de Logs */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Nível</TableHead>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[150px]">Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum log encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant={
                              log.level === 'ERROR' ? 'destructive' :
                              log.level === 'WARN' ? 'default' :
                              log.level === 'INFO' ? 'secondary' :
                              'outline'
                            }
                            className={
                              log.level === 'WARN' ? 'bg-yellow-600 hover:bg-yellow-700' : ''
                            }
                          >
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                            locale: language === 'pt' ? ptBR : enUS
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-2xl">
                            <p className="text-sm font-mono break-words">{log.message}</p>
                            {log.context && (
                              <details className="mt-1">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:underline">
                                  Ver contexto
                                </summary>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log.context, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.source || 'N/A'}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && hash && (
          <div className="space-y-6">
            {/* Dynamic import para evitar carregar componente pesado */}
            {typeof window !== 'undefined' && (
              <NewsletterTab adminHash={hash} />
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Tem certeza?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O item será permanentemente deletado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Logs Dialog */}
      <AlertDialog open={clearLogsDialogOpen} onOpenChange={setClearLogsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Limpar Logs
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja limpar os logs? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLogs}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando...
                </>
              ) : (
                'Limpar Logs'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
