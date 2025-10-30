"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, ArrowRight, Loader2, Heart, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PostListItem, PostsResponse } from "@/types/post";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Função para calcular tempo de leitura baseado no conteúdo
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

export default function PostsSection() {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`/api/posts?page=${pageNum}&pageSize=6`);

      if (!response.ok) {
        throw new Error('Erro ao buscar posts');
      }

      const data: PostsResponse = await response.json();

      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchPosts(page + 1, true);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const locale = language === 'pt' ? ptBR : enUS;
    return format(new Date(date), 'dd MMM yyyy', { locale });
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      className="py-16 px-4"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('blog.allPosts')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('blog.allPostsDescription')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {posts.map((post, index) => {
            const firstCategory = post.categories[0]?.category;
            const categoryColor = firstCategory?.color || '#3b82f6';

            return (
              <motion.div
                key={post.id}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <Card className="overflow-hidden group cursor-pointer h-full">
                  {/* Cover Image ou Gradient */}
                  <div
                    className="relative h-48"
                    style={{
                      background: post.coverImage
                        ? `url(${post.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* Category Badge */}
                    {firstCategory && (
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-gray-900"
                        >
                          {firstCategory.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-grow">
                      {post.excerpt || t('blog.noDescription')}
                    </p>

                    <div className="space-y-3">
                      {/* Author and Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span className="truncate">{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {post._count && (
                            <>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{post._count.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post._count.comments}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date and Read More */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          onClick={() => window.location.href = `/blog/${post.slug}`}
                        >
                          {t('blog.readMore')}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Load More Button */}
        {page < totalPages && (
          <motion.div
            className="text-center mt-12"
            variants={fadeInUp}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('blog.loading')}
                </>
              ) : (
                t('blog.loadMore')
              )}
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <motion.div
            className="text-center py-12"
            variants={fadeInUp}
          >
            <p className="text-muted-foreground text-lg">
              {t('blog.noPosts')}
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
