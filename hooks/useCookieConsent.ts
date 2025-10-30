'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  accepted: boolean;
  preferences: CookiePreferences;
  timestamp: number;
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Load consent from localStorage
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
      } catch {
        // Fallback for old format
        setConsent({
          accepted: savedConsent === 'accepted',
          preferences: {
            essential: true,
            preferences: savedConsent === 'accepted',
            analytics: false,
            marketing: false,
          },
          timestamp: Date.now(),
        });
      }
    }
    setIsLoaded(true);
  }, []);

  const acceptAll = () => {
    if (typeof window === 'undefined') return;
    
    const newConsent: CookieConsent = {
      accepted: true,
      preferences: {
        essential: true,
        preferences: true,
        analytics: true,
        marketing: true,
      },
      timestamp: Date.now(),
    };
    setConsent(newConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
  };

  const declineAll = () => {
    if (typeof window === 'undefined') return;
    
    const newConsent: CookieConsent = {
      accepted: false,
      preferences: {
        essential: true, // Essential cookies are always required
        preferences: false,
        analytics: false,
        marketing: false,
      },
      timestamp: Date.now(),
    };
    setConsent(newConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
  };

  const updatePreferences = (preferences: Partial<CookiePreferences>) => {
    if (typeof window === 'undefined') return;

    // Se não existe consent ainda, criar um novo
    const currentConsent = consent || {
      accepted: false,
      preferences: {
        essential: true,
        preferences: false,
        analytics: false,
        marketing: false,
      },
      timestamp: Date.now(),
    };

    const newConsent: CookieConsent = {
      ...currentConsent,
      accepted: true, // Marcar como aceito quando preferências são atualizadas
      preferences: {
        ...currentConsent.preferences,
        ...preferences,
      },
      timestamp: Date.now(),
    };
    setConsent(newConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
  };

  const hasConsent = (type: keyof CookiePreferences) => {
    return consent?.preferences[type] ?? false;
  };

  const isFirstVisit = () => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('cookieConsent');
  };

  const clearConsent = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cookieConsent');
    setConsent(null);
  };

  return {
    consent,
    isLoaded,
    acceptAll,
    declineAll,
    updatePreferences,
    hasConsent,
    isFirstVisit,
    clearConsent,
  };
}
