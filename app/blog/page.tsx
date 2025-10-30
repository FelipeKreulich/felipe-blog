"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroSection from "@/components/blog/HeroSection";
import CategoriesSection from "@/components/blog/CategoriesSection";
import PostsSection from "@/components/blog/PostsSection";
import TopWritersSection from "@/components/blog/TopWritersSection";
import NewsletterSection from "@/components/blog/NewsletterSection";
import { useMetaTags } from "@/hooks/useMetaTags";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function BlogPage() {
  useMetaTags();

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <Header showAnimations={true} />
      
      <main>
        <HeroSection />
        <CategoriesSection />
        <TopWritersSection />
        <PostsSection />
        <NewsletterSection />
      </main>
      
      <Footer showAnimations={true} />
    </motion.div>
  );
}
