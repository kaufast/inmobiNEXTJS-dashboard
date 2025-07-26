import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Building2, X } from 'lucide-react';
import { toast } from 'sonner';

interface AgencyStepInfoProps {
  wizard: {
    data: any;
    updateData: (data: any) => void;
    uploadFile: (file: File, type: 'logo' | 'document') => Promise<string>;
  };
}

export function AgencyStepInfo({ wizard }: AgencyStepInfoProps) {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    wizard.updateData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await wizard.uploadFile(file, 'logo');
      wizard.updateData({ agencyLogo: url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    wizard.updateData({ agencyLogo: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!wizard.data.agencyName?.trim()) {
      newErrors.agencyName = 'Agency name is required';
    }
    
    if (!wizard.data.agencyEmail?.trim()) {
      newErrors.agencyEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizard.data.agencyEmail)) {
      newErrors.agencyEmail = 'Please enter a valid email address';
    }
    
    if (!wizard.data.agencyPhone?.trim()) {
      newErrors.agencyPhone = 'Phone number is required';
    }

    if (wizard.data.agencyWebsite && !/^https?:\/\/.+\..+/.test(wizard.data.agencyWebsite)) {
      newErrors.agencyWebsite = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Agency Information</span>
          </CardTitle>
          <CardDescription>
            Tell us about your agency. This information will be used to set up your profile 
            and will be visible to potential clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agency Name */}
          <div className="space-y-2">
            <Label htmlFor="agencyName" className="text-sm font-medium">
              Agency Name *
            </Label>
            <Input
              id="agencyName"
              placeholder="Enter your agency name"
              value={wizard.data.agencyName || ''}
              onChange={(e) => handleInputChange('agencyName', e.target.value)}
              className={errors.agencyName ? 'border-red-500' : ''}
            />
            {errors.agencyName && (
              <p className="text-sm text-red-600">{errors.agencyName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="agencyEmail" className="text-sm font-medium">
              Business Email *
            </Label>
            <Input
              id="agencyEmail"
              type="email"
              placeholder="contact@youragency.com"
              value={wizard.data.agencyEmail || ''}
              onChange={(e) => handleInputChange('agencyEmail', e.target.value)}
              className={errors.agencyEmail ? 'border-red-500' : ''}
            />
            {errors.agencyEmail && (
              <p className="text-sm text-red-600">{errors.agencyEmail}</p>
            )}
            <p className="text-sm text-gray-500">
              This will be your primary contact email and login email
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="agencyPhone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="agencyPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={wizard.data.agencyPhone || ''}
              onChange={(e) => handleInputChange('agencyPhone', e.target.value)}
              className={errors.agencyPhone ? 'border-red-500' : ''}
            />
            {errors.agencyPhone && (
              <p className="text-sm text-red-600">{errors.agencyPhone}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="agencyWebsite" className="text-sm font-medium">
              Website (Optional)
            </Label>
            <Input
              id="agencyWebsite"
              type="url"
              placeholder="https://www.youragency.com"
              value={wizard.data.agencyWebsite || ''}
              onChange={(e) => handleInputChange('agencyWebsite', e.target.value)}
              className={errors.agencyWebsite ? 'border-red-500' : ''}
            />
            {errors.agencyWebsite && (
              <p className="text-sm text-red-600">{errors.agencyWebsite}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Agency Logo (Optional)</Label>
            
            {wizard.data.agencyLogo ? (
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={wizard.data.agencyLogo}
                  alt="Agency logo"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                  <p className="text-sm text-gray-500">Your agency logo is ready</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeLogo}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {uploading ? 'Uploading...' : 'Upload your agency logo'}
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              A professional logo helps build trust with potential clients. You can add this later if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 