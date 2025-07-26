/**
 * Image SEO Component for Real Estate Properties
 * Handles structured data, preloading, and SEO optimization for images
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  generateImageGalleryStructuredData,
  preloadImage,
  generateImageAltText,
  PROPERTY_IMAGE_PRESETS
} from '@/lib/image-optimization';

interface ImageSEOProps {
  images: string[];
  property: {
    id: string;
    title: string;
    description?: string;
    propertyType?: string;
    city?: string;
    country?: string;
    bedrooms?: number;
    bathrooms?: number;
    price?: number;
    currency?: string;
    url?: string;
  };
  currentImageIndex?: number;
  preloadCount?: number;
  locale?: string;
}

export const ImageSEO: React.FC<ImageSEOProps> = ({
  images,
  property,
  currentImageIndex = 0,
  preloadCount = 3,
  locale = 'en-US'
}) => {
  // Generate structured data for image gallery
  const galleryStructuredData = generateImageGalleryStructuredData(
    images,
    {
      title: property.title,
      description: property.description,
      url: property.url || `/property/${property.id}`
    }
  );

  // Generate individual image structured data
  const imageStructuredData = images.slice(0, 10).map((image, index) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": image,
    "name": `${property.title} - Image ${index + 1}`,
    "description": generateImageAltText(property, index, images.length),
    "contentUrl": image,
    "thumbnailUrl": image,
    "caption": generateImageAltText(property, index, images.length),
    "width": PROPERTY_IMAGE_PRESETS.gallery.width,
    "height": PROPERTY_IMAGE_PRESETS.gallery.height,
    "encodingFormat": "image/webp",
    "about": {
      "@type": "RealEstateListing",
      "name": property.title,
      "url": property.url || `/property/${property.id}`
    }
  }));

  // Generate property with image structured data
  const propertyWithImageData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.title,
    "description": property.description,
    "image": images.map((image, index) => ({
      "@type": "ImageObject",
      "url": image,
      "name": `${property.title} - Image ${index + 1}`,
      "description": generateImageAltText(property, index, images.length)
    })),
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": property.currency || "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Preload critical images
  React.useEffect(() => {
    if (images.length > 0) {
      // Preload first few images
      images.slice(0, preloadCount).forEach(image => {
        preloadImage(image);
      });
    }
  }, [images, preloadCount]);

  // Generate Open Graph image tags
  const ogImageTags = images.slice(0, 6).map((image, index) => (
    <meta
      key={`og-image-${index}`}
      property="og:image"
      content={image}
    />
  ));

  // Generate Twitter Card image tags
  const twitterImageTags = images.slice(0, 4).map((image, index) => (
    <meta
      key={`twitter-image-${index}`}
      name="twitter:image"
      content={image}
    />
  ));

  return (
    <Helmet>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(galleryStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(imageStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(propertyWithImageData)}
      </script>

      {/* Open Graph Images */}
      {ogImageTags}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={generateImageAltText(property, 0, images.length)} />

      {/* Twitter Card Images */}
      {twitterImageTags}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Preload hints for critical images */}
      {images.slice(0, preloadCount).map((image, index) => (
        <link
          key={`preload-${index}`}
          rel="preload"
          href={image}
          as="image"
          crossOrigin="anonymous"
        />
      ))}

      {/* Prefetch hints for remaining images */}
      {images.slice(preloadCount, preloadCount + 3).map((image, index) => (
        <link
          key={`prefetch-${index}`}
          rel="prefetch"
          href={image}
          crossOrigin="anonymous"
        />
      ))}

      {/* Image-specific meta tags */}
      <meta name="image" content={images[currentImageIndex] || images[0]} />
      <meta name="thumbnail" content={images[0]} />
      
      {/* Property-specific image meta */}
      <meta name="property:image:count" content={images.length.toString()} />
      <meta name="property:image:primary" content={images[0]} />
      
      {/* SEO-friendly image descriptions */}
      <meta 
        name="description" 
        content={`${property.title} - View ${images.length} photos of this ${property.propertyType} in ${property.city}, ${property.country}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms.`}
      />

      {/* Rich snippets for images */}
      <meta itemProp="image" content={images[0]} />
      <meta itemProp="thumbnailUrl" content={images[0]} />
      <meta itemProp="contentUrl" content={images[0]} />
    </Helmet>
  );
};

// Property Image Sitemap Generator
interface PropertyImageSitemapProps {
  properties: Array<{
    id: string;
    title: string;
    images: string[];
    lastModified?: Date;
    url?: string;
  }>;
}

export const PropertyImageSitemap: React.FC<PropertyImageSitemapProps> = ({ properties }) => {
  const imageSitemapData = properties.map(property => ({
    url: property.url || `/property/${property.id}`,
    images: property.images.map((image, index) => ({
      url: image,
      caption: `${property.title} - Image ${index + 1}`,
      title: `${property.title} - Photo ${index + 1}`,
      location: image
    })),
    lastModified: property.lastModified || new Date()
  }));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageSitemap",
          "url": "/images-sitemap.xml",
          "image": imageSitemapData.flatMap(property => 
            property.images.map(image => ({
              "@type": "ImageObject",
              "url": image.url,
              "caption": image.caption,
              "name": image.title,
              "contentUrl": image.url,
              "about": {
                "@type": "RealEstateListing",
                "url": property.url
              }
            }))
          )
        })}
      </script>
    </Helmet>
  );
};

// Critical Image Preloader Component
interface CriticalImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export const CriticalImagePreloader: React.FC<CriticalImagePreloaderProps> = ({ 
  images, 
  priority = true 
}) => {
  React.useEffect(() => {
    if (priority && images.length > 0) {
      // Preload first 3 images immediately
      images.slice(0, 3).forEach(image => {
        preloadImage(image);
      });
    }
  }, [images, priority]);

  return (
    <Helmet>
      {priority && images.slice(0, 3).map((image, index) => (
        <link
          key={`critical-preload-${index}`}
          rel="preload"
          href={image}
          as="image"
          crossOrigin="anonymous"
        />
      ))}
    </Helmet>
  );
};

// Image Performance Monitoring
export const ImagePerformanceMonitor: React.FC = () => {
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img') {
          // Log image loading performance
          console.log('Image Performance:', {
            url: entry.name,
            duration: entry.duration,
            transferSize: (entry as any).transferSize,
            decodedBodySize: (entry as any).decodedBodySize,
            loadTime: entry.responseEnd - entry.startTime
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ImageSEO;