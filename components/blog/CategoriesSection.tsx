"use client";

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
  Layers
} from "lucide-react";
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

const badgeHover = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

export default function CategoriesSection() {
  const { t } = useLanguage();

  const categories = [
    { name: "Desenvolvimento Web", icon: Globe, color: "bg-blue-500", count: 12 },
    { name: "Frontend", icon: Code, color: "bg-green-500", count: 8 },
    { name: "Backend", icon: Database, color: "bg-purple-500", count: 6 },
    { name: "Mobile", icon: Smartphone, color: "bg-pink-500", count: 4 },
    { name: "Design", icon: Palette, color: "bg-orange-500", count: 7 },
    { name: "Performance", icon: Zap, color: "bg-yellow-500", count: 5 },
    { name: "Segurança", icon: Shield, color: "bg-red-500", count: 3 },
    { name: "Analytics", icon: BarChart3, color: "bg-indigo-500", count: 2 },
    { name: "DevOps", icon: Cpu, color: "bg-teal-500", count: 4 },
    { name: "Arquitetura", icon: Layers, color: "bg-gray-500", count: 3 }
  ];

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
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.name}
                variants={badgeHover}
                whileHover="hover"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  variant="secondary" 
                  className="px-4 py-3 text-sm font-medium cursor-pointer group hover:shadow-md transition-all duration-200 bg-card border-2 hover:border-primary/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${category.color} text-white`}>
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
