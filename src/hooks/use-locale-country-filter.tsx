import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { getDefaultCountryFromLocale, getLocaleMapping } from '@/lib/locale-utils';

/**
 * This hook enforces locale-country filtering throughout the application
 * It ensures that:
 * 1. Each locale only shows properties from its specific country
 * 2. The correct language is used based on the locale
 * 3. Prevents cross-country property mixing
 */
export function useLocaleCountryFilter() {
  const [, navigate] = useLocation();
  const { currentLanguage } = useLanguage();
  const [country, setCountry] = useState<string | undefined>(undefined);
  
  // Determine country from locale on mount
  useEffect(() => {
    if (currentLanguage) {
      // 1. First try the locale mapping (most reliable, based on config)
      const localeMapping = getLocaleMapping(currentLanguage);
      const mappingCountry = localeMapping?.country;
      
      // 2. Fall back to the function (least reliable)
      const fallbackCountry = getDefaultCountryFromLocale(currentLanguage);
      
      // Use the most reliable source available
      const effectiveCountry = mappingCountry ?? fallbackCountry;
      
      if (effectiveCountry) {
        setCountry(effectiveCountry);
      }
    }
  }, [currentLanguage]);

  /**
   * Apply country filter to a URL query string
   * 
   * @param url - The URL to filter (can include query parameters)
   * @returns URL with country parameter added/replaced
   */
  const applyCountryFilterToUrl = useCallback((url: string): string => {
    if (!country) return url;
    
    const [basePath, queryString] = url.split('?');
    const params = new URLSearchParams(queryString || '');
    
    // Set the country parameter
    params.set('country', country);
    
    return `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [country]);
  
  /**
   * Filter search parameters to include the country from the current locale
   * 
   * @param searchParams - The search parameters to filter
   * @returns Filtered search parameters with enforced country
   */
  const filterSearchParams = useCallback(<T extends { country?: string }>(searchParams: T): T => {
    // Check if we have a country to enforce
    if (!country) {
      return searchParams;
    }
    
    // Create a copy to avoid mutating the original
    const filteredParams = { ...searchParams };
    
    // Only override if the search params don't already have a country
    // or if the country is different from the locale's country
    if (!searchParams.country) {
      filteredParams.country = country;
    } else if (searchParams.country.toLowerCase() !== country.toLowerCase()) {
      filteredParams.country = country;
    }
    
    return filteredParams;
  }, [country]);
  
  /**
   * Filter an array of properties to only include those from the current locale's country
   * 
   * @param properties - Array of properties to filter
   * @returns Filtered properties array
   */
  const filterPropertiesByCountry = useCallback(<T extends { country: string }>(properties: T[]): T[] => {
    // Early return if no country to filter by or no properties to filter
    if (!country || !properties?.length) {
      return properties || [];
    }
    
    // Case-insensitive filter by country name
    return properties.filter(property => 
      property.country.toLowerCase() === country.toLowerCase()
    );
  }, [country]);
  
  /**
   * Navigate to a URL with country filtering applied
   * 
   * @param url - The destination URL
   */
  const navigateWithCountryFilter = useCallback((url: string) => {
    const filteredUrl = applyCountryFilterToUrl(url);
    navigate(filteredUrl);
  }, [applyCountryFilterToUrl, navigate]);
  
  /**
   * Start enforcing the country filter 
   * Call this once the app is initialized
   */
  const enforceCountryFilter = useCallback(() => {
    if (!country) {
      // Enhanced country source prioritization (same as in useEffect):
      // 1. First try the locale mapping (most reliable, based on config)
      const localeMapping = getLocaleMapping(currentLanguage);
      const mappingCountry = localeMapping?.country;
      
      // 2. Fall back to the function (least reliable)
      const fallbackCountry = getDefaultCountryFromLocale(currentLanguage);
      
      // Use the most reliable source available
      const effectiveCountry = mappingCountry ?? fallbackCountry;
      
      if (effectiveCountry) {
        setCountry(effectiveCountry);
      }
    }
  }, [country, currentLanguage]);
  
  return {
    country,
    enforceCountryFilter,
    filterSearchParams,
    filterPropertiesByCountry,
    navigateWithCountryFilter,
    applyCountryFilterToUrl
  };
}