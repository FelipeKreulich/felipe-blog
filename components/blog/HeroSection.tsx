"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

// Removed cardHover variants - using whileHover directly

export default function HeroSection() {
  const { t } = useLanguage();

  // Mock data - substitua por dados reais do seu CMS/API
  const featuredPost = {
    id: 1,
    title: "Como Construir Aplicações Web Modernas com Next.js 15",
    excerpt: "Descubra as principais funcionalidades e melhorias da nova versão do Next.js, incluindo Server Components, App Router e otimizações de performance.",
    category: "Desenvolvimento Web",
    author: "Felipe Silva",
    readTime: "8 min",
    publishedAt: "2024-01-15",
    image: "/api/placeholder/800/400",
    slug: "nextjs-15-guide"
  };

  const highlights = [
    {
      id: 2,
      title: "TypeScript vs JavaScript: Quando Usar Cada Um",
      excerpt: "Uma análise completa das diferenças entre TypeScript e JavaScript para ajudar você a escolher a melhor opção para seu projeto.",
      category: "Tecnologia",
      slug: "typescript-vs-javascript"
    },
    {
      id: 3,
      title: "Design System: Criando Consistência Visual",
      excerpt: "Aprenda como criar e implementar um design system eficiente que melhora a experiência do usuário e acelera o desenvolvimento.",
      category: "Design",
      slug: "design-system-guide"
    },
    {
      id: 4,
      title: "Performance Web: Técnicas de Otimização",
      excerpt: "Explore as melhores práticas para otimizar a performance de suas aplicações web e melhorar a experiência do usuário.",
      category: "Performance",
      slug: "web-performance-optimization"
    }
  ];

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
              <Card className="overflow-hidden group cursor-pointer">
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {featuredPost.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:text-blue-600 transition-colors">
                    {featuredPost.title}
                  </h1>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{featuredPost.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Destaques */}
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
                  <Card className="cursor-pointer group">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
