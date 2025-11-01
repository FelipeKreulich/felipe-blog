'use client';

import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, User, LogOut, Settings, FileText, Bookmark, Trophy } from "lucide-react";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import { SearchBar } from "@/components/SearchBar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  showAnimations?: boolean;
  className?: string;
}

export function Header({ showAnimations = true, className = "" }: HeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      {session && <NotificationDropdown />}

        {status === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || ''} />
                  <AvatarFallback className="cursor-pointer">
                    {session.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>{t('header.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/my-posts')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{t('header.myPosts')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/bookmarks')}>
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Bookmarks</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/achievements')}>
              <Trophy className="mr-2 h-4 w-4" />
              <span>Achievements</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('header.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('header.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="ghost" size="sm" onClick={() => router.push('/signin')}>
            {t('header.login')}
          </Button>
          <Button size="sm" onClick={() => router.push('/signup')}>
            {t('header.signup')}
          </Button>
        </>
      )}
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
              {/* Search Bar for Mobile */}
              <SearchBar className="w-full" />

              <div className="flex justify-center mb-4">
                <ThemeLanguageToggle />
              </div>

              {status === 'loading' ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                </div>
              ) : session ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || ''} />
                      <AvatarFallback>
                        {session.user?.name ? getInitials(session.user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t('header.profile')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/my-posts');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('header.myPosts')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/bookmarks');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/achievements');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Achievements
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t('header.settings')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('header.logout')}
                  </Button>
                </div>
              ) : (
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
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const HeaderContent = () => (
    <nav className="flex flex-col gap-4">
      {/* Top Row: Logo and Navigation */}
      <div className="flex items-center justify-between relative">
        <Logo />
        <DesktopNav />
        <MobileMenuButton />
        <MobileMenu />
      </div>

      {/* Search Bar */}
      <div className="hidden md:block">
        <SearchBar className="mx-auto" />
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
