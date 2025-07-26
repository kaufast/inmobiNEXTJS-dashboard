import { useToast } from '@/hooks/use-toast';
import { LanguageCode } from '@/types/language';
import React from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";

// Language interface
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

// Display all languages in the UI
export const LANGUAGES: Language[] = [
  { code: "en-GB", name: "U.K.", nativeName: "U.K.", flag: "🇬🇧" },
  { code: "ca-ES", name: "Català", nativeName: "Català", flag: "🎗️" },
  { code: "en-US", name: "USA", nativeName: "U.S.", flag: "🇺🇸" },
  { code: "es-MX", name: "Mexico", nativeName: "México", flag: "🇲🇽" },
  { code: "es-ES", name: "España", nativeName: "España", flag: "🇪🇸" },
  { code: "de-AT", name: "Österreich", nativeName: "Österreich", flag: "🇦🇹" },
  { code: "de-DE", name: "Deutschland", nativeName: "Deutschland", flag: "🇩🇪" },
  { code: "fr-FR", name: "France", nativeName: "Français", flag: "🇫🇷" },
];

const DEFAULT_LANGUAGE: LanguageCode = "en-GB";
const LANGUAGE_STORAGE_KEY = "i18nextLng"; // Changed to match i18next's storage key

// Language context type
interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  languages: Language[];
  getLanguageByCode: (code: LanguageCode) => Language | undefined;
  isRTL?: boolean;
}

// Create the language context
const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = React.useState<LanguageCode>(() => {
    // Initialize from URL or localStorage or browser language
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const urlLang = pathSegments[0];
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLang = navigator.language;
    
    console.log('Language detection:', { urlLang, storedLang, browserLang, pathSegments });
    
    // Check if URL contains a language code
    if (window.location.pathname.includes('/es-ES')) {
      console.log('Detected Spanish from URL path');
      return 'es-ES';
    }
    
    // First check URL
    if (urlLang && LANGUAGES.some(lang => lang.code === urlLang)) {
      console.log('Using URL language:', urlLang);
      return urlLang as LanguageCode;
    }
    
    // Then check localStorage
    if (storedLang && LANGUAGES.some(lang => lang.code === storedLang)) {
      console.log('Using stored language:', storedLang);
      return storedLang as LanguageCode;
    }
    
    // Then check browser language
    if (LANGUAGES.some(lang => lang.code === browserLang)) {
      console.log('Using browser language:', browserLang);
      return browserLang as LanguageCode;
    }
    
    // Default to en-GB
    console.log('Using default language:', DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  });

  // Initialize language and update URL if needed
  useEffect(() => {
    const initLanguage = async () => {
      try {
        console.log('Initializing language:', currentLanguage);
        
        // Force clear any cached language data
        localStorage.removeItem('i18nextLng');
        console.log('useLanguage: Setting language to', currentLanguage);
        
        // Load all namespaces for the language before changing
        const namespaces = ['common', 'dashboard', 'verification', 'search', 'properties', 'home', 'auth', 'tour', 'actions', 'newsletter', 'investment', 'security'];
        await i18n.loadNamespaces(namespaces);
        
        // Wait for all resources to be loaded
        await new Promise(resolve => {
          const checkResources = () => {
            const allLoaded = namespaces.every(ns => 
              i18n.hasResourceBundle(currentLanguage, ns)
            );
            if (allLoaded) {
              resolve(true);
            } else {
              setTimeout(checkResources, 10);
            }
          };
          checkResources();
        });
        
        // Change the language and force reload
        await i18n.changeLanguage(currentLanguage);
        
        // Store in localStorage
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
        
        // Update URL if needed
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);
        
        // If no language in URL, add it
        if (!LANGUAGES.some(lang => lang.code === pathSegments[0])) {
          const newPath = `/${currentLanguage}${pathSegments.length > 0 ? '/' + pathSegments.join('/') : ''}${window.location.search}`;
          window.history.replaceState({}, '', newPath);
        }
        
        console.log('Language initialized:', {
          language: currentLanguage,
          i18nLanguage: i18n.language,
          namespaces: i18n.services?.resourceStore ? ['common', 'dashboard', 'verification', 'search', 'properties', 'home', 'auth', 'tour', 'actions'] : []
        });
      } catch (error) {
        console.error('Failed to initialize language:', error);
      }
    };

    initLanguage();
  }, [currentLanguage, i18n]);

  // Change language function
  const handleChangeLanguage = useCallback(async (langCode: LanguageCode) => {
    if (LANGUAGES.some(lang => lang.code === langCode)) {
      try {
        // First, ensure we're not using any fallback language
        await i18n.loadNamespaces(['common', 'dashboard', 'verification', 'search', 'properties']);
        
        // Force clear i18next cache
        localStorage.removeItem('i18nextLng');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('i18next:')) {
            localStorage.removeItem(key);
          }
        });
        
        // Set the new language explicitly
        localStorage.setItem('i18nextLng', langCode);
        
        // Update URL
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);
        
        // Remove any existing language code
        if (LANGUAGES.some(lang => lang.code === pathSegments[0])) {
          pathSegments.shift();
        }
        
        // Add new language code to URL
        const newPath = `/${langCode}${pathSegments.length > 0 ? '/' + pathSegments.join('/') : ''}${window.location.search}`;
        
        // Change language in i18next before navigation
        await i18n.changeLanguage(langCode);
        
        // Force reload the page with the new URL
        window.location.href = newPath;
        
      } catch (error) {
        console.error('Error changing language:', error);
        toast({
          title: "Error",
          description: "Failed to change language. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [i18n, toast]);

  // Helper to get language details by code
  const getLanguageByCode = useCallback((code: LanguageCode) => {
    return LANGUAGES.find(lang => lang.code === code);
  }, []);

  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage: handleChangeLanguage,
    languages: LANGUAGES,
    getLanguageByCode,
    isRTL: false
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for using the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}