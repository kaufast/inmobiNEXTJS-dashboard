import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import '../property/cropper.css';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CloudinaryWidgetUploader from '../property/CloudinaryWidgetUploader';

interface WidgetImageEditorProps {
  onImageProcessed: (file: File, url: string) => void;
  onCancel?: () => void;
  maxSizeInMB?: number;
  allowedFileTypes?: string[];
}

export default function WidgetImageEditor({
  onImageProcessed,
  onCancel,
  maxSizeInMB = 5,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: WidgetImageEditorProps) {
  const { t } = useTranslation('common');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      setUploadError('Invalid file. Please check file type and size.');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > maxSizeInBytes) {
        setUploadError(`File too large. Maximum size is ${maxSizeInMB} MB.`);
        return;
      }
      
      if (!allowedFileTypes.includes(file.type)) {
        setUploadError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`);
        return;
      }
      
      // Convert file to URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [maxSizeInBytes, allowedFileTypes, maxSizeInMB]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': allowedFileTypes
    },
    maxFiles: 1
  });
  
  const handleCloudinarySuccess = (url: string, info: any) => {
    console.log('Cloudinary upload success:', { url, info });
    setCloudinaryUrl(url);
    setUploadError(null);
    
    // Create a File object from the URL
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File(
          [blob], 
          info.original_filename || `image-${Date.now()}.${info.format}`, 
          { type: `image/${info.format}` }
        );
        
        // Call the callback with the processed image and Cloudinary URL
        onImageProcessed(file, url);
      })
      .catch(err => {
        console.error('Error converting URL to File:', err);
        setUploadError('Error processing the uploaded image');
      });
  };
  
  const handleCloudinaryError = (error: any) => {
    console.error('Cloudinary upload error:', error);
    setUploadError('Error uploading image to Cloudinary');
  };
  
  const resetImage = () => {
    setUploadedImage(null);
    setCloudinaryUrl(null);
    setUploadError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Editor (Widget Version)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!cloudinaryUrl ? (
          <div className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-neutral-400" />
                <p className="text-lg font-medium">Drag and drop an image, or click to upload</p>
                <p className="text-sm text-neutral-500">
                  Supported formats: JPG, PNG, WebP, GIF (max {maxSizeInMB}MB)
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 border rounded-md gap-3">
              <p className="text-base font-medium">Or upload directly with Cloudinary Widget</p>
              <CloudinaryWidgetUploader
                onUploadSuccess={handleCloudinarySuccess}
                onUploadError={handleCloudinaryError}
                buttonText="Open Cloudinary Upload Widget"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              />
              <p className="text-xs text-neutral-500 mt-2">The widget provides additional editing features and better browser compatibility.</p>
            </div>
            
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                <p className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {uploadError}
                </p>
              </div>
            )}
            
            {uploadedImage && !cloudinaryUrl && (
              <div className="flex flex-col items-center">
                <div className="relative rounded-md overflow-hidden">
                  <img 
                    src={uploadedImage} 
                    alt="Preview" 
                    className="max-h-[300px] w-auto mx-auto border rounded-md"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-center mb-2">Now, upload this image to Cloudinary:</p>
                  <div className="flex justify-center">
                    <CloudinaryWidgetUploader
                      onUploadSuccess={handleCloudinarySuccess}
                      onUploadError={handleCloudinaryError}
                      buttonText="Upload This Image"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative rounded-md overflow-hidden">
              <img 
                src={cloudinaryUrl} 
                alt="Uploaded" 
                className="max-h-[400px] w-auto mx-auto border rounded-md"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600">
                Image uploaded successfully
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {cloudinaryUrl ? (
          <>
            <Button variant="outline" onClick={resetImage}>
              Upload Another Image
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}

              <Button onClick={resetImage} className="bg-black hover:bg-white hover:text-black text-white">
                <Check className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
} 