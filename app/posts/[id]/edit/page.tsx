'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { TipTapEditor } from '@/components/editor/TipTapEditor';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    fetchData();
  }, [status, postId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Buscar post
      const postRes = await fetch(`/api/posts/${postId}`);
      if (!postRes.ok) {
        if (postRes.status === 404) {
          toast.error('Post não encontrado');
          router.push('/my-posts');
          return;
        }
        if (postRes.status === 403) {
          toast.error('Você não tem permissão para editar este post');
          router.push('/my-posts');
          return;
        }
        throw new Error('Erro ao carregar post');
      }

      const postData = await postRes.json();
      const post = postData.post;

      setTitle(post.title);
      setExcerpt(post.excerpt || '');
      setContent(post.content);
      setCoverImage(post.coverImage || '');
      setPublished(post.published);
      setSelectedCategories(post.categories.map((c: any) => c.category.id));
      setTags(post.tags.map((t: any) => t.tag.name));

      // Buscar categorias
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar post');
      router.push('/my-posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!content.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      setIsSaving(true);

      const updateData: any = {
        title,
        excerpt: excerpt.trim() || null,
        content,
        coverImage: coverImage || null,
        categoryIds: selectedCategories,
        tags: tags
      };

      if (shouldPublish !== undefined) {
        updateData.published = shouldPublish;
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar post');
      }

      toast.success('Post atualizado com sucesso!');
      router.push('/my-posts');
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      toast.error(error.message || 'Erro ao salvar post');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/my-posts')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold">Editar Post</h1>
            <p className="text-muted-foreground">Faça alterações no seu artigo</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
            {!published && (
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Publicar
              </Button>
            )}
            {published && (
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                Despublicar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="title" className="text-base font-semibold">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do post..."
                  className="text-2xl font-bold h-auto py-3 mt-2"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/200 caracteres
                </p>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="excerpt" className="text-base font-semibold">
                  Resumo
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve resumo do post (aparecerá nos cards)..."
                  className="mt-2 min-h-[100px]"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {excerpt.length}/300 caracteres
                </p>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="content" className="text-base font-semibold">
                  Conteúdo *
                </Label>
                <div className="mt-2">
                  <TipTapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Escreva o conteúdo do seu post aqui..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Imagem de Capa</CardTitle>
                <CardDescription>URL da imagem de capa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                />
                {coverImage && (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                      onError={() => setCoverImage('')}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setCoverImage('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categorias</CardTitle>
                <CardDescription>Selecione as categorias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Badge
                        style={{
                          backgroundColor: category.color || '#6b7280',
                          color: 'white'
                        }}
                      >
                        {category.name}
                      </Badge>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
                <CardDescription>Adicione tags ao post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Digite uma tag..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Adicionar
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
