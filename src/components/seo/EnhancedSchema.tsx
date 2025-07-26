import React from 'react';
import { Property } from '@shared/schema';

interface EnhancedSchemaProps {
  property?: Property;
  properties?: Property[];
  context: 'property' | 'search' | 'home' | 'agent';
  location?: string;
  searchQuery?: string;
  totalResults?: number;
}

export const EnhancedSchema: React.FC<EnhancedSchemaProps> = ({
  property,
  properties = [],
  context,
  location,
  searchQuery,
  totalResults
}) => {
  
  // Generate comprehensive schema based on context
  const generateSchema = () => {
    const schemas: any[] = [];
    
    // Always include Organization schema
    schemas.push(generateOrganizationSchema());
    
    // Always include WebSite schema for enhanced search
    schemas.push(generateWebSiteSchema());
    
    switch (context) {
      case 'property':
        if (property) {
          schemas.push(generatePropertySchema(property));
          schemas.push(generateRealEstateListingSchema(property));
          schemas.push(generateProductSchema(property));
          schemas.push(generatePlaceSchema(property));
          schemas.push(generateOfferSchema(property));
        }
        break;
        
      case 'search':
        if (properties.length > 0) {
          schemas.push(generateSearchResultsSchema(properties, searchQuery, totalResults));
          schemas.push(generateItemListSchema(properties));
          schemas.push(generateCollectionPageSchema(properties, location));
        }
        break;
        
      case 'home':
        schemas.push(generateWebPageSchema());
        schemas.push(generateBreadcrumbListSchema());
        break;
        
      case 'agent':
        schemas.push(generateRealEstateAgentSchema());
        break;
    }
    
    return {
      "@context": "https://schema.org",
      "@graph": schemas
    };
  };

  // Organization schema with comprehensive details
  const generateOrganizationSchema = () => ({
    "@type": "Organization",
    "@id": "https://inmobi.mobi/#organization",
    "name": "Inmobi Real Estate",
    "alternateName": "Inmobi",
    "url": "https://inmobi.mobi",
    "logo": {
      "@type": "ImageObject",
      "url": "https://inmobi.mobi/logo.png",
      "width": 300,
      "height": 100
    },
    "image": "https://inmobi.mobi/logo.png",
    "description": "Premier real estate platform connecting buyers, sellers, and renters with verified properties across Spain and Europe. Expert agents, virtual tours, and comprehensive property listings.",
    "foundingDate": "2023",
    "slogan": "Find Your Dream Property",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES",
      "addressRegion": "Madrid",
      "addressLocality": "Madrid"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Spain"
      },
      {
        "@type": "Country", 
        "name": "France"
      },
      {
        "@type": "Country",
        "name": "Germany"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-679-680-000",
      "contactType": "customer service",
      "areaServed": "ES",
      "availableLanguage": ["English", "Spanish", "Catalan", "German", "French"]
    },
    "sameAs": [
      "https://www.facebook.com/inmobi",
      "https://www.instagram.com/inmobi", 
      "https://www.linkedin.com/company/inmobi",
      "https://twitter.com/inmobi"
    ],
    "knowsAbout": [
      "Real Estate",
      "Property Sales",
      "Property Rentals",
      "Property Investment",
      "Real Estate Market Analysis",
      "Property Valuation",
      "Mortgage Assistance",
      "Property Management"
    ],
    "serviceType": [
      "Real Estate Services",
      "Property Search",
      "Property Listing",
      "Property Valuation",
      "Real Estate Consultation"
    ]
  });

  // Enhanced WebSite schema for search functionality
  const generateWebSiteSchema = () => ({
    "@type": "WebSite",
    "@id": "https://inmobi.mobi/#website",
    "url": "https://inmobi.mobi",
    "name": "Inmobi Real Estate",
    "description": "Find your dream property with Inmobi's comprehensive real estate platform",
    "publisher": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "inLanguage": ["en", "es", "ca", "de", "fr"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://inmobi.mobi/search?query={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  });

  // Property-specific schema
  const generatePropertySchema = (prop: Property) => ({
    "@type": "Residence",
    "@id": `https://inmobi.mobi/property/${prop.id}#property`,
    "name": prop.title,
    "description": prop.description,
    "url": `https://inmobi.mobi/property/${prop.id}`,
    "image": prop.images || [],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": prop.address,
      "addressLocality": prop.city,
      "addressRegion": prop.state,
      "addressCountry": prop.country
    },
    ...(prop.latitude && prop.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": prop.latitude,
        "longitude": prop.longitude
      }
    }),
    "numberOfRooms": prop.bedrooms,
    "numberOfBathroomsTotal": prop.bathrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": prop.areaSqm || prop.squareFeet,
      "unitCode": prop.areaSqm ? "MTK" : "FTK"
    },
    "accommodationCategory": prop.propertyType,
    "amenityFeature": prop.features?.map(feature => ({
      "@type": "LocationFeatureSpecification",
      "name": feature,
      "value": true
    })) || []
  });

  // Real Estate Listing schema
  const generateRealEstateListingSchema = (prop: Property) => ({
    "@type": "RealEstateListing",
    "@id": `https://inmobi.mobi/property/${prop.id}#listing`,
    "name": prop.title,
    "description": prop.description,
    "url": `https://inmobi.mobi/property/${prop.id}`,
    "datePosted": prop.createdAt || new Date().toISOString(),
    "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    "provider": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "realEstateAgent": {
      "@type": "RealEstateAgent",
      "name": "Areeya al Shams",
      "email": "areeya@inmobi.mobi",
      "telephone": "+34-679-680-000",
      "worksFor": {
        "@id": "https://inmobi.mobi/#organization"
      }
    }
  });

  // Product schema for e-commerce features
  const generateProductSchema = (prop: Property) => ({
    "@type": "Product",
    "@id": `https://inmobi.mobi/property/${prop.id}#product`,
    "name": prop.title,
    "description": prop.description,
    "image": prop.images || [],
    "url": `https://inmobi.mobi/property/${prop.id}`,
    "sku": `PROP-${prop.id}`,
    "category": "Real Estate",
    "brand": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "offers": {
      "@type": "Offer",
      "price": prop.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@id": "https://inmobi.mobi/#organization"
      },
      "validFrom": new Date().toISOString(),
      "priceSpecification": {
        "@type": "PriceSpecification", 
        "price": prop.price,
        "priceCurrency": "EUR"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "bedrooms",
        "value": prop.bedrooms
      },
      {
        "@type": "PropertyValue",
        "name": "bathrooms",
        "value": prop.bathrooms
      },
      {
        "@type": "PropertyValue",
        "name": "propertyType",
        "value": prop.propertyType
      },
      {
        "@type": "PropertyValue",
        "name": "listingType",
        "value": prop.listingType
      }
    ]
  });

  // Place schema for location information
  const generatePlaceSchema = (prop: Property) => ({
    "@type": "Place",
    "@id": `https://inmobi.mobi/property/${prop.id}#place`,
    "name": `${prop.title} - ${prop.city}`,
    "description": `Property located in ${prop.city}, ${prop.country}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": prop.address,
      "addressLocality": prop.city,
      "addressRegion": prop.state,
      "addressCountry": prop.country
    },
    ...(prop.latitude && prop.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": prop.latitude,
        "longitude": prop.longitude
      }
    })
  });

  // Offer schema for pricing information
  const generateOfferSchema = (prop: Property) => ({
    "@type": "Offer",
    "@id": `https://inmobi.mobi/property/${prop.id}#offer`,
    "itemOffered": {
      "@id": `https://inmobi.mobi/property/${prop.id}#property`
    },
    "price": prop.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "validFrom": new Date().toISOString(),
    "category": prop.listingType === 'rent' ? 'Rental' : 'Sale'
  });

  // Search results schema
  const generateSearchResultsSchema = (props: Property[], query?: string, total?: number) => ({
    "@type": "SearchResultsPage",
    "@id": "https://inmobi.mobi/search#searchresults",
    "name": `Property Search Results${query ? ` for "${query}"` : ''}`,
    "description": `Search results showing ${total || props.length} properties`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": total || props.length,
      "itemListElement": props.slice(0, 10).map((prop, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@id": `https://inmobi.mobi/property/${prop.id}#product`
        }
      }))
    }
  });

  // Item list schema for property listings
  const generateItemListSchema = (props: Property[]) => ({
    "@type": "ItemList",
    "@id": "https://inmobi.mobi/search#itemlist",
    "name": "Property Listings",
    "numberOfItems": props.length,
    "itemListElement": props.map((prop, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstateListing",
        "@id": `https://inmobi.mobi/property/${prop.id}`,
        "name": prop.title,
        "url": `https://inmobi.mobi/property/${prop.id}`
      }
    }))
  });

  // Collection page schema
  const generateCollectionPageSchema = (props: Property[], loc?: string) => ({
    "@type": "CollectionPage",
    "@id": "https://inmobi.mobi/search#collection",
    "name": `Properties${loc ? ` in ${loc}` : ''}`,
    "description": `Collection of real estate properties${loc ? ` in ${loc}` : ''}`,
    "mainEntity": {
      "@id": "https://inmobi.mobi/search#itemlist"
    }
  });

  // Web page schema for home page
  const generateWebPageSchema = () => ({
    "@type": "WebPage",
    "@id": "https://inmobi.mobi/#webpage",
    "url": "https://inmobi.mobi",
    "name": "Inmobi Real Estate - Find Your Dream Property",
    "description": "Premier real estate platform for finding properties across Spain and Europe",
    "isPartOf": {
      "@id": "https://inmobi.mobi/#website"
    },
    "about": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://inmobi.mobi/images/hero-home.jpg"
    }
  });

  // Breadcrumb schema
  const generateBreadcrumbListSchema = () => ({
    "@type": "BreadcrumbList",
    "@id": "https://inmobi.mobi/#breadcrumbs",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://inmobi.mobi"
      }
    ]
  });

  // Real estate agent schema
  const generateRealEstateAgentSchema = () => ({
    "@type": "RealEstateAgent",
    "@id": "https://inmobi.mobi/agent#agent",
    "name": "Areeya al Shams",
    "jobTitle": "Senior Real Estate Agent",
    "email": "areeya@inmobi.mobi",
    "telephone": "+34-679-680-000",
    "worksFor": {
      "@id": "https://inmobi.mobi/#organization"
    },
    "knowsAbout": [
      "Real Estate Sales",
      "Property Valuation",
      "Market Analysis",
      "Client Relations",
      "Property Investment"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Spain"
    }
  });

  const schema = generateSchema();

  return (
    <script 
      type="application/ld+json" 
      data-enhanced-schema={context}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
};

export default EnhancedSchema;