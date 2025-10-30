'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Settings,
  MapPin,
  Briefcase,
  Calendar,
  Link2,
  FileText,
  Heart,
  MessageCircle,
  Twitter,
  Github,
  Linkedin,
  Globe,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  profile: {
    title: string | null;
    company: string | null;
    website: string | null;
    location: string | null;
    socialLinks: any;
  } | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  categories: {
    category: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface Stats {
  posts: number;
  comments: number;
  likes: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ posts: 0, comments: 0, likes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = session?.user?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/profile/${username}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t('profile.notFound'));
          router.push('/blog');
          return;
        }
        throw new Error('Erro ao buscar perfil');
      }

      const data = await response.json();
      setProfile(data.user);
      setPosts(data.posts);
      setStats(data.stats);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error(t('profile.error'));
    } finally {
      setIsLoading(false);
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

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM yyyy', {
      locale: language === 'pt' ? ptBR : enUS
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      'ADMIN': 'destructive',
      'MODERATOR': 'default',
      'EDITOR': 'secondary',
      'WRITER': 'outline',
      'USER': 'outline'
    };
    return variants[role] || 'outline';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Admin',
      'MODERATOR': 'Moderador',
      'EDITOR': 'Editor',
      'WRITER': 'Escritor',
      'USER': 'Usuário'
    };
    return labels[role] || role;
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      'twitter': Twitter,
      'github': Github,
      'linkedin': Linkedin,
      'website': Globe,
      'email': Mail
    };
    return icons[platform.toLowerCase()] || Link2;
  };

  if (isLoading) {
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner + Avatar Section */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Container */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-20 md:-mt-24">
              {/* Botão Voltar */}
              <Link href="/blog">
                <Button variant="ghost" className="gap-2 mb-4 bg-background/80 backdrop-blur-sm">
                  <ArrowLeft className="h-4 w-4" />
                  {t('profile.backToBlog')}
                </Button>
              </Link>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex justify-center md:justify-start">
                      <Avatar className="h-32 w-32 border-4 border-background">
                        <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                        <AvatarFallback className="text-4xl">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                          <p className="text-muted-foreground mb-2">@{profile.username}</p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <Badge variant={getRoleBadgeVariant(profile.role) as any}>
                              {getRoleLabel(profile.role)}
                            </Badge>
                            {profile.profile?.title && (
                              <Badge variant="outline">
                                <Briefcase className="mr-1 h-3 w-3" />
                                {profile.profile.title}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Edit Button */}
                        {isOwnProfile && (
                          <Button onClick={() => router.push('/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            {t('profile.editProfile')}
                          </Button>
                        )}
                      </div>

                      {/* Bio */}
                      {profile.bio && (
                        <p className="text-muted-foreground mb-4">{profile.bio}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                        {profile.profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.profile.location}
                          </div>
                        )}
                        {profile.profile?.company && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {profile.profile.company}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {t('profile.memberSince')} {formatDate(profile.createdAt)}
                        </div>
                      </div>

                      {/* Social Links */}
                      {profile.profile?.socialLinks && Object.keys(profile.profile.socialLinks).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                          {Object.entries(profile.profile.socialLinks).map(([platform, url]) => {
                            const Icon = getSocialIcon(platform);
                            return (
                              <Button
                                key={platform}
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={url as string} target="_blank" rel="noopener noreferrer">
                                  <Icon className="h-4 w-4" />
                                </a>
                              </Button>
                            );
                          })}
                          {profile.profile.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={profile.profile.website} target="_blank" rel="noopener noreferrer">
                                <Link2 className="mr-2 h-4 w-4" />
                                {t('profile.website')}
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.stats.posts')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.posts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.stats.likes')}</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.likes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.stats.comments')}</CardTitle>
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.comments}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="posts">{t('profile.tabs.posts')}</TabsTrigger>
              <TabsTrigger value="about">{t('profile.tabs.about')}</TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('profile.noPosts')}</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile ? t('profile.noPostsOwn') : t('profile.noPostsUser')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
                      {post.coverImage && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      <CardHeader className="flex-1">
                        <CardTitle className="line-clamp-2">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                            {post.title}
                          </Link>
                        </CardTitle>
                        {post.excerpt && (
                          <CardDescription className="line-clamp-2">
                            {post.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.about.title')}</CardTitle>
                  <CardDescription>{t('profile.about.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">{t('profile.about.bio')}</h3>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}

                  {profile.profile && (
                    <div className="space-y-4">
                      {profile.profile.title && (
                        <div>
                          <h3 className="font-semibold mb-1">{t('profile.about.role')}</h3>
                          <p className="text-muted-foreground">{profile.profile.title}</p>
                        </div>
                      )}

                      {profile.profile.company && (
                        <div>
                          <h3 className="font-semibold mb-1">{t('profile.about.company')}</h3>
                          <p className="text-muted-foreground">{profile.profile.company}</p>
                        </div>
                      )}

                      {profile.profile.location && (
                        <div>
                          <h3 className="font-semibold mb-1">{t('profile.about.location')}</h3>
                          <p className="text-muted-foreground">{profile.profile.location}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-1">{t('profile.about.joined')}</h3>
                    <p className="text-muted-foreground">{formatDate(profile.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
