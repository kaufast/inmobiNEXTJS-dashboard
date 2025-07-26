/**
 * UploadCare Widget Component - TEST/DEV VERSION
 * 
 * This is a TEST component for evaluating UploadCare integration
 * DO NOT USE IN PRODUCTION - This is for testing purposes only
 * 
 * Current implementation uses Cloudinary in production
 * Switch to this component only after thorough testing
 */

import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UploadcareWidgetOptions, UploadcareWidgetAPI, UploadcareWidgetFileInfo } from '@/types/uploadcare.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  AlertTriangle, 
  Info,
  Settings,
  TestTube
} from 'lucide-react';

// UploadCare Configuration
const UPLOADCARE_CONFIG: UploadcareWidgetOptions = {
  // Public key from environment variable
  publicKey: import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '',
  
  // File upload settings
  multiple: true,
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: 'image/*',
  imageShrink: '2048x2048',
  
  // UI settings
  tabs: 'file camera url facebook gdrive gphotos dropbox instagram',
  effects: 'crop,rotate,mirror,flip,blur,sharp,invert',
  
  // Localization
  locale: 'auto',
  
  // Preview settings
  previewStep: true,
  clearable: true,
  
  // CDN settings
  cdnBase: 'https://ucarecdn.com',
  
  // Security settings (for production)
  secureExpire: '',
  secureSignature: ''
};

export interface UploadCareImage {
  uuid: string;
  name: string;
  url: string;
  cdnUrl: string;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
  originalFilename: string;
  isPrimary?: boolean;
}

interface UploadCareWidgetProps {
  images: UploadCareImage[];
  onUploadSuccess: (images: UploadCareImage[]) => void;
  onUploadError: (error: string) => void;
  onImageRemove: (uuid: string) => void;
  onSetPrimary: (uuid: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

// Declare global uploadcare widget
declare global {
  interface Window {
    uploadcare: any;
  }
}

export function UploadCareWidget({
  images,
  onUploadSuccess,
  onUploadError,
  onImageRemove,
  onSetPrimary,
  maxImages = 10,
  disabled = false
}: UploadCareWidgetProps) {
  const { toast } = useToast();
  const widgetRef = useRef<UploadcareWidgetAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Load UploadCare widget script
  useEffect(() => {
    const loadUploadCareWidget = () => {
      // Check if script is already loaded
      if (window.uploadcare) {
        // Widget already loaded
        setIsWidgetLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
      script.charset = 'utf-8';
      script.async = true;

      script.onload = () => {
        // Widget loaded successfully
        setIsWidgetLoaded(true);
        setInitializationError(null);
      };

      script.onerror = () => {
        // Failed to load widget
        setInitializationError('Failed to load UploadCare widget');
      };

      document.head.appendChild(script);
    };

    loadUploadCareWidget();
  }, []); // Remove onUploadError dependency to prevent infinite loop

  // Initialize widget when loaded
  useEffect(() => {
    if (!isWidgetLoaded || !window.uploadcare) return;

    try {
      // Initializing widget with config
      
      // Initialize widget
      const widget = window.uploadcare.Widget('[data-uploadcare-widget]', {
        ...UPLOADCARE_CONFIG,
        onChange: (group: any) => {
          if (group) {
            // Files selected
            handleFilesSelected(group);
          }
        }
      });

      widgetRef.current = widget;

      // Listen for widget events - only use methods that exist
      try {
        if (typeof widget.onUploadComplete === 'function') {
          widget.onUploadComplete((fileInfo: any) => {
            // Upload complete
          });
        }
      } catch (e) {
        // onUploadComplete not available
      }

      try {
        if (typeof widget.onDialogOpen === 'function') {
          widget.onDialogOpen(() => {
            // Dialog opened
          });
        }
      } catch (e) {
        // onDialogOpen not available
      }

      try {
        if (typeof widget.onDialogClose === 'function') {
          widget.onDialogClose(() => {
            // Dialog closed
          });
        }
      } catch (e) {
        // onDialogClose not available
      }

      // Widget initialized successfully

    } catch (error) {
      // Widget initialization error
      setInitializationError('Failed to initialize UploadCare widget');
    }
  }, [isWidgetLoaded]); // Remove onUploadError dependency

  // Report initialization error to parent component
  useEffect(() => {
    if (initializationError) {
      onUploadError(initializationError);
    }
  }, [initializationError, onUploadError]);

  const handleFilesSelected = async (group: { promise: () => Promise<void>; files: () => any[] }) => {
    setIsLoading(true);
    // Processing file group

    try {
      // Wait for group to be ready
      await group.promise();
      
      const files = group.files();
      // Files in group

      const uploadedImages: UploadCareImage[] = [];

      for (const file of files) {
        try {
          // Wait for file to be ready
          const fileInfo = await file.promise();
          // Processing file info

          const uploadedImage: UploadCareImage = {
            uuid: fileInfo.uuid,
            name: fileInfo.name || 'Untitled',
            url: fileInfo.originalUrl || fileInfo.cdnUrl,
            cdnUrl: fileInfo.cdnUrl,
            size: fileInfo.size || 0,
            width: fileInfo.imageInfo?.width,
            height: fileInfo.imageInfo?.height,
            mimeType: fileInfo.mimeType || 'image/jpeg',
            originalFilename: fileInfo.originalFilename || fileInfo.name,
            isPrimary: images.length === 0 // First image is primary
          };

          uploadedImages.push(uploadedImage);
          
        } catch (fileError) {
          // File processing error
          onUploadError(`Failed to process file: ${fileError.message}`);
        }
      }

      if (uploadedImages.length > 0) {
        // Successfully processed images
        onUploadSuccess(uploadedImages);
        
        toast({
          title: "Upload Successful",
          description: `${uploadedImages.length} image(s) uploaded successfully`,
        });
      }

    } catch (error) {
      // Group processing error
      onUploadError('Failed to process uploaded files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (uuid: string) => {
    // Removing image
    onImageRemove(uuid);
    
    toast({
      title: "Image Removed",
      description: "Image has been removed from the gallery",
    });
  };

  const handleSetPrimary = (uuid: string) => {
    // Setting primary image
    onSetPrimary(uuid);
    
    toast({
      title: "Primary Image Set",
      description: "This image will be used as the main property image",
    });
  };

  const canUploadMore = images.length < maxImages;

  // Check if public key is configured
  if (!UPLOADCARE_CONFIG.publicKey) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <strong>Configuration Error:</strong> Uploadcare public key is not configured.
          <br />
          Please add VITE_UPLOADCARE_PUBLIC_KEY to your environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* TEST WARNING */}
      <Alert className="border-orange-200 bg-orange-50">
        <TestTube className="h-4 w-4" />
        <AlertDescription>
          <strong>TEST VERSION:</strong> This is the UploadCare integration test. 
          Not for production use. Currently testing file uploads and CDN integration.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {initializationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>UploadCare Error:</strong> {initializationError}
            <br />
            <span className="text-sm">Please refresh the page to try again.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">UploadCare Configuration</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Public Key: {UPLOADCARE_CONFIG.publicKey}</p>
            <p>Max Files: {UPLOADCARE_CONFIG.maxFiles}</p>
            <p>Max Size: {(UPLOADCARE_CONFIG.maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
            <p>CDN Base: {UPLOADCARE_CONFIG.cdnBase}</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Widget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Property Images ({images.length}/{maxImages})</h3>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-sm text-gray-500">Processing uploads...</span>
            )}
            <Info className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Upload Button */}
        {canUploadMore && !initializationError && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Upload Property Images</p>
                <p className="text-sm text-gray-500">
                  Drag and drop images here or click to browse
                </p>
              </div>
              
              {/* Hidden input that UploadCare will enhance */}
              <input
                type="hidden"
                data-uploadcare-widget
                data-uploadcare-public-key={UPLOADCARE_CONFIG.publicKey}
                data-uploadcare-multiple={UPLOADCARE_CONFIG.multiple}
                data-uploadcare-max-files={UPLOADCARE_CONFIG.maxFiles}
                data-uploadcare-max-file-size={UPLOADCARE_CONFIG.maxFileSize}
                data-uploadcare-allowed-file-types={UPLOADCARE_CONFIG.allowedFileTypes}
                data-uploadcare-image-shrink={UPLOADCARE_CONFIG.imageShrink}
                data-uploadcare-tabs={UPLOADCARE_CONFIG.tabs}
                data-uploadcare-effects={UPLOADCARE_CONFIG.effects}
                data-uploadcare-locale={UPLOADCARE_CONFIG.locale}
                data-uploadcare-preview-step={UPLOADCARE_CONFIG.previewStep}
                data-uploadcare-clearable={UPLOADCARE_CONFIG.clearable}
                disabled={disabled || isLoading}
              />
              
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isLoading || !isWidgetLoaded || initializationError}
                onClick={() => widgetRef.current?.openDialog()}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Processing...' : !isWidgetLoaded ? 'Loading...' : 'Select Images'}
              </Button>
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.uuid} className={`relative group ${image.isPrimary ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-2">
                  <div className="aspect-square relative">
                    <img
                      src={`${image.cdnUrl}/-/preview/300x300/`}
                      alt={image.name}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        // Image load error
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                    
                    {/* Image Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        {!image.isPrimary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimary(image.uuid)}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(image.uuid)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Primary
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p className="truncate">{image.name}</p>
                    <p>{(image.size / 1024).toFixed(1)}KB</p>
                    {image.width && image.height && (
                      <p>{image.width}×{image.height}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <div className="text-xs text-gray-600">
            <p><strong>Widget Status:</strong> {initializationError ? 'Error' : isWidgetLoaded ? 'Loaded' : 'Loading...'}</p>
            <p><strong>Images Count:</strong> {images.length}</p>
            <p><strong>Can Upload More:</strong> {canUploadMore ? 'Yes' : 'No'}</p>
            <p><strong>Primary Image:</strong> {images.find(img => img.isPrimary)?.name || 'None'}</p>
            {initializationError && (
              <p><strong>Error:</strong> {initializationError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}