import { useLocale } from './use-locale';

export function useLocalizedRoute<T>(pattern: string) {
  const { locale } = useLocale();
  const localizedPattern = `/${locale}${pattern.startsWith('/') ? pattern : `/${pattern}`}`;
  
  return localizedPattern;
} 