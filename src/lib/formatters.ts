import { useLanguage } from '@/hooks/use-language';
import { LanguageCode } from '@/types/language';

// Currency code mapping for different locales
const currencyByLocale: Record<LanguageCode, string> = {
  'es-MX': 'MXN',
  'en-GB': 'GBP',
  'en-US': 'USD',
  'es-ES': 'EUR',
  'ca-ES': 'EUR',
  'de-AT': 'EUR',
  'de-DE': 'EUR'
};

// Measurement system mapping (metric vs imperial)
const measurementByLocale: Record<LanguageCode, 'metric' | 'imperial'> = {
  'es-MX': 'metric',
  'en-GB': 'metric',
  'en-US': 'imperial',
  'es-ES': 'metric',
  'ca-ES': 'metric',
  'de-AT': 'metric',
  'de-DE': 'metric'
};

/**
 * Format a date according to the current locale
 */
export function useLocalizedDate() {
  const { currentLanguage } = useLanguage();
  
  return {
    /**
     * Format a date in the user's locale
     * @param date - Date to format
     * @param options - Intl.DateTimeFormatOptions
     * @returns Formatted date string
     */
    format: (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      };
      
      return new Intl.DateTimeFormat(currentLanguage, defaultOptions).format(date);
    },
    
    /**
     * Format a date in short format
     * @param date - Date to format
     * @returns Formatted date string
     */
    formatShort: (date: Date | number) => {
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },
    
    /**
     * Format a date with time
     * @param date - Date to format
     * @returns Formatted date and time string
     */
    formatWithTime: (date: Date | number) => {
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    /**
     * Format a date as relative time (e.g., "2 days ago", "in 3 hours")
     * @param date - Date to format
     * @returns Relative time string
     */
    formatRelative: (date: Date | number) => {
      const now = new Date();
      const targetDate = new Date(date);
      const diffMs = targetDate.getTime() - now.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });
      
      if (Math.abs(diffDay) > 0) {
        return rtf.format(diffDay, 'day');
      }
      if (Math.abs(diffHour) > 0) {
        return rtf.format(diffHour, 'hour');
      }
      if (Math.abs(diffMin) > 0) {
        return rtf.format(diffMin, 'minute');
      }
      return rtf.format(diffSec, 'second');
    }
  };
}

/**
 * Format a number (currency, percentage, etc.) according to the current locale
 */
export function useLocalizedNumber() {
  const { currentLanguage } = useLanguage();
  
  return {
    /**
     * Format a number in the user's locale
     * @param value - Number to format
     * @param options - Intl.NumberFormatOptions
     * @returns Formatted number string
     */
    format: (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(value);
    },
    
    /**
     * Format a number as currency
     * @param value - Number to format
     * @param currencyOverride - Optional currency code to override the default
     * @returns Formatted currency string
     */
    formatCurrency: (value: number, currencyOverride?: string) => {
      const currency = currencyOverride || currencyByLocale[currentLanguage] || 'USD';
      
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }).format(value);
    },
    
    /**
     * Format a number as a percentage
     * @param value - Number to format (0-1)
     * @returns Formatted percentage string
     */
    formatPercent: (value: number) => {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'percent',
        maximumFractionDigits: 1
      }).format(value);
    },
    
    /**
     * Format a number with units
     * @param value - Number to format
     * @param unit - Unit to append (e.g., 'm²', 'km')
     * @returns Formatted number with unit
     */
    formatWithUnit: (value: number, unit: string) => {
      return `${new Intl.NumberFormat(currentLanguage).format(value)} ${unit}`;
    },
    
    /**
     * Format area measurement according to locale (sqft vs sqm)
     * @param value - Area in square feet
     * @returns Formatted area with appropriate unit
     */
    formatArea: (value: number) => {
      const measurementSystem = measurementByLocale[currentLanguage] || 'metric';
      
      if (measurementSystem === 'imperial') {
        return `${new Intl.NumberFormat(currentLanguage).format(value)} sq ft`;
      } else {
        // Convert from square feet to square meters (1 sq ft = 0.092903 sq m)
        const sqm = Math.round(value * 0.092903);
        return `${new Intl.NumberFormat(currentLanguage).format(sqm)} m²`;
      }
    },
    
    /**
     * Format distance according to locale (miles vs kilometers)
     * @param value - Distance in miles
     * @returns Formatted distance with appropriate unit
     */
    formatDistance: (value: number) => {
      const measurementSystem = measurementByLocale[currentLanguage] || 'metric';
      
      if (measurementSystem === 'imperial') {
        return `${new Intl.NumberFormat(currentLanguage, { maximumFractionDigits: 1 }).format(value)} mi`;
      } else {
        // Convert from miles to kilometers (1 mile = 1.60934 km)
        const km = value * 1.60934;
        return `${new Intl.NumberFormat(currentLanguage, { maximumFractionDigits: 1 }).format(km)} km`;
      }
    }
  };
}

/**
 * Standalone formatters that don't require hooks (for use in utilities)
 * Based on TASK-03-PROPERTY-FEATURES.md requirements
 */

/**
 * Format area measurement for any locale
 * @param value Area in square feet
 * @param locale Locale string (e.g., 'en-US', 'es-ES')
 * @returns Formatted area with appropriate unit
 */
export function formatAreaForLocale(value: number, locale: string): string {
  const measurementSystem = measurementByLocale[locale as LanguageCode] || 'metric';
  
  if (measurementSystem === 'imperial') {
    return `${new Intl.NumberFormat(locale).format(value)} sq ft`;
  } else {
    // Convert from square feet to square meters
    const sqm = Math.round(value * 0.092903);
    return `${new Intl.NumberFormat(locale).format(sqm)} m²`;
  }
}

/**
 * Format price for any locale
 * @param value Price amount
 * @param locale Locale string
 * @returns Formatted price with currency
 */
export function formatPriceForLocale(value: number, locale: string): string {
  const currency = currencyByLocale[locale as LanguageCode] || 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format date for any locale
 * @param date Date to format
 * @param locale Locale string
 * @param options Format options
 * @returns Formatted date string
 */
export function formatDateForLocale(
  date: Date | number, 
  locale: string, 
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Get measurement system for a locale
 * @param locale Locale string
 * @returns 'metric' or 'imperial'
 */
export function getMeasurementSystem(locale: string): 'metric' | 'imperial' {
  return measurementByLocale[locale as LanguageCode] || 'metric';
}

/**
 * Convert square feet to square meters
 * @param sqft Area in square feet
 * @returns Area in square meters
 */
export function sqftToSqm(sqft: number): number {
  return Math.round(sqft * 0.092903);
}

/**
 * Convert miles to kilometers
 * @param miles Distance in miles
 * @returns Distance in kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}