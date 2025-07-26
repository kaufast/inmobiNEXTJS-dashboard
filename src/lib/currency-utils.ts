/**
 * Currency utilities for locale-aware price formatting
 * Based on TASK-03-PROPERTY-FEATURES.md lines 83-117
 */

export interface CurrencyConfig {
  currency: string;
  symbol: string;
  exchangeRate?: number; // Optional for future currency conversion
}

export const LOCALE_CURRENCIES: Record<string, CurrencyConfig> = {
  'en-US': { currency: 'USD', symbol: '$' },
  'en-GB': { currency: 'GBP', symbol: '£' },
  'es-ES': { currency: 'EUR', symbol: '€' },
  'es-MX': { currency: 'MXN', symbol: '$' },
  'de-DE': { currency: 'EUR', symbol: '€' },
  'de-AT': { currency: 'EUR', symbol: '€' },
  'ca-ES': { currency: 'EUR', symbol: '€' },
};

/**
 * Format price according to user's locale and currency preferences
 * @param price Price in base currency (USD)
 * @param locale User's locale (e.g., 'en-GB', 'es-ES')
 * @param options Additional formatting options
 * @returns Formatted price string with appropriate currency
 */
export function formatPrice(
  price: number, 
  locale: string,
  options: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showCurrency = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;

  const config = LOCALE_CURRENCIES[locale] || LOCALE_CURRENCIES['en-US'];
  
  try {
    if (showCurrency) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits,
        maximumFractionDigits
      }).format(price);
    } else {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits
      }).format(price);
    }
  } catch (error) {
    console.error('Error formatting price:', error);
    // Fallback to simple formatting
    return `${config.symbol}${price.toLocaleString()}`;
  }
}

/**
 * Format price range for search filters and property listings
 * @param minPrice Minimum price
 * @param maxPrice Maximum price
 * @param locale User's locale
 * @returns Formatted price range string
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  locale: string
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, locale);
  }
  
  const formattedMin = formatPrice(minPrice, locale);
  const formattedMax = formatPrice(maxPrice, locale);
  
  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Get currency symbol for a given locale
 * @param locale User's locale
 * @returns Currency symbol
 */
export function getCurrencySymbol(locale: string): string {
  const config = LOCALE_CURRENCIES[locale] || LOCALE_CURRENCIES['en-US'];
  return config.symbol;
}

/**
 * Get currency code for a given locale
 * @param locale User's locale
 * @returns Currency code (e.g., 'USD', 'EUR')
 */
export function getCurrencyCode(locale: string): string {
  const config = LOCALE_CURRENCIES[locale] || LOCALE_CURRENCIES['en-US'];
  return config.currency;
}

/**
 * Check if a locale uses the Euro currency
 * @param locale User's locale
 * @returns True if locale uses EUR
 */
export function usesEuro(locale: string): boolean {
  const config = LOCALE_CURRENCIES[locale];
  return config?.currency === 'EUR';
}

/**
 * Format price for property cards with abbreviated format for large numbers
 * @param price Price to format
 * @param locale User's locale
 * @returns Abbreviated price (e.g., "€1.2M", "$850K")
 */
export function formatPriceAbbreviated(price: number, locale: string): string {
  const config = LOCALE_CURRENCIES[locale] || LOCALE_CURRENCIES['en-US'];
  
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `${config.symbol}${millions.toFixed(1)}M`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    return `${config.symbol}${thousands.toFixed(0)}K`;
  } else {
    return formatPrice(price, locale);
  }
}