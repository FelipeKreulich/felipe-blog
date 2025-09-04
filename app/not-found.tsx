'use client';

import { Button } from "@/components/ui/button";
import { BookOpen, Home, Search, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetaTags } from "@/hooks/useMetaTags";
import Link from "next/link";

export default function NotFound() {
  const { t } = useLanguage();
  useMetaTags();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header showAnimations={false} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-muted-foreground/20 select-none">
              404
            </h1>
          </div>

          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-4">
            {t('404.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-4">
            {t('404.subtitle')}
          </p>

          {/* Description */}
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">
            {t('404.description')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                {t('404.backHome')}
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="group">
                <BookOpen className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                {t('404.exploreBlog')}
              </Button>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground">Blog</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Search className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-muted-foreground">Search</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer showAnimations={false} />

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-50 dark:bg-purple-950/20 rounded-full blur-3xl opacity-30" />
      </div>
    </div>
  );
}
