/**
 * UploadCare React Widget - Simplified Implementation
 * 
 * Using the official @uploadcare/react-widget package
 * This should be more stable than the vanilla JS implementation
 */

import React, { useState, useCallback } from 'react';
import { Widget } from '@uploadcare/react-widget';
import { useToast } from '@/hooks/use-toast';
import type { UploadcareWidgetFileInfo, UploadcareWidgetOptions } from '@/types/uploadcare.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  AlertTriangle, 
  Info,
  Settings,
  TestTube,
  CheckCircle
} from 'lucide-react';

// UploadCare Configuration
const UPLOADCARE_CONFIG: UploadcareWidgetOptions = {
  publicKey: import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '',
  multiple: true,
  multipleMax: 10,
  multipleMin: 1,
  imagesOnly: true,
  previewStep: true,
  imageShrink: '2048x2048',
  imageResize: '2048x2048',
  tabs: 'file camera url facebook gdrive gphotos dropbox instagram',
  effects: 'crop,rotate,mirror,flip',
  locale: 'auto',
  clearable: true,
  cdnBase: 'https://ucarecdn.com'
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

interface UploadCareWidgetReactProps {
  images: UploadCareImage[];
  onUploadSuccess: (images: UploadCareImage[]) => void;
  onUploadError: (error: string) => void;
  onImageRemove: (uuid: string) => void;
  onSetPrimary: (uuid: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function UploadCareWidgetReact({
  images,
  onUploadSuccess,
  onUploadError,
  onImageRemove,
  onSetPrimary,
  maxImages = 10,
  disabled = false
}: UploadCareWidgetReactProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = useCallback(async (fileInfo: UploadcareWidgetFileInfo) => {
    setIsUploading(true);
    // Upload started

    try {
      // Handle single file
      if (fileInfo && !Array.isArray(fileInfo)) {
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

        // Processed image
        onUploadSuccess([uploadedImage]);
        
        toast({
          title: "Upload Successful",
          description: "Image uploaded successfully",
        });
      }
    } catch (error) {
      // Upload error occurred
      onUploadError('Failed to process uploaded file');
    } finally {
      setIsUploading(false);
    }
  }, [images.length, onUploadSuccess, onUploadError, toast]);

  const handleMultipleUpload = useCallback(async (group: { promise: () => Promise<void>; files: () => any[] }) => {
    setIsUploading(true);
    // Multiple upload started

    try {
      // Wait for group to be ready
      await group.promise();
      
      const files = group.files();
      // Processing files in group

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
            isPrimary: images.length === 0 && uploadedImages.length === 0 // First image is primary
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
      setIsUploading(false);
    }
  }, [images.length, onUploadSuccess, onUploadError, toast]);

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

  return (
    <div className="space-y-6">
      {/* TEST WARNING */}
      <Alert className="border-green-200 bg-green-50">
        <TestTube className="h-4 w-4" />
        <AlertDescription>
          <strong>React Widget Implementation:</strong> Using @uploadcare/react-widget package. 
          This should be more stable than the vanilla JS implementation.
        </AlertDescription>
      </Alert>

      {/* Configuration Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">UploadCare Configuration</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Public Key: {UPLOADCARE_CONFIG.publicKey}</p>
            <p>Max Files: {UPLOADCARE_CONFIG.multipleMax}</p>
            <p>Images Only: {UPLOADCARE_CONFIG.imagesOnly ? 'Yes' : 'No'}</p>
            <p>CDN Base: {UPLOADCARE_CONFIG.cdnBase}</p>
            <p>Widget Type: React Widget</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Widget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Property Images ({images.length}/{maxImages})</h3>
          <div className="flex items-center gap-2">
            {isUploading && (
              <span className="text-sm text-gray-500">Uploading...</span>
            )}
            <Info className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Upload Area */}
        {canUploadMore && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Upload Property Images</p>
                <p className="text-sm text-gray-500">
                  Click to select images from your device or other sources
                </p>
              </div>
              
              {/* UploadCare React Widget */}
              <div className="flex justify-center">
                <Widget
                  publicKey={UPLOADCARE_CONFIG.publicKey}
                  multiple={UPLOADCARE_CONFIG.multiple}
                  multipleMax={UPLOADCARE_CONFIG.multipleMax}
                  multipleMin={UPLOADCARE_CONFIG.multipleMin}
                  imagesOnly={UPLOADCARE_CONFIG.imagesOnly}
                  previewStep={UPLOADCARE_CONFIG.previewStep}
                  imageShrink={UPLOADCARE_CONFIG.imageShrink}
                  imageResize={UPLOADCARE_CONFIG.imageResize}
                  tabs={UPLOADCARE_CONFIG.tabs}
                  effects={UPLOADCARE_CONFIG.effects}
                  locale={UPLOADCARE_CONFIG.locale}
                  clearable={UPLOADCARE_CONFIG.clearable}
                  cdnBase={UPLOADCARE_CONFIG.cdnBase}
                  onChange={handleMultipleUpload}
                  onFileSelect={handleUpload}
                  systemDialog={false}
                  disabled={disabled || isUploading}
                />
              </div>
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

      {/* Status Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Widget Status:</strong> React Widget Ready</p>
            <p><strong>Images Count:</strong> {images.length}</p>
            <p><strong>Can Upload More:</strong> {canUploadMore ? 'Yes' : 'No'}</p>
            <p><strong>Primary Image:</strong> {images.find(img => img.isPrimary)?.name || 'None'}</p>
            <p><strong>Upload Status:</strong> {isUploading ? 'Uploading...' : 'Ready'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}