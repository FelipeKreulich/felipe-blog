"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User, Heart, MessageCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PostListItem } from "@/types/post";
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

export default function HeroSection() {
  const { t, language } = useLanguage();
  const [featuredPosts, setFeaturedPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      setIsLoading(true);

      // Usar nova API endpoint de featured posts
      // Ela busca: posts featured > posts mais curtidos > posts recentes
      const response = await fetch('/api/posts/featured?limit=4');

      if (!response.ok) {
        throw new Error('Erro ao buscar posts em destaque');
      }

      const data = await response.json();
      setFeaturedPosts(data.posts || []);
    } catch (error) {
      console.error('Erro ao buscar posts em destaque:', error);
    } finally {
      setIsLoading(false);
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

  if (featuredPosts.length === 0) {
    return null;
  }

  const mainPost = featuredPosts[0];
  const highlights = featuredPosts.slice(1, 4);

  return (
    <motion.section 
      className="py-16 px-4"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Post Principal */}
          <motion.div
            className="lg:col-span-2"
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card
                className="overflow-hidden group cursor-pointer"
                onClick={() => window.location.href = `/blog/${mainPost.slug}`}
              >
                <div
                  className="relative h-64 md:h-80"
                  style={{
                    background: mainPost.coverImage
                      ? `url(${mainPost.coverImage}) center/cover`
                      : `linear-gradient(135deg, ${mainPost.categories[0]?.category.color || '#3b82f6'}, ${mainPost.categories[0]?.category.color || '#3b82f6'}dd)`
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  {mainPost.categories[0] && (
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900">
                        {mainPost.categories[0].category.name}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:text-blue-600 transition-colors">
                    {mainPost.title}
                  </h1>
                  <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                    {mainPost.excerpt || t('blog.noDescription')}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{mainPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(mainPost.publishedAt)}</span>
                      </div>
                    </div>
                    {mainPost._count && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{mainPost._count.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{mainPost._count.comments}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Destaques */}
          {highlights.length > 0 && (
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('blog.highlights')}
              </h2>
              <div className="space-y-4">
                {highlights.map((post, index) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                  >
                    <Card
                      className="cursor-pointer group"
                      onClick={() => window.location.href = `/blog/${post.slug}`}
                    >
                      <CardContent className="p-4">
                        {post.categories[0] && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {post.categories[0].category.name}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt || t('blog.noDescription')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
