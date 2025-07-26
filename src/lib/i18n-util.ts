// client/src/lib/i18n-util.ts
import i18next from 'i18next';
import { LanguageCode } from '@/types/language';
import { LANGUAGES } from '@/hooks/use-language';

/**
 * Utility functions for i18n related operations
 */

/**
 * Gets the language from URL if present in the format /en-US/path or /en/path
 * @returns The language code or null if not found
 */
export function getLanguageFromUrl(): string | null {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const potentialLang = pathSegments[0];
    // Check if this looks like a language code (en, en-US, etc.)
    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(potentialLang)) {
      // Check if it's in our supported languages
      const supportedLngs = i18next.options.supportedLngs;
      const isSupported = Array.isArray(supportedLngs) && supportedLngs.includes(potentialLang);
      if (isSupported) {
        return potentialLang;
      }
    }
  }
  return null;
}

/**
 * Generates URL with language prefix
 * @param path - URL path without language
 * @param lang - Language code to use
 * @returns URL with language prefix
 */
export function getUrlWithLanguage(path: string, lang: string = i18next.language): string {
  // Remove any existing language prefix
  const cleanPath = removeLanguageFromUrl(path);
  // Add the new language prefix if it's not the default
  return `/${lang}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

/**
 * Removes language prefix from URL if present
 * @param url - URL with possible language prefix
 * @returns URL without language prefix
 */
export function removeLanguageFromUrl(url: string): string {
  const pathSegments = url.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const potentialLang = pathSegments[0];
    // Check if this looks like a language code
    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(potentialLang)) {
      // Check if it's in our supported languages
      const supportedLngs = i18next.options.supportedLngs;
      const isSupported = Array.isArray(supportedLngs) && supportedLngs.includes(potentialLang);
      if (isSupported) {
        return '/' + pathSegments.slice(1).join('/');
      }
    }
  }
  return url;
}

/**
 * Get language name from code
 * @param code - Language code (e.g., 'en-US')
 * @returns Language name or code if not found
 */
export function getLanguageName(code: LanguageCode): string {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
}

/**
 * Handles language-based SEO metadata
 * @param title - Page title
 * @param path - Current path
 * @returns Object with canonical and alternate links
 */
export function getLanguageSeoData(title: string, path: string) {
  const currentLang = i18next.language;
  const canonicalUrl = `${window.location.origin}${getUrlWithLanguage(path, currentLang)}`;
  
  const alternateLinks = LANGUAGES.map(lang => ({
    hrefLang: lang.code,
    href: `${window.location.origin}${getUrlWithLanguage(path, lang.code)}`
  }));
  
  return {
    title: `${title} | Inmobi`,
    canonicalUrl,
    alternateLinks
  };
}

/**
 * Lazy load a namespace for a specific language
 * @param lng - Language code
 * @param ns - Namespace to load
 * @returns Promise that resolves when the namespace is loaded
 */
export const lazyLoadNamespace = async (lng: string, ns: string): Promise<void> => {
  try {
    // Check if namespace is already loaded
    if (i18next.hasResourceBundle(lng, ns)) {
      return;
    }

    // Load the namespace
    await i18next.loadNamespaces(ns);
    console.log(`Lazy loaded namespace ${ns} for language ${lng}`);
  } catch (error) {
    console.error(`Error lazy loading namespace ${ns} for language ${lng}:`, error);
  }
};

/**
 * Preload common translations for a language
 * @param lng - Language code to preload
 */
export const preloadLanguage = async (lng: string): Promise<void> => {
  try {
    // Preload common namespace
    await i18next.loadNamespaces('common');
    
    // Preload other frequently used namespaces
    const commonNamespaces = ['auth', 'navbar'];
    await Promise.all(commonNamespaces.map(ns => i18next.loadNamespaces(ns)));
    
    console.log(`Preloaded common translations for language ${lng}`);
  } catch (error) {
    console.error(`Error preloading language ${lng}:`, error);
  }
};

/**
 * Get cached translation or load it if not cached
 * @param key - Translation key
 * @param options - Translation options
 * @returns Translated string
 */
export const getCachedTranslation = (key: string, options?: any): string => {
  const cacheKey = `i18n_${i18next.language}_${key}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const translation = i18next.t(key, options);
  localStorage.setItem(cacheKey, translation);
  return translation;
};

/**
 * Clear translation cache for a specific language
 * @param lng - Language code
 */
export const clearTranslationCache = (lng: string): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`i18n_${lng}_`)) {
      localStorage.removeItem(key);
    }
  });
};