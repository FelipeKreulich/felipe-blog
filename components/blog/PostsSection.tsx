"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
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

export default function PostsSection() {
  const { t } = useLanguage();

  // Mock data - substitua por dados reais do seu CMS/API
  const posts = [
    {
      id: 5,
      title: "React Server Components: O Futuro do React",
      excerpt: "Entenda como os Server Components estão revolucionando a forma como construímos aplicações React.",
      category: "React",
      author: "Felipe Silva",
      readTime: "6 min",
      publishedAt: "2024-01-12",
      image: "/api/placeholder/400/250",
      slug: "react-server-components"
    },
    {
      id: 6,
      title: "CSS Grid vs Flexbox: Quando Usar Cada Um",
      excerpt: "Uma comparação detalhada entre CSS Grid e Flexbox para ajudar você a escolher a melhor opção.",
      category: "CSS",
      author: "Felipe Silva",
      readTime: "5 min",
      publishedAt: "2024-01-10",
      image: "/api/placeholder/400/250",
      slug: "css-grid-vs-flexbox"
    },
    {
      id: 7,
      title: "Microserviços: Arquitetura e Implementação",
      excerpt: "Aprenda os conceitos fundamentais de microserviços e como implementá-los em seus projetos.",
      category: "Arquitetura",
      author: "Felipe Silva",
      readTime: "10 min",
      publishedAt: "2024-01-08",
      image: "/api/placeholder/400/250",
      slug: "microservices-architecture"
    },
    {
      id: 8,
      title: "GraphQL vs REST: Qual Escolher?",
      excerpt: "Compare GraphQL e REST para entender qual tecnologia é melhor para sua API.",
      category: "API",
      author: "Felipe Silva",
      readTime: "7 min",
      publishedAt: "2024-01-05",
      image: "/api/placeholder/400/250",
      slug: "graphql-vs-rest"
    },
    {
      id: 9,
      title: "Docker para Desenvolvedores Frontend",
      excerpt: "Como usar Docker para melhorar seu ambiente de desenvolvimento frontend.",
      category: "DevOps",
      author: "Felipe Silva",
      readTime: "8 min",
      publishedAt: "2024-01-03",
      image: "/api/placeholder/400/250",
      slug: "docker-frontend-developers"
    },
    {
      id: 10,
      title: "Testes Automatizados: Estratégias e Ferramentas",
      excerpt: "Descubra as melhores práticas para implementar testes automatizados em seus projetos.",
      category: "Testes",
      author: "Felipe Silva",
      readTime: "9 min",
      publishedAt: "2024-01-01",
      image: "/api/placeholder/400/250",
      slug: "automated-testing-strategies"
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
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
            >
              <Card className="overflow-hidden group cursor-pointer h-full">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{post.publishedAt}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        {t('blog.readMore')}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          variants={fadeInUp}
        >
          <Button variant="outline" size="lg" className="px-8">
            {t('blog.loadMore')}
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
