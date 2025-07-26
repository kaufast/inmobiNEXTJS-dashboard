import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  fetchPlaceAutocomplete, 
  fetchPlaceDetails, 
  debouncedPlaceAutocomplete,
  cancelDebouncedAutocomplete,
  parseAddressComponents,
  type PlacePrediction,
  type PlaceDetailsResult
} from '@/lib/places-service';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (result: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    addressComponents: {
      streetNumber?: string;
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    placeId: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  disabled = false,
  className
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle input change with debounced autocomplete
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setError('');
    
    if (inputValue.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debouncedPlaceAutocomplete(inputValue, (result) => {
      setIsLoading(false);
      
      if (result.success) {
        setPredictions(result.predictions);
        setIsOpen(result.predictions.length > 0);
        setSelectedIndex(-1);
      } else {
        setError(result.error || 'Failed to fetch suggestions');
        setPredictions([]);
        setIsOpen(false);
      }
    });
  };

  // Handle prediction selection
  const handlePredictionSelect = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    setIsOpen(false);
    
    try {
      const placeDetails = await fetchPlaceDetails(prediction.place_id);
      
      if (placeDetails.success && placeDetails.coordinates && placeDetails.address) {
        const addressComponents = parseAddressComponents(placeDetails.addressComponents || []);
        
        onAddressSelect({
          address: placeDetails.address,
          coordinates: placeDetails.coordinates,
          addressComponents,
          placeId: prediction.place_id
        });
        
        onChange(placeDetails.address);
      } else {
        setError(placeDetails.error || 'Failed to get place details');
      }
    } catch (error) {
      setError('Failed to process selected address');
      console.error('Error selecting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePredictionSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      cancelDebouncedAutocomplete();
    };
  }, []);

  // Clear predictions when input is cleared
  useEffect(() => {
    if (!value.trim()) {
      setPredictions([]);
      setIsOpen(false);
      setError('');
    }
  }, [value]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          className="pl-10 pr-10 border-black focus:border-black focus:ring-black"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* Clear button */}
        {value && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => {
              onChange('');
              setError('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* Dropdown with predictions */}
      {isOpen && predictions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg border-black"
        >
          <CardContent className="p-0">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.place_id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors",
                  selectedIndex === index && "bg-blue-50"
                )}
                onClick={() => handlePredictionSelect(prediction)}
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {isOpen && predictions.length === 0 && value.trim().length >= 2 && !isLoading && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border-black">
          <CardContent className="p-3">
            <div className="text-sm text-gray-500 text-center">
              No addresses found. Try a different search.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>• Type to search for addresses</span>
          <span>• Use arrow keys to navigate</span>
          <span>• Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}