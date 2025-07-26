import { useState, useRef } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  AlertTriangle,
  Trash,
  RefreshCw,
  Cloud,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CloudinaryWidgetUploader from "@/components/property/CloudinaryWidgetUploader";
import { WidgetImageEditor } from "@/components/debug";

// Extended image object with cloudinaryUrl
interface PropertyImage {
  file: File;
  url: string;
  name: string;
  cloudinaryUrl?: string; // URL from Cloudinary for optimized delivery
  isFeature?: boolean; // Flag to mark an image as the feature image
}

// Constants for image limits
const MAX_IMAGES_TOTAL = 12;
const MAX_IMAGES_PER_UPLOAD = 5;

export function StepImages() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(
    propertyData.primaryImageIndex || 0
  );
  const [showImageEditor, setShowImageEditor] = useState(false);

  // Check if we've reached the maximum number of allowed images
  const hasReachedMaxImages = 
    propertyData.images && propertyData.images.length >= MAX_IMAGES_TOTAL;

  // Calculate how many more images can be uploaded
  const remainingImageSlots = MAX_IMAGES_TOTAL - (propertyData.images?.length || 0);

  // Handle Cloudinary widget upload success
  const handleCloudinarySuccess = async (url: string, info: any) => {
    console.log('Cloudinary upload success:', { url, info });
    
    try {
      // Create a File object from the URL (this will be async)
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      if (!blob) {
        throw new Error('Failed to create blob from image');
      }
      
      const file = new File(
        [blob], 
        info.original_filename || `image-${Date.now()}.${info.format}`, 
        { type: `image/${info.format}` }
      );
      
      // Create the new image object
      const newImage: PropertyImage = {
        file,
        url, // Use Cloudinary URL directly
        name: file.name,
        cloudinaryUrl: url,
        isFeature: false, // Default to not a feature image
      };
      
      // Add the new image to property data
      const updatedImages = [...(propertyData.images || []), newImage];
      
      // Ensure we're not exceeding the maximum number of images
      if (updatedImages.length > MAX_IMAGES_TOTAL) {
        toast({
          title: t('wizard.steps.images.tooManyImages'),
          description: t('wizard.steps.images.maxImagesReached', { max: MAX_IMAGES_TOTAL }),
          variant: "destructive",
        });
        return;
      }
      
      updatePropertyData({
        images: updatedImages,
      });
      
      // Set as primary if it's the first image
      if (!propertyData.images || propertyData.images.length === 0) {
        updatePropertyData({ primaryImageIndex: 0 });
        setPrimaryImageIndex(0);
      }
      
      // Show success message
      toast({
        title: t('wizard.steps.images.uploadSuccess'),
        description: t('wizard.steps.images.cloudinarySuccess'),
      });
    } catch (err) {
      console.error('Error processing Cloudinary image:', err);
      toast({
        title: t('wizard.steps.images.uploadFailed'),
        description: t('wizard.steps.images.uploadFailedDescription'),
        variant: "destructive",
      });
    }
  };
  
  // Handle Cloudinary widget upload error
  const handleCloudinaryError = (error: any) => {
    console.error('Cloudinary widget error:', error);
    toast({
      title: t('wizard.steps.images.uploadFailed'),
      description: t('wizard.steps.images.uploadFailedDescription'),
      variant: "destructive",
    });
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...(propertyData.images || [])];
    
    // Check if the removed image was marked as feature image
    const wasFeatureImage = updatedImages[index].isFeature;
    
    // Remove the image
    updatedImages.splice(index, 1);
    
    // Update the primary image index if needed
    let newPrimaryIndex = primaryImageIndex;
    if (primaryImageIndex === index) {
      // If we removed the primary image, set the first image as primary
      newPrimaryIndex = updatedImages.length > 0 ? 0 : -1;
    } else if (primaryImageIndex > index) {
      // If we removed an image before the primary, adjust the index
      newPrimaryIndex--;
    }
    
    // Update property data with adjusted images
    updatePropertyData({
      images: updatedImages,
      primaryImageIndex: newPrimaryIndex >= 0 ? newPrimaryIndex : undefined,
    });
    
    // If the removed image was the feature image, clear the featureImage field
    if (wasFeatureImage) {
      updatePropertyData({ featureImage: undefined });
    }
    
    setPrimaryImageIndex(newPrimaryIndex >= 0 ? newPrimaryIndex : 0);
  };

  // Handle setting the primary image
  const handleSetPrimaryImage = (index: number) => {
    updatePropertyData({ primaryImageIndex: index });
    setPrimaryImageIndex(index);
  };
  
  // Handle setting an image as the feature image
  const handleSetFeatureImage = (index: number) => {
    const updatedImages = [...(propertyData.images || [])];
    
    // Remove isFeature flag from all images
    updatedImages.forEach(img => {
      img.isFeature = false;
    });
    
    // Set the feature flag for the selected image
    updatedImages[index].isFeature = true;
    
    // Get the cloudinary URL for the feature image
    const featureImageUrl = updatedImages[index].cloudinaryUrl || updatedImages[index].url;
    
    // Update the property data with modified images and featureImage URL
    updatePropertyData({ 
      images: updatedImages,
      featureImage: featureImageUrl
    });
    
    toast({
      title: "Feature image set",
      description: "This image will be displayed prominently in listings",
    });
  };

  // Handle image processed from WidgetImageEditor
  const handleImageProcessed = (file: File, cloudinaryUrl: string) => {
    // Check if we've reached the maximum number of images
    if (propertyData.images && propertyData.images.length >= MAX_IMAGES_TOTAL) {
      toast({
        title: t('wizard.steps.images.tooManyImages'),
        description: t('wizard.steps.images.maxImagesReached', { max: MAX_IMAGES_TOTAL }),
        variant: "destructive",
      });
      setShowImageEditor(false);
      return;
    }
    
    const newImage: PropertyImage = {
      file,
      url: cloudinaryUrl, // Use Cloudinary URL directly
      name: file.name,
      cloudinaryUrl,
      isFeature: false,
    };
    
    // Add the new image to property data
    updatePropertyData({
      images: [...(propertyData.images || []), newImage],
    });
    
    // Set as primary if it's the first image
    if (!propertyData.images || propertyData.images.length === 0) {
      updatePropertyData({ primaryImageIndex: 0 });
      setPrimaryImageIndex(0);
    }
    
    // Close the image editor
    setShowImageEditor(false);
    
    // Show success message
    toast({
      title: t('wizard.steps.images.imageProcessedSuccess'),
      description: t('wizard.steps.images.cloudinarySuccess'),
    });
  };

  return (
    <>
      <QuestionCard
        title={t('wizard.steps.images.title')}
        description={t('wizard.steps.images.description')}
        icon={<ImageIcon className="h-5 w-5" />}
      >
        <div className="space-y-6">
          {(!propertyData.images || propertyData.images.length === 0) && (
            <Alert className="bg-black text-white border-0">
              <AlertTriangle className="h-4 w-4 text-white" />
              <AlertDescription>
                {t('wizard.steps.images.imageRequired')}
              </AlertDescription>
            </Alert>
          )}

          {/* Display the number of images used out of total allowed */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {t('wizard.steps.images.imagesCount', { 
                current: propertyData.images?.length || 0, 
                max: MAX_IMAGES_TOTAL 
              })}
            </span>
            {hasReachedMaxImages && (
              <span className="text-sm bg-black text-white px-2 py-1 rounded">
                {t('wizard.steps.images.maxImagesReached', { max: MAX_IMAGES_TOTAL })}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Image upload options */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-center">
              {/* Cloudinary Widget upload */}
              <div className="flex-1 flex justify-center">
                <div
                  className="w-full h-40 flex flex-col justify-center items-center gap-2 border border-dashed rounded-md p-4"
                >
                  <Cloud className="h-10 w-10 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {t('wizard.steps.images.uploadButton')}
                  </span>
                  <CloudinaryWidgetUploader
                    onUploadSuccess={handleCloudinarySuccess}
                    onUploadError={handleCloudinaryError}
                    buttonText={t('wizard.steps.images.openCloudinaryWidget')}
                    className="mt-2 bg-black hover:bg-gray-900 text-white py-2 px-4 rounded transition-colors duration-200"
                    multiple={true}
                    maxFiles={Math.min(MAX_IMAGES_PER_UPLOAD, remainingImageSlots)}
                    disabled={hasReachedMaxImages}
                  />
                </div>
              </div>
              
              {/* Advanced image editor */}
              <div className="flex-1 flex justify-center">
                <div
                  className="w-full h-40 flex flex-col justify-center items-center gap-2 border border-dashed rounded-md p-4"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {t('wizard.steps.images.uploadAdvanced')}
                  </span>
                        <Button
                    onClick={() => setShowImageEditor(true)}
                    variant="shadcn-black"
                    className="mt-2"
                    disabled={hasReachedMaxImages}
                        >
                    {t('wizard.steps.images.openImageEditor')}
                        </Button>
                </div>
              </div>
            </div>
            
            {/* Display uploaded images */}
            {propertyData.images && propertyData.images.length > 0 && (
              <div className="mt-6">
                <Label>{t('wizard.steps.images.uploadedImagesLabel')}</Label>
                <p className="text-sm bg-black text-white p-2 rounded my-4">
                  {t('wizard.steps.images.selectPrimaryImageLabel')}
                </p>
                
                <RadioGroup
                  value={primaryImageIndex.toString()}
                  onValueChange={(value) => handleSetPrimaryImage(parseInt(value))}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {propertyData.images.map((image: PropertyImage, index: number) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border">
                      {/* Controls overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          {/* Set as primary */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white"
                            onClick={() => handleSetPrimaryImage(index)}
                          >
                            <RadioGroupItem value={index.toString()} className="mr-2" />
                            {t('wizard.steps.images.setPrimary')}
                          </Button>
                          
                          {/* Set as feature */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white"
                            onClick={() => handleSetFeatureImage(index)}
                          >
                            <Star className={`h-4 w-4 mr-2 ${image.isFeature ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            {t('wizard.steps.images.setFeature')}
                          </Button>
                      
                      {/* Delete button */}
                      <Button
                            size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                        </div>
                      </div>
                      
                      {/* Image */}
                      <img
                        src={image.cloudinaryUrl || image.url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      
                      {/* Feature image badge */}
                      {image.isFeature && (
                        <div className="absolute bottom-2 right-2 bg-black text-white rounded-full px-2 py-1 text-xs font-medium">
                          Feature
                        </div>
                      )}
                      
                      {/* Cloudinary badge */}
                      {image.cloudinaryUrl && (
                        <div className="absolute bottom-2 left-2 bg-black text-white rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                          <Cloud className="h-3 w-3 text-white" />
                          {t('wizard.steps.images.optimizedLabel')}
                        </div>
                      )}
                      
                      {/* Image number */}
                      <div className="absolute top-2 left-2 bg-black text-white rounded-full px-2 py-1 text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        </div>
      </QuestionCard>
      
      {/* Image Editor Dialog */}
      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent className="max-w-4xl p-0">
          <WidgetImageEditor 
            onImageProcessed={handleImageProcessed}
            onCancel={() => setShowImageEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}