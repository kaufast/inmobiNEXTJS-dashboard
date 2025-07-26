import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import PropertyCard from '../property/PropertyCard';
import L from 'leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';
import { Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapLocationSetterProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
}

// This component allows the map to update on position change
const MapLocationSetter: React.FC<MapLocationSetterProps> = ({ position, setPosition }) => {
  const map = useMap();
  
  // useEffect for setting map center
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  // Handle map clicks to set position
  useEffect(() => {
    // Give the map container a higher z-index during interaction
    const mapContainer = map.getContainer();
    
    // This function increases z-index of map container to handle events better
    const setupMapInteraction = () => {
      if (mapContainer) {
        // Save original z-index
        const originalZIndex = mapContainer.style.zIndex || '';
        
        // Increase z-index during interaction to capture events
        mapContainer.style.zIndex = '1000';
        
        // Listen for mouseout to restore z-index
        mapContainer.addEventListener('mouseout', () => {
          mapContainer.style.zIndex = originalZIndex;
        });
      }
    };
    
    setupMapInteraction();
    
    // Map click handler
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Explicitly stop event propagation to prevent other elements from catching it
      e.originalEvent.stopPropagation();
      setPosition([e.latlng.lat, e.latlng.lng]);
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, setPosition]);
  
  return null;
};

const SpatialSearch: React.FC = () => {
  const { t } = useTranslation('search');
  // Default position (New York City)
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [radius, setRadius] = useState<number>(1); // km
  const [isSearching, setIsSearching] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  
  // Reference for the MapContainer
  const mapRef = useRef<L.Map | null>(null);
  
  // Query for properties near the position
  const {
    data: properties,
    isLoading,
    refetch
  } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties/search', { lat: position[0], lng: position[1], radius }],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/properties/search', {
        lat: position[0],
        lng: position[1],
        radius: radius
      });
      return response.json();
    },
    enabled: false // Don't run automatically
  });
  
  // Function to perform search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to geocode address to coordinates
  const handleAddressSearch = async () => {
    if (!searchAddress) return;
    
    setIsFindingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 13);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setIsFindingLocation(false);
    }
  };
  
  // Function to get current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsFindingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          mapRef.current?.setView([latitude, longitude], 13);
          setIsFindingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsFindingLocation(false);
        }
      );
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('search.spatial.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="mb-4">
              <Label htmlFor="address">{t('search.spatial.searchByAddress')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="address"
                  placeholder={t('search.spatial.addressPlaceholder')}
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <Button 
                  size="icon" 
                  onClick={handleAddressSearch}
                  disabled={isFindingLocation || !searchAddress}
                >
                  {isFindingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleCurrentLocation} 
              variant="outline" 
              className="w-full mb-4"
              disabled={isFindingLocation}
            >
              {isFindingLocation ? 
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('search.spatial.findingLocation')}</> : 
                t('search.spatial.useCurrentLocation')
              }
            </Button>
            
            <div className="mb-4">
              <Label htmlFor="radius" className="block mb-2">
                {t('search.spatial.searchRadius')}: {radius} {t('search.spatial.km')}
              </Label>
              <Slider 
                id="radius"
                min={0.5} 
                max={10} 
                step={0.5} 
                value={[radius]} 
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600 mb-1">{t('search.spatial.currentCoordinates')}:</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{t('search.spatial.lat')}: {position[0].toFixed(6)}</Badge>
                <Badge variant="outline">{t('search.spatial.lng')}: {position[1].toFixed(6)}</Badge>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch} 
              className="w-full mt-4 bg-black text-white hover:bg-white hover:text-black"
              disabled={isSearching}
            >
              {isSearching ? 
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('search.spatial.searching')}</> : 
                t('search.spatial.searchProperties')
              }
            </Button>
          </div>
          
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-semibold mb-2">{t('search.spatial.howToUse')}:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• {t('search.spatial.instructions.clickMap')}</li>
              <li>• {t('search.spatial.instructions.adjustRadius')}</li>
              <li>• {t('search.spatial.instructions.searchButton')}</li>
              <li>• {t('search.spatial.instructions.enterAddress')}</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              ref={mapRef}
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} />
              <CircleMarker
                center={position}
                radius={radius * 20} // Scaled for visual representation
                pathOptions={{ color: 'rgba(0, 0, 0, 0.7)', fillColor: 'rgba(0, 0, 0, 0.2)', fillOpacity: 0.3 }}
              />
              <MapLocationSetter position={position} setPosition={setPosition} />
              {properties?.properties.map((property) => (
                <Marker 
                  key={property.id} 
                  position={[property.latitude, property.longitude]}
                  icon={L.icon({ iconUrl: '/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}
                >
                  <PropertyCard property={property} isMapPopup={true} />
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {isLoading && (
            <div className="mt-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
              {t('search.loadingResults')} 
            </div>
          )}
          {!isLoading && properties?.properties && properties.properties.length === 0 && (
            <div className="mt-4 text-center">
              <p>{t('search.spatial.noPropertiesFound')}</p>
            </div>
          )}
          {!isLoading && !properties && (
            <div className="mt-4 text-center">
              <p>{t('search.spatial.initialInstructions')}</p>
            </div>
          )}
        </div>
      </div>
      
      {properties && properties.properties.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {t('search.propertiesFound')} ({properties.total})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialSearch;