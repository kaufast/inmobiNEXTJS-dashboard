/**
 * Virtual Tour Structured Data Component
 * Implements virtual tour and 360° view structured data for real estate properties
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Property } from '@shared/schema';

interface VirtualTourItem {
  name: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string; // ISO 8601 duration format (e.g., "PT5M30S")
  uploadDate?: string; // ISO 8601 date format
  viewCount?: number;
  room?: string;
  floor?: number;
  is360?: boolean;
  embedUrl?: string;
}

interface VirtualTourSchemaProps {
  property: Property;
  virtualTours: VirtualTourItem[];
  locale?: string;
}

export function VirtualTourSchema({ property, virtualTours, locale = 'en-US' }: VirtualTourSchemaProps) {
  const { t } = useTranslation(['properties', 'common']);

  // Create Video structured data for virtual tours
  const createVideoSchema = (tour: VirtualTourItem) => ({
    "@type": "VideoObject",
    "@id": `https://inmobi.mobi/property/${property.id}/tour/${encodeURIComponent(tour.name)}`,
    "name": tour.name,
    "description": tour.description,
    "url": tour.url,
    "embedUrl": tour.embedUrl || tour.url,
    "thumbnailUrl": tour.thumbnailUrl || property.images?.[0] || "/images/default-tour-thumbnail.jpg",
    "uploadDate": tour.uploadDate || new Date().toISOString(),
    "duration": tour.duration || "PT5M",
    "publisher": {
      "@type": "Organization",
      "name": "Inmobi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://inmobi.mobi/images/logo.svg"
      }
    },
    "author": {
      "@type": "Organization",
      "name": "Inmobi Real Estate"
    },
    "contentUrl": tour.url,
    "interactionStatistic": tour.viewCount ? {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ViewAction",
      "userInteractionCount": tour.viewCount
    } : undefined,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "room",
        "value": tour.room || "General"
      },
      {
        "@type": "PropertyValue",
        "name": "floor",
        "value": tour.floor || 1
      },
      {
        "@type": "PropertyValue",
        "name": "is360",
        "value": tour.is360 || false
      }
    ].filter(prop => prop.value !== undefined)
  });

  // Create VirtualLocation structured data
  const createVirtualLocationSchema = () => ({
    "@type": "VirtualLocation",
    "@id": `https://inmobi.mobi/property/${property.id}/virtual-tour`,
    "name": `Virtual Tour - ${property.title}`,
    "description": `Take a virtual tour of ${property.title} located in ${property.city}, ${property.country}`,
    "url": `https://inmobi.mobi/property/${property.id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "addressRegion": property.state,
      "addressCountry": property.country
    },
    "hasMap": virtualTours.length > 0 ? virtualTours[0].url : undefined,
    "maximumAttendeeCapacity": 1,
    "virtualTourUrl": virtualTours.length > 0 ? virtualTours[0].url : undefined
  });

  // Create comprehensive schema combining all tours
  const virtualTourSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `https://inmobi.mobi/property/${property.id}`,
    "name": property.title,
    "description": property.description,
    "url": `https://inmobi.mobi/property/${property.id}`,
    "virtualTour": virtualTours.map(createVideoSchema),
    "location": createVirtualLocationSchema(),
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": property.currency || "USD",
      "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "virtualTourAvailable": virtualTours.length > 0
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "virtualTourCount",
        "value": virtualTours.length
      },
      {
        "@type": "PropertyValue",
        "name": "has360Tour",
        "value": virtualTours.some(tour => tour.is360)
      },
      {
        "@type": "PropertyValue",
        "name": "totalTourDuration",
        "value": virtualTours.reduce((total, tour) => {
          if (tour.duration) {
            // Simple duration parsing (assumes format like "PT5M30S")
            const match = tour.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const hours = parseInt(match[1] || '0');
              const minutes = parseInt(match[2] || '0');
              const seconds = parseInt(match[3] || '0');
              return total + (hours * 3600) + (minutes * 60) + seconds;
            }
          }
          return total + 300; // Default 5 minutes
        }, 0)
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(virtualTourSchema)}
      </script>
    </Helmet>
  );
}

// Virtual Tour Display Component
export function VirtualTourDisplay({ property, virtualTours, locale = 'en-US' }: VirtualTourSchemaProps) {
  const { t } = useTranslation(['properties', 'common']);
  const [activeTab, setActiveTab] = React.useState(0);

  if (virtualTours.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        {t('propertyDetails.virtualTour.title', 'Virtual Tour')}
      </h3>
      
      {/* Tour Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {virtualTours.map((tour, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tour.name}
            {tour.is360 && (
              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded">
                360°
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tour Content */}
      {virtualTours[activeTab] && (
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
            {virtualTours[activeTab].embedUrl ? (
              <iframe
                src={virtualTours[activeTab].embedUrl}
                title={virtualTours[activeTab].name}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">
                    {t('propertyDetails.virtualTour.loading', 'Loading virtual tour...')}
                  </p>
                  <a
                    href={virtualTours[activeTab].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                  >
                    {t('propertyDetails.virtualTour.openExternal', 'Open in new window')}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Tour Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {virtualTours[activeTab].name}
            </h4>
            <p className="text-gray-700 mb-3">
              {virtualTours[activeTab].description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {virtualTours[activeTab].room && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  {virtualTours[activeTab].room}
                </span>
              )}
              
              {virtualTours[activeTab].floor && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Floor {virtualTours[activeTab].floor}
                </span>
              )}
              
              {virtualTours[activeTab].duration && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {virtualTours[activeTab].duration}
                </span>
              )}
              
              {virtualTours[activeTab].viewCount && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {virtualTours[activeTab].viewCount.toLocaleString()} views
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample virtual tour data generator
export function generateSampleVirtualTours(property: Property): VirtualTourItem[] {
  const sampleTours: VirtualTourItem[] = [];

  // Main property tour
  sampleTours.push({
    name: t('virtualTour.main.name', 'Complete Property Tour'),
    description: t('virtualTour.main.description', { 
      title: property.title,
      default: `Take a comprehensive virtual tour of ${property.title} and explore every room and feature.`
    }),
    url: `https://inmobi.mobi/tours/property-${property.id}`,
    thumbnailUrl: property.images?.[0] || "/images/default-tour-thumbnail.jpg",
    duration: "PT8M30S",
    uploadDate: new Date().toISOString(),
    viewCount: Math.floor(Math.random() * 1000) + 100,
    room: "Complete Property",
    floor: 1,
    is360: true,
    embedUrl: `https://inmobi.mobi/tours/embed/property-${property.id}`
  });

  // Kitchen tour
  if (property.propertyType !== 'studio') {
    sampleTours.push({
      name: t('virtualTour.kitchen.name', 'Kitchen Tour'),
      description: t('virtualTour.kitchen.description', 'Explore the modern kitchen with all its features and appliances.'),
      url: `https://inmobi.mobi/tours/property-${property.id}/kitchen`,
      duration: "PT3M",
      room: "Kitchen",
      floor: 1,
      is360: true,
      embedUrl: `https://inmobi.mobi/tours/embed/property-${property.id}/kitchen`
    });
  }

  // Bedroom tour
  if (property.bedrooms && property.bedrooms > 0) {
    sampleTours.push({
      name: t('virtualTour.bedroom.name', 'Master Bedroom'),
      description: t('virtualTour.bedroom.description', 'Tour the spacious master bedroom with its elegant design.'),
      url: `https://inmobi.mobi/tours/property-${property.id}/bedroom`,
      duration: "PT2M45S",
      room: "Master Bedroom",
      floor: property.propertyType === 'apartment' ? 1 : 2,
      is360: false,
      embedUrl: `https://inmobi.mobi/tours/embed/property-${property.id}/bedroom`
    });
  }

  return sampleTours;
}

// Hook for managing virtual tours
export function useVirtualTours(property: Property) {
  const [tours, setTours] = React.useState<VirtualTourItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // In a real app, this would fetch from API
    const fetchTours = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, generate sample tours
        const sampleTours = generateSampleVirtualTours(property);
        setTours(sampleTours);
      } catch (error) {
        console.error('Error fetching virtual tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [property.id]);

  const addTour = (tour: VirtualTourItem) => {
    setTours(prev => [...prev, tour]);
  };

  const removeTour = (index: number) => {
    setTours(prev => prev.filter((_, i) => i !== index));
  };

  const updateTour = (index: number, updatedTour: VirtualTourItem) => {
    setTours(prev => prev.map((tour, i) => i === index ? updatedTour : tour));
  };

  return {
    tours,
    loading,
    addTour,
    removeTour,
    updateTour
  };
}

export default VirtualTourSchema;