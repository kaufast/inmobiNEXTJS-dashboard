/**
 * Google Places API service for address autocomplete
 */

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlaceAutocompleteResult {
  success: boolean;
  predictions: PlacePrediction[];
  error?: string;
}

export interface PlaceDetailsResult {
  success: boolean;
  result?: PlaceDetails;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  addressComponents?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  placeId?: string;
  error?: string;
}

/**
 * Fetch address autocomplete suggestions
 */
export async function fetchPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult> {
  if (!input || input.trim().length < 2) {
    return {
      success: true,
      predictions: []
    };
  }

  try {
    const API_BASE = process.env.NODE_ENV === 'production' 
      ? '' 
      : `${window.location.protocol}//${window.location.hostname}:8090`;

    const response = await fetch(`${API_BASE}/api/properties/places/autocomplete?input=${encodeURIComponent(input)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Autocomplete failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        predictions: [],
        error: data.error || 'Failed to fetch autocomplete suggestions'
      };
    }

    return {
      success: true,
      predictions: data.predictions || []
    };
  } catch (error) {
    console.error('Places autocomplete service error:', error);
    return {
      success: false,
      predictions: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetch place details by place ID
 */
export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  if (!placeId) {
    return {
      success: false,
      error: 'Place ID is required'
    };
  }

  try {
    const API_BASE = process.env.NODE_ENV === 'production' 
      ? '' 
      : `${window.location.protocol}//${window.location.hostname}:8090`;

    const response = await fetch(`${API_BASE}/api/properties/places/details?place_id=${encodeURIComponent(placeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Place details failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Failed to fetch place details'
      };
    }

    return {
      success: true,
      result: data.result,
      coordinates: data.coordinates,
      address: data.address,
      addressComponents: data.addressComponents,
      placeId: data.placeId
    };
  } catch (error) {
    console.error('Places details service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debounced autocomplete function
 */
let debounceTimer: NodeJS.Timeout | null = null;

export function debouncedPlaceAutocomplete(
  input: string,
  callback: (result: PlaceAutocompleteResult) => void,
  delay: number = 300
): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const result = await fetchPlaceAutocomplete(input);
    callback(result);
  }, delay);
}

/**
 * Cancel pending debounced autocomplete request
 */
export function cancelDebouncedAutocomplete(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/**
 * Parse address components into structured format
 */
export function parseAddressComponents(addressComponents: Array<{
  long_name: string;
  short_name: string;
  types: string[];
}>): {
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
} {
  const result: {
    streetNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } = {};

  for (const component of addressComponents) {
    const types = component.types;
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      result.street = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.long_name;
    } else if (types.includes('postal_code')) {
      result.zipCode = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.long_name;
    }
  }

  return result;
}