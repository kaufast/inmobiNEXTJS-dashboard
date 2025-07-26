import { useRef, useEffect, useState, useCallback } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2, X } from "lucide-react";
import L from "leaflet";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";

// Import Google Maps animation constants
const GOOGLE_MAPS_ANIMATION = {
  BOUNCE: 1,
  DROP: 2
};

interface PlaceResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Extract address components from Google geocoding result
const extractAddressComponents = (addressComponents: any[]) => {
  const result: Record<string, string> = {};
  
  // Debug the address components
  console.log('Processing address components:', JSON.stringify(addressComponents));
  
  for (const component of addressComponents) {
    const types = component.types;
    
    if (types.includes("street_number")) {
      result.streetNumber = component.long_name;
    } else if (types.includes("route")) {
      result.street = component.long_name;
    } else if (types.includes("locality") || types.includes("sublocality")) {
      // In many countries, what we call "city" can be in different address component types
      result.city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      result.state = component.long_name;
    } else if (types.includes("country")) {
      result.country = component.long_name;
    } else if (types.includes("postal_code")) {
      result.zipCode = component.long_name;
    } else if (types.includes("sublocality_level_1") && !result.city) {
      // Often used in international addresses, especially in Mexico and Spain
      result.city = component.long_name;
    } else if (types.includes("political") && types.includes("administrative_area_level_2") && !result.city) {
      // Sometimes the city is in administrative_area_level_2 (especially in Mexico)
      result.city = component.long_name;
    } else if (types.includes("neighborhood") && !result.address) {
      // When no specific street is given, use neighborhood
      result.neighborhood = component.long_name;
    }
  }
  
  // Combine street number and street name
  if (result.streetNumber && result.street) {
    result.address = `${result.streetNumber} ${result.street}`;
  } else if (result.street) {
    result.address = result.street;
  } else if (result.neighborhood) {
    // If we only have neighborhood but no specific address
    result.address = result.neighborhood;
  }
  
  // For Spanish locales, ensure city takes precedence over smaller regions
  if (result.country === "Mexico" || result.country === "México" || 
      result.country === "Spain" || result.country === "España") {
    // First check if we have a proper city, otherwise use the largest available region
    if (!result.city && result.state) {
      result.city = result.state;
    }
  }
  
  console.log('Extracted address components:', result);
  return result;
};

const libraries = ["places"] as const;

export function StepLocation() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [showExactAddress, setShowExactAddress] = useState(
    !!propertyData.address
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: propertyData.latitude || 40.7128,
    lng: propertyData.longitude || -74.006
  });
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    propertyData.latitude && propertyData.longitude 
      ? { lat: propertyData.latitude, lng: propertyData.longitude } 
      : null
  );

  // Load Google Maps script with safety checks
  const { isLoaded: googleMapsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: "weekly"
  });

  // Initialize OpenStreetMap when Google Maps fails
  const [usingFallbackMap, setUsingFallbackMap] = useState(false);
  
  // Log Google Maps loading status and handle errors
  useEffect(() => {
    console.log('Google Maps loading status:', {
      isLoaded: googleMapsLoaded,
      loadError,
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'configured' : 'missing'
    });
    
    if (loadError || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps loading error:', loadError || 'Missing API key');
      setUsingFallbackMap(true);
      toast({
        title: t('wizard.steps.location.mapLoadingError'),
        description: t('wizard.steps.location.mapLoadingErrorDesc'),
        variant: "destructive",
      });
    }
  }, [googleMapsLoaded, loadError, toast, t]);

  // Set up Places Autocomplete
  const {
    ready,
    value: inputValue,
    suggestions: { status, data: placesSuggestions },
    setValue: setInputValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    callbackName: "initMap",
    requestOptions: {
      componentRestrictions: { 
        country: propertyData.country === "Mexico" || propertyData.country === "México" ? "mx" : 
                 propertyData.country === "Spain" || propertyData.country === "España" ? "es" : 
                 propertyData.country === "Germany" || propertyData.country === "Deutschland" ? "de" : 
                 propertyData.country === "Austria" || propertyData.country === "Österreich" ? "at" : undefined 
      },
      // Add language bias for better results
      language: propertyData.country === "Mexico" || propertyData.country === "México" || 
                propertyData.country === "Spain" || propertyData.country === "España" ? "es" : 
                propertyData.country === "Germany" || propertyData.country === "Deutschland" || 
                propertyData.country === "Austria" || propertyData.country === "Österreich" ? "de" : "en",
      // Enable all types of places for flexibility
      types: ['address', 'establishment', '(regions)', '(cities)']
    },
    debounce: 300,
    enabled: googleMapsLoaded && !loadError
  });

  // Log Places Autocomplete status
  useEffect(() => {
    console.log('Places Autocomplete status:', {
      ready,
      status,
      suggestionsCount: placesSuggestions.length,
      inputValue
    });
  }, [ready, status, placesSuggestions.length, inputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle place selection
  const handleSelectPlace = useCallback(async (place: PlaceResult) => {
    if (!googleMapsLoaded) {
      console.error('Google Maps not loaded when trying to select place');
      toast({
        title: t('wizard.steps.location.errorTitle'),
        description: t('wizard.steps.location.geocodingError'),
        variant: "destructive",
      });
      return;
    }

    setInputValue(place.description, false);
    clearSuggestions();
    setPopoverOpen(false);

    try {
      // Geocode the selected place
      const results = await getGeocode({ placeId: place.place_id });
      console.log('Geocoding results:', results);
      
      if (results.length === 0) {
        throw new Error('No geocoding results found');
      }
      
      // Get latitude and longitude
      const { lat, lng } = await getLatLng(results[0]);
      console.log('Selected location coordinates:', { lat, lng });
      
      // Extract address components
      const addressComponents = extractAddressComponents(results[0].address_components);
      
      // Update the map center and marker position
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      
      // Update property data with the new location information
      updatePropertyData({
        address: addressComponents.address || '',
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        zipCode: addressComponents.zipCode || '',
        country: addressComponents.country || '',
        latitude: lat,
        longitude: lng
      });
      
      toast({
        title: t('wizard.steps.location.addressSelected'),
        description: t('wizard.steps.location.addressSelectedDesc'),
      });
    } catch (error) {
      console.error('Error selecting place:', error);
      toast({
        title: t('wizard.steps.location.errorTitle'),
        description: t('wizard.steps.location.geocodingError'),
        variant: "destructive",
      });
    }
  }, [googleMapsLoaded, toast, clearSuggestions, setInputValue, updatePropertyData, t]);

  // Initialize the map when it's ready
  useEffect(() => {
    // Function to initialize Leaflet map (fallback)
    const initLeafletMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Only initialize once
        if (typeof window !== 'undefined' && typeof L !== 'undefined') {
          // Create the map instance
          const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], 13);
          
          // Add the tile layer (OpenStreetMap)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Add a marker if we have coordinates
          if (markerPosition) {
            markerRef.current = L.marker([markerPosition.lat, markerPosition.lng]).addTo(map);
          }
          
          // Add click handler to the map
          map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            
            // Update marker position
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng]).addTo(map);
            }
            
            // Update state and property data
            setMarkerPosition({ lat, lng });
            updatePropertyData({
              latitude: lat,
              longitude: lng
            });
            
            toast({
              title: t('wizard.steps.location.manualPositionUpdateTitle'),
              description: t('wizard.steps.location.manualPositionUpdateDesc'),
            });
            
            // Note: This doesn't update the address information since we don't have geocoding here
          });
          
          // Store the map instance
          mapInstanceRef.current = map;
        }
      }
    };
    
    // Initialize the appropriate map
    if (usingFallbackMap) {
      console.log('Initializing fallback Leaflet map');
      initLeafletMap();
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current && usingFallbackMap) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [usingFallbackMap, markerPosition, mapCenter, toast, updatePropertyData, t]);

  // Handle the exact address toggle
  const handleExactAddressToggle = (checked: boolean) => {
    setShowExactAddress(checked);
    
    // If toggling off, we clear the detailed address but keep coordinates
    if (!checked) {
      updatePropertyData({
        address: '',
        hideExactAddress: true
      });
    } else {
      updatePropertyData({
        hideExactAddress: false
      });
    }
  };

  // Define Google Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem'
  };

  // Handle Google Maps click event
  const handleGoogleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    
    // Update property data with new coordinates
    updatePropertyData({
      latitude: lat,
      longitude: lng
    });
    
    toast({
      title: t('wizard.steps.location.manualPositionUpdateTitle'),
      description: t('wizard.steps.location.manualPositionUpdateDesc'),
    });
  }, [updatePropertyData, toast, t]);

  return (
    <QuestionCard
      title={t('wizard.steps.location.title')}
      description={t('wizard.steps.location.description')}
      icon={<MapPin className="h-5 w-5" />}
    >
      <div className="space-y-6">
        {/* Location search */}
        <div className="space-y-2">
          <Label htmlFor="location-search" className="font-medium">
            {t('wizard.steps.location.searchPlaceholder')}
          </Label>
          
          <Popover open={popoverOpen && placesSuggestions.length > 0} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  id="location-search"
                  placeholder={t('wizard.steps.location.searchPlaceholder')}
                  value={inputValue}
                  onChange={handleInputChange}
                  className="pr-10"
                  disabled={!googleMapsLoaded || !ready}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {inputValue ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setInputValue('');
                        clearSuggestions();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </PopoverTrigger>
            
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
              <Command>
                <CommandInput placeholder={t('wizard.steps.location.searchPlaceholder')} className="h-9" />
                <CommandEmpty>{t('wizard.steps.location.searchEmpty')}</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {placesSuggestions.map((place) => (
                    <CommandItem
                      key={place.place_id}
                      onSelect={() => handleSelectPlace(place)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{place.structured_formatting.main_text}</span>
                        <span className="text-sm text-muted-foreground">{place.structured_formatting.secondary_text}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Map section */}
        <div className="space-y-4">
          <Label className="font-medium">{t('wizard.steps.location.mapTitle')}</Label>
          
          <div className="border rounded-lg overflow-hidden h-[300px] bg-gray-100">
            {googleMapsLoaded && !usingFallbackMap ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={14}
                onClick={handleGoogleMapClick}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  scrollwheel: true,
                  fullscreenControl: true,
                  streetViewControl: true,
                }}
              >
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    animation={GOOGLE_MAPS_ANIMATION.DROP}
                  />
                )}
              </GoogleMap>
            ) : (
              <div ref={mapRef} className="w-full h-full" />
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {t('wizard.steps.location.mapInstructions')}
          </div>
        </div>
        
        {/* Show exact address toggle */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label className="text-base cursor-pointer" htmlFor="show-exact-address">
              {t('wizard.steps.location.addressToggleLabel')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('wizard.steps.location.addressToggleDescription')}
            </p>
          </div>
          <Switch
            id="show-exact-address"
            checked={showExactAddress}
            onCheckedChange={handleExactAddressToggle}
          />
        </div>
        
        {/* Address details (conditional) */}
        {showExactAddress && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-lg">{t('wizard.steps.location.addressDetails')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">{t('wizard.steps.location.addressLabel')}</Label>
                <Input
                  id="address"
                  placeholder={t('wizard.steps.location.addressPlaceholder')}
                  value={propertyData.address || ''}
                  onChange={(e) => updatePropertyData({ address: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">{t('wizard.steps.location.cityLabel')}</Label>
                <Input
                  id="city"
                  placeholder={t('wizard.steps.location.cityPlaceholder')}
                  value={propertyData.city || ''}
                  onChange={(e) => updatePropertyData({ city: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">{t('wizard.steps.location.stateLabel')}</Label>
                <Input
                  id="state"
                  placeholder={t('wizard.steps.location.statePlaceholder')}
                  value={propertyData.state || ''}
                  onChange={(e) => updatePropertyData({ state: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t('wizard.steps.location.zipCodeLabel')}</Label>
                <Input
                  id="zipCode"
                  placeholder={t('wizard.steps.location.zipCodePlaceholder')}
                  value={propertyData.zipCode || ''}
                  onChange={(e) => updatePropertyData({ zipCode: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">{t('wizard.steps.location.countryLabel')}</Label>
                <Input
                  id="country"
                  placeholder={t('wizard.steps.location.countryPlaceholder')}
                  value={propertyData.country || ''}
                  onChange={(e) => updatePropertyData({ country: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </QuestionCard>
  );
}