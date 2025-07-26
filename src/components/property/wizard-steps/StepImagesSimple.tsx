import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Simplified image object
interface SimpleImage {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
}

const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function StepImagesSimple() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<SimpleImage[]>([]);

  // Initialize images from property data on mount
  useEffect(() => {
    if (propertyData.images && propertyData.images.length > 0) {
      const existingImages: SimpleImage[] = propertyData.images.map((img: any, index: number) => ({
        id: `existing-${index}`,
        file: img.file,
        url: img.url,
        isPrimary: index === (propertyData.primaryImageIndex || 0),
      }));
      setImages(existingImages);
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Images state:', images.length);
    console.log('Property data images:', propertyData.images?.length || 0);
  }, [images, propertyData.images]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Check total count
    const currentImageCount = propertyData.images?.length || 0;
    if (currentImageCount + files.length > MAX_IMAGES) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - currentImageCount} more.`,
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image type. Please use JPG, PNG, or WebP.`,
          variant: "destructive",
        });
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create image objects
    const newImages: SimpleImage[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isPrimary: currentImageCount === 0 && index === 0, // First image is primary
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // Update property data in the expected format
    const newPropertyData = {
      images: updatedImages.map(img => ({
        file: img.file,
        url: img.url,
        name: img.file.name,
      })),
      primaryImageIndex: updatedImages.findIndex(img => img.isPrimary),
    };
    
    console.log('[StepImagesSimple] Updating property data with:', newPropertyData);
    updatePropertyData(newPropertyData);

    toast({
      title: "Images Added",
      description: `${validFiles.length} image(s) added successfully.`,
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (!imageToRemove) return;

    // Clean up object URL
    URL.revokeObjectURL(imageToRemove.url);

    const updatedImages = images.filter(img => img.id !== id);
    
    // If we removed the primary image, make the first remaining image primary
    if (imageToRemove.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);

    // Update property data
    updatePropertyData({
      images: updatedImages.map(img => ({
        file: img.file,
        url: img.url,
        name: img.file.name,
      })),
      primaryImageIndex: updatedImages.findIndex(img => img.isPrimary),
    });

    toast({
      title: "Image Removed",
      description: "Image has been removed successfully.",
    });
  };

  // Set primary image
  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    }));

    setImages(updatedImages);

    // Update property data
    updatePropertyData({
      images: updatedImages.map(img => ({
        file: img.file,
        url: img.url,
        name: img.file.name,
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
            {propertyData.images?.length || 0} of {MAX_IMAGES} images uploaded
          </span>
          {(propertyData.images?.length || 0) >= MAX_IMAGES && (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
              Maximum reached
            </span>
          )}
        </div>

        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Property Images
          </h3>
          <p className="text-gray-600 mb-4">
            Select multiple images to upload (JPG, PNG, WebP - Max 10MB each)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={(propertyData.images?.length || 0) >= MAX_IMAGES}
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={(propertyData.images?.length || 0) >= MAX_IMAGES}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Images
          </Button>
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