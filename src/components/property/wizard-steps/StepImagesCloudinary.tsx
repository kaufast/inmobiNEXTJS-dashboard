import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  AlertTriangle,
  Cloud,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import CloudinaryWidgetUploader from "../CloudinaryWidgetUploader";

// Simple image structure - ONLY URLs, no File objects
interface CloudinaryImage {
  id: string;
  url: string; // Permanent Cloudinary URL
  publicId: string; // Cloudinary public ID for deletion
  isPrimary: boolean;
}

const MAX_IMAGES = 10;

export function StepImagesCloudinary() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize from property data
  useEffect(() => {
    if (propertyData.images && Array.isArray(propertyData.images)) {
      const cloudinaryImages: CloudinaryImage[] = propertyData.images.map((img: any, index: number) => ({
        id: img.id || `img-${index}`,
        url: img.url,
        publicId: img.publicId || '',
        isPrimary: index === (propertyData.primaryImageIndex || 0),
      }));
      setImages(cloudinaryImages);
    }
  }, [propertyData.images, propertyData.primaryImageIndex]);

  // Handle Cloudinary upload success
  const handleUploadSuccess = (url: string, info: any) => {
    console.log('Cloudinary upload success:', { url, info });
    
    const newImage: CloudinaryImage = {
      id: info.public_id,
      url: info.secure_url,
      publicId: info.public_id,
      isPrimary: images.length === 0, // First image is primary
    };

    const updatedImages = [...images, newImage];
    setImages(updatedImages);

    // Update property data with simple structure
    updatePropertyData({
      images: updatedImages.map(img => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
      })),
      primaryImageIndex: updatedImages.findIndex(img => img.isPrimary),
    });

    toast({
      title: "Image Uploaded",
      description: "Image uploaded successfully!",
    });
  };

  // Handle Cloudinary upload error
  const handleUploadError = (error: any) => {
    console.error('Cloudinary upload error:', error);
    toast({
      title: "Upload Failed",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
  };

  // Remove image
  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0) {
      const removedImage = images.find(img => img.id === imageId);
      if (removedImage?.isPrimary) {
        updatedImages[0].isPrimary = true;
      }
    }

    setImages(updatedImages);

    // Update property data
    updatePropertyData({
      images: updatedImages.map(img => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
      })),
      primaryImageIndex: updatedImages.findIndex(img => img.isPrimary),
    });

    toast({
      title: "Image Removed",
      description: "Image has been removed successfully.",
    });
  };

  // Set primary image
  const setPrimaryImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));

    setImages(updatedImages);

    // Update property data
    updatePropertyData({
      images: updatedImages.map(img => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
      })),
      primaryImageIndex: updatedImages.findIndex(img => img.isPrimary),
    });

    toast({
      title: "Primary Image Set",
      description: "This image will be displayed first in listings.",
    });
  };

  return (
    <QuestionCard
      title={t('wizard.steps.images.title')}
      description={t('wizard.steps.images.description')}
      icon={<ImageIcon className="h-5 w-5" />}
      className="property-images"
    >
      <div className="space-y-6">
        {/* Warning if no images */}
        {images.length === 0 && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {t('wizard.steps.images.imageRequired')}
            </AlertDescription>
          </Alert>
        )}

        {/* Image count */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {images.length} of {MAX_IMAGES} images uploaded
          </span>
          {images.length >= MAX_IMAGES && (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
              Maximum reached
            </span>
          )}
        </div>

        {/* Upload button */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Property Images
          </h3>
          <p className="text-gray-600 mb-4">
            Upload images directly to our secure cloud storage
          </p>
          
          <CloudinaryWidgetUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            buttonText="Choose Images"
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto"
            multiple={true}
            maxFiles={Math.min(5, MAX_IMAGES - images.length)}
          />
        </div>

        {/* Display uploaded images */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Uploaded Images</h3>
            <p className="text-sm text-gray-600">
              Click the star to set an image as primary. The primary image will be displayed first.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.currentTarget.src = '/placeholder-image.jpg'; // Fallback
                      }}
                    />
                  </div>
                  
                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  
                  {/* Image number */}
                  <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  
                  {/* Controls overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => setPrimaryImage(image.id)}
                      disabled={image.isPrimary}
                    >
                      <Star className={`h-4 w-4 ${image.isPrimary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </QuestionCard>
  );
}