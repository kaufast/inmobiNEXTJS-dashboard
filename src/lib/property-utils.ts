import { Property } from "@shared/schema";

/**
 * Convert features from any format to an array
 * @param features Features in any format (string, array, object)
 * @returns Features as a string array
 */
export function getFeatureArray(features: any): string[] {
  if (!features) return [];
  
  // Handle string features (common from database)
  if (typeof features === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [features];
    } catch {
      // If not JSON, try splitting by common separators
      if (features.includes(',')) return features.split(',').map(f => f.trim());
      if (features.includes(';')) return features.split(';').map(f => f.trim());
      return [features.trim()]; // Single feature
    }
  }
  
  // Already an array
  if (Array.isArray(features)) {
    return features.map(f => String(f)).filter(Boolean);
  }
  
  // Handle object case
  if (typeof features === 'object' && features !== null) {
    // If it's a property object with a features array
    if (Array.isArray(features.features)) {
      return features.features.map((f: unknown) => String(f)).filter(Boolean);
    }
    // If it's some other object, convert to string
    return [JSON.stringify(features)];
  }
  
  // For any other type, convert to string
  return [String(features)].filter(Boolean);
}

/**
 * Convert images from any format to an array
 * @param images Images in any format (string, array, object)
 * @returns Images as a string array
 */
export function getImagesArray(images: any): string[] {
  if (!images) return [];
  
  // Handle string images (common from database)
  if (typeof images === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [images];
    } catch {
      // If not JSON, try splitting by common separators
      if (images.includes(',')) return images.split(',').map(img => img.trim());
      if (images.includes(';')) return images.split(';').map(img => img.trim());
      return [images.trim()]; // Single image
    }
  }
  
  // Already an array
  if (Array.isArray(images)) {
    return images.map(img => {
      // Handle image objects with url property
      if (typeof img === 'object' && img !== null && 'url' in img) {
        return img.url;
      }
      return String(img);
    }).filter(Boolean);
  }
  
  // Handle object case
  if (typeof images === 'object' && images !== null) {
    // If it's a property object with an images array
    if (Array.isArray(images.images)) {
      return images.images.map((img: unknown) => {
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return (img as { url: string }).url;
        }
        return String(img);
      }).filter(Boolean);
    }
    // If it's an image object with url property
    if ('url' in images) {
      return [(images as { url: string }).url];
    }
    // If it's some other object, convert to string
    return [JSON.stringify(images)];
  }
  
  // For any other type, convert to string
  return [String(images)].filter(Boolean);
}

/**
 * Normalize a property object to ensure consistent types
 * @param property Property object from API
 * @returns Normalized property with consistent types
 */
export function normalizeProperty(property: any): Property | undefined {
  if (!property) return undefined;
  
  try {
    // Debug logging to see raw property data
    console.log('🔧 NORMALIZE DEBUG - Raw property:', {
      id: property.id,
      title: property.title,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      property_type: property.property_type,
      listing_type: property.listing_type,
      square_feet: property.square_feet
    });
    
    // Define valid property types based on Neon schema
    const validPropertyTypes = ['apartment', 'villa', 'penthouse', 'townhouse', 'office', 'retail', 'land'] as const;
    
    const normalizedProperty = {
      ...property,
      // Convert numeric fields - handle both snake_case (database) and camelCase (frontend)
      id: typeof property.id === 'string' ? parseInt(property.id) : property.id,
      price: typeof property.price === 'string' ? parseFloat(property.price) : (property.price ?? null),
      bedrooms: typeof property.bedrooms === 'string' ? parseInt(property.bedrooms) : (property.bedrooms ?? 0),
      bathrooms: typeof property.bathrooms === 'string' ? parseFloat(property.bathrooms) : (property.bathrooms ?? 0),
      squareFeet: typeof (property.square_feet || property.squareFeet) === 'string' 
        ? parseInt(property.square_feet || property.squareFeet) 
        : (property.square_feet || property.squareFeet || 0),
      
      // Convert boolean fields - handle snake_case and camelCase
      isPremium: property.is_premium === true || property.is_premium === 'true' || property.isPremium === true || property.isPremium === 'true',
      isVerified: property.is_verified === true || property.is_verified === 'true' || property.isVerified === true || property.isVerified === 'true',
      isFeatured: property.is_featured === true || property.is_featured === 'true' || property.isFeatured === true || property.isFeatured === 'true',
      
      // Handle listing type field name mismatch
      listingType: property.listing_type || property.listingType || 'buy',
      
      // Ensure propertyType is valid - handle snake_case field name
      propertyType: validPropertyTypes.includes((property.property_type || property.propertyType) as typeof validPropertyTypes[number]) 
        ? (property.property_type || property.propertyType)
        : 'apartment', // Default to apartment if invalid
      
      // Handle PostGIS location if present
      location: property.location || null,
      
      // Convert array fields
      features: getFeatureArray(property.features),
      images: getImagesArray(property.images),
    };
    
    console.log('🔧 NORMALIZE DEBUG - Normalized result:', {
      id: normalizedProperty.id,
      title: normalizedProperty.title,
      price: normalizedProperty.price,
      bedrooms: normalizedProperty.bedrooms,
      bathrooms: normalizedProperty.bathrooms,
      propertyType: normalizedProperty.propertyType,
      listingType: normalizedProperty.listingType,
      squareFeet: normalizedProperty.squareFeet
    });
    
    return normalizedProperty;
  } catch (error) {
    console.error('Error normalizing property:', error);
    // Return a safe version of the property with defaults
    return {
      ...property,
      propertyType: 'apartment', // Ensure propertyType is set even in error case
      features: [],
      images: [],
      isFeatured: false,
      location: null
    };
  }
}

/**
 * Normalize an array of properties
 * @param properties Array of properties from API
 * @returns Array of normalized properties
 */
export function normalizeProperties(properties: any[]): Property[] {
  if (!properties || !Array.isArray(properties)) return [];
  return properties.map(property => normalizeProperty(property)).filter((p): p is Property => p !== undefined);
} 