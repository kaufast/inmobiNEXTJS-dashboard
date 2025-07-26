import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgencyStepBusinessDetailsProps {
  wizard: {
    data: any;
    updateData: (data: any) => void;
  };
}

export function AgencyStepBusinessDetails({ wizard }: AgencyStepBusinessDetailsProps) {
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
    
    if (!wizard.data.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }
    
    if (!wizard.data.businessDescription?.trim()) {
      newErrors.businessDescription = 'Business description is required';
    } else if (wizard.data.businessDescription.trim().length < 50) {
      newErrors.businessDescription = 'Description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const descriptionLength = wizard.data.businessDescription?.length || 0;
  const minLength = 50;
  const maxLength = 500;

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Business Details</span>
          </CardTitle>
          <CardDescription>
            Tell us about your business credentials and what makes your agency unique. 
            This information helps us verify your agency and assists clients in choosing your services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber" className="text-sm font-medium">
              Real Estate License Number *
            </Label>
            <Input
              id="licenseNumber"
              placeholder="RE123456789"
              value={wizard.data.licenseNumber || ''}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              className={errors.licenseNumber ? 'border-red-500' : ''}
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-600">{errors.licenseNumber}</p>
            )}
            <p className="text-sm text-gray-500">
              Enter your state-issued real estate license number. This will be verified during the approval process.
            </p>
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="text-sm font-medium">
              Business Description *
            </Label>
            <Textarea
              id="businessDescription"
              placeholder="Describe your agency's services, specialties, and what sets you apart from competitors..."
              value={wizard.data.businessDescription || ''}
              onChange={(e) => handleInputChange('businessDescription', e.target.value)}
              className={`min-h-[120px] ${errors.businessDescription ? 'border-red-500' : ''}`}
              maxLength={maxLength}
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.businessDescription && (
                  <p className="text-sm text-red-600">{errors.businessDescription}</p>
                )}
              </div>
              <p className={`text-sm ${
                descriptionLength < minLength 
                  ? 'text-red-500' 
                  : descriptionLength > maxLength * 0.9 
                  ? 'text-orange-500' 
                  : 'text-gray-500'
              }`}>
                {descriptionLength}/{maxLength} characters
                {descriptionLength < minLength && ` (${minLength - descriptionLength} more needed)`}
              </p>
            </div>
          </div>

          {/* Writing Guidelines */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips for a great description:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Highlight your years of experience and expertise</li>
                <li>• Mention specific areas or property types you specialize in</li>
                <li>• Include any awards, certifications, or notable achievements</li>
                <li>• Describe your team size and service approach</li>
                <li>• Keep it professional but personable</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Example Description */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Example Description:</h4>
            <p className="text-sm text-gray-600 italic">
              "Premium Properties Group has been serving the greater Los Angeles area for over 15 years, 
              specializing in luxury residential sales and commercial real estate. Our team of 12 licensed 
              agents brings deep local market knowledge and personalized service to every transaction. 
              We've earned the 'Top Producer' award three years running and maintain a 98% client satisfaction 
              rating. Whether you're buying your first home or expanding your investment portfolio, we're 
              committed to making your real estate goals a reality."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 