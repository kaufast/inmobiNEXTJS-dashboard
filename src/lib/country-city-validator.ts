/**
 * Country-City validation utility for bulk property upload
 */

import { COUNTRY_CITIES } from './csv-parser';

export interface CountryInfo {
  code: string;
  name: string;
  cities: string[];
}

export interface CityValidationResult {
  isValid: boolean;
  suggestedCities: string[];
  message: string;
}

/**
 * Get all available countries with their cities
 */
export function getAvailableCountries(): CountryInfo[] {
  return Object.entries(COUNTRY_CITIES).map(([code, cities]) => ({
    code,
    name: code, // You can map this to full country names if needed
    cities
  }));
}

/**
 * Get cities for a specific country
 */
export function getCitiesForCountry(countryCode: string): string[] {
  return COUNTRY_CITIES[countryCode] || [];
}

/**
 * Validate if a city exists in a country
 */
export function validateCityForCountry(city: string, countryCode: string): CityValidationResult {
  const availableCities = getCitiesForCountry(countryCode);
  
  if (availableCities.length === 0) {
    return {
      isValid: true, // If no cities defined for country, consider it valid
      suggestedCities: [],
      message: `No city validation available for ${countryCode}`
    };
  }
  
  const normalizedCity = city.toLowerCase().trim();
  const isExactMatch = availableCities.some(c => c.toLowerCase() === normalizedCity);
  
  if (isExactMatch) {
    return {
      isValid: true,
      suggestedCities: [],
      message: `${city} is valid for ${countryCode}`
    };
  }
  
  // Find similar cities using fuzzy matching
  const suggestedCities = findSimilarCities(city, availableCities);
  
  return {
    isValid: false,
    suggestedCities,
    message: suggestedCities.length > 0 
      ? `"${city}" is not valid for ${countryCode}. Did you mean: ${suggestedCities.slice(0, 3).join(', ')}?`
      : `"${city}" is not a valid city for ${countryCode}`
  };
}

/**
 * Find similar cities using fuzzy string matching
 */
function findSimilarCities(inputCity: string, availableCities: string[]): string[] {
  const normalizedInput = inputCity.toLowerCase().trim();
  const similarities: Array<{ city: string; score: number }> = [];
  
  availableCities.forEach(city => {
    const normalizedCity = city.toLowerCase();
    const score = calculateSimilarity(normalizedInput, normalizedCity);
    
    if (score > 0.3) { // Threshold for similarity
      similarities.push({ city, score });
    }
  });
  
  // Sort by similarity score and return top matches
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.city);
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return 1 - (matrix[len1][len2] / maxLen);
}

/**
 * Batch validate multiple properties for country-city consistency
 */
export function batchValidateCities(properties: Array<{ city: string; country: string; id: string }>) {
  return properties.map(property => ({
    id: property.id,
    city: property.city,
    country: property.country,
    validation: validateCityForCountry(property.city, property.country)
  }));
}

/**
 * Get validation summary for a batch of properties
 */
export function getValidationSummary(validationResults: ReturnType<typeof batchValidateCities>) {
  const total = validationResults.length;
  const valid = validationResults.filter(r => r.validation.isValid).length;
  const invalid = total - valid;
  
  const invalidByCountry = validationResults
    .filter(r => !r.validation.isValid)
    .reduce((acc, r) => {
      acc[r.country] = (acc[r.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  return {
    total,
    valid,
    invalid,
    validPercentage: (valid / total) * 100,
    invalidByCountry
  };
}

/**
 * Auto-correct city names based on fuzzy matching
 */
export function autoCorrectCities(properties: Array<{ city: string; country: string; id: string }>) {
  return properties.map(property => {
    const validation = validateCityForCountry(property.city, property.country);
    
    if (!validation.isValid && validation.suggestedCities.length > 0) {
      // If there's a high-confidence match, auto-correct
      const bestMatch = validation.suggestedCities[0];
      const similarity = calculateSimilarity(
        property.city.toLowerCase(),
        bestMatch.toLowerCase()
      );
      
      if (similarity > 0.8) { // High confidence threshold
        return {
          ...property,
          city: bestMatch,
          wasAutoCorrected: true,
          originalCity: property.city
        };
      }
    }
    
    return {
      ...property,
      wasAutoCorrected: false,
      originalCity: property.city
    };
  });
}

/**
 * Export country-city mapping for dropdown components
 */
export function getCountryCityMapping(): Record<string, string[]> {
  return COUNTRY_CITIES;
}

/**
 * Search cities across all countries
 */
export function searchCitiesGlobally(query: string, limit: number = 10): Array<{ city: string; country: string }> {
  const results: Array<{ city: string; country: string; score: number }> = [];
  const normalizedQuery = query.toLowerCase().trim();
  
  Object.entries(COUNTRY_CITIES).forEach(([country, cities]) => {
    cities.forEach(city => {
      const normalizedCity = city.toLowerCase();
      
      if (normalizedCity.includes(normalizedQuery)) {
        const score = normalizedCity.startsWith(normalizedQuery) ? 1 : 0.7;
        results.push({ city, country, score });
      }
    });
  });
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({ city: item.city, country: item.country }));
}