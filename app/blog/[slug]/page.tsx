'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  Edit,
  Send,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { ReportButton } from '@/components/blog/ReportButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { SafeHtml } from '@/components/SafeHtml';
import { ReactionButton } from '@/components/reactions/ReactionButton';

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const [post, setPost] = useState<any>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/slug/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Post não encontrado');
          router.push('/blog');
          return;
        }
        throw new Error('Erro ao carregar post');
      }

      const data = await response.json();
      setPost(data.post);
      setHasLiked(data.hasLiked || false);
    } catch (error: any) {
      console.error('Erro ao buscar post:', error);
      toast.error('Erro ao carregar post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) {
      toast.error('Faça login para curtir posts');
      router.push('/signin');
      return;
    }

    try {
      setIsLiking(true);
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      });

      if (!response.ok) throw new Error('Erro ao curtir');

      const data = await response.json();
      setHasLiked(data.liked);

      // Atualizar contagem de likes
      setPost({
        ...post,
        _count: {
          ...post._count,
          likes: data.liked
            ? (post._count.likes || 0) + 1
            : Math.max(0, (post._count.likes || 0) - 1)
        }
      });
    } catch (error) {
      toast.error('Erro ao curtir post');
    } finally {
      setIsLiking(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.id) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!session) {
      toast.error('Faça login para comentar');
      router.push('/signin');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (!response.ok) throw new Error('Erro ao comentar');

      toast.success('Comentário enviado!');
      setNewComment('');
      await fetchComments();

      // Atualizar contagem
      setPost({
        ...post,
        _count: {
          ...post._count,
          comments: (post._count.comments || 0) + 1
        }
      });
    } catch (error) {
      toast.error('Erro ao enviar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast.error('Faça login para responder');
      router.push('/signin');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId })
      });

      if (!response.ok) throw new Error('Erro ao responder');

      toast.success('Resposta enviada!');
      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao deletar');

      toast.success('Comentário deletado');
      await fetchComments();

      // Atualizar contagem
      setPost({
        ...post,
        _count: {
          ...post._count,
          comments: Math.max(0, (post._count.comments || 0) - 1)
        }
      });
    } catch (error) {
      toast.error('Erro ao deletar comentário');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canEdit = post && session?.user && (
    post.authorId === session.user.id ||
    ['EDITOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)
  );

  useEffect(() => {
    fetchPost();
  }, [slug]);

  // Registra visualização do post
  useEffect(() => {
    if (post?.id) {
      const trackView = async () => {
        try {
          await fetch(`/api/posts/${post.id}/view`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Erro ao registrar visualização:', error);
        }
      };

      trackView();
    }
  }, [post?.id]);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

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

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>

            {/* Post Meta */}
            <div className="max-w-4xl mx-auto">
              {/* Categories */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map(({ category }: any) => (
                    <Link key={category.id} href={`/blog?category=${category.slug}`}>
                      <Badge
                        style={{
                          backgroundColor: category.color || '#6b7280',
                          color: 'white'
                        }}
                        className="hover:opacity-80 cursor-pointer"
                      >
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">
                  {post.excerpt}
                </p>
              )}

              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Link href={`/profile/${post.author.username}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                      <AvatarFallback>
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author.name}</p>
                      {post.author.profile?.title && (
                        <p className="text-sm text-muted-foreground">
                          {post.author.profile.title}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                <Separator orientation="vertical" className="h-12" />

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.publishedAt || post.createdAt), 'dd MMM yyyy', {
                      locale: language === 'pt' ? ptBR : enUS
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {Math.ceil(post.content.length / 1000)} min
                  </div>
                </div>

                {canEdit && (
                  <>
                    <Separator orientation="vertical" className="h-12" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/posts/${post.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </>
                )}
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant={hasLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {post._count.likes || 0}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post._count.comments || 0}
                </Button>

                {/* Bookmark Button */}
                <BookmarkButton postId={post.id} size="sm" showText={false} />

                {/* Report Button */}
                {session && session.user.id !== post.authorId && (
                  <ReportButton postId={post.id} />
                )}
              </div>

              {/* Reactions */}
              <div className="mt-4">
                <ReactionButton postId={post.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="container mx-auto px-4 -mt-8 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <SafeHtml html={post.content} />
            </article>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(({ tag }: any) => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-8 pt-6 border-t">
              <ShareButtons
                url={typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_APP_URL || 'https://kreulich-blog.vercel.app'}/blog/${post.slug}`}
                title={post.title}
              />
            </div>

            {/* Comments Section */}
            <div className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">
                Comentários ({comments.length})
              </h2>

              {/* New Comment Form */}
              {session ? (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                        <AvatarFallback>
                          {getInitials(session.user.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Deixe seu comentário..."
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSubmitComment}
                            disabled={isSubmittingComment || !newComment.trim()}
                          >
                            {isSubmittingComment ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Comentar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Faça login para comentar
                    </p>
                    <Button onClick={() => router.push('/signin')}>
                      Fazer Login
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        {/* Comment Header */}
                        <div className="flex items-start gap-4">
                          <Link href={`/profile/${comment.author.username}`}>
                            <Avatar className="cursor-pointer">
                              <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
                              <AvatarFallback>
                                {getInitials(comment.author.name)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <Link href={`/profile/${comment.author.username}`}>
                                  <p className="font-semibold hover:underline cursor-pointer">
                                    {comment.author.name}
                                  </p>
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(comment.createdAt), 'dd MMM yyyy, HH:mm', {
                                    locale: language === 'pt' ? ptBR : enUS
                                  })}
                                </p>
                              </div>
                              {session?.user && (
                                comment.authorId === session.user.id ||
                                ['MODERATOR', 'ADMIN'].includes(session.user.role)
                              ) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

                            {session && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(comment.id)}
                              >
                                Responder
                              </Button>
                            )}

                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <div className="mt-4 pl-4 border-l-2">
                                <Textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Escreva sua resposta..."
                                  className="mb-2"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitReply(comment.id)}
                                    disabled={!replyContent.trim()}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent('');
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 space-y-4 pl-4 border-l-2">
                                {comment.replies.map((reply: any) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <Link href={`/profile/${reply.author.username}`}>
                                      <Avatar className="h-8 w-8 cursor-pointer">
                                        <AvatarImage src={reply.author.avatar || undefined} alt={reply.author.name} />
                                        <AvatarFallback>
                                          {getInitials(reply.author.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <Link href={`/profile/${reply.author.username}`}>
                                            <p className="text-sm font-semibold hover:underline cursor-pointer">
                                              {reply.author.name}
                                            </p>
                                          </Link>
                                          <p className="text-xs text-muted-foreground">
                                            {format(new Date(reply.createdAt), 'dd MMM yyyy, HH:mm', {
                                              locale: language === 'pt' ? ptBR : enUS
                                            })}
                                          </p>
                                        </div>
                                        {session?.user && (
                                          reply.authorId === session.user.id ||
                                          ['MODERATOR', 'ADMIN'].includes(session.user.role)
                                        ) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComment(reply.id)}
                                          >
                                            <Trash2 className="h-3 w-3 text-red-600" />
                                          </Button>
                                        )}
                                      </div>
                                      <p className="text-sm whitespace-pre-wrap mt-1">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
