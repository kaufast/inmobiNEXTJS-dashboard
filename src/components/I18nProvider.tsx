import React, { useEffect, useState, ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [initialized, setInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!initialized) {
      const loadResources = async () => {
        try {
          // Get user's preferred language from localStorage or browser
          const savedLanguage = localStorage.getItem('i18nextLng');
          const browserLang = navigator.language;
          const defaultLang = 'en-GB';
          
          // Find the best matching language
          const supportedLangs = i18n.options.supportedLngs || [];
          const userLang = savedLanguage || 
                          (supportedLangs.includes(browserLang) ? browserLang : defaultLang);
          
          // Load all namespaces for the user's language
          const namespaces = i18n.options.ns || [];
          await i18n.loadNamespaces(namespaces);
          
          // Set the language
          await i18n.changeLanguage(userLang);
          
          console.log('Language initialized:', {
            language: i18n.language,
            namespaces: i18n.reportNamespaces.getUsedNamespaces()
          });
          
          setInitialized(true);
        } catch (error) {
          console.error('Failed to initialize language:', error);
          // Try to recover by loading just the common namespace
          try {
            await i18n.loadNamespaces(['common']);
              setInitialized(true);
          } catch (retryError) {
            console.error('Failed to recover language initialization:', retryError);
          }
        }
      };

      loadResources();
    }
  }, [initialized]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen flex-col">
        <div className="text-lg">Loading translations...</div>
        <div className="mt-2 text-sm text-gray-500">
          If this takes too long, try refreshing the page
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

// Wrapper component for individual sections that need translations
export function TranslationWrapper({ children }: { children: ReactNode }) {
  const { ready } = useTranslation();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 