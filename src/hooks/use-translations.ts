import { useLanguage } from './use-language';
import { getTranslation, formatTranslation } from '@/lib/translations';

export function useTranslations(namespace?: string) {
  const { currentLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Namespace is ignored - only using en-GB locale as specified
    const translation = getTranslation(key, currentLanguage);
    return params ? formatTranslation(translation, params) : translation;
  };

  return { t };
} 