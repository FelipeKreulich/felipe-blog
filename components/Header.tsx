'use client';

import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  showAnimations?: boolean;
  className?: string;
}

export function Header({ showAnimations = true, className = "" }: HeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  const Logo = () => (
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
  );

  const DesktopNav = () => (
    <div className="hidden md:flex items-center space-x-4">
      <ThemeLanguageToggle />
      <Button variant="ghost" size="sm" onClick={() => router.push('/signin')}>
        {t('header.login')}
      </Button>
      <Button size="sm" onClick={() => router.push('/signup')}>
        {t('header.signup')}
      </Button>
    </div>
  );

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="md:hidden"
      onClick={toggleMobileMenu}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="flex justify-center mb-4">
                <ThemeLanguageToggle />
              </div>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    router.push('/signin');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t('header.login')}
                </Button>
                <Button 
                  className="w-full justify-start"
                  onClick={() => {
                    router.push('/signup');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t('header.signup')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const HeaderContent = () => (
    <nav className="flex items-center justify-between relative">
      <Logo />
      <DesktopNav />
      <MobileMenuButton />
      <MobileMenu />
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
