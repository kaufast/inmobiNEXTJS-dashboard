/**
 * Enhanced Structured Data Components for Real Estate SEO
 * Implements advanced schema types for better search visibility
 */

import { Helmet } from 'react-helmet-async';

// FAQ Schema for Property Questions
export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

// Price History Schema for Property Pricing
export interface PriceHistoryItem {
  date: string;
  price: number;
  currency: string;
  priceType: 'sale' | 'rent' | 'estimate';
  changeReason?: string;
}

interface PriceHistorySchemaProps {
  propertyId: string;
  propertyName: string;
  priceHistory: PriceHistoryItem[];
}

export function PriceHistorySchema({ propertyId, propertyName, priceHistory }: PriceHistorySchemaProps) {
  const priceHistorySchema = {
    "@context": "https://schema.org",
    "@type": "PropertyValue",
    "propertyID": propertyId,
    "name": `Price History for ${propertyName}`,
    "value": priceHistory.map(item => ({
      "@type": "MonetaryAmount",
      "value": item.price,
      "currency": item.currency,
      "validFrom": item.date,
      "description": `${item.priceType} price${item.changeReason ? ` - ${item.changeReason}` : ''}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(priceHistorySchema)}
      </script>
    </Helmet>
  );
}

// Virtual Tour Schema for Property Tours
export interface VirtualTourData {
  tourUrl: string;
  tourType: '360' | 'video' | 'slideshow';
  duration?: number; // in minutes
  description?: string;
  thumbnailUrl?: string;
}

interface VirtualTourSchemaProps {
  propertyId: string;
  propertyName: string;
  virtualTour: VirtualTourData;
}

export function VirtualTourSchema({ propertyId, propertyName, virtualTour }: VirtualTourSchemaProps) {
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "VirtualLocation",
    "name": `Virtual Tour - ${propertyName}`,
    "description": virtualTour.description || `${virtualTour.tourType} virtual tour of ${propertyName}`,
    "url": virtualTour.tourUrl,
    "about": {
      "@type": "RealEstateListing",
      "name": propertyName,
      "identifier": propertyId
    },
    "additionalType": "https://schema.org/TouristAttraction",
    "mainEntity": {
      "@type": "MediaObject",
      "contentUrl": virtualTour.tourUrl,
      "encodingFormat": virtualTour.tourType === 'video' ? 'video/mp4' : 'application/x-shockwave-flash',
      "duration": virtualTour.duration ? `PT${virtualTour.duration}M` : undefined,
      "thumbnailUrl": virtualTour.thumbnailUrl,
      "description": `${virtualTour.tourType} tour of ${propertyName}`
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(tourSchema)}
      </script>
    </Helmet>
  );
}

// Agent Review Schema for Real Estate Agents
export interface AgentReview {
  reviewId: string;
  reviewer: {
    name: string;
    image?: string;
  };
  rating: number;
  reviewText: string;
  datePublished: string;
  wouldRecommend?: boolean;
}

interface AgentReviewSchemaProps {
  agentId: string;
  agentName: string;
  agentImage?: string;
  agentUrl?: string;
  reviews: AgentReview[];
  averageRating: number;
  totalReviews: number;
}

export function AgentReviewSchema({ 
  agentId, 
  agentName, 
  agentImage, 
  agentUrl, 
  reviews, 
  averageRating, 
  totalReviews 
}: AgentReviewSchemaProps) {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": agentId,
    "name": agentName,
    "image": agentImage,
    "url": agentUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": totalReviews,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "@id": review.reviewId,
      "author": {
        "@type": "Person",
        "name": review.reviewer.name,
        "image": review.reviewer.image
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.reviewText,
      "datePublished": review.datePublished,
      "publisher": {
        "@type": "Organization",
        "name": "Inmobi"
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(reviewSchema)}
      </script>
    </Helmet>
  );
}

// Property Comparison Schema
export interface PropertyComparison {
  comparisonId: string;
  properties: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    location: string;
    url: string;
    image?: string;
  }>;
  comparisonCriteria: string[];
  dateCreated: string;
}

interface PropertyComparisonSchemaProps {
  comparison: PropertyComparison;
}

export function PropertyComparisonSchema({ comparison }: PropertyComparisonSchemaProps) {
  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Property Comparison",
    "description": `Comparison of ${comparison.properties.length} properties`,
    "dateCreated": comparison.dateCreated,
    "numberOfItems": comparison.properties.length,
    "itemListElement": comparison.properties.map((property, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstateListing",
        "@id": property.id,
        "name": property.name,
        "url": property.url,
        "image": property.image,
        "floorSize": {
          "@type": "QuantitativeValue",
          "value": property.area,
          "unitText": "SQM"
        },
        "numberOfRooms": property.bedrooms,
        "numberOfBathroomsTotal": property.bathrooms,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": property.location
        },
        "offers": {
          "@type": "Offer",
          "price": property.price,
          "priceCurrency": property.currency,
          "availability": "https://schema.org/InStock"
        }
      }
    })),
    "additionalProperty": comparison.comparisonCriteria.map(criterion => ({
      "@type": "PropertyValue",
      "name": criterion,
      "description": `Comparison criterion: ${criterion}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(comparisonSchema)}
      </script>
    </Helmet>
  );
}

// Investment Analysis Schema for Property Investment Information
export interface InvestmentAnalysis {
  propertyId: string;
  expectedReturn: number;
  paybackPeriod: number;
  rentalYield: number;
  appreciation: number;
  marketTrends: string[];
  investmentRisk: 'low' | 'medium' | 'high';
  analysisDate: string;
}

interface InvestmentAnalysisSchemaProps {
  propertyId: string;
  propertyName: string;
  analysis: InvestmentAnalysis;
}

export function InvestmentAnalysisSchema({ propertyId, propertyName, analysis }: InvestmentAnalysisSchemaProps) {
  const investmentSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": `Investment Analysis - ${propertyName}`,
    "description": `Real estate investment analysis for ${propertyName}`,
    "provider": {
      "@type": "Organization",
      "name": "Inmobi"
    },
    "about": {
      "@type": "RealEstateListing",
      "@id": propertyId,
      "name": propertyName
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Expected Return",
        "value": analysis.expectedReturn,
        "unitText": "PERCENT"
      },
      {
        "@type": "PropertyValue",
        "name": "Payback Period",
        "value": analysis.paybackPeriod,
        "unitText": "YEAR"
      },
      {
        "@type": "PropertyValue",
        "name": "Rental Yield",
        "value": analysis.rentalYield,
        "unitText": "PERCENT"
      },
      {
        "@type": "PropertyValue",
        "name": "Appreciation",
        "value": analysis.appreciation,
        "unitText": "PERCENT"
      },
      {
        "@type": "PropertyValue",
        "name": "Investment Risk",
        "value": analysis.investmentRisk
      }
    ],
    "dateCreated": analysis.analysisDate,
    "keywords": analysis.marketTrends.join(", ")
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(investmentSchema)}
      </script>
    </Helmet>
  );
}

// Neighborhood Information Schema
export interface NeighborhoodInfo {
  name: string;
  city: string;
  country: string;
  description: string;
  averagePrice: number;
  currency: string;
  walkScore?: number;
  crimeRate?: string;
  schools: Array<{
    name: string;
    rating: number;
    distance: number;
  }>;
  amenities: string[];
  transportation: string[];
}

interface NeighborhoodSchemaProps {
  neighborhood: NeighborhoodInfo;
}

export function NeighborhoodSchema({ neighborhood }: NeighborhoodSchemaProps) {
  const neighborhoodSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": neighborhood.name,
    "description": neighborhood.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": neighborhood.city,
      "addressCountry": neighborhood.country
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Average Property Price",
        "value": neighborhood.averagePrice,
        "unitText": neighborhood.currency
      },
      ...(neighborhood.walkScore ? [{
        "@type": "PropertyValue",
        "name": "Walk Score",
        "value": neighborhood.walkScore,
        "maxValue": 100
      }] : []),
      ...(neighborhood.crimeRate ? [{
        "@type": "PropertyValue",
        "name": "Crime Rate",
        "value": neighborhood.crimeRate
      }] : [])
    ],
    "amenityFeature": neighborhood.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "publicAccess": neighborhood.transportation.length > 0,
    "additionalType": "https://schema.org/Residence"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(neighborhoodSchema)}
      </script>
    </Helmet>
  );
}