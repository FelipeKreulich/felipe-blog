'use client';

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showAnimations?: boolean;
  className?: string;
}

export function Header({ showAnimations = true, className = "" }: HeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const HeaderContent = () => (
    <nav className="flex items-center justify-between">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        {showAnimations ? (
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="text-2xl font-bold">{t('header.blogName')}</span>
          </motion.div>
        ) : (
          <>
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">{t('header.blogName')}</span>
          </>
        )}
      </Link>
      <div className="flex items-center space-x-4">
        <ThemeLanguageToggle />
        <Button variant="ghost" size="sm" onClick={() => router.push('/signin')}>
          {t('header.login')}
        </Button>
        <Button size="sm" onClick={() => router.push('/signup')}>
          {t('header.signup')}
        </Button>
      </div>
    </nav>
  );

  if (showAnimations) {
    return (
      <motion.header 
        className={`container mx-auto px-4 py-6 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderContent />
      </motion.header>
    );
  }

  return (
    <header className={`container mx-auto px-4 py-6 ${className}`}>
      <HeaderContent />
    </header>
  );
}
