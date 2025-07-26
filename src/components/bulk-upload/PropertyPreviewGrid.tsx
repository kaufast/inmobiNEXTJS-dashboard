/**
 * Property Preview Grid Component for Bulk Upload
 */

import React, { useState, useMemo } from 'react';
import { PropertyRow } from '@/lib/csv-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Settings,
  Eye,
  EyeOff,
  Filter,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyPreviewGridProps {
  properties: PropertyRow[];
  onPropertiesChange: (properties: PropertyRow[]) => void;
  onSelectedPropertiesChange: (selectedIds: string[]) => void;
  onOpenAmenities: (propertyIds: string[]) => void;
  className?: string;
}

export function PropertyPreviewGrid({
  properties,
  onPropertiesChange,
  onSelectedPropertiesChange,
  onOpenAmenities,
  className
}: PropertyPreviewGridProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | null>(null);
  const [showInvalidOnly, setShowInvalidOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'location' | 'type'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply validity filter
    if (showInvalidOnly) {
      filtered = filtered.filter(property => !property.isValid);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'location':
          aValue = `${a.city}, ${a.country}`.toLowerCase();
          bValue = `${b.city}, ${b.country}`.toLowerCase();
          break;
        case 'type':
          aValue = a.propertyType.toLowerCase();
          bValue = b.propertyType.toLowerCase();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [properties, searchTerm, showInvalidOnly, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = properties.length;
    const valid = properties.filter(p => p.isValid).length;
    const invalid = total - valid;
    const warnings = properties.filter(p => p.warnings.length > 0).length;

    return { total, valid, invalid, warnings };
  }, [properties]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredAndSortedProperties.map(p => p.id);
      setSelectedIds(allIds);
      onSelectedPropertiesChange(allIds);
    } else {
      setSelectedIds([]);
      onSelectedPropertiesChange([]);
    }
  };

  const handleSelectProperty = (propertyId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedIds, propertyId]
      : selectedIds.filter(id => id !== propertyId);
    
    setSelectedIds(newSelected);
    onSelectedPropertiesChange(newSelected);
  };

  const handleStartEdit = (property: PropertyRow) => {
    setEditingId(property.id);
    setEditingProperty({ ...property });
  };

  const handleSaveEdit = () => {
    if (editingProperty) {
      const updatedProperties = properties.map(p =>
        p.id === editingProperty.id ? editingProperty : p
      );
      onPropertiesChange(updatedProperties);
      setEditingId(null);
      setEditingProperty(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingProperty(null);
  };

  const handleEditChange = (field: keyof PropertyRow, value: any) => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        [field]: value
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (property: PropertyRow) => {
    if (!property.isValid) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Invalid
        </Badge>
      );
    }

    if (property.warnings.length > 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-yellow-600">
          <AlertCircle className="h-3 w-3" />
          Warning
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-3 w-3" />
        Valid
      </Badge>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Preview ({filteredAndSortedProperties.length} of {properties.length})
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                onClick={() => onOpenAmenities(selectedIds)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Add Amenities ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardTitle>

        {/* Statistics */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Valid: {stats.valid}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            Invalid: {stats.invalid}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            Warnings: {stats.warnings}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-by">Sort by:</Label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-invalid"
              checked={showInvalidOnly}
              onCheckedChange={setShowInvalidOnly}
            />
            <Label htmlFor="show-invalid">Show invalid only</Label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredAndSortedProperties.length && filteredAndSortedProperties.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProperties.map((property) => (
                <TableRow key={property.id} className={cn(
                  "transition-colors",
                  !property.isValid && "bg-red-50",
                  property.warnings.length > 0 && property.isValid && "bg-yellow-50",
                  selectedIds.includes(property.id) && "bg-blue-50"
                )}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(property.id)}
                      onCheckedChange={(checked) => handleSelectProperty(property.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(property)}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-gray-500">{property.address}</div>
                      {property.errors.length > 0 && (
                        <div className="text-xs text-red-600">
                          {property.errors.slice(0, 2).join(', ')}
                          {property.errors.length > 2 && '...'}
                        </div>
                      )}
                      {property.warnings.length > 0 && (
                        <div className="text-xs text-yellow-600">
                          {property.warnings.slice(0, 2).join(', ')}
                          {property.warnings.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{property.propertyType}</Badge>
                      <div className="text-sm text-gray-500">{property.listingType}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {property.city}, {property.country}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(property.price)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {property.toilets}
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {property.propertySize}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(property)}
                        disabled={editingId !== null}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedProperties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No properties found matching your criteria.
          </div>
        )}

        {/* Edit Modal */}
        {editingId && editingProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingProperty.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editingProperty.price}
                      onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-country">Country</Label>
                    <Input
                      id="edit-country"
                      value={editingProperty.country}
                      onChange={(e) => handleEditChange('country', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={editingProperty.city}
                      onChange={(e) => handleEditChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                    <Input
                      id="edit-bedrooms"
                      type="number"
                      step="0.5"
                      value={editingProperty.bedrooms}
                      onChange={(e) => handleEditChange('bedrooms', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-toilets">Toilets</Label>
                    <Input
                      id="edit-toilets"
                      type="number"
                      step="0.5"
                      value={editingProperty.toilets}
                      onChange={(e) => handleEditChange('toilets', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editingProperty.address}
                    onChange={(e) => handleEditChange('address', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={editingProperty.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}