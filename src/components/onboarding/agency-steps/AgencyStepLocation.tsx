import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building } from 'lucide-react';

interface AgencyStepLocationProps {
  wizard: {
    data: any;
    updateData: (data: any) => void;
  };
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export function AgencyStepLocation({ wizard }: AgencyStepLocationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    wizard.updateData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!wizard.data.address?.trim()) {
      newErrors.address = 'Street address is required';
    }
    
    if (!wizard.data.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!wizard.data.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!wizard.data.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(wizard.data.postalCode)) {
      newErrors.postalCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Agency Location</span>
          </CardTitle>
          <CardDescription>
            Provide your agency's physical address. This helps clients find you and 
            establishes your service area for property listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Street Address *
            </Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              value={wizard.data.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* City and State Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                City *
              </Label>
              <Input
                id="city"
                placeholder="New York"
                value={wizard.data.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                State *
              </Label>
              <Select
                value={wizard.data.state || ''}
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Postal Code and Country Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium">
                ZIP Code *
              </Label>
              <Input
                id="postalCode"
                placeholder="10001"
                value={wizard.data.postalCode || ''}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country
              </Label>
              <Input
                id="country"
                value={wizard.data.country || 'United States'}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Currently serving US agencies only
              </p>
            </div>
          </div>

          {/* Address Preview */}
          {wizard.data.address && wizard.data.city && wizard.data.state && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Address Preview
                  </h4>
                  <p className="text-sm text-blue-700">
                    {wizard.data.address}
                    {wizard.data.city && `, ${wizard.data.city}`}
                    {wizard.data.state && `, ${wizard.data.state}`}
                    {wizard.data.postalCode && ` ${wizard.data.postalCode}`}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This address will be used for verification and may be visible to clients
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 