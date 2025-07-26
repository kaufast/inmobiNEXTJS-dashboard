import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

/**
 * Custom hook to ensure consistent translation loading across all components
 * This fixes the cascading translation failures caused by namespace loading conflicts
 */
export const useTranslationFix = (namespaces: string | string[]) => {
  const { t, i18n } = useTranslation(namespaces);

  useEffect(() => {
    // Ensure all required namespaces are loaded for the current language
    const loadNamespaces = async () => {
      const namespacesToLoad = Array.isArray(namespaces) ? namespaces : [namespaces];
      
      try {
        // Load namespaces if not already loaded
        const currentLang = i18n.language;
        for (const ns of namespacesToLoad) {
          if (!i18n.hasResourceBundle(currentLang, ns)) {
            await i18n.loadNamespaces(ns);
          }
        }
      } catch (error) {
        console.error('Error loading translation namespaces:', error);
      }
    };

    loadNamespaces();
  }, [i18n, i18n.language, namespaces]);

  return { t, i18n };
};