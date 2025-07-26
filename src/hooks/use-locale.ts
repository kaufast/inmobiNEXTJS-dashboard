import { useTranslation } from 'react-i18next';

export function useLocale() {
  const { i18n } = useTranslation();
  
  return {
    locale: i18n.language || 'en-GB',
    isRTL: i18n.dir() === 'rtl'
  };
} 