'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieSettings } from "@/components/CookieSettings";

export function CookieBanner() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();
  const { consent, isFirstVisit } = useCookieConsent();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  
  if (isFirstVisit()) return null;

  if (!consent) return null;

  return (
    <>
      <CookieSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
          >
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cookie className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('cookies.banner.text')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-8 px-2 text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    {t('cookies.settings')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
