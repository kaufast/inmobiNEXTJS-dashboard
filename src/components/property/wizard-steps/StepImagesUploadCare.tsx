/**
 * StepImagesUploadCare - TEST/DEV VERSION
 * 
 * This component replaces StepImagesCloudinary for UploadCare testing
 * DO NOT USE IN PRODUCTION - This is for testing purposes only
 * 
 * Testing UploadCare integration for property image uploads
 * Compare functionality with existing Cloudinary implementation
 */

import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon,
  AlertTriangle,
  TestTube,
  Info,
  CheckCircle,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { UploadCareWidgetReact, UploadCareImage } from "../UploadCareWidgetReact";
import { isUploadcareConfigured, UploadcareErrors } from "@/utils/uploadcare.utils";

const MAX_IMAGES = 10;

export function StepImagesUploadCare() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const [images, setImages] = useState<UploadCareImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize from property data
  useEffect(() => {
    // Initializing with property data
    
    if (propertyData.images && Array.isArray(propertyData.images)) {
      // Convert existing images to UploadCare format, filtering out null/invalid entries
      const uploadCareImages: UploadCareImage[] = propertyData.images
        .filter((img: any) => img != null) // Filter out null/undefined entries
        .map((img: any, index: number) => {
          // Handle case where img is just a URL string
          if (typeof img === 'string') {
            return {
              uuid: `img-${index}`,
              name: `Image ${index + 1}`,
              url: img,
              cdnUrl: img,
              size: 0,
              width: undefined,
              height: undefined,
              mimeType: 'image/jpeg',
              originalFilename: `Image ${index + 1}`,
              isPrimary: index === (propertyData.primaryImageIndex || 0),
            };
          }
          
          // Handle case where img is an object
          return {
            uuid: img.uuid || img.id || `img-${index}`,
            name: img.name || img.originalFilename || `Image ${index + 1}`,
            url: img.url || img.cdnUrl || img,
            cdnUrl: img.cdnUrl || img.url || img,
            size: img.size || 0,
            width: img.width,
            height: img.height,
            mimeType: img.mimeType || 'image/jpeg',
            originalFilename: img.originalFilename || img.name,
            isPrimary: index === (propertyData.primaryImageIndex || 0),
          };
        })
        .filter((img: UploadCareImage) => img.url && img.cdnUrl); // Only keep images with valid URLs
      
      // Converted images
      setImages(uploadCareImages);
    }
  }, [propertyData.images, propertyData.primaryImageIndex]);

  // Handle successful upload
  const handleUploadSuccess = (uploadedImages: UploadCareImage[]) => {
    // Upload success
    setIsProcessing(true);
    
    try {
      // Add new images to existing ones
      const newImages = [...images, ...uploadedImages];
      
      // Ensure we don't exceed max images
      const limitedImages = newImages.slice(0, MAX_IMAGES);
      
      // Update local state
      setImages(limitedImages);
      
      // Convert to property data format - store as URL strings for database compatibility
      const propertyImages = limitedImages
        .map((img) => img.cdnUrl || img.url)
        .filter((url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined');
      
      // Update property data
      updatePropertyData({
        images: propertyImages,
        primaryImageIndex: limitedImages.findIndex(img => img.isPrimary) || 0
      });
      
      // Updated property data with images
      
      toast({
        title: "Images Uploaded",
        description: `${uploadedImages.length} image(s) uploaded successfully using UploadCare`,
        variant: "default",
      });
      
    } catch (error) {
      // Error processing upload
      toast({
        title: "Upload Error",
        description: "Failed to process uploaded images",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    // Upload error
    setIsProcessing(false);
    
    toast({
      title: "Upload Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Handle image removal
  const handleImageRemove = (uuid: string) => {
    // Removing image
    
    try {
      const updatedImages = images.filter(img => img.uuid !== uuid);
      
      // If removed image was primary, set first image as primary
      if (updatedImages.length > 0) {
        const wasPrimary = images.find(img => img.uuid === uuid)?.isPrimary;
        if (wasPrimary) {
          updatedImages[0].isPrimary = true;
        }
      }
      
      setImages(updatedImages);
      
      // Update property data - store as URL strings for database compatibility
      const propertyImages = updatedImages
        .map((img) => img.cdnUrl || img.url)
        .filter((url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined');
      
      updatePropertyData({
        images: propertyImages,
        primaryImageIndex: updatedImages.findIndex(img => img.isPrimary) || 0
      });
      
      // Updated property after removal
      
    } catch (error) {
      // Error removing image
      toast({
        title: "Remove Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  // Handle setting primary image
  const handleSetPrimary = (uuid: string) => {
    // Setting primary image
    
    try {
      const updatedImages = images.map(img => ({
        ...img,
        isPrimary: img.uuid === uuid
      }));
      
      setImages(updatedImages);
      
      // Update property data - store as URL strings for database compatibility
      const propertyImages = updatedImages
        .map((img) => img.cdnUrl || img.url)
        .filter((url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined');
      
      updatePropertyData({
        images: propertyImages,
        primaryImageIndex: updatedImages.findIndex(img => img.isPrimary) || 0
      });
      
      // Updated primary image in property data
      
    } catch (error) {
      // Error setting primary image
      toast({
        title: "Primary Image Error",
        description: "Failed to set primary image",
        variant: "destructive",
      });
    }
  };

  // Check if step is valid
  const isStepValid = images.length > 0;

  // Check if Uploadcare is properly configured
  if (!isUploadcareConfigured()) {
    return (
      <QuestionCard
        title={`${t('wizard.steps.images.title')} - Configuration Error`}
        description="Uploadcare configuration is missing"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        className="property-images-uploadcare-error"
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Configuration Error:</strong><br />
            {UploadcareErrors.MISSING_CONFIG}
          </AlertDescription>
        </Alert>
      </QuestionCard>
    );
  }

  return (
    <QuestionCard
      title={`${t('wizard.steps.images.title')} - UploadCare Test`}
      description={`${t('wizard.steps.images.description')} (Testing UploadCare integration)`}
      icon={<ImageIcon className="h-5 w-5" />}
      className="property-images-uploadcare-test"
    >
      <div className="space-y-6">
        {/* TEST WARNING */}
        <Alert className="border-orange-200 bg-orange-50">
          <TestTube className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>TEST VERSION - UploadCare Integration</strong>
            <br />
            This is a test implementation of UploadCare for property image uploads.
            <br />
            <strong>DO NOT USE IN PRODUCTION.</strong> Testing CDN, transformations, and upload flow.
          </AlertDescription>
        </Alert>

        {/* Step Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {isStepValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          <span className="text-sm">
            {isStepValid 
              ? `Step Complete: ${images.length} image(s) uploaded` 
              : "At least one image is required to continue"
            }
          </span>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">UploadCare Test Instructions:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Upload property images using UploadCare widget</li>
                <li>• Test drag-and-drop, camera, and external sources</li>
                <li>• Verify CDN URLs and image transformations</li>
                <li>• Check image metadata and file handling</li>
                <li>• Test primary image selection and removal</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Configuration Status:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Public Key: {import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '0765b66fa520b9cf0789'}</li>
                <li>• Max Images: {MAX_IMAGES}</li>
                <li>• Max Size: 10MB per image</li>
                <li>• Allowed Types: Images only</li>
                <li>• CDN: ucarecdn.com</li>
              </ul>
            </div>
          </div>
        </div>

        {/* UploadCare React Widget */}
        <UploadCareWidgetReact
          images={images}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          onImageRemove={handleImageRemove}
          onSetPrimary={handleSetPrimary}
          maxImages={MAX_IMAGES}
          disabled={isProcessing}
        />

        {/* Step Requirements */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Requirements:</p>
              <ul className="space-y-1 text-yellow-800">
                <li>• At least one image is required</li>
                <li>• First uploaded image becomes primary automatically</li>
                <li>• You can change the primary image anytime</li>
                <li>• Images are processed through UploadCare CDN</li>
                <li>• Maximum {MAX_IMAGES} images allowed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Debug Info:</strong></p>
            <p>Images Count: {images.length}</p>
            <p>Primary Image: {images.find(img => img.isPrimary)?.name || 'None'}</p>
            <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
            <p>Step Valid: {isStepValid ? 'Yes' : 'No'}</p>
            <p>Property Images: {propertyData.images?.length || 0}</p>
          </div>
        </div>
      </div>
    </QuestionCard>
  );
}