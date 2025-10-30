"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Palette,
  Database,
  Smartphone,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Cpu,
  Layers,
  Loader2,
  Tag
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/types/category";

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

// Mapa de ícones baseado no nome da categoria
const iconMap: Record<string, any> = {
  'web': Globe,
  'desenvolvimento': Globe,
  'frontend': Code,
  'backend': Database,
  'mobile': Smartphone,
  'design': Palette,
  'performance': Zap,
  'seguranca': Shield,
  'segurança': Shield,
  'analytics': BarChart3,
  'devops': Cpu,
  'arquitetura': Layers,
  'default': Tag
};

// Função para obter ícone baseado no nome da categoria
const getIconForCategory = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();
  for (const key in iconMap) {
    if (lowerName.includes(key)) {
      return iconMap[key];
    }
  }
  return iconMap.default;
};

export default function CategoriesSection() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');

      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }

      const data = await response.json();
      // Exibir todas as categorias (mesmo sem posts)
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="py-16 px-4 bg-muted/30"
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
            {t('blog.categories')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('blog.categoriesDescription')}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          variants={staggerContainer}
        >
          {categories.map((category, index) => {
            const IconComponent = getIconForCategory(category.name);
            const bgColor = category.color || '#3b82f6';

            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }}
              >
                <Badge
                  variant="secondary"
                  className="px-4 py-3 text-sm font-medium cursor-pointer group hover:shadow-md transition-all duration-200 bg-card border-2 hover:border-primary/20"
                  onClick={() => window.location.href = `/blog?category=${category.slug}`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="p-1 rounded-full text-white"
                      style={{ backgroundColor: bgColor }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
