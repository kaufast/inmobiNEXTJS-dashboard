/**
 * Geographic SEO Keywords and Rich Descriptions
 * Provides city and country-specific optimization content for all supported locales
 */

export interface GeographicSEOData {
  title: string;
  description: string;
  keywords: string[];
  richDescription: string;
  localKeywords: string[];
  propertyTypes: string[];
  priceRange: string;
  currency: string;
  marketDescription: string;
}

export const GEOGRAPHIC_SEO_DATA: Record<string, Record<string, GeographicSEOData>> = {
  // Spanish Cities (es-ES, ca-ES)
  'barcelona': {
    'es-ES': {
      title: 'Propiedades en Barcelona - Pisos y Casas en Venta y Alquiler',
      description: 'Descubre las mejores propiedades en Barcelona. Pisos, casas y áticos en Eixample, Gràcia, Born y más. Búsqueda inteligente con IA.',
      keywords: ['barcelona', 'pisos barcelona', 'casas barcelona', 'alquiler barcelona', 'venta barcelona', 'eixample', 'gracia', 'born', 'sagrada familia', 'park guell'],
      richDescription: 'Barcelona ofrece una mezcla única de arquitectura histórica y vida moderna. Desde apartamentos en el icónico Eixample hasta casas tradicionales en Gràcia, la ciudad condal presenta oportunidades inmobiliarias excepcionales con proximidad a la playa, cultura vibrante y excelente conectividad.',
      localKeywords: ['metro barcelona', 'playa barceloneta', 'sagrada familia', 'park güell', 'las ramblas', 'barrio gótico', 'el born', 'eixample', 'gràcia', 'sant antoni'],
      propertyTypes: ['piso', 'ático', 'casa', 'estudio', 'dúplex', 'loft'],
      priceRange: '€150,000 - €2,000,000',
      currency: 'EUR',
      marketDescription: 'El mercado inmobiliario de Barcelona se caracteriza por su estabilidad y crecimiento constante, con alta demanda tanto de inversores locales como internacionales.'
    },
    'ca-ES': {
      title: 'Propietats a Barcelona - Pisos i Cases en Venda i Lloguer',
      description: 'Descobreix les millors propietats a Barcelona. Pisos, cases i àtics a l\'Eixample, Gràcia, Born i més. Cerca intel·ligent amb IA.',
      keywords: ['barcelona', 'pisos barcelona', 'cases barcelona', 'lloguer barcelona', 'venda barcelona', 'eixample', 'gràcia', 'born', 'sagrada família', 'park güell'],
      richDescription: 'Barcelona ofereix una barreja única d\'arquitectura històrica i vida moderna. Des d\'apartaments a l\'icònic Eixample fins a cases tradicionals a Gràcia, la ciutat comtal presenta oportunitats immobiliàries excepcionals amb proximitat a la platja, cultura vibrant i excel·lent connectivitat.',
      localKeywords: ['metro barcelona', 'platja barceloneta', 'sagrada família', 'park güell', 'les rambles', 'barri gòtic', 'el born', 'eixample', 'gràcia', 'sant antoni'],
      propertyTypes: ['pis', 'àtic', 'casa', 'estudi', 'dúplex', 'loft'],
      priceRange: '€150,000 - €2,000,000',
      currency: 'EUR',
      marketDescription: 'El mercat immobiliari de Barcelona es caracteritza per la seva estabilitat i creixement constant, amb alta demanda tant d\'inversors locals com internacionals.'
    },
    'en-GB': {
      title: 'Properties in Barcelona - Flats and Houses for Sale and Rent',
      description: 'Discover the best properties in Barcelona. Flats, houses and penthouses in Eixample, Gràcia, Born and more. AI-powered intelligent search.',
      keywords: ['barcelona', 'barcelona flats', 'barcelona houses', 'barcelona rental', 'barcelona sale', 'eixample', 'gracia', 'born', 'sagrada familia', 'park guell'],
      richDescription: 'Barcelona offers a unique blend of historic architecture and modern living. From flats in the iconic Eixample to traditional houses in Gràcia, the Catalan capital presents exceptional property opportunities with beach proximity, vibrant culture and excellent connectivity.',
      localKeywords: ['barcelona metro', 'barceloneta beach', 'sagrada familia', 'park güell', 'las ramblas', 'gothic quarter', 'el born', 'eixample', 'gràcia', 'sant antoni'],
      propertyTypes: ['flat', 'penthouse', 'house', 'studio', 'duplex', 'loft'],
      priceRange: '€150,000 - €2,000,000',
      currency: 'EUR',
      marketDescription: 'Barcelona\'s property market is characterised by stability and consistent growth, with high demand from both local and international investors.'
    }
  },
  'madrid': {
    'es-ES': {
      title: 'Propiedades en Madrid - Pisos y Casas en la Capital',
      description: 'Encuentra tu hogar ideal en Madrid. Propiedades en Malasaña, Chueca, Salamanca y más barrios exclusivos. Búsqueda avanzada con IA.',
      keywords: ['madrid', 'pisos madrid', 'casas madrid', 'malasaña', 'chueca', 'salamanca', 'retiro', 'chamberí'],
      richDescription: 'Madrid, capital de España, ofrece un mercado inmobiliario dinámico con opciones desde apartamentos modernos en Malasaña hasta elegantes propiedades en el barrio de Salamanca.',
      localKeywords: ['metro madrid', 'parque retiro', 'puerta del sol', 'gran vía', 'malasaña', 'chueca', 'salamanca', 'chamberí'],
      propertyTypes: ['piso', 'ático', 'casa', 'estudio', 'dúplex'],
      priceRange: '€200,000 - €3,000,000',
      currency: 'EUR',
      marketDescription: 'El mercado inmobiliario madrileño es uno de los más activos de España, con constante demanda y precios al alza en zonas premium.'
    }
  },
  // Mexican Cities (es-MX)
  'mexico-city': {
    'es-MX': {
      title: 'Propiedades en Ciudad de México - Casas y Departamentos',
      description: 'Descubre las mejores propiedades en CDMX. Casas, departamentos y condominios en Polanco, Roma Norte, Condesa y más. IA inmobiliaria.',
      keywords: ['ciudad de mexico', 'cdmx', 'polanco', 'roma norte', 'condesa', 'santa fe', 'coyoacan', 'departamentos cdmx'],
      richDescription: 'Ciudad de México ofrece un mercado inmobiliario vibrante con opciones desde departamentos modernos en Polanco hasta casas tradicionales en Coyoacán, combinando historia, cultura y oportunidades de inversión.',
      localKeywords: ['metro cdmx', 'polanco', 'roma norte', 'condesa', 'santa fe', 'coyoacán', 'del valle', 'doctores', 'centro histórico'],
      propertyTypes: ['departamento', 'casa', 'condominio', 'penthouse', 'estudio'],
      priceRange: '$2,000,000 - $50,000,000 MXN',
      currency: 'MXN',
      marketDescription: 'El mercado inmobiliario de la CDMX presenta gran dinamismo con alta demanda en zonas como Polanco, Roma Norte y Santa Fe.'
    },
    'en-US': {
      title: 'Properties in Mexico City - Houses and Apartments in CDMX',
      description: 'Discover the best properties in Mexico City. Houses, apartments and condos in Polanco, Roma Norte, Condesa and more. AI real estate search.',
      keywords: ['mexico city', 'cdmx', 'polanco', 'roma norte', 'condesa', 'santa fe', 'coyoacan', 'mexico city apartments'],
      richDescription: 'Mexico City offers a vibrant real estate market with options from modern apartments in Polanco to traditional houses in Coyoacán, combining history, culture and investment opportunities.',
      localKeywords: ['mexico city metro', 'polanco', 'roma norte', 'condesa', 'santa fe', 'coyoacán', 'del valle', 'centro historico'],
      propertyTypes: ['apartment', 'house', 'condo', 'penthouse', 'studio'],
      priceRange: '$100,000 - $2,500,000 USD',
      currency: 'USD',
      marketDescription: 'Mexico City\'s real estate market shows great dynamism with high demand in areas like Polanco, Roma Norte and Santa Fe.'
    }
  },
  // German Cities (de-DE, de-AT)
  'berlin': {
    'de-DE': {
      title: 'Immobilien in Berlin - Wohnungen und Häuser kaufen und mieten',
      description: 'Entdecken Sie die besten Immobilien in Berlin. Wohnungen, Häuser in Mitte, Prenzlauer Berg, Kreuzberg und mehr. KI-gestützte Suche.',
      keywords: ['berlin', 'wohnungen berlin', 'häuser berlin', 'mitte', 'prenzlauer berg', 'kreuzberg', 'charlottenburg', 'friedrichshain'],
      richDescription: 'Berlin bietet einen dynamischen Immobilienmarkt mit Optionen von modernen Wohnungen in Mitte bis zu Altbauwohnungen in Prenzlauer Berg. Die deutsche Hauptstadt kombiniert Geschichte, Kultur und Investitionsmöglichkeiten.',
      localKeywords: ['u-bahn berlin', 's-bahn', 'mitte', 'prenzlauer berg', 'kreuzberg', 'charlottenburg', 'friedrichshain', 'neukölln', 'schöneberg'],
      propertyTypes: ['wohnung', 'haus', 'penthouse', 'studio', 'maisonette'],
      priceRange: '€200,000 - €2,000,000',
      currency: 'EUR',
      marketDescription: 'Der Berliner Immobilienmarkt zeigt kontinuierliches Wachstum mit hoher Nachfrage sowohl von lokalen als auch internationalen Investoren.'
    },
    'en-GB': {
      title: 'Properties in Berlin - Flats and Houses for Sale and Rent',
      description: 'Discover the best properties in Berlin. Flats, houses in Mitte, Prenzlauer Berg, Kreuzberg and more. AI-powered property search.',
      keywords: ['berlin', 'berlin flats', 'berlin houses', 'mitte', 'prenzlauer berg', 'kreuzberg', 'charlottenburg', 'friedrichshain'],
      richDescription: 'Berlin offers a dynamic property market with options from modern flats in Mitte to period apartments in Prenzlauer Berg. The German capital combines history, culture and investment opportunities.',
      localKeywords: ['berlin u-bahn', 's-bahn', 'mitte', 'prenzlauer berg', 'kreuzberg', 'charlottenburg', 'friedrichshain', 'neukölln', 'schöneberg'],
      propertyTypes: ['flat', 'house', 'penthouse', 'studio', 'maisonette'],
      priceRange: '€200,000 - €2,000,000',
      currency: 'EUR',
      marketDescription: 'Berlin\'s property market shows continuous growth with high demand from both local and international investors.'
    }
  },
  'vienna': {
    'de-AT': {
      title: 'Immobilien in Wien - Wohnungen und Häuser in Österreich',
      description: 'Entdecken Sie die besten Immobilien in Wien. Wohnungen, Häuser in Innere Stadt, Leopoldstadt, Landstraße und mehr. KI-Immobiliensuche.',
      keywords: ['wien', 'wohnungen wien', 'häuser wien', 'innere stadt', 'leopoldstadt', 'landstraße', 'wieden', 'margareten'],
      richDescription: 'Wien bietet einen stabilen Immobilienmarkt mit eleganten Altbauwohnungen in der Inneren Stadt bis zu modernen Entwicklungen in Leopoldstadt. Die österreichische Hauptstadt verbindet imperiale Geschichte mit zeitgenössischem Wohnen.',
      localKeywords: ['u-bahn wien', 'straßenbahn', 'innere stadt', 'leopoldstadt', 'landstraße', 'wieden', 'margareten', 'mariahilf', 'neubau'],
      propertyTypes: ['wohnung', 'haus', 'penthouse', 'studio', 'maisonette'],
      priceRange: '€300,000 - €3,000,000',
      currency: 'EUR',
      marketDescription: 'Der Wiener Immobilienmarkt zeichnet sich durch Stabilität und Qualität aus, mit besonders hoher Nachfrage in zentralen Bezirken.'
    }
  },
  // French Cities (fr-FR)
  'paris': {
    'fr-FR': {
      title: 'Immobilier à Paris - Appartements et Maisons à Vendre et Louer',
      description: 'Découvrez les meilleures propriétés à Paris. Appartements, maisons dans le Marais, Saint-Germain, Montmartre et plus. Recherche IA immobilière.',
      keywords: ['paris', 'appartements paris', 'maisons paris', 'marais', 'saint-germain', 'montmartre', 'latin quarter', 'champs elysees'],
      richDescription: 'Paris offre un marché immobilier prestigieux avec des options allant d\'appartements haussmanniens dans le 7ème arrondissement aux lofts modernes dans le Marais. La capitale française combine élégance, culture et opportunités d\'investissement exceptionnelles.',
      localKeywords: ['métro paris', 'rer', 'marais', 'saint-germain', 'montmartre', 'latin quarter', 'champs-élysées', 'trocadéro', 'bastille'],
      propertyTypes: ['appartement', 'maison', 'penthouse', 'studio', 'duplex'],
      priceRange: '€400,000 - €5,000,000',
      currency: 'EUR',
      marketDescription: 'Le marché immobilier parisien est l\'un des plus prestigieux au monde, avec une demande constante et des prix reflétant la qualité de vie exceptionnelle.'
    },
    'en-GB': {
      title: 'Properties in Paris - Apartments and Houses for Sale and Rent',
      description: 'Discover the best properties in Paris. Apartments, houses in Marais, Saint-Germain, Montmartre and more. AI-powered property search.',
      keywords: ['paris', 'paris apartments', 'paris houses', 'marais', 'saint-germain', 'montmartre', 'latin quarter', 'champs elysees'],
      richDescription: 'Paris offers a prestigious property market with options from Haussmannian apartments in the 7th arrondissement to modern lofts in the Marais. The French capital combines elegance, culture and exceptional investment opportunities.',
      localKeywords: ['paris metro', 'rer', 'marais', 'saint-germain', 'montmartre', 'latin quarter', 'champs-élysées', 'trocadéro', 'bastille'],
      propertyTypes: ['apartment', 'house', 'penthouse', 'studio', 'duplex'],
      priceRange: '€400,000 - €5,000,000',
      currency: 'EUR',
      marketDescription: 'Paris property market is one of the most prestigious in the world, with constant demand and prices reflecting exceptional quality of life.'
    }
  },
  // UK Cities (en-GB)
  'london': {
    'en-GB': {
      title: 'Properties in London - Flats and Houses for Sale and Rent',
      description: 'Discover the best properties in London. Flats, houses in Kensington, Chelsea, Notting Hill and more. AI-powered property search.',
      keywords: ['london', 'london flats', 'london houses', 'kensington', 'chelsea', 'notting hill', 'mayfair', 'canary wharf'],
      richDescription: 'London offers one of the world\'s most dynamic property markets with options from period houses in Kensington to modern flats in Canary Wharf. The UK capital combines historic charm with contemporary living and excellent investment potential.',
      localKeywords: ['london underground', 'tube', 'kensington', 'chelsea', 'notting hill', 'mayfair', 'canary wharf', 'shoreditch', 'clapham'],
      propertyTypes: ['flat', 'house', 'penthouse', 'studio', 'maisonette'],
      priceRange: '£300,000 - £10,000,000',
      currency: 'GBP',
      marketDescription: 'London\'s property market is renowned for its resilience and international appeal, with consistent demand from both domestic and overseas buyers.'
    }
  },
  // US Cities (en-US)
  'new-york': {
    'en-US': {
      title: 'Properties in New York - Apartments and Houses for Sale and Rent',
      description: 'Discover the best properties in New York. Apartments, houses in Manhattan, Brooklyn, Queens and more. AI-powered real estate search.',
      keywords: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'upper east side', 'soho', 'tribeca'],
      richDescription: 'New York offers one of the world\'s most exciting real estate markets with options from luxury condos in Manhattan to brownstones in Brooklyn. The Big Apple combines urban energy with diverse neighborhoods and strong investment fundamentals.',
      localKeywords: ['nyc subway', 'manhattan', 'brooklyn', 'queens', 'upper east side', 'soho', 'tribeca', 'williamsburg', 'chelsea'],
      propertyTypes: ['apartment', 'condo', 'house', 'penthouse', 'studio'],
      priceRange: '$500,000 - $20,000,000',
      currency: 'USD',
      marketDescription: 'New York\'s real estate market is characterized by high demand, limited supply, and strong long-term appreciation potential.'
    }
  }
};

/**
 * Get geographic SEO data for a specific city and locale
 */
export function getGeographicSEOData(city: string, locale: string): GeographicSEOData | null {
  const cityKey = city.toLowerCase().replace(/\s+/g, '-');
  const cityData = GEOGRAPHIC_SEO_DATA[cityKey];
  
  if (!cityData) return null;
  
  // Try exact locale match first
  if (cityData[locale]) {
    return cityData[locale];
  }
  
  // Try language fallback (e.g., 'es' for 'es-MX')
  const languageCode = locale.split('-')[0];
  const fallbackLocale = Object.keys(cityData).find(key => key.startsWith(languageCode));
  
  if (fallbackLocale && cityData[fallbackLocale]) {
    return cityData[fallbackLocale];
  }
  
  // Default to English if available
  if (cityData['en-GB']) {
    return cityData['en-GB'];
  }
  
  if (cityData['en-US']) {
    return cityData['en-US'];
  }
  
  return null;
}

/**
 * Generate SEO-optimized search page title and description
 */
export function generateSearchSEO(searchParams: {
  city?: string;
  country?: string;
  propertyType?: string;
  listingType?: string;
}, locale: string): { title: string; description: string; keywords: string[] } {
  const geoData = searchParams.city ? getGeographicSEOData(searchParams.city, locale) : null;
  
  let title = '';
  let description = '';
  let keywords: string[] = [];
  
  if (geoData) {
    title = geoData.title;
    description = geoData.description;
    keywords = [...geoData.keywords, ...geoData.localKeywords];
    
    // Customize for specific search parameters
    if (searchParams.propertyType) {
      const propertyType = searchParams.propertyType.toLowerCase();
      if (geoData.propertyTypes.includes(propertyType)) {
        title = title.replace(/Properties|Propiedades|Immobilien|Propriétés/i, 
          propertyType.charAt(0).toUpperCase() + propertyType.slice(1) + 's');
      }
    }
    
    if (searchParams.listingType) {
      const listingType = searchParams.listingType.toLowerCase();
      if (listingType === 'rent' || listingType === 'alquiler' || listingType === 'mieten' || listingType === 'louer') {
        title = title.replace(/Sale|Venta|Verkauf|Vendre/i, 'Rent');
        description = description.replace(/sale|venta|verkauf|vendre/gi, 'rent');
      }
    }
  } else {
    // Generic fallback
    const cityName = searchParams.city || searchParams.country || 'Properties';
    title = `${cityName} Properties - Real Estate Search | Inmobi`;
    description = `Find the best properties in ${cityName}. Advanced search with AI-powered recommendations.`;
    keywords = ['real estate', 'properties', 'search', cityName.toLowerCase()];
  }
  
  return { title, description, keywords };
} 