'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cookie, Shield, Settings, BarChart3, Megaphone, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent, CookiePreferences } from "@/hooks/useCookieConsent";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const { t } = useLanguage();
  const { consent, updatePreferences } = useCookieConsent();
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    preferences: consent?.preferences.preferences ?? false,
    analytics: consent?.preferences.analytics ?? false,
    marketing: consent?.preferences.marketing ?? false,
  });

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    updatePreferences(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleDeclineAll = () => {
    setPreferences({
      essential: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Cookie className="h-5 w-5" />
            <span>{t('cookies.settings')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {t('cookies.settingsDescription')}
          </p>

          {/* Cookie Types */}
          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{t('cookies.essential.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('cookies.essential.description')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={preferences.essential} disabled />
                <span className="text-xs text-muted-foreground">{t('cookies.always')}</span>
              </div>
            </div>

            {/* Preference Cookies */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{t('cookies.preferences.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('cookies.preferences.description')}</p>
                </div>
              </div>
              <Switch 
                checked={preferences.preferences} 
                onCheckedChange={() => handleToggle('preferences')}
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">{t('cookies.analytics.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('cookies.analytics.description')}</p>
                </div>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={() => handleToggle('analytics')}
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Megaphone className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{t('cookies.marketing.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('cookies.marketing.description')}</p>
                </div>
              </div>
              <Switch 
                checked={preferences.marketing} 
                onCheckedChange={() => handleToggle('marketing')}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
              {t('cookies.acceptAll')}
            </Button>
            <Button variant="outline" onClick={handleDeclineAll} className="flex-1">
              {t('cookies.declineAll')}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t('cookies.cancel')}
            </Button>
            <Button onClick={handleSave} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{t('cookies.save')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
