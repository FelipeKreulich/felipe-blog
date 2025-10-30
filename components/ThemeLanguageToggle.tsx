'use client';

import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function ThemeLanguageToggle() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      {/* Language Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
        className="flex items-center space-x-1 cursor-pointer"
      >
        <Globe className="h-4 w-4 cursor-pointer" />
        <span className="text-xs font-medium cursor-pointer">
          {language === 'pt' ? 'PT' : 'EN'}
        </span>
      </Button>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center space-x-1 cursor-pointer"
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4 cursor-pointer" />
        ) : (
          <Sun className="h-4 w-4 cursor-pointer" />
        )}
      </Button>
    </div>
  );
}
