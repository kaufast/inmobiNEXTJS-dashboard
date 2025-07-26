import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { lazyLoadNamespace, getCachedTranslation, preloadLanguage } from '@/lib/i18n-util';
import { useLanguage } from './use-language';

export const useOptimizedTranslations = (namespaces: string | string[] = 'common') => {
  const { t, i18n } = useTranslation(namespaces);
  const { currentLanguage } = useLanguage();

  // Preload common translations when language changes
  useEffect(() => {
    preloadLanguage(currentLanguage);
  }, [currentLanguage]);

  // Optimized translation function with caching
  const optimizedT = useCallback((key: string, options?: any) => {
    return getCachedTranslation(key, options);
  }, [currentLanguage]);

  // Lazy load namespace when needed
  const loadNamespace = useCallback(async (ns: string) => {
    await lazyLoadNamespace(currentLanguage, ns);
  }, [currentLanguage]);

  return {
    t: optimizedT,
    loadNamespace,
    i18n,
    currentLanguage
  };
}; 