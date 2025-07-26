import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng, Map as LeafletMap } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Search, Navigation, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyLocationMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  className?: string;
  disabled?: boolean;
}

interface LocationMarkerProps {
  position: LatLng | null;
  onPositionChange: (position: LatLng) => void;
  disabled?: boolean;
}

function LocationMarker({ position, onPositionChange, disabled }: LocationMarkerProps) {
  const [dragging, setDragging] = useState(false);
  
  const eventHandlers = React.useMemo(() => ({
    dragstart: () => {
      setDragging(true);
    },
    dragend: (e: any) => {
      setDragging(false);
      const marker = e.target;
      const position = marker.getLatLng();
      onPositionChange(position);
    },
  }), [onPositionChange]);

  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onPositionChange(e.latlng);
      }
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={!disabled}
      eventHandlers={eventHandlers}
      opacity={dragging ? 0.7 : 1}
    />
  );
}

export function PropertyLocationMap({
  latitude,
  longitude,
  address = '',
  onLocationChange,
  className,
  disabled = false,
}: PropertyLocationMapProps) {
  const { toast } = useToast();
  const mapRef = useRef<LeafletMap | null>(null);
  
  // State management
  const [position, setPosition] = useState<LatLng | null>(
    latitude && longitude ? new LatLng(latitude, longitude) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    latitude && longitude 
      ? new LatLng(latitude, longitude)
      : new LatLng(40.7128, -74.0060) // Default to NYC
  );

  // Update position when props change
  useEffect(() => {
    if (latitude && longitude) {
      const newPosition = new LatLng(latitude, longitude);
      setPosition(newPosition);
      setMapCenter(newPosition);
      setCurrentAddress(address);
    }
  }, [latitude, longitude, address]);

  // Geocoding function
  const geocodeAddress = async (searchAddress: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/properties/geocode?address=${encodeURIComponent(searchAddress)}`);
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.coordinates) {
        const newPosition = new LatLng(data.coordinates.latitude, data.coordinates.longitude);
        setPosition(newPosition);
        setMapCenter(newPosition);
        setCurrentAddress(data.address || searchAddress);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView(newPosition, 16);
        }
        
        onLocationChange({
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude,
          address: data.address || searchAddress,
        });
        
        toast({
          title: "Location found",
          description: `Successfully located: ${data.address || searchAddress}`,
        });
      } else {
        toast({
          title: "Location not found",
          description: "Could not find the specified address. Please try a different search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for the address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(`/api/properties/reverse-geocode?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.address) {
        setCurrentAddress(data.address);
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: data.address,
        });
      } else {
        // Fallback to coordinates display
        const coordsAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setCurrentAddress(coordsAddress);
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: coordsAddress,
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates display
      const coordsAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(coordsAddress);
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address: coordsAddress,
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handle position change from map interaction
  const handlePositionChange = (newPosition: LatLng) => {
    if (disabled) return;
    
    setPosition(newPosition);
    reverseGeocode(newPosition.lat, newPosition.lng);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !disabled) {
      geocodeAddress(searchQuery.trim());
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (disabled) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = new LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setPosition(newPosition);
          setMapCenter(newPosition);
          
          if (mapRef.current) {
            mapRef.current.setView(newPosition, 16);
          }
          
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          
          toast({
            title: "Location found",
            description: "Successfully located your current position",
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location access denied",
            description: "Could not access your location. Please search for an address instead.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please search for an address instead.",
        variant: "destructive",
      });
    }
  };

  // Reset map to initial state
  const resetMap = () => {
    if (disabled) return;
    
    setPosition(null);
    setCurrentAddress('');
    setSearchQuery('');
    setMapCenter(new LatLng(40.7128, -74.0060));
    
    if (mapRef.current) {
      mapRef.current.setView(new LatLng(40.7128, -74.0060), 10);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Controls */}
        <div className="space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for an address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={disabled || isSearching}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              variant="outline" 
              disabled={disabled || isSearching || !searchQuery.trim()}
              className="shrink-0"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Use Current Location
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetMap}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <MapContainer
            center={mapCenter}
            zoom={position ? 16 : 10}
            style={{ height: '400px', width: '100%' }}
            className="rounded-lg border"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              onPositionChange={handlePositionChange}
              disabled={disabled}
            />
          </MapContainer>
          
          {/* Loading Overlay */}
          {isReverseGeocoding && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding address...
              </div>
            </div>
          )}
        </div>

        {/* Location Information */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Location</Label>
          
          {position ? (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Address:</p>
                <p className="text-sm text-muted-foreground">{currentAddress || 'Unknown address'}</p>
                {currentAddress && (
                  <div className="mt-2 text-xs text-gray-500">
                    ✓ Location confirmed by {currentAddress.includes(',') ? 'address selection' : 'coordinates'}
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Coordinates:</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Lat: {position.lat.toFixed(6)}</span>
                  <span>Lng: {position.lng.toFixed(6)}</span>
                </div>
              </div>
              
              <Badge variant="outline" className="w-fit">
                <MapPin className="h-3 w-3 mr-1" />
                Location confirmed
              </Badge>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click on the map to set a location</p>
              <p className="text-xs">or search for an address above</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click anywhere on the map to set the property location</p>
          <p>• Drag the marker to fine-tune the exact position</p>
          <p>• Search for an address to automatically place a marker</p>
          <p>• Use "Current Location" to detect your position</p>
        </div>
      </CardContent>
    </Card>
  );
}