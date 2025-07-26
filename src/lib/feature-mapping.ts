/**
 * Feature mapping utilities for search normalization
 * Based on TASK-03-PROPERTY-FEATURES.md lines 67-79
 * Solves the problem: Users search "Swimming Pool", properties have "pool" = NO MATCH
 */

export interface FeatureMapping {
  [key: string]: string[];
}

/**
 * Comprehensive feature mapping with multi-language support
 * Maps search terms to all possible property feature variations
 */
export const FEATURE_MAPPING: FeatureMapping = {
  // Swimming Pool variations
  'swimming pool': ['pool', 'swimming', 'swimming pool', 'piscina', 'zwembad', 'schwimmbad'],
  'pool': ['pool', 'swimming', 'swimming pool', 'piscina', 'zwembad'],
  'piscina': ['pool', 'swimming', 'swimming pool', 'piscina'],
  
  // Garden/Yard variations
  'garden': ['garden', 'yard', 'jardín', 'jardin', 'garten', 'tuin', 'outdoor space'],
  'yard': ['garden', 'yard', 'jardín', 'jardin', 'garten', 'tuin'],
  'jardín': ['garden', 'yard', 'jardín', 'jardin', 'garten'],
  'garten': ['garden', 'yard', 'jardín', 'jardin', 'garten'],
  
  // Garage/Parking variations
  'garage': ['garage', 'parking', 'garaje', 'garage space', 'covered parking'],
  'parking': ['garage', 'parking', 'garaje', 'car park', 'parking space'],
  'garaje': ['garage', 'parking', 'garaje', 'parking space'],
  
  // Balcony/Terrace variations
  'balcony': ['balcony', 'terrace', 'balcón', 'balkon', 'terraza', 'outdoor terrace'],
  'terrace': ['balcony', 'terrace', 'balcón', 'balkon', 'terraza', 'patio'],
  'balcón': ['balcony', 'terrace', 'balcón', 'balkon'],
  'terraza': ['balcony', 'terrace', 'balcón', 'terraza', 'patio'],
  
  // Air Conditioning variations
  'air conditioning': ['ac', 'air conditioning', 'aire acondicionado', 'klimaanlage', 'airconditioner'],
  'ac': ['ac', 'air conditioning', 'aire acondicionado', 'klimaanlage'],
  'aire acondicionado': ['ac', 'air conditioning', 'aire acondicionado'],
  
  // Kitchen variations
  'kitchen': ['kitchen', 'cocina', 'küche', 'keuken', 'fitted kitchen', 'modern kitchen'],
  'cocina': ['kitchen', 'cocina', 'küche'],
  'modern kitchen': ['kitchen', 'cocina', 'modern kitchen', 'fitted kitchen'],
  
  // Fireplace variations
  'fireplace': ['fireplace', 'chimenea', 'kamin', 'open haard', 'wood burning'],
  'chimenea': ['fireplace', 'chimenea', 'kamin'],
  
  // Storage variations
  'storage': ['storage', 'closet', 'wardrobe', 'almacenamiento', 'armario', 'schrank'],
  'closet': ['storage', 'closet', 'wardrobe', 'armario'],
  'wardrobe': ['storage', 'closet', 'wardrobe', 'armario'],
  
  // Security variations
  'security': ['security', 'alarm', 'seguridad', 'sicherheit', 'beveiliging'],
  'alarm': ['security', 'alarm', 'seguridad', 'security system'],
  'seguridad': ['security', 'alarm', 'seguridad'],
  
  // Elevator variations
  'elevator': ['elevator', 'lift', 'ascensor', 'aufzug', 'lift'],
  'lift': ['elevator', 'lift', 'ascensor', 'aufzug'],
  'ascensor': ['elevator', 'lift', 'ascensor'],
  
  // Sea/Water view variations
  'sea view': ['sea view', 'ocean view', 'water view', 'vista al mar', 'meerblick'],
  'ocean view': ['sea view', 'ocean view', 'water view', 'vista al mar'],
  'vista al mar': ['sea view', 'ocean view', 'water view', 'vista al mar'],
  'water view': ['sea view', 'ocean view', 'water view', 'vista al mar'],
};

/**
 * Normalize search terms to find all possible feature matches
 * @param searchTerm User's search input
 * @returns Array of normalized feature terms to search for
 */
export function normalizeFeatures(searchTerm: string): string[] {
  const normalized = searchTerm.toLowerCase().trim();
  
  // Check if we have a direct mapping
  const directMapping = FEATURE_MAPPING[normalized];
  if (directMapping) {
    return directMapping;
  }
  
  // Check for partial matches (e.g., "pool" matches "swimming pool")
  const partialMatches: string[] = [];
  Object.entries(FEATURE_MAPPING).forEach(([key, values]) => {
    if (key.includes(normalized) || normalized.includes(key)) {
      partialMatches.push(...values);
    }
    // Also check if the search term matches any of the mapped values
    if (values.some(value => value.includes(normalized) || normalized.includes(value))) {
      partialMatches.push(...values);
    }
  });
  
  if (partialMatches.length > 0) {
    // Remove duplicates and return
    return [...new Set(partialMatches)];
  }
  
  // If no mapping found, return the original term
  return [normalized];
}

/**
 * Get all possible search terms for a given feature
 * Useful for reverse lookups when displaying property features
 * @param feature Property feature from database
 * @returns Array of user-friendly search terms
 */
export function getSearchTermsForFeature(feature: string): string[] {
  const normalized = feature.toLowerCase().trim();
  
  // Find all keys that map to this feature
  const searchTerms: string[] = [];
  Object.entries(FEATURE_MAPPING).forEach(([key, values]) => {
    if (values.includes(normalized)) {
      searchTerms.push(key);
    }
  });
  
  // If no reverse mapping found, return the original feature
  return searchTerms.length > 0 ? searchTerms : [feature];
}

/**
 * Check if two features are equivalent (considering all language variations)
 * @param feature1 First feature to compare
 * @param feature2 Second feature to compare
 * @returns True if features are equivalent
 */
export function areFeaturesSimilar(feature1: string, feature2: string): boolean {
  const normalized1 = normalizeFeatures(feature1);
  const normalized2 = normalizeFeatures(feature2);
  
  // Check if there's any overlap between the normalized arrays
  return normalized1.some(f1 => normalized2.includes(f1));
}

/**
 * Filter properties by feature search with intelligent matching
 * @param properties Array of properties to filter
 * @param searchFeatures Array of features to search for
 * @returns Filtered properties that match any of the search features
 */
export function filterPropertiesByFeatures(
  properties: any[], 
  searchFeatures: string[]
): any[] {
  if (!searchFeatures.length) return properties;
  
  return properties.filter(property => {
    const propertyFeatures = Array.isArray(property.features) 
      ? property.features 
      : [property.features].filter(Boolean);
    
    // Check if any search feature matches any property feature
    return searchFeatures.some(searchFeature => {
      const normalizedSearchTerms = normalizeFeatures(searchFeature);
      return propertyFeatures.some((propertyFeature: string) => {
        const normalizedPropertyTerms = normalizeFeatures(propertyFeature);
        return normalizedSearchTerms.some(searchTerm => 
          normalizedPropertyTerms.includes(searchTerm)
        );
      });
    });
  });
}