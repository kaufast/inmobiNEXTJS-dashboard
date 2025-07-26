/**
 * Geocoding service for converting addresses to coordinates
 * Based on TASK-03-PROPERTY-FEATURES.md lines 26-49
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface GeocodingError {
  error: string;
  details?: string;
}

/**
 * Geocode an address using the backend API
 * @param address Full address string to geocode
 * @returns Promise with coordinates or error
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | GeocodingError> {
  if (!address || address.trim().length === 0) {
    return { error: 'Address is required' };
  }

  try {
    const API_BASE = process.env.NODE_ENV === 'production' 
      ? '' 
      : `${window.location.protocol}//${window.location.hostname}:8090`;

    const response = await fetch(`${API_BASE}/api/properties/geocode?address=${encodeURIComponent(address)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || data.error) {
      return { error: data.error || 'Geocoding failed', details: data.details };
    }

    // Handle new API format with coordinates object
    if (data.coordinates) {
      return {
        latitude: data.coordinates.latitude,
        longitude: data.coordinates.longitude,
        formattedAddress: data.address || data.formattedAddress
      };
    }

    // Handle legacy format (fallback)
    return {
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lng,
      formattedAddress: data.formattedAddress || data.formatted_address
    };
  } catch (error) {
    console.error('Geocoding service error:', error);
    return { 
      error: 'Failed to geocode address', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Debounced geocoding function to avoid too many API calls
 * @param address Address to geocode
 * @param delay Delay in milliseconds (default: 1000ms)
 * @returns Promise with geocoding result
 */
export function debouncedGeocode(address: string, delay: number = 1000): Promise<GeocodingResult | GeocodingError> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(async () => {
      const result = await geocodeAddress(address);
      resolve(result);
    }, delay);

    // Store timeout ID for potential cleanup
    (debouncedGeocode as any).timeoutId = timeoutId;
  });
}

/**
 * Cancel pending debounced geocoding request
 */
export function cancelDebouncedGeocode(): void {
  if ((debouncedGeocode as any).timeoutId) {
    clearTimeout((debouncedGeocode as any).timeoutId);
    (debouncedGeocode as any).timeoutId = null;
  }
}

/**
 * Compose full address from components
 * @param components Address components
 * @returns Full address string
 */
export function composeAddress(components: {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string {
  const { address, city, state, zipCode, country } = components;
  
  const parts = [
    address,
    city,
    state && zipCode ? `${state} ${zipCode}` : state || zipCode,
    country
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Check if coordinates are valid
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @returns True if coordinates are valid
 */
export function areCoordinatesValid(latitude?: number, longitude?: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}