/**
 * Image Optimization Utilities for Real Estate SEO
 * Handles image compression, format conversion, and responsive images
 */

// Image format types
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png' | 'auto';

// Image optimization parameters
export interface ImageOptimizationParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  crop?: 'fill' | 'fit' | 'crop' | 'scale';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'face' | 'auto';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

// Responsive image breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Property image presets
export const PROPERTY_IMAGE_PRESETS = {
  thumbnail: {
    width: 150,
    height: 100,
    quality: 80,
    format: 'webp' as const,
    crop: 'fill' as const
  },
  card: {
    width: 400,
    height: 300,
    quality: 85,
    format: 'webp' as const,
    crop: 'fill' as const
  },
  gallery: {
    width: 800,
    height: 600,
    quality: 90,
    format: 'webp' as const,
    crop: 'fill' as const
  },
  hero: {
    width: 1200,
    height: 600,
    quality: 90,
    format: 'webp' as const,
    crop: 'fill' as const
  },
  fullscreen: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'webp' as const,
    crop: 'fit' as const
  }
} as const;

// Generate Cloudinary URL with optimizations
export function generateCloudinaryUrl(
  publicId: string,
  params: ImageOptimizationParams = {}
): string {
  const baseUrl = process.env.VITE_CLOUDINARY_URL || 'https://res.cloudinary.com/demo';
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
  
  const {
    width,
    height,
    quality = 85,
    format = 'auto',
    crop = 'fill',
    gravity = 'center',
    blur,
    sharpen,
    brightness,
    contrast,
    saturation
  } = params;
  
  const transformations = [];
  
  // Basic transformations
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  
  // Effect transformations
  if (blur) transformations.push(`e_blur:${blur}`);
  if (sharpen) transformations.push(`e_sharpen:${sharpen}`);
  if (brightness) transformations.push(`e_brightness:${brightness}`);
  if (contrast) transformations.push(`e_contrast:${contrast}`);
  if (saturation) transformations.push(`e_saturation:${saturation}`);
  
  // Auto optimizations
  transformations.push('q_auto'); // Auto quality
  transformations.push('f_auto'); // Auto format
  transformations.push('dpr_auto'); // Auto DPR
  
  const transformString = transformations.join(',');
  
  return `${baseUrl}/${cloudName}/image/upload/${transformString}/${publicId}`;
}

// Generate responsive image srcset
export function generateResponsiveSrcSet(
  src: string,
  baseWidth: number = 800,
  params: ImageOptimizationParams = {}
): string {
  const widths = [
    Math.floor(baseWidth * 0.5),
    baseWidth,
    Math.floor(baseWidth * 1.5),
    Math.floor(baseWidth * 2)
  ];
  
  const srcSetItems = widths.map(width => {
    const optimizedUrl = optimizeImageUrl(src, { ...params, width });
    return `${optimizedUrl} ${width}w`;
  });
  
  return srcSetItems.join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizesAttribute(
  breakpoints: Partial<Record<keyof typeof RESPONSIVE_BREAKPOINTS, string>>
): string {
  const sizeItems = Object.entries(breakpoints)
    .map(([breakpoint, size]) => {
      const pixels = RESPONSIVE_BREAKPOINTS[breakpoint as keyof typeof RESPONSIVE_BREAKPOINTS];
      return `(max-width: ${pixels}px) ${size}`;
    });
  
  return sizeItems.join(', ');
}

// Optimize image URL
export function optimizeImageUrl(
  src: string,
  params: ImageOptimizationParams = {}
): string {
  // Check if it's a Cloudinary image
  if (src.includes('cloudinary.com') || src.includes('res.cloudinary.com')) {
    // Extract public ID from Cloudinary URL
    const publicIdMatch = src.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (publicIdMatch) {
      return generateCloudinaryUrl(publicIdMatch[1], params);
    }
  }
  
  // For non-Cloudinary images, return optimized URL with query params
  const url = new URL(src, window.location.origin);
  
  if (params.width) url.searchParams.set('w', params.width.toString());
  if (params.height) url.searchParams.set('h', params.height.toString());
  if (params.quality) url.searchParams.set('q', params.quality.toString());
  if (params.format) url.searchParams.set('f', params.format);
  
  return url.toString();
}

// Generate WebP version of image
export function generateWebPUrl(src: string, params: ImageOptimizationParams = {}): string {
  return optimizeImageUrl(src, { ...params, format: 'webp' });
}

// Generate AVIF version of image
export function generateAVIFUrl(src: string, params: ImageOptimizationParams = {}): string {
  return optimizeImageUrl(src, { ...params, format: 'avif' });
}

// Generate blur placeholder
export function generateBlurPlaceholder(
  src: string,
  params: ImageOptimizationParams = {}
): string {
  return optimizeImageUrl(src, {
    ...params,
    width: 40,
    height: 30,
    quality: 10,
    blur: 5
  });
}

// Generate image alt text for SEO
export function generateImageAltText(
  property: {
    title?: string;
    propertyType?: string;
    city?: string;
    country?: string;
    bedrooms?: number;
    bathrooms?: number;
    price?: number;
    currency?: string;
  },
  imageIndex?: number,
  totalImages?: number,
  imageType?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'dining' | 'other'
): string {
  const parts = [];
  
  if (property.title) {
    parts.push(property.title);
  }
  
  if (property.propertyType) {
    parts.push(property.propertyType);
  }
  
  if (property.bedrooms && property.bathrooms) {
    parts.push(`${property.bedrooms} bed, ${property.bathrooms} bath`);
  }
  
  if (property.city && property.country) {
    parts.push(`in ${property.city}, ${property.country}`);
  }
  
  if (property.price && property.currency) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: property.currency,
      maximumFractionDigits: 0
    });
    parts.push(`priced at ${formatter.format(property.price)}`);
  }
  
  if (imageType) {
    parts.push(`${imageType} view`);
  }
  
  if (imageIndex !== undefined && totalImages !== undefined) {
    parts.push(`- Image ${imageIndex + 1} of ${totalImages}`);
  }
  
  return parts.join(' ');
}

// Preload critical images
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

// Prefetch images for better performance
export function prefetchImage(src: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = src;
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

// Image loading states
export interface ImageLoadingState {
  loaded: boolean;
  error: boolean;
  loading: boolean;
}

// Custom hook for image loading
export function useImageLoading(src: string): ImageLoadingState {
  const [state, setState] = React.useState<ImageLoadingState>({
    loaded: false,
    error: false,
    loading: true
  });
  
  React.useEffect(() => {
    setState({ loaded: false, error: false, loading: true });
    
    const img = new Image();
    
    img.onload = () => {
      setState({ loaded: true, error: false, loading: false });
    };
    
    img.onerror = () => {
      setState({ loaded: false, error: true, loading: false });
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return state;
}

// Progressive image loading
export function createProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  onLoad?: () => void
): HTMLImageElement {
  const img = new Image();
  
  // Load low quality first
  img.src = lowQualitySrc;
  img.style.filter = 'blur(5px)';
  img.style.transition = 'filter 0.3s ease';
  
  // Load high quality in background
  const highQualityImg = new Image();
  highQualityImg.onload = () => {
    img.src = highQualitySrc;
    img.style.filter = 'none';
    onLoad?.();
  };
  highQualityImg.src = highQualitySrc;
  
  return img;
}

// Image optimization for different property types
export const PROPERTY_TYPE_PRESETS = {
  'apartment': {
    emphasis: ['interior', 'living', 'kitchen', 'bedroom'],
    ratios: ['16:9', '4:3', '1:1']
  },
  'house': {
    emphasis: ['exterior', 'interior', 'garden', 'living'],
    ratios: ['16:9', '4:3', '3:2']
  },
  'villa': {
    emphasis: ['exterior', 'pool', 'garden', 'interior'],
    ratios: ['16:9', '3:2', '21:9']
  },
  'commercial': {
    emphasis: ['exterior', 'interior', 'office', 'reception'],
    ratios: ['16:9', '4:3', '2:1']
  },
  'land': {
    emphasis: ['exterior', 'landscape', 'aerial'],
    ratios: ['16:9', '3:2', '21:9']
  }
} as const;

// Generate structured data for image gallery
export function generateImageGalleryStructuredData(
  images: string[],
  property: {
    title?: string;
    description?: string;
    url?: string;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${property.title} - Photo Gallery`,
    "description": property.description || `Photo gallery for ${property.title}`,
    "url": property.url,
    "image": images.map((image, index) => ({
      "@type": "ImageObject",
      "url": image,
      "name": `${property.title} - Image ${index + 1}`,
      "description": `Property image ${index + 1} of ${images.length}`,
      "position": index + 1
    }))
  };
}

// Export React import for the hook
import React from 'react';

export default {
  generateCloudinaryUrl,
  generateResponsiveSrcSet,
  generateSizesAttribute,
  optimizeImageUrl,
  generateWebPUrl,
  generateAVIFUrl,
  generateBlurPlaceholder,
  generateImageAltText,
  preloadImage,
  prefetchImage,
  useImageLoading,
  createProgressiveImage,
  generateImageGalleryStructuredData,
  PROPERTY_IMAGE_PRESETS,
  RESPONSIVE_BREAKPOINTS,
  PROPERTY_TYPE_PRESETS
};