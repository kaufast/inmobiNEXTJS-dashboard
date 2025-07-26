import Fuse from 'fuse.js';
import * as stringSimilarity from 'string-similarity';
import { normalizeFeatures, filterPropertiesByFeatures } from './feature-mapping';

/**
 * Internationalized search utilities for Inmobi
 * Handles language-specific character normalization, 
 * diacritics removal, and fuzzy search
 */

/**
 * Remove diacritics/accents from a string
 * @param text Input text with possible diacritics
 * @returns Normalized text without diacritics
 */
export function removeDiacritics(text: string): string {
  if (!text) return '';
  
  // Use NFD normalization to separate base characters from accents
  // then remove all combining diacritical marks
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * German-specific letter normalization map
 * Maps special German characters to their common search alternatives
 */
const GERMAN_CHARS_MAP: Record<string, string[]> = {
  'ä': ['a', 'ae'],
  'ö': ['o', 'oe'],
  'ü': ['u', 'ue'],
  'ß': ['ss'],
};

/**
 * Spanish-specific letter normalization map
 */
const SPANISH_CHARS_MAP: Record<string, string[]> = {
  'á': ['a'],
  'é': ['e'],
  'í': ['i'],
  'ó': ['o'],
  'ú': ['u'],
  'ü': ['u'],
  'ñ': ['n', 'nn'],
};

/**
 * Map a special character to its alternatives based on language
 * @param char Character to map
 * @param locale Current locale (e.g., 'de-DE', 'es-ES')
 * @returns Array of alternative character forms
 */
function getCharAlternatives(char: string, locale: string): string[] {
  const lowerChar = char.toLowerCase();
  
  // Choose mapping based on language code
  if (locale.startsWith('de')) {
    return GERMAN_CHARS_MAP[lowerChar] || [lowerChar];
  } else if (locale.startsWith('es')) {
    return SPANISH_CHARS_MAP[lowerChar] || [lowerChar];
  }
  
  // Default to original character
  return [lowerChar];
}

/**
 * Generate all alternative spellings for a text based on language rules
 * @param text Original text
 * @param locale Current locale (e.g., 'de-DE', 'es-ES') 
 * @returns Array of alternative spellings, including the original
 */
export function generateAlternativeSpellings(text: string, locale: string): string[] {
  if (!text) return [''];
  
  const textLower = text.toLowerCase();
  const alternatives = [textLower];
  
  // Add version with diacritics removed
  const withoutDiacritics = removeDiacritics(textLower);
  if (withoutDiacritics !== textLower) {
    alternatives.push(withoutDiacritics);
  }
  
  // For German, handle specific character replacements
  if (locale.startsWith('de')) {
    // Replace ä with ae, ö with oe, etc.
    let germanized = textLower;
    germanized = germanized.replace(/ä/g, 'ae');
    germanized = germanized.replace(/ö/g, 'oe');
    germanized = germanized.replace(/ü/g, 'ue');
    germanized = germanized.replace(/ß/g, 'ss');
    
    if (germanized !== textLower && !alternatives.includes(germanized)) {
      alternatives.push(germanized);
    }
    
    // Also handle simplified replacements (ä → a, ö → o, etc.)
    let simplifiedGerman = textLower;
    simplifiedGerman = simplifiedGerman.replace(/ä/g, 'a');
    simplifiedGerman = simplifiedGerman.replace(/ö/g, 'o');
    simplifiedGerman = simplifiedGerman.replace(/ü/g, 'u');
    
    if (simplifiedGerman !== textLower && !alternatives.includes(simplifiedGerman)) {
      alternatives.push(simplifiedGerman);
    }
  }
  
  // For Spanish, remove accents but preserve ñ
  if (locale.startsWith('es')) {
    let spanishSimple = textLower;
    spanishSimple = spanishSimple.replace(/á/g, 'a');
    spanishSimple = spanishSimple.replace(/é/g, 'e');
    spanishSimple = spanishSimple.replace(/í/g, 'i');
    spanishSimple = spanishSimple.replace(/ó/g, 'o');
    spanishSimple = spanishSimple.replace(/ú/g, 'u');
    
    if (spanishSimple !== textLower && !alternatives.includes(spanishSimple)) {
      alternatives.push(spanishSimple);
    }
    
    // Handle ñ → n replacement
    const withoutN = textLower.replace(/ñ/g, 'n');
    if (withoutN !== textLower && !alternatives.includes(withoutN)) {
      alternatives.push(withoutN);
    }
  }
  
  return [...new Set(alternatives)]; // Remove duplicates
}

/**
 * Interface for search results with similarity scoring
 */
export interface ScoredSearchResult<T> {
  item: T;
  score: number;
  matchedOn?: string;
}

/**
 * Options for fuzzy search
 */
export interface FuzzySearchOptions {
  threshold?: number;
  includeScore?: boolean;
  shouldSort?: boolean;
  keys?: string[];
  locale?: string;
  keyPrefixMapping?: Record<string, number>; // Weight multipliers for keys
}

/**
 * Perform a fuzzy search on a collection with internationalization support
 * @param items Collection to search
 * @param query Search query
 * @param options Search options
 * @returns Scored and sorted search results
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: FuzzySearchOptions = {}
): ScoredSearchResult<T>[] {
  if (!query || !items?.length) return [];
  
  const locale = options.locale || 'en-US';
  const threshold = options.threshold || 0.3;
  const keys = options.keys || ['name', 'title', 'city', 'country', 'address'];
  const keyWeights = options.keyPrefixMapping || {};
  
  // Normalize the query for better matching
  const normalizedQuery = removeDiacritics(query.toLowerCase());
  
  // Generate alternative spellings
  const queryAlternatives = generateAlternativeSpellings(query, locale);
  
  // Configure Fuse.js options
  const fuseOptions = {
    includeScore: true,
    threshold,
    shouldSort: options.shouldSort !== false,
    keys: keys.map(key => ({
      name: key,
      weight: keyWeights[key] || 1
    })),
    // Optimize for location names with these settings
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
  };
  
  const fuse = new Fuse(items, fuseOptions);
  
  // Try each alternative spelling and combine results
  let allResults: ScoredSearchResult<T>[] = [];
  
  for (const alternative of queryAlternatives) {
    const results = fuse.search(alternative);
    
    // Convert Fuse results to our format and track which query matched
    const formattedResults = results.map(result => ({
      item: result.item,
      score: result.score || 0,
      matchedOn: alternative
    }));
    
    allResults = [...allResults, ...formattedResults];
  }
  
  // Remove duplicates, keeping the best score for each item
  const uniqueResults = new Map<string, ScoredSearchResult<T>>();
  
  for (const result of allResults) {
    const itemKey = JSON.stringify(result.item);
    
    if (!uniqueResults.has(itemKey) || result.score < uniqueResults.get(itemKey)!.score) {
      uniqueResults.set(itemKey, result);
    }
  }
  
  // Sort by score (lower is better)
  return Array.from(uniqueResults.values()).sort((a, b) => a.score - b.score);
}

/**
 * Check if a query might have typos or misspellings
 * @param query The search query
 * @param knownTerms Array of known correct terms to check against
 * @param minSimilarity Minimum similarity threshold (0-1)
 * @returns An object with the best match and its similarity score
 */
export function findPossibleCorrection(
  query: string,
  knownTerms: string[],
  minSimilarity: number = 0.7
): { bestMatch: string; similarity: number } | null {
  if (!query || !knownTerms?.length) return null;
  
  const normalizedQuery = removeDiacritics(query.toLowerCase());
  const normalizedTerms = knownTerms.map(term => removeDiacritics(term.toLowerCase()));
  
  // Find the best match using string-similarity
  const { bestMatch } = stringSimilarity.findBestMatch(normalizedQuery, normalizedTerms);
  
  // Only suggest if similarity is above threshold
  if (bestMatch.rating >= minSimilarity) {
    return {
      bestMatch: knownTerms[bestMatch.targetIndex],
      similarity: bestMatch.rating
    };
  }
  
  return null;
}

/**
 * Get search suggestion for possible typos
 * @param query User's search query
 * @param knownTerms Dictionary of known terms
 * @param locale Current locale
 * @returns Suggestion message or null if no good suggestion
 */
export function getSearchSuggestion(
  query: string,
  knownTerms: string[],
  locale: string = 'en-US'
): string | null {
  const correction = findPossibleCorrection(query, knownTerms);
  
  if (!correction) return null;
  
  // Format suggestion message based on locale
  if (locale.startsWith('es')) {
    return `¿Quisiste decir "${correction.bestMatch}"?`;
  } else if (locale.startsWith('de')) {
    return `Meinten Sie "${correction.bestMatch}"?`;
  } else {
    return `Did you mean "${correction.bestMatch}"?`;
  }
}

/**
 * Normalize a string for search (lowercase, remove diacritics, trim)
 * @param text Text to normalize
 * @returns Normalized text ready for comparison
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  return removeDiacritics(text.toLowerCase().trim());
}

/**
 * Search predicate that handles internationalized text
 * Use this for simple filtering that doesn't require full fuzzy search
 * 
 * @param haystack Text to search within
 * @param needle Text to search for
 * @param locale Current locale
 * @returns True if needle is found in haystack
 */
export function internationalizedIncludes(
  haystack: string,
  needle: string,
  locale: string = 'en-US'
): boolean {
  if (!haystack || !needle) return false;
  
  // Normalize both strings
  const normalizedHaystack = normalizeForSearch(haystack);
  
  // Generate alternatives for the search term based on locale
  const needleAlternatives = generateAlternativeSpellings(needle, locale);
  
  // Check if any alternative is included in the normalized haystack
  return needleAlternatives.some(alt => normalizedHaystack.includes(normalizeForSearch(alt)));
}

/**
 * Filter an array of objects based on a search query with internationalization support
 * @param items Array of objects to filter
 * @param query Search query
 * @param keys Object keys to search in
 * @param locale Current locale
 * @returns Filtered array of objects
 */
export function filterByQuery<T>(
  items: T[],
  query: string,
  keys: (keyof T)[],
  locale: string = 'en-US'
): T[] {
  if (!query || !items?.length) return items;
  
  // For empty or very short queries, return all items
  if (query.length < 2) return items;
  
  return items.filter(item => {
    return keys.some(key => {
      const value = item[key];
      // Only process string values
      if (typeof value !== 'string') return false;
      
      return internationalizedIncludes(value, query, locale);
    });
  });
}

/**
 * Enhanced property search with feature normalization
 * @param properties Array of properties to search
 * @param query Search query
 * @param features Array of features to filter by
 * @param locale Current locale
 * @returns Filtered properties with intelligent feature matching
 */
export function searchPropertiesWithFeatures(
  properties: any[],
  query?: string,
  features?: string[],
  locale: string = 'en-US'
): any[] {
  let filteredProperties = properties;
  
  // Apply text-based search first
  if (query && query.length >= 2) {
    filteredProperties = filterByQuery(
      filteredProperties,
      query,
      ['title', 'description', 'address', 'city', 'country'],
      locale
    );
  }
  
  // Apply feature-based filtering with normalization
  if (features && features.length > 0) {
    // Normalize all search features
    const normalizedSearchFeatures = features.flatMap(feature => normalizeFeatures(feature));
    
    filteredProperties = filterPropertiesByFeatures(filteredProperties, normalizedSearchFeatures);
  }
  
  return filteredProperties;
}

/**
 * Get search suggestions for features with typo correction
 * @param query Feature search query
 * @param locale Current locale
 * @returns Array of suggested feature terms
 */
export function getFeatureSuggestions(
  query: string,
  locale: string = 'en-US'
): string[] {
  if (!query || query.length < 2) return [];
  
  // Common features in multiple languages
  const commonFeatures = [
    'swimming pool', 'pool', 'piscina',
    'garden', 'yard', 'jardín', 'garten',
    'garage', 'parking', 'garaje',
    'balcony', 'terrace', 'balcón', 'terraza',
    'air conditioning', 'ac', 'aire acondicionado',
    'kitchen', 'cocina', 'küche',
    'fireplace', 'chimenea', 'kamin'
  ];
  
  // Use fuzzy search to find similar features
  const suggestions = fuzzySearch(
    commonFeatures.map(f => ({ name: f })),
    query,
    {
      keys: ['name'],
      threshold: 0.4,
      locale
    }
  );
  
  return suggestions.slice(0, 5).map(s => s.item.name);
}