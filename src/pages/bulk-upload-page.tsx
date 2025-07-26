/**
 * Bulk Upload Page Component
 */

import React from 'react';
import { BulkPropertyUpload } from '@/components/bulk-upload/BulkPropertyUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star,
  Database,
  Settings,
  Globe,
  Lock,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { canAccessBulkUpload, getBulkUploadPermissionMessage, getRoleDisplayName } from '@/lib/role-permissions';

export default function BulkUploadPage() {
  const { user } = useAuth();
  
  const handleUploadComplete = (result: { uploaded: number; skipped: number }) => {
    console.log('Upload completed:', result);
    // You can add additional logic here, such as:
    // - Redirecting to a success page
    // - Updating parent state
    // - Showing additional success messages
  };

  // Additional verification check on page load
  const hasAccess = canAccessBulkUpload(user);
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Lock className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {getBulkUploadPermissionMessage(user)}
                </AlertDescription>
              </Alert>
              
              {user && (
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600">
                    <p><strong>Current Role:</strong> {getRoleDisplayName(user.role)}</p>
                    <p><strong>Verification Status:</strong> {user.isVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <p><strong>Bulk Upload Access Requirements:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Super Admin - Full access</li>
                  <li>Agency Admin - Full access</li>
                  <li>Verified Agent - Full access</li>
                  <li>Agency Agent - Must be verified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Multiple File Formats",
      description: "Support for CSV, Excel (.xlsx), and legacy Excel (.xls) files"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Smart Validation",
      description: "Automatic validation of property data with detailed error reporting"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Country-City Validation",
      description: "Ensures cities are valid for the selected country with suggestions"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Bulk Amenities",
      description: "Add amenities to multiple properties at once with custom options"
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Batch Processing",
      description: "Efficiently process large datasets with progress tracking"
    }
  ];

  const supportedFields = [
    { name: "Property Title", required: true, type: "text" },
    { name: "Country", required: true, type: "dropdown" },
    { name: "Address", required: true, type: "text" },
    { name: "City", required: true, type: "dropdown" },
    { name: "Zip Code", required: true, type: "text" },
    { name: "Telephone", required: true, type: "text" },
    { name: "Price", required: true, type: "number" },
    { name: "Property Type", required: true, type: "dropdown" },
    { name: "Listing Type", required: true, type: "dropdown" },
    { name: "Bedrooms", required: true, type: "number" },
    { name: "Toilets", required: true, type: "number" },
    { name: "Property Size", required: true, type: "number" },
    { name: "Year Built", required: false, type: "number" },
    { name: "Parking Space", required: false, type: "text" },
    { name: "Property Description", required: true, type: "text" }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Bulk Property Upload</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload hundreds of properties at once using our powerful bulk upload tool. 
          Supports CSV and Excel files with smart validation and amenity management.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Before you start:</strong> Make sure your data follows the template format. 
          Download the template below to see the required fields and format. 
          All uploaded properties will be set to "pending" status and require approval.
        </AlertDescription>
      </Alert>

      {/* Main Upload Component */}
      <BulkPropertyUpload onUploadComplete={handleUploadComplete} />

      {/* Supported Fields Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Supported Fields Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{field.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {field.required ? (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips and Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Use the template:</strong> Download our template to ensure your data is formatted correctly.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Validate cities:</strong> Make sure city names match exactly with our supported cities for each country.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Check data types:</strong> Ensure numbers are formatted as numbers (no currency symbols in price).
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Review before upload:</strong> Use the preview grid to check and edit any problematic entries.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Add amenities:</strong> Select multiple properties and add amenities in bulk to save time.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}