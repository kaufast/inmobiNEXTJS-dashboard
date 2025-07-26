import i18next from 'i18next';

/**
 * Generates a URL path with the current locale prefix
 * @param path - URL path without language
 * @returns URL with language prefix
 */
export const route = (path: string): string => {
  const locale = i18next.language || 'en-GB';
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}; 