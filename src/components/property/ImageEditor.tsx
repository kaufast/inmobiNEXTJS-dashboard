import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import './cropper.css';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Upload, Crop, Image as ImageIcon, RefreshCw, Check, X, Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { uploadToCloudinary } from '@/services/cloudinary';

interface ImageEditorProps {
  onImageProcessed: (file: File, url: string) => void;
  onCancel?: () => void;
  aspectRatio?: number;
  maxSizeInMB?: number;
  quality?: number;
  allowedFileTypes?: string[];
}

export default function ImageEditor({
  onImageProcessed,
  onCancel,
  aspectRatio = 16 / 9,
  maxSizeInMB = 5,
  quality = 0.8,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: ImageEditorProps) {
  const { t } = useTranslation('properties');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(aspectRatio.toString());
  const [compressQuality, setCompressQuality] = useState<number>(quality * 100);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const cropperRef = useRef<any>(null);
  
  const aspectRatioOptions = [
    { label: '16:9 (Landscape)', value: (16 / 9).toString() },
    { label: '4:3 (Landscape)', value: (4 / 3).toString() },
    { label: '1:1 (Square)', value: '1' },
    { label: '3:4 (Portrait)', value: (3 / 4).toString() },
    { label: '9:16 (Portrait)', value: (9 / 16).toString() },
    { label: 'Free', value: 'NaN' }
  ];

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors.map((err: any) => err.message).join(', ');
      setUploadError(t('imageEditor.invalidFile', { errors }));
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > maxSizeInBytes) {
        setUploadError(t('imageEditor.errorTooLarge', { size: maxSizeInMB }));
        return;
      }
      
      if (!allowedFileTypes.includes(file.type)) {
        setUploadError(t('imageEditor.errorInvalidType', { types: allowedFileTypes.join(', ') }));
        return;
      }
      
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setIsCropping(true);
        setCroppedImage(null);
        setCloudinaryUrl(null);
      };
      reader.readAsDataURL(file);
    }
  }, [maxSizeInBytes, allowedFileTypes, maxSizeInMB, t]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': allowedFileTypes
    },
    maxFiles: 1
  });
  
  const cropImage = async () => {
    if (cropperRef.current) {
      setIsProcessing(true);
      
      try {
        // Access the cropper instance
        const cropperInstance = cropperRef.current.cropper;
        
        if (cropperInstance) {
          // Get cropped canvas
          const canvas = cropperInstance.getCroppedCanvas({
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          });
          
          if (canvas) {
            // Create a Promise to handle blob creation
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (blob: Blob | null) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error(t('imageEditor.errorProcessing')));
                  }
                },
                'image/webp',
                compressQuality / 100
              );
            });
            
            try {
              // Upload to Cloudinary
              setIsUploading(true);
              const cloudinaryUrl = await uploadToCloudinary(blob);
              setCloudinaryUrl(cloudinaryUrl);
              setIsUploading(false);
              
              // Convert to File object
              const croppedImageFile = new File(
                [blob], 
                `cropped-image-${Date.now()}.webp`, 
                { type: 'image/webp' }
              );
              
              // Set cropped image preview (using Cloudinary URL)
              setCroppedImage(cloudinaryUrl);
              setIsCropping(false);
              setIsProcessing(false);
              
              // Call the callback with the processed image and Cloudinary URL
              onImageProcessed(croppedImageFile, cloudinaryUrl);
            } catch (error) {
              console.error('Error uploading to Cloudinary:', error);
              setUploadError(t('imageEditor.errorCloudinary'));
              setIsProcessing(false);
              setIsUploading(false);
            }
          } else {
            setUploadError(t('imageEditor.errorCanvas'));
            setIsProcessing(false);
          }
        } else {
          setUploadError(t('imageEditor.errorCropper'));
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setUploadError(t('imageEditor.errorProcessing'));
        setIsProcessing(false);
      }
    }
  };
  
  const resetImage = () => {
    setUploadedImage(null);
    setCroppedImage(null);
    setCloudinaryUrl(null);
    setIsCropping(false);
    setUploadError(null);
  };
  
  const handleAspectRatioChange = (value: string) => {
    setSelectedAspectRatio(value);
  };
  
  const handleQualityChange = (value: number[]) => {
    setCompressQuality(value[0]);
  };

  // Update cropper aspect ratio when selectedAspectRatio changes
  useEffect(() => {
    if (cropperRef.current) {
      const ratio = parseFloat(selectedAspectRatio);
      const cropper = cropperRef.current.cropper;
      if (cropper) {
        cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
      }
    }
  }, [selectedAspectRatio]);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {t('imageEditor.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedImage ? (
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
              <p className="text-lg font-medium">{t('imageEditor.dragDropLabel')}</p>
              <p className="text-sm text-neutral-500">
                {t('imageEditor.supportedFormats', { size: maxSizeInMB })}
              </p>
            </div>
          </div>
        ) : isCropping ? (
          <div className="space-y-4">
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium mb-2">{t('imageEditor.aspectRatio')}</p>
                  <Select 
                    value={selectedAspectRatio}
                    onValueChange={handleAspectRatioChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    {t('imageEditor.quality', { quality: compressQuality })}
                  </p>
                  <Slider
                    defaultValue={[compressQuality]}
                    max={100}
                    min={10}
                    step={5}
                    onValueChange={handleQualityChange}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Cropper
                ref={cropperRef}
                src={uploadedImage}
                style={{ height: 400, width: '100%' }}
                aspectRatio={parseFloat(selectedAspectRatio)}
                guides={true}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                className="border rounded-md"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    {isUploading ? (
                      <>
                        <Cloud className="h-8 w-8 animate-pulse text-primary" />
                        <p>{t('imageEditor.uploading')}</p>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <p>{t('imageEditor.processing')}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                <p className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {uploadError}
                </p>
              </div>
            )}
          </div>
        ) : croppedImage && (
          <div className="flex flex-col items-center">
            <div className="relative rounded-md overflow-hidden">
              <img 
                src={croppedImage} 
                alt="Cropped" 
                className="max-h-[400px] w-auto mx-auto border rounded-md"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-500">
                {cloudinaryUrl ? (
                  <span className="flex items-center justify-center gap-1">
                    <Cloud className="h-4 w-4 text-green-500" />
                    {t('imageEditor.cloudinarySuccess')}
                  </span>
                ) : (
                  t('imageEditor.processingSuccess')
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {uploadedImage ? (
          <>
            <Button variant="outline" onClick={resetImage}>
              {t('imageEditor.startOver')}
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t('imageEditor.cancel')}
                </Button>
              )}

              {isCropping ? (
                <Button onClick={cropImage} disabled={isProcessing} className="bg-black hover:bg-white hover:text-black text-white">
                  <Crop className="h-4 w-4 mr-2" />
                  {t('imageEditor.cropAndSave')}
                </Button>
              ) : (
                <Button onClick={resetImage} className="bg-black hover:bg-white hover:text-black text-white">
                  <Check className="h-4 w-4 mr-2" />
                  {t('imageEditor.done')}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                {t('imageEditor.cancel')}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}