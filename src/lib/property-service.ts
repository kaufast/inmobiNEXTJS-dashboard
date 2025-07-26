import { apiRequest } from "@/lib/queryClient";
import { Property, PropertySearchParams } from "@shared/schema";
import i18n from "@/i18n";
import { formatPrice } from "@/lib/currency-utils";
import { formatAreaForLocale } from "@/lib/formatters";

export interface PropertySearchResult {
  properties: Property[];
  total: number;
}

export const PropertyService = {
  /**
   * Get a property by ID
   */
  async getProperty(id: number): Promise<Property> {
    const response = await apiRequest("GET", `/api/properties/${id}`);
    return response.json();
  },

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const response = await apiRequest("GET", `/api/properties/featured?limit=${limit}`);
    return response.json();
  },

  /**
   * Get all properties with pagination
   */
  async getProperties(limit: number = 10, offset: number = 0): Promise<Property[]> {
    const response = await apiRequest("GET", `/api/properties?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  /**
   * Search properties with filters
   */
  async searchProperties(params: Partial<PropertySearchParams>): Promise<PropertySearchResult> {
    // Build query string from params
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}=${value.join(',')}`;
        }
        return `${key}=${encodeURIComponent(String(value))}`;
      })
      .join('&');
    
    const response = await apiRequest("GET", `/api/properties/search?${queryParams}`);
    return response.json();
  },

  /**
   * Format price for display with locale awareness
   */
  formatPrice(price: number, isRent: boolean = false, locale?: string): string {
    const currentLocale = locale || i18n.language || 'en-US';
    const formatted = formatPrice(price, currentLocale);
    
    return isRent ? `${formatted}/mo` : formatted;
  },

  /**
   * Format area with locale-appropriate units (sqft vs sqm)
   */
  formatArea(squareFeet: number, locale?: string): string {
    const currentLocale = locale || i18n.language || 'en-US';
    return formatAreaForLocale(squareFeet, currentLocale);
  },

  /**
   * Get property type display name
   */
  getPropertyTypeName(type: string): string {
    const typeKey = type.toLowerCase().replace(/^propertyTypes\./, '');
    return i18n.t(`propertyTypes.${typeKey}`, { ns: 'properties', defaultValue: type });
  },

  /**
   * Get appropriate icon for a property feature
   */
  getFeatureIcon(feature: string): string {
    const featureToIcon: Record<string, string> = {
      pool: 'fa-swimming-pool',
      sea: 'fa-water',
      ocean: 'fa-water',
      balcony: 'fa-sun',
      terrace: 'fa-sun',
      air: 'fa-snowflake',
      conditioning: 'fa-snowflake',
      parking: 'fa-car',
      garage: 'fa-car',
      gym: 'fa-dumbbell',
      fitness: 'fa-dumbbell',
      security: 'fa-shield-alt',
      garden: 'fa-leaf',
      views: 'fa-mountain',
      furnished: 'fa-couch',
      pets: 'fa-paw',
      wifi: 'fa-wifi',
      fireplace: 'fa-fire',
      storage: 'fa-box',
      elevator: 'fa-arrow-up',
    };
    
    // Find a matching icon based on feature name containing any of the keys
    const matchingKey = Object.keys(featureToIcon).find(key => 
      feature.toLowerCase().includes(key)
    );
    
    return matchingKey ? featureToIcon[matchingKey] : 'fa-check';
  }
};
