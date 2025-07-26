/**
 * Image Compression and Format Conversion Service
 * Handles WebP conversion, compression, and responsive image generation
 */

// Image compression options
export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  progressive?: boolean;
  preserveMetadata?: boolean;
}

// Default compression settings
export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'webp',
  progressive: true,
  preserveMetadata: false
};

// Canvas-based image compression
export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { maxWidth = 1920, maxHeight = 1080, quality = 85, format = 'webp' } = options;
      
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Configure canvas for better quality
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality / 100
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Generate multiple image formats
export async function generateMultipleFormats(
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<{
  webp: Blob;
  jpeg: Blob;
  avif?: Blob;
}> {
  const webpBlob = await compressImage(file, { ...options, format: 'webp' });
  const jpegBlob = await compressImage(file, { ...options, format: 'jpeg' });
  
  // AVIF support is limited, so we'll make it optional
  let avifBlob: Blob | undefined;
  try {
    avifBlob = await compressImage(file, { ...options, format: 'avif' });
  } catch (error) {
    console.warn('AVIF format not supported:', error);
  }
  
  return {
    webp: webpBlob,
    jpeg: jpegBlob,
    avif: avifBlob
  };
}

// Generate responsive image sizes
export async function generateResponsiveSizes(
  file: File,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<Array<{ width: number; blob: Blob }>> {
  const results: Array<{ width: number; blob: Blob }> = [];
  
  for (const width of sizes) {
    const blob = await compressImage(file, {
      ...options,
      maxWidth: width,
      maxHeight: Math.floor(width * 0.75) // 4:3 aspect ratio
    });
    results.push({ width, blob });
  }
  
  return results;
}

// Convert image to WebP
export async function convertToWebP(
  file: File,
  quality: number = 85
): Promise<Blob> {
  return compressImage(file, {
    format: 'webp',
    quality,
    preserveMetadata: false
  });
}

// Generate blur placeholder
export async function generateBlurPlaceholder(
  file: File,
  size: number = 40
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = Math.floor(size * 0.75);
      
      if (ctx) {
        // Draw small, blurred version
        ctx.filter = 'blur(5px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.1);
        resolve(dataUrl);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Batch image compression
export async function batchCompressImages(
  files: File[],
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS,
  onProgress?: (progress: number) => void
): Promise<Blob[]> {
  const results: Blob[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const blob = await compressImage(files[i], options);
    results.push(blob);
    
    if (onProgress) {
      onProgress((i + 1) / files.length);
    }
  }
  
  return results;
}

// Image format detection
export function getImageFormat(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    case 'gif':
      return 'gif';
    default:
      return 'jpeg';
  }
}

// Check WebP support
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

// Check AVIF support
export function isAVIFSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').startsWith('data:image/avif');
}

// Progressive JPEG encoding
export async function createProgressiveJPEG(
  file: File,
  quality: number = 85
): Promise<Blob> {
  return compressImage(file, {
    format: 'jpeg',
    quality,
    progressive: true
  });
}

// Image metadata extractor
export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  aspectRatio: number;
  colorSpace?: string;
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const metadata: ImageMetadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: getImageFormat(file),
        aspectRatio: img.naturalWidth / img.naturalHeight
      };
      
      resolve(metadata);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Property image processor
export interface PropertyImageProcessor {
  thumbnail: Blob;
  card: Blob;
  gallery: Blob;
  hero: Blob;
  placeholder: string;
  metadata: ImageMetadata;
}

export async function processPropertyImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<PropertyImageProcessor> {
  const metadata = await extractImageMetadata(file);
  
  const [thumbnail, card, gallery, hero, placeholder] = await Promise.all([
    compressImage(file, { ...options, maxWidth: 150, maxHeight: 100, quality: 80 }),
    compressImage(file, { ...options, maxWidth: 400, maxHeight: 300, quality: 85 }),
    compressImage(file, { ...options, maxWidth: 800, maxHeight: 600, quality: 90 }),
    compressImage(file, { ...options, maxWidth: 1200, maxHeight: 800, quality: 90 }),
    generateBlurPlaceholder(file, 40)
  ]);
  
  return {
    thumbnail,
    card,
    gallery,
    hero,
    placeholder,
    metadata
  };
}

// Upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  timeRemaining: number;
}

export function createUploadProgressTracker(
  onProgress: (progress: UploadProgress) => void
): (event: ProgressEvent) => void {
  let startTime = Date.now();
  
  return (event: ProgressEvent) => {
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const speed = event.loaded / elapsed;
    const timeRemaining = (event.total - event.loaded) / speed;
    
    const progress: UploadProgress = {
      loaded: event.loaded,
      total: event.total,
      percentage: Math.round((event.loaded / event.total) * 100),
      speed,
      timeRemaining
    };
    
    onProgress(progress);
  };
}

// Image validation
export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validatePropertyImage(
  file: File,
  requirements: {
    maxSize?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedFormats?: string[];
  } = {}
): Promise<ImageValidationResult> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    minWidth = 400,
    minHeight = 300,
    maxWidth = 4000,
    maxHeight = 4000,
    allowedFormats = ['jpeg', 'jpg', 'png', 'webp']
  } = requirements;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`Image size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum (${Math.round(maxSize / 1024 / 1024)}MB)`);
  }
  
  // Check format
  const format = getImageFormat(file);
  if (!allowedFormats.includes(format)) {
    errors.push(`Format ${format} is not allowed. Allowed formats: ${allowedFormats.join(', ')}`);
  }
  
  // Check dimensions
  try {
    const metadata = await extractImageMetadata(file);
    
    if (metadata.width < minWidth || metadata.height < minHeight) {
      errors.push(`Image dimensions (${metadata.width}x${metadata.height}) are below minimum (${minWidth}x${minHeight})`);
    }
    
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      warnings.push(`Image dimensions (${metadata.width}x${metadata.height}) are above recommended maximum (${maxWidth}x${maxHeight})`);
    }
    
    // Check aspect ratio
    if (metadata.aspectRatio < 0.5 || metadata.aspectRatio > 3) {
      warnings.push(`Unusual aspect ratio (${metadata.aspectRatio.toFixed(2)}). Recommended: 0.5-3.0`);
    }
  } catch (error) {
    errors.push('Failed to read image metadata');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  compressImage,
  generateMultipleFormats,
  generateResponsiveSizes,
  convertToWebP,
  generateBlurPlaceholder,
  batchCompressImages,
  processPropertyImage,
  validatePropertyImage,
  extractImageMetadata,
  isWebPSupported,
  isAVIFSupported,
  createUploadProgressTracker
};