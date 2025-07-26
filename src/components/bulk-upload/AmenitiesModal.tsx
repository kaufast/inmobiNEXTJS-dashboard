/**
 * Amenities Modal Component for Bulk Property Upload
 */

import React, { useState, useEffect } from 'react';
import { PropertyRow } from '@/lib/csv-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  X, 
  Wind, 
  Zap, 
  Home, 
  Car, 
  Dumbbell, 
  Waves, 
  Flower, 
  Heart, 
  Mountain, 
  Flame, 
  ArrowUp, 
  Accessibility, 
  Shield, 
  Users, 
  Shirt,
  Check,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyAmenity {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'comfort' | 'outdoor' | 'safety' | 'luxury' | 'accessibility' | 'services';
  description?: string;
}

export interface CustomAmenity {
  id: string;
  name: string;
  description?: string;
  propertyId: string;
}

export interface PropertyAmenities {
  propertyId: string;
  standardAmenities: string[]; // IDs of standard amenities
  customAmenities: CustomAmenity[];
}

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyRow[];
  selectedPropertyIds: string[];
  onSave: (amenities: PropertyAmenities[]) => void;
  initialAmenities?: PropertyAmenities[];
}

// Standard amenities with categories
const STANDARD_AMENITIES: PropertyAmenity[] = [
  // Comfort
  { id: 'air-conditioning', name: 'Air Conditioning', icon: <Wind className="h-4 w-4" />, category: 'comfort' },
  { id: 'heating', name: 'Heating', icon: <Flame className="h-4 w-4" />, category: 'comfort' },
  { id: 'furnished', name: 'Furnished', icon: <Home className="h-4 w-4" />, category: 'comfort' },
  { id: 'fireplace', name: 'Fireplace', icon: <Flame className="h-4 w-4" />, category: 'comfort' },
  
  // Outdoor
  { id: 'balcony-patio', name: 'Balcony/Patio', icon: <Mountain className="h-4 w-4" />, category: 'outdoor' },
  { id: 'garden', name: 'Garden', icon: <Flower className="h-4 w-4" />, category: 'outdoor' },
  { id: 'swimming-pool', name: 'Swimming Pool', icon: <Waves className="h-4 w-4" />, category: 'outdoor' },
  { id: 'ocean-view', name: 'Ocean View', icon: <Mountain className="h-4 w-4" />, category: 'outdoor' },
  
  // Safety & Security
  { id: 'security-system', name: 'Security System', icon: <Shield className="h-4 w-4" />, category: 'safety' },
  { id: 'garage', name: 'Garage', icon: <Car className="h-4 w-4" />, category: 'safety' },
  
  // Luxury
  { id: 'gym', name: 'Gym', icon: <Dumbbell className="h-4 w-4" />, category: 'luxury' },
  { id: 'concierge', name: 'Concierge', icon: <Users className="h-4 w-4" />, category: 'luxury' },
  { id: 'lift', name: 'Lift/Elevator', icon: <ArrowUp className="h-4 w-4" />, category: 'luxury' },
  
  // Accessibility
  { id: 'wheelchair-access', name: 'Wheelchair Access', icon: <Accessibility className="h-4 w-4" />, category: 'accessibility' },
  { id: 'pet-friendly', name: 'Pet Friendly', icon: <Heart className="h-4 w-4" />, category: 'accessibility' },
  
  // Services
  { id: 'laundry-room', name: 'Laundry Room', icon: <Shirt className="h-4 w-4" />, category: 'services' }
];

const CATEGORY_LABELS = {
  comfort: 'Comfort & Climate',
  outdoor: 'Outdoor & Views',
  safety: 'Safety & Security',
  luxury: 'Luxury & Facilities',
  accessibility: 'Accessibility & Pets',
  services: 'Services & Utilities'
};

const CATEGORY_ICONS = {
  comfort: <Wind className="h-4 w-4" />,
  outdoor: <Mountain className="h-4 w-4" />,
  safety: <Shield className="h-4 w-4" />,
  luxury: <Dumbbell className="h-4 w-4" />,
  accessibility: <Accessibility className="h-4 w-4" />,
  services: <Shirt className="h-4 w-4" />
};

export function AmenitiesModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyIds,
  onSave,
  initialAmenities = []
}: AmenitiesModalProps) {
  const [propertyAmenities, setPropertyAmenities] = useState<PropertyAmenities[]>([]);
  const [activeTab, setActiveTab] = useState('bulk');
  const [newCustomAmenity, setNewCustomAmenity] = useState({ name: '', description: '' });
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Initialize amenities for selected properties
  useEffect(() => {
    if (isOpen) {
      const initialData = selectedPropertyIds.map(propertyId => {
        const existing = initialAmenities.find(a => a.propertyId === propertyId);
        return existing || {
          propertyId,
          standardAmenities: [],
          customAmenities: []
        };
      });
      setPropertyAmenities(initialData);
    }
  }, [isOpen, selectedPropertyIds, initialAmenities]);

  const selectedProperties = properties.filter(p => selectedPropertyIds.includes(p.id));

  const handleStandardAmenityToggle = (amenityId: string, propertyId?: string) => {
    setPropertyAmenities(prev => {
      if (propertyId) {
        // Toggle for specific property
        return prev.map(pa => {
          if (pa.propertyId === propertyId) {
            const isSelected = pa.standardAmenities.includes(amenityId);
            return {
              ...pa,
              standardAmenities: isSelected
                ? pa.standardAmenities.filter(id => id !== amenityId)
                : [...pa.standardAmenities, amenityId]
            };
          }
          return pa;
        });
      } else {
        // Bulk toggle for all selected properties
        const isSelectedInAll = prev.every(pa => pa.standardAmenities.includes(amenityId));
        return prev.map(pa => ({
          ...pa,
          standardAmenities: isSelectedInAll
            ? pa.standardAmenities.filter(id => id !== amenityId)
            : [...pa.standardAmenities.filter(id => id !== amenityId), amenityId]
        }));
      }
    });
  };

  const handleAddCustomAmenity = (propertyId?: string) => {
    if (!newCustomAmenity.name.trim()) return;

    const customAmenity: CustomAmenity = {
      id: `custom_${Date.now()}`,
      name: newCustomAmenity.name,
      description: newCustomAmenity.description || undefined,
      propertyId: propertyId || 'bulk'
    };

    setPropertyAmenities(prev => {
      if (propertyId) {
        // Add to specific property
        return prev.map(pa => {
          if (pa.propertyId === propertyId) {
            return {
              ...pa,
              customAmenities: [...pa.customAmenities, customAmenity]
            };
          }
          return pa;
        });
      } else {
        // Add to all selected properties
        return prev.map(pa => ({
          ...pa,
          customAmenities: [...pa.customAmenities, { ...customAmenity, propertyId: pa.propertyId }]
        }));
      }
    });

    setNewCustomAmenity({ name: '', description: '' });
    setIsAddingCustom(false);
  };

  const handleRemoveCustomAmenity = (amenityId: string, propertyId: string) => {
    setPropertyAmenities(prev =>
      prev.map(pa => {
        if (pa.propertyId === propertyId) {
          return {
            ...pa,
            customAmenities: pa.customAmenities.filter(ca => ca.id !== amenityId)
          };
        }
        return pa;
      })
    );
  };

  const handleSave = () => {
    onSave(propertyAmenities);
    onClose();
  };

  const handleCopyAmenities = (fromPropertyId: string) => {
    const sourceAmenities = propertyAmenities.find(pa => pa.propertyId === fromPropertyId);
    if (!sourceAmenities) return;

    setPropertyAmenities(prev =>
      prev.map(pa => {
        if (pa.propertyId !== fromPropertyId) {
          return {
            ...pa,
            standardAmenities: [...sourceAmenities.standardAmenities],
            customAmenities: sourceAmenities.customAmenities.map(ca => ({
              ...ca,
              id: `${ca.id}_copy_${Date.now()}`,
              propertyId: pa.propertyId
            }))
          };
        }
        return pa;
      })
    );
  };

  const getAmenityStats = () => {
    const allStandardAmenities = propertyAmenities.flatMap(pa => pa.standardAmenities);
    const allCustomAmenities = propertyAmenities.flatMap(pa => pa.customAmenities);
    
    return {
      totalStandard: new Set(allStandardAmenities).size,
      totalCustom: allCustomAmenities.length,
      mostCommon: STANDARD_AMENITIES.filter(sa => 
        propertyAmenities.every(pa => pa.standardAmenities.includes(sa.id))
      ).length
    };
  };

  const stats = getAmenityStats();

  const renderAmenityGrid = (category: PropertyAmenity['category'], propertyId?: string) => {
    const amenities = STANDARD_AMENITIES.filter(a => a.category === category);
    const currentPropertyAmenities = propertyId 
      ? propertyAmenities.find(pa => pa.propertyId === propertyId)
      : null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {amenities.map(amenity => {
          const isSelected = propertyId
            ? currentPropertyAmenities?.standardAmenities.includes(amenity.id) || false
            : propertyAmenities.every(pa => pa.standardAmenities.includes(amenity.id));
          
          const isPartiallySelected = !propertyId && !isSelected && 
            propertyAmenities.some(pa => pa.standardAmenities.includes(amenity.id));

          return (
            <Card
              key={amenity.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 bg-blue-50",
                isPartiallySelected && "ring-1 ring-blue-300 bg-blue-25"
              )}
              onClick={() => handleStandardAmenityToggle(amenity.id, propertyId)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    isSelected ? "bg-blue-500 text-white" : "bg-gray-100"
                  )}>
                    {amenity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{amenity.name}</div>
                    {isPartiallySelected && (
                      <div className="text-xs text-blue-600">
                        {propertyAmenities.filter(pa => pa.standardAmenities.includes(amenity.id)).length} selected
                      </div>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCustomAmenities = (propertyId?: string) => {
    const customAmenities = propertyId
      ? propertyAmenities.find(pa => pa.propertyId === propertyId)?.customAmenities || []
      : propertyAmenities.flatMap(pa => pa.customAmenities);

    return (
      <div className="space-y-3">
        {customAmenities.map(amenity => (
          <Card key={amenity.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{amenity.name}</div>
                {amenity.description && (
                  <div className="text-sm text-gray-600 mt-1">{amenity.description}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCustomAmenity(amenity.id, amenity.propertyId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {isAddingCustom ? (
          <Card className="p-3">
            <div className="space-y-2">
              <Input
                placeholder="Amenity name"
                value={newCustomAmenity.name}
                onChange={(e) => setNewCustomAmenity(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newCustomAmenity.description}
                onChange={(e) => setNewCustomAmenity(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAddCustomAmenity(propertyId)}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingCustom(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAddingCustom(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Amenity
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Amenities ({selectedProperties.length} properties)
          </DialogTitle>
        </DialogHeader>

        {/* Statistics */}
        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div>Standard: {stats.totalStandard} categories</div>
          <div>Custom: {stats.totalCustom} amenities</div>
          <div>Common: {stats.mostCommon} shared</div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk">Bulk Edit</TabsTrigger>
            <TabsTrigger value="individual">Individual Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-6">
            <div className="text-sm text-gray-600">
              Changes will apply to all {selectedProperties.length} selected properties.
            </div>

            {Object.entries(CATEGORY_LABELS).map(([categoryKey, categoryLabel]) => (
              <div key={categoryKey}>
                <div className="flex items-center gap-2 mb-3">
                  {CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS]}
                  <h3 className="font-medium">{categoryLabel}</h3>
                </div>
                {renderAmenityGrid(categoryKey as PropertyAmenity['category'])}
              </div>
            ))}

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Custom Amenities</h3>
              {renderCustomAmenities()}
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            {selectedProperties.map(property => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-gray-600">{property.city}, {property.country}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyAmenities(property.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy to Others
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(CATEGORY_LABELS).map(([categoryKey, categoryLabel]) => (
                    <div key={categoryKey}>
                      <div className="flex items-center gap-2 mb-2">
                        {CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS]}
                        <h4 className="font-medium text-sm">{categoryLabel}</h4>
                      </div>
                      {renderAmenityGrid(categoryKey as PropertyAmenity['category'], property.id)}
                    </div>
                  ))}

                  <Separator />

                  <div>
                    <h4 className="font-medium text-sm mb-2">Custom Amenities</h4>
                    {renderCustomAmenities(property.id)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Amenities
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}