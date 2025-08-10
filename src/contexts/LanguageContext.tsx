'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslations, getBrowserLanguage, Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get language from localStorage or browser
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = getBrowserLanguage();
    
    setLanguage(savedLanguage || browserLanguage);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = getTranslations(language);

  if (!mounted) {
    // Return loading state with default language
    return (
      <LanguageContext.Provider value={{
        language: 'de',
        setLanguage: handleSetLanguage,
        t: getTranslations('de')
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;