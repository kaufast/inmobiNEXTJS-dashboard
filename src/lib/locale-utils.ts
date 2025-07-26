/**
 * Locale to country mapping utilities
 * This module provides strict mapping between locales and countries for property filtering
 */

// Map locale to database country name and country code (ISO 3166-1 alpha-2)
// Country name MUST match exactly what's in the database
export interface LocaleCountryMapping {
  country: string;    // Full country name as stored in database
  countryCode: string; // ISO 3166-1 alpha-2 code
  language: string;    // ISO 639-1 language code
  defaultCurrency: string; // Default currency for this locale
}

// Comprehensive locale to country mapping with all necessary data
export const LOCALE_MAP: Record<string, LocaleCountryMapping> = {
  // English locales
  'en-US': {
    country: 'United States',
    countryCode: 'US',
    language: 'en',
    defaultCurrency: 'USD'
  },
  'en-GB': {
    country: 'United Kingdom',
    countryCode: 'GB',
    language: 'en',
    defaultCurrency: 'GBP'
  },
  
  // Spanish locales
  'es-MX': {
    country: 'Mexico',
    countryCode: 'MX',
    language: 'es',
    defaultCurrency: 'MXN'
  },
  'es-ES': {
    country: 'Spain',
    countryCode: 'ES',
    language: 'es',
    defaultCurrency: 'EUR'
  },
  
  // German locales
  'de-DE': {
    country: 'Germany',
    countryCode: 'DE',
    language: 'de',
    defaultCurrency: 'EUR'
  },
  'de-AT': {
    country: 'Austria',
    countryCode: 'AT',
    language: 'de',
    defaultCurrency: 'EUR'
  },
  
  // French locale
  'fr-FR': {
    country: 'France',
    countryCode: 'FR',
    language: 'fr',
    defaultCurrency: 'EUR'
  },
  
  // Catalan locale
  'ca-ES': {
    country: 'Spain',
    countryCode: 'ES',
    language: 'ca',
    defaultCurrency: 'EUR'
  }
};

// Country code to database country name mapping (for reverse lookups)
export const COUNTRY_CODE_TO_NAME: Record<string, string> = Object.values(LOCALE_MAP).reduce(
  (acc, { countryCode, country }) => ({ ...acc, [countryCode]: country }), 
  {}
);

// Language to potential countries mapping (for fallback resolution)
export const LANGUAGE_TO_COUNTRIES: Record<string, string[]> = {
  'en': ['United States', 'United Kingdom'],
  'es': ['Spain', 'Mexico'],
  'de': ['Germany', 'Austria'],
  'ca': ['Spain'],
  'fr': ['France']
};

// Default locale to use if no match is found
export const DEFAULT_LOCALE = 'en-US';

/**
 * Get the mapping information for a locale
 * 
 * @param locale - The locale string (e.g., 'en-US', 'es-MX')
 * @returns The locale mapping or undefined if not found
 */
export function getLocaleMapping(locale: string): LocaleCountryMapping | undefined {
  return LOCALE_MAP[locale];
}

/**
 * Get the country name from a locale string
 * 
 * @param locale - The locale string (e.g., 'en-US', 'es-MX')
 * @returns The country name or undefined if no mapping exists
 */
export function getDefaultCountryFromLocale(locale?: string): string | undefined {
  if (!locale) return undefined;
  
  // If exact match exists, return it
  if (LOCALE_MAP[locale]) {
    return LOCALE_MAP[locale].country;
  }
  
  // Try to match just the language part (first 2 characters) and region
  const [language, region] = locale.toLowerCase().split('-');
  
  // Try to find a matching locale by combining language and region
  if (language && region) {
    // Look for exact language-region match
    const localeKey = Object.keys(LOCALE_MAP).find(key => {
      const [lang, reg] = key.toLowerCase().split('-');
      return lang === language && reg === region;
    });
    
    if (localeKey) {
      return LOCALE_MAP[localeKey].country;
    }
  }
  
  // Try to find a matching locale by language only if no exact match
  if (language) {
    // Look for first locale with matching language
    const localeKey = Object.keys(LOCALE_MAP).find(key => {
      const lang = key.toLowerCase().split('-')[0];
      return lang === language;
    });
    
    if (localeKey) {
      return LOCALE_MAP[localeKey].country;
    }
  }
  
  // Handle specific region codes when language is not enough
  if (region) {
    // Map region codes directly to countries
    const regionToCountry: Record<string, string> = {
      'us': 'United States',
      'gb': 'United Kingdom',
      'uk': 'United Kingdom',
      'mx': 'Mexico',
      'es': 'Spain',
      'de': 'Germany',
      'at': 'Austria',
      'fr': 'France',
      'ca': 'Spain'
    };
    
    if (regionToCountry[region]) {
      return regionToCountry[region];
    }
  }
  
  // If all else fails, use the default
  return LOCALE_MAP[DEFAULT_LOCALE].country;
}

/**
 * Normalize text for search comparisons (remove accents, lowercase)
 * 
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim();
}

/**
 * Check if the search query matches a country name, accounting for accents and case
 * 
 * @param query - The search query
 * @param country - The country name to check against
 * @returns True if the query matches the country
 */
export function matchesCountry(query: string, country: string): boolean {
  const normalizedQuery = normalizeText(query);
  const normalizedCountry = normalizeText(country);
  
  // Handle special cases for USA
  if (normalizedQuery === 'usa' || 
      normalizedQuery === 'united states' || 
      normalizedQuery === 'united states of america' || 
      normalizedQuery === 'us' || 
      normalizedQuery === 'america') {
    return normalizedCountry === 'united states' || normalizedCountry === 'usa';
  }
  
  // Handle special cases for UK
  if (normalizedQuery === 'uk' || 
      normalizedQuery === 'united kingdom' || 
      normalizedQuery === 'england' || 
      normalizedQuery === 'britain' || 
      normalizedQuery === 'great britain') {
    return normalizedCountry === 'united kingdom' || normalizedCountry === 'uk';
  }
  
  // Regular comparison
  return normalizedCountry.includes(normalizedQuery) || 
         normalizedQuery.includes(normalizedCountry);
}