'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, Settings, BarChart3, Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieSettings } from "@/components/CookieSettings";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();
  const { isFirstVisit, acceptAll, declineAll, isLoaded } = useCookieConsent();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Show popup on first visit after a short delay
    if (isLoaded && isFirstVisit()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isFirstVisit]);

  const handleAccept = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleDecline = () => {
    declineAll();
    setIsVisible(false);
  };

  const handleSettings = () => {
    setIsSettingsOpen(true);
  };

  // Don't render anything until we're on the client side
  if (!isClient) return null;
  
  // Don't show if user has already made a choice
  if (!isFirstVisit()) return null;

  return (
    <>
      <CookieSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleDecline}
            />

            {/* Cookie Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-50"
            >
              <Card className="p-4 shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Cookie className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {t('cookies.title')}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t('cookies.subtitle')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDecline}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('cookies.description')}
                  </p>

                  {/* Cookie Types */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <Shield className="h-3 w-3 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{t('cookies.essential.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('cookies.essential.description')}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{t('cookies.always')}</div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <Settings className="h-3 w-3 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{t('cookies.preferences.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('cookies.preferences.description')}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{t('cookies.optional')}</div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <BarChart3 className="h-3 w-3 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{t('cookies.analytics.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('cookies.analytics.description')}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{t('cookies.optional')}</div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <Megaphone className="h-3 w-3 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{t('cookies.marketing.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('cookies.marketing.description')}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{t('cookies.optional')}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSettings}
                    className="flex-1 text-xs h-8"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    {t('cookies.settings')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 text-xs h-8"
                  >
                    {t('cookies.decline')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 text-xs h-8"
                  >
                    {t('cookies.accept')}
                  </Button>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    {t('cookies.footer')}
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
