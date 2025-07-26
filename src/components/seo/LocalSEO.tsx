import React from 'react';
import { Helmet } from 'react-helmet';

interface LocalBusinessInfo {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  telephone: string;
  email: string;
  priceRange: string;
  openingHours: string[];
  languages: string[];
  serviceArea: string[];
}

interface LocalSEOProps {
  location: 'barcelona' | 'mexico' | 'berlin' | 'vienna' | 'paris' | 'london' | 'newyork';
  pageType?: 'city' | 'neighborhood' | 'search';
  specificLocation?: string; // e.g., "Eixample", "Condesa"
}

const LOCAL_BUSINESSES: Record<string, LocalBusinessInfo> = {
  barcelona: {
    name: "Inmobi Barcelona",
    address: {
      streetAddress: "Carrer de Mallorca, 401",
      addressLocality: "Barcelona", 
      addressRegion: "Catalunya",
      postalCode: "08013",
      addressCountry: "ES"
    },
    geo: {
      latitude: 41.3851,
      longitude: 2.1734
    },
    telephone: "+34-123-456-789",
    email: "barcelona@inmobi.mobi",
    priceRange: "€€€",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["Spanish", "Catalan", "English"],
    serviceArea: [
      "Barcelona",
      "Badalona", 
      "Hospitalet de Llobregat",
      "Terrassa",
      "Sabadell"
    ]
  },
  mexico: {
    name: "Inmobi Mexico",
    address: {
      streetAddress: "Av. Reforma 222",
      addressLocality: "Mexico City",
      addressRegion: "CDMX", 
      postalCode: "06600",
      addressCountry: "MX"
    },
    geo: {
      latitude: 19.4326,
      longitude: -99.1332
    },
    telephone: "+52-55-1234-5678",
    email: "mexico@inmobi.mobi", 
    priceRange: "$$$",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["Spanish", "English"],
    serviceArea: [
      "Mexico City",
      "Guadalajara",
      "Monterrey", 
      "Cancun",
      "Playa del Carmen"
    ]
  },
  berlin: {
    name: "Inmobi Berlin",
    address: {
      streetAddress: "Unter den Linden 1",
      addressLocality: "Berlin",
      addressRegion: "Berlin",
      postalCode: "10117",
      addressCountry: "DE"
    },
    geo: {
      latitude: 52.5200,
      longitude: 13.4050
    },
    telephone: "+49-30-1234-5678",
    email: "berlin@inmobi.mobi",
    priceRange: "€€€",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["German", "English"],
    serviceArea: [
      "Berlin",
      "Hamburg",
      "München",
      "Köln",
      "Frankfurt",
      "Stuttgart",
      "Düsseldorf",
      "Leipzig",
      "Dresden",
      "Hannover"
    ]
  },
  vienna: {
    name: "Inmobi Vienna",
    address: {
      streetAddress: "Ringstraße 1",
      addressLocality: "Vienna",
      addressRegion: "Wien",
      postalCode: "1010",
      addressCountry: "AT"
    },
    geo: {
      latitude: 48.2082,
      longitude: 16.3738
    },
    telephone: "+43-1-234-5678",
    email: "vienna@inmobi.mobi",
    priceRange: "€€€",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["German", "English"],
    serviceArea: [
      "Vienna",
      "Graz",
      "Linz",
      "Salzburg",
      "Innsbruck",
      "Klagenfurt",
      "Villach",
      "Wels",
      "Sankt Pölten",
      "Dornbirn"
    ]
  },
  paris: {
    name: "Inmobi Paris",
    address: {
      streetAddress: "Champs-Élysées 1",
      addressLocality: "Paris",
      addressRegion: "Île-de-France",
      postalCode: "75008",
      addressCountry: "FR"
    },
    geo: {
      latitude: 48.8566,
      longitude: 2.3522
    },
    telephone: "+33-1-23-45-67-89",
    email: "paris@inmobi.mobi",
    priceRange: "€€€",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["French", "English"],
    serviceArea: [
      "Paris",
      "Marseille",
      "Lyon",
      "Toulouse",
      "Nice",
      "Nantes",
      "Montpellier",
      "Strasbourg",
      "Bordeaux",
      "Lille"
    ]
  },
  london: {
    name: "Inmobi London",
    address: {
      streetAddress: "Oxford Street 1",
      addressLocality: "London",
      addressRegion: "England",
      postalCode: "W1C 1AA",
      addressCountry: "GB"
    },
    geo: {
      latitude: 51.5074,
      longitude: -0.1278
    },
    telephone: "+44-20-1234-5678",
    email: "london@inmobi.mobi",
    priceRange: "£££",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["English"],
    serviceArea: [
      "London",
      "Birmingham",
      "Manchester",
      "Leeds",
      "Glasgow",
      "Liverpool",
      "Newcastle",
      "Sheffield",
      "Bristol",
      "Edinburgh"
    ]
  },
  newyork: {
    name: "Inmobi New York",
    address: {
      streetAddress: "Fifth Avenue 1",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US"
    },
    geo: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    telephone: "+1-212-123-4567",
    email: "newyork@inmobi.mobi",
    priceRange: "$$$",
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-14:00"
    ],
    languages: ["English", "Spanish"],
    serviceArea: [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "San Jose"
    ]
  }
};

export const LocalSEO: React.FC<LocalSEOProps> = ({ 
  location, 
  pageType = 'city',
  specificLocation 
}) => {
  const business = LOCAL_BUSINESSES[location];
  
  if (!business) return null;

  // Generate LocalBusiness structured data
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `https://inmobi.mobi/#${location}-office`,
    "name": business.name,
    "image": `https://inmobi.mobi/images/office-${location}.jpg`,
    "description": `Professional real estate services in ${business.address.addressLocality}. Find your perfect property with local expertise and AI-powered search.`,
    "url": `https://inmobi.mobi/${location === 'barcelona' ? 'es-ES' : 'es-MX'}/`,
    "telephone": business.telephone,
    "email": business.email,
    "priceRange": business.priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address.streetAddress,
      "addressLocality": business.address.addressLocality,
      "addressRegion": business.address.addressRegion,
      "postalCode": business.address.postalCode,
      "addressCountry": business.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.geo.latitude,
      "longitude": business.geo.longitude
    },
    "openingHoursSpecification": business.openingHours.map(hours => {
      const [days, time] = hours.split(' ');
      const [open, close] = time.split('-');
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": days,
        "opens": open,
        "closes": close
      };
    }),
    "knowsLanguage": business.languages,
    "areaServed": business.serviceArea.map(area => ({
      "@type": "City",
      "name": area
    })),
    "parentOrganization": {
      "@type": "Organization",
      "@id": "https://inmobi.mobi/#organization",
      "name": "Inmobi"
    },
    "sameAs": [
      `https://www.facebook.com/inmobi${location}`,
      `https://twitter.com/inmobi${location}`,
      `https://www.linkedin.com/company/inmobi-${location}`
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Real Estate Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Property Sales",
            "description": "Professional property sales services"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Property Rentals",
            "description": "Rental property management and leasing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Property Valuation",
            "description": "Professional property valuation services"
          }
        }
      ]
    }
  };

  // Generate Place schema for the location
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `https://inmobi.mobi/#${location}-area`,
    "name": specificLocation || business.address.addressLocality,
    "description": `Discover properties in ${specificLocation || business.address.addressLocality}. ${location === 'barcelona' ? 'Barcelona offers a unique blend of historic charm and modern living, from Gothic Quarter apartments to modern Eixample flats.' : 'Mexico offers diverse real estate opportunities from city centers to coastal properties, with rich culture and growing markets.'}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": specificLocation || business.address.addressLocality,
      "addressRegion": business.address.addressRegion,
      "addressCountry": business.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.geo.latitude,
      "longitude": business.geo.longitude
    },
    "containedInPlace": {
      "@type": "Country",
      "name": location === 'barcelona' ? 'Spain' : 'Mexico'
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, placeSchema]
  };

  // Generate location-specific meta tags
  const locationName = specificLocation || business.address.addressLocality;
  const countryName = location === 'barcelona' ? 'Spain' : 'Mexico';
  
  return (
    <Helmet>
      {/* Local SEO meta tags */}
      <meta name="geo.region" content={business.address.addressCountry} />
      <meta name="geo.placename" content={locationName} />
      <meta name="geo.position" content={`${business.geo.latitude};${business.geo.longitude}`} />
      <meta name="ICBM" content={`${business.geo.latitude}, ${business.geo.longitude}`} />
      
      {/* Location-specific Open Graph tags */}
      <meta property="og:locality" content={locationName} />
      <meta property="og:region" content={business.address.addressRegion} />
      <meta property="og:country-name" content={countryName} />
      
      {/* Business information */}
      <meta name="contact:phone_number" content={business.telephone} />
      <meta name="contact:email" content={business.email} />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(combinedSchema)}
      </script>
    </Helmet>
  );
};

// Helper function to determine location from URL or search parameters
export const getLocationFromContext = (
  currentLanguage: string,
  searchParams?: { city?: string; country?: string }
): 'barcelona' | 'mexico' | 'berlin' | 'vienna' | 'paris' | 'london' | 'newyork' | null => {
  // Check search parameters first
  if (searchParams?.city && searchParams?.country) {
    const city = searchParams.city.toLowerCase();
    const country = searchParams.country.toLowerCase();
    
    if (city.includes('barcelona') || country.includes('spain')) {
      return 'barcelona';
    }
    if (city.includes('mexico') || country.includes('mexico')) {
      return 'mexico';
    }
    if (city.includes('berlin') || city.includes('hamburg') || city.includes('munich') || country.includes('germany')) {
      return 'berlin';
    }
    if (city.includes('vienna') || city.includes('salzburg') || country.includes('austria')) {
      return 'vienna';
    }
    if (city.includes('paris') || city.includes('lyon') || city.includes('marseille') || country.includes('france')) {
      return 'paris';
    }
    if (city.includes('london') || city.includes('manchester') || city.includes('birmingham') || country.includes('united kingdom') || country.includes('uk')) {
      return 'london';
    }
    if (city.includes('new york') || city.includes('los angeles') || city.includes('chicago') || country.includes('united states') || country.includes('usa')) {
      return 'newyork';
    }
  }
  
  // Check language locale
  if (currentLanguage === 'es-ES' || currentLanguage === 'ca-ES') {
    return 'barcelona';
  }
  if (currentLanguage === 'es-MX') {
    return 'mexico';
  }
  if (currentLanguage === 'de-DE') {
    return 'berlin';
  }
  if (currentLanguage === 'de-AT') {
    return 'vienna';
  }
  if (currentLanguage === 'fr-FR') {
    return 'paris';
  }
  if (currentLanguage === 'en-GB') {
    return 'london';
  }
  if (currentLanguage === 'en-US') {
    return 'newyork';
  }
  
  return null;
};

// Component to add local SEO based on context
export const AutoLocalSEO: React.FC<{
  currentLanguage: string;
  searchParams?: { city?: string; country?: string };
  specificLocation?: string;
}> = ({ currentLanguage, searchParams, specificLocation }) => {
  const location = getLocationFromContext(currentLanguage, searchParams);
  
  if (!location) return null;
  
  return (
    <LocalSEO 
      location={location}
      pageType={searchParams ? 'search' : 'city'}
      specificLocation={specificLocation}
    />
  );
};