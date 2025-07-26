/**
 * Optimized Image Component for Real Estate SEO
 * Includes lazy loading, responsive images, WebP support, and proper alt text
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyType?: string;
  imageIndex?: number;
  totalImages?: number;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

// Generate optimized image URLs with different formats and sizes
const generateImageSources = (
  src: string, 
  width?: number, 
  height?: number,
  quality: number = 85
): { webp: string; avif: string; jpeg: string; srcSet: string } => {
  // Safety check for src
  if (!src || typeof src !== 'string' || src === 'null' || src === 'undefined' || src === '[object Object]') {
    console.error('Invalid src provided to generateImageSources:', src);
    const fallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
    return {
      webp: fallback,
      avif: fallback,
      jpeg: fallback,
      srcSet: fallback
    };
  }
  
  // Check if the image is from Cloudinary
  const isCloudinary = src.includes('cloudinary.com') || src.includes('res.cloudinary.com');
  
  // Check if the image is from UploadCare
  const isUploadCare = src.includes('ucarecdn.com');
  
  if (isCloudinary) {
    // Extract the base URL and transform parameters
    const baseUrl = src.split('/upload/')[0] + '/upload/';
    const imagePath = src.split('/upload/')[1];
    
    const transforms = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push('f_auto'); // Auto format selection
    transforms.push('c_fill'); // Fill mode for consistent sizing
    
    const transformString = transforms.join(',');
    
    return {
      webp: `${baseUrl}${transformString},f_webp/${imagePath}`,
      avif: `${baseUrl}${transformString},f_avif/${imagePath}`,
      jpeg: `${baseUrl}${transformString},f_jpg/${imagePath}`,
      srcSet: [
        `${baseUrl}${transformString},f_webp,w_${width || 800}/${imagePath} ${width || 800}w`,
        `${baseUrl}${transformString},f_webp,w_${(width || 800) * 2}/${imagePath} ${(width || 800) * 2}w`,
        `${baseUrl}${transformString},f_webp,w_${(width || 800) * 0.5}/${imagePath} ${(width || 800) * 0.5}w`,
      ].join(', ')
    };
  }
  
  if (isUploadCare) {
    // UploadCare transformations
    const baseUrl = src.split('/-/')[0];
    const transforms = [];
    
    if (width && height) {
      transforms.push(`resize/${width}x${height}`);
    } else if (width) {
      transforms.push(`scale_crop/${width}x${Math.round(width * 0.75)}`);
    } else if (height) {
      transforms.push(`scale_crop/${Math.round(height * 1.33)}x${height}`);
    }
    
    transforms.push('format/auto');
    transforms.push(`quality/${quality}`);
    
    const transformString = transforms.length > 0 ? `/-/${transforms.join('/')}/` : '/';
    
    return {
      webp: `${baseUrl}${transformString}`,
      avif: `${baseUrl}${transformString}`,
      jpeg: `${baseUrl}${transformString}`,
      srcSet: `${baseUrl}${transformString}`
    };
  }
  
  // For other images, return the original source
  return {
    webp: src,
    avif: src,
    jpeg: src,
    srcSet: src
  };
};

// Generate SEO-optimized alt text
const generateAltText = (
  alt: string,
  propertyTitle?: string,
  propertyLocation?: string,
  propertyType?: string,
  imageIndex?: number,
  totalImages?: number
): string => {
  if (alt && alt.trim()) {
    return alt;
  }
  
  // Generate descriptive alt text based on property information
  const parts = [];
  
  if (propertyTitle) {
    parts.push(propertyTitle);
  }
  
  if (propertyType) {
    parts.push(propertyType);
  }
  
  if (propertyLocation) {
    parts.push(`in ${propertyLocation}`);
  }
  
  if (imageIndex !== undefined && totalImages !== undefined) {
    parts.push(`- Image ${imageIndex + 1} of ${totalImages}`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'Property image';
};

// Generate structured data for images
const generateImageStructuredData = (
  src: string,
  alt: string,
  width?: number,
  height?: number,
  propertyTitle?: string
) => {
  if (typeof window === 'undefined') return null;
  
  const imageData = {
    "@type": "ImageObject",
    "url": src,
    "description": alt,
    "width": width,
    "height": height,
    "name": propertyTitle || alt,
    "caption": alt,
    "contentUrl": src,
    "encodingFormat": "image/jpeg"
  };
  
  return imageData;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 85,
  propertyTitle,
  propertyLocation,
  propertyType,
  imageIndex,
  totalImages,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
  style,
  loading = 'lazy',
  decoding = 'async'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslation(['common', 'properties']);
  
  // Handle invalid src
  if (!src || typeof src !== 'string' || src === 'null' || src === 'undefined' || src === '[object Object]') {
    console.error('OptimizedImage: Invalid src provided:', src);
    return (
      <div 
        className={`relative overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No image</p>
        </div>
      </div>
    );
  }
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || typeof window === 'undefined') {
      setIsIntersecting(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  // Generate optimized image sources
  const imageSources = generateImageSources(src, width, height, quality);
  
  // Generate SEO-optimized alt text
  const optimizedAlt = generateAltText(
    alt,
    propertyTitle,
    propertyLocation,
    propertyType,
    imageIndex,
    totalImages
  );
  
  // Generate structured data
  const structuredData = generateImageStructuredData(
    src,
    optimizedAlt,
    width,
    height,
    propertyTitle
  );
  
  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setImageError(true);
    onError?.();
  };
  
  const baseClasses = `
    transition-opacity duration-300 ease-in-out
    ${imageLoaded ? 'opacity-100' : 'opacity-0'}
    ${className}
  `;
  
  const placeholderClasses = `
    bg-gray-200 animate-pulse
    ${!imageLoaded && !imageError ? 'block' : 'hidden'}
  `;
  
  // Fallback image for errors
  const fallbackImage = '/images/property-placeholder.jpg';
  
  return (
    <div 
      className="relative overflow-hidden bg-gray-100"
      style={{ width, height, ...style }}
    >
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Placeholder */}
      <div
        className={`absolute inset-0 ${placeholderClasses}`}
        style={{ width, height }}
      >
        {blurDataURL && (
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover filter blur-sm"
            aria-hidden="true"
          />
        )}
      </div>
      
      {/* Main Image */}
      {isIntersecting && (
        <picture>
          {/* AVIF format (most efficient) */}
          <source
            srcSet={imageSources.avif}
            type="image/avif"
            sizes={sizes}
          />
          
          {/* WebP format (widely supported) */}
          <source
            srcSet={imageSources.webp}
            type="image/webp"
            sizes={sizes}
          />
          
          {/* JPEG fallback */}
          <img
            ref={imgRef}
            src={imageError ? fallbackImage : imageSources.jpeg}
            alt={optimizedAlt}
            width={width}
            height={height}
            className={baseClasses}
            loading={priority ? 'eager' : loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center',
              ...style
            }}
            // SEO attributes
            itemProp="image"
            // Accessibility attributes
            role="img"
            aria-label={optimizedAlt}
          />
        </picture>
      )}
      
      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              {t('common:errors.imageLoadFailed', 'Image failed to load')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Property Image Gallery Component
interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
  propertyLocation: string;
  propertyType: string;
  className?: string;
  priority?: boolean;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  propertyTitle,
  propertyLocation,
  propertyType,
  className = '',
  priority = false
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useTranslation(['properties']);
  
  // Filter out invalid images
  const validImages = images?.filter(img => img && typeof img === 'string') || [];
  
  if (validImages.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '300px' }}>
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">
            {t('properties:noImages', 'No images available')}
          </p>
          <p className="text-sm mt-1">
            {t('properties:noImagesDescription', 'This property has no images to display')}
          </p>
        </div>
      </div>
    );
  }
  
  // Ensure currentImageIndex is within bounds
  const safeCurrentIndex = Math.max(0, Math.min(currentImageIndex, validImages.length - 1));
  const currentImage = validImages[safeCurrentIndex];
  
  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <OptimizedImage
        src={currentImage}
        alt={`${propertyTitle} - ${propertyLocation}`}
        width={800}
        height={600}
        propertyTitle={propertyTitle}
        propertyLocation={propertyLocation}
        propertyType={propertyType}
        imageIndex={safeCurrentIndex}
        totalImages={validImages.length}
        priority={priority}
        className="w-full h-full rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
      />
      
      {/* Image Navigation */}
      {validImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={() => setCurrentImageIndex((prev) => 
              prev === 0 ? validImages.length - 1 : prev - 1
            )}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label={t('properties:previousImage', 'Previous image')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Next Button */}
          <button
            onClick={() => setCurrentImageIndex((prev) => 
              prev === validImages.length - 1 ? 0 : prev + 1
            )}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label={t('properties:nextImage', 'Next image')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {safeCurrentIndex + 1} / {validImages.length}
          </div>
        </>
      )}
      
      {/* Thumbnail Navigation */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                index === currentImageIndex
                  ? 'border-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <OptimizedImage
                src={image}
                alt={`${propertyTitle} thumbnail ${index + 1}`}
                width={80}
                height={64}
                propertyTitle={propertyTitle}
                propertyLocation={propertyLocation}
                propertyType={propertyType}
                imageIndex={index}
                totalImages={images.length}
                className="w-full h-full"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Property Card Image Component
interface PropertyCardImageProps {
  src: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyType: string;
  className?: string;
  priority?: boolean;
}

export const PropertyCardImage: React.FC<PropertyCardImageProps> = ({
  src,
  propertyTitle,
  propertyLocation,
  propertyType,
  className = '',
  priority = false
}) => {
  // Simplified version for debugging - use basic img tag
  return (
    <img
      src={src}
      alt={`${propertyTitle} - ${propertyType} in ${propertyLocation}`}
      className={`rounded-lg ${className}`}
      style={{ objectFit: 'cover' }}
      loading={priority ? 'eager' : 'lazy'}
      onError={(e) => {
        console.error('Image failed to load:', src);
        // Use a basic fallback
        e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
      }}
    />
  );
};

export default OptimizedImage;