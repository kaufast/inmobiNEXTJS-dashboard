import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PropertyList from "@/components/search/PropertyList";
import PropertyMap from "@/components/search/PropertyMap";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import { SEOHead } from "@/components/seo/SEOHead";
import { EnhancedSEO } from "@/components/seo/EnhancedSEO";
import { ConversationalFAQ } from "@/components/seo/ConversationalFAQ";
import { EnhancedSchema } from "@/components/seo/EnhancedSchema";
import { VoiceSearchOptimization } from "@/components/seo/VoiceSearchOptimization";
import { MachineReadableData } from "@/components/seo/MachineReadableData";
import { Breadcrumbs, generateBreadcrumbs } from "@/components/seo/Breadcrumbs";
import { AutoLocalSEO } from "@/components/seo/LocalSEO";
import { SearchResultsSEOEnhancer } from "@/components/seo/PropertySEOEnhancer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/use-language";
import { PropertyService } from "@/lib/property-service";
import { generateSearchSEO, getGeographicSEOData } from "@/lib/geographic-seo";
import { Property, PropertySearchParams } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { getDefaultCountryFromLocale } from "@/lib/locale-utils";

// Type alias to match the search filters component
// Multi-Country Search Strategy: Fixed type to match backend schema
type PropertySearchFilters = {
  query?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  listingType?: string;
  minAreaSqm?: number;  // Fixed: Use areaSqm instead of squareFeet
  maxAreaSqm?: number;  // Fixed: Use areaSqm instead of squareFeet
  features?: string[];
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  radius?: number;
};

interface PropertyCompactCardProps {
  property: Property;
}

interface SearchResponse {
  properties: Property[];
  total: number;
}

// Create a separate component for the compact card view
const PropertyCompactCard = ({ property }: PropertyCompactCardProps) => {
  const { t } = useTranslation('properties');
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="flex h-full">
        <div className="w-20 h-20 bg-neutral-200 relative shrink-0">
          {property.images && property.images.length > 0 && (
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>
          <p className="text-xs text-neutral-500 mb-1">
            {property.bedrooms} {t('propertyCard.bed', { ns: 'properties', defaultValue: 'bed'})} · {property.bathrooms} {t('propertyCard.bath', { ns: 'properties', defaultValue: 'bath' })}
          </p>
          <p className="font-semibold text-sm mt-auto">
            {PropertyService.formatPrice(property.price, property.listingType === 'rent')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Define the valid property types
const validPropertyTypes = ['apartment', 'villa', 'penthouse', 'townhouse', 'office', 'retail', 'land'] as const;
type ValidPropertyType = typeof validPropertyTypes[number];

export default function SearchResultsPage() {
  const { t } = useTranslation('search');

  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({ limit: 9, offset: 0 });
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [resultsView, setResultsView] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const limit = 9; // Items per page

  // Get current language from the global context (set by App.tsx routing)
  const { currentLanguage } = useLanguage();
  
  // Multi-Country Search Strategy Implementation:
  // 1. Default to Locale-Based Country Filtering
  // 2. Each locale shows properties from its specific country by default
  // 3. Postcode searches override locale filtering
  // 4. City searches within locale country unless postcode detected
  const getCountryForLocale = (locale: string): string => {
    console.log("🌍 Multi-Country Search: Getting default country for locale:", locale);
    
    // Use comprehensive locale utils for better country mapping
    const country = getDefaultCountryFromLocale(locale);
    
    console.log("🌍 Multi-Country Search: Default country mapped to:", country);
    return country || 'United Kingdom'; // fallback
  };
  
  const defaultCountry = getCountryForLocale(currentLanguage);
  console.log("🌍 Multi-Country Search: Using default country filter:", defaultCountry);
  
  // Parse query params on initial load and when URL changes  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const params: PropertySearchParams = {
      limit,
      offset: (page - 1) * limit,
    };

    // Extract query parameters from URL
    if (urlParams.has('query')) params.query = urlParams.get('query') || undefined;
    if (urlParams.has('city')) params.city = urlParams.get('city') || undefined;
    
    // Apply default country if no country specified in URL
    params.country = urlParams.get('country') || defaultCountry;
    
    if (urlParams.has('minPrice')) params.minPrice = Number(urlParams.get('minPrice'));
    if (urlParams.has('maxPrice')) params.maxPrice = Number(urlParams.get('maxPrice'));
    if (urlParams.has('bedrooms')) params.bedrooms = Number(urlParams.get('bedrooms'));
    if (urlParams.has('bathrooms')) params.bathrooms = Number(urlParams.get('bathrooms'));
    if (urlParams.has('propertyType')) {
      const propertyType = urlParams.get('propertyType');
      if (propertyType && validPropertyTypes.includes(propertyType as ValidPropertyType)) {
        params.propertyType = propertyType as ValidPropertyType;
      }
    }
    if (urlParams.has('listingType')) params.listingType = urlParams.get('listingType') as any;
    // Fixed: Use areaSqm instead of squareFeet to match backend schema
    if (urlParams.has('minAreaSqm')) params.minAreaSqm = Number(urlParams.get('minAreaSqm'));
    if (urlParams.has('maxAreaSqm')) params.maxAreaSqm = Number(urlParams.get('maxAreaSqm'));
    if (urlParams.has('features')) {
      const featuresString = urlParams.get('features');
      if (featuresString) {
        params.features = featuresString.split(',');
      }
    }
    if (urlParams.has('lat') && urlParams.has('lng')) {
      params.lat = Number(urlParams.get('lat'));
      params.lng = Number(urlParams.get('lng'));
      if (urlParams.has('radius')) {
        params.radius = Number(urlParams.get('radius'));
      }
    }

    setSearchParams(params);
  }, [location, page]);

  // Fetch properties based on search parameters
  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['/api/properties/search', searchParams],
    queryFn: async () => {
      // Build query string from search parameters
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, String(value));
          }
        }
      });
      
      const queryString = params.toString();
      const url = `/api/properties/search${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Multi-Country Search: Making API call to:', url);
      console.log('🔍 Multi-Country Search: Search params:', searchParams);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
    enabled: Object.keys(searchParams).length > 0,
  });

  const properties: Property[] = data?.properties || [];
  const total: number = data?.total || 0;

  // Generate SEO data for search results using geographic SEO
  const generateSEOData = () => {
    const searchQuery = searchParams.query || '';
    const city = searchParams.city || '';
    const country = searchParams.country || 'Global';
    const propertyType = searchParams.propertyType || '';
    const listingType = searchParams.listingType || '';

    // Use geographic SEO data if available
    const geoSEO = generateSearchSEO({
      city,
      country,
      propertyType,
      listingType
    }, currentLanguage);

    let title = geoSEO.title;
    let description = geoSEO.description;
    let keywords = geoSEO.keywords;

    // Add search query to title if present
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
      title = `${searchQuery} - ${title}`;
    }

    // Add total count to description if available
    if (total > 0) {
      description = description.replace(/Discover|Descubre|Entdecken|Découvrez/i, 
        `Discover ${total}`);
    }

    // Combine with additional keywords
    const additionalKeywords = [
      'real estate',
      'properties',
      searchQuery,
      city,
      country,
      propertyType,
      listingType === 'rent' ? 'rental' : 'sale',
      'search',
      'homes'
    ].filter(Boolean);
    
    keywords = [...(Array.isArray(keywords) ? keywords : []), ...additionalKeywords].filter(Boolean);

    // Create ItemList structured data
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": title,
      "description": description,
      "numberOfItems": total,
      "itemListElement": properties.slice(0, 10).map((property, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `https://inmobi.mobi/property/${property.id}`,
          "name": property.title,
          "description": property.description,
          "image": property.images?.[0] || "/images/family-home.webp",
          "url": `https://inmobi.mobi/property/${property.id}`,
          "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock", // Fixed: Property doesn't have status field
            "seller": {
              "@type": "Organization",
              "name": "Inmobi"
            }
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "bedrooms",
              "value": property.bedrooms
            },
            {
              "@type": "PropertyValue", 
              "name": "bathrooms",
              "value": property.bathrooms
            },
            {
              "@type": "PropertyValue",
              "name": "area",
              "value": property.areaSqm,
              "unitText": "square meters"
            }
          ]
        }
      }))
    };

    return { title, description, keywords, itemListSchema };
  };

  const seoData = generateSEOData();

  // Build query string from params - moved before canonicalUrl to avoid temporal dead zone
  const buildQueryString = (params: PropertySearchFilters): string => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'limit' && key !== 'offset') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            urlParams.set(key, value.join(','));
          }
        } else {
          urlParams.set(key, String(value));
        }
      }
    });
    
    return urlParams.toString();
  };

  // Generate canonical URL with current search parameters
  const canonicalUrl = (() => {
    const currentPath = location.split('?')[0];
    const queryString = buildQueryString(searchParams);
    return `${currentPath}${queryString ? `?${queryString}` : ''}`;
  })();

  // Generate alternate locales for current search
  const alternateLocales = [
    { locale: "en-US", url: canonicalUrl },
    { locale: "es-ES", url: canonicalUrl },
    { locale: "ca-ES", url: canonicalUrl },
    { locale: "es-MX", url: canonicalUrl },
    { locale: "en-GB", url: canonicalUrl },
    { locale: "fr-FR", url: canonicalUrl },
    { locale: "de-AT", url: canonicalUrl },
    { locale: "de-DE", url: canonicalUrl }
  ];

  // Update URL with filters - preserve existing locale prefix
  const updateUrlWithFilters = (filters: PropertySearchFilters) => {
    const updatedParams = { ...searchParams, ...filters, offset: 0 };
    
    // Multi-Country Search Strategy: Preserve default country for locale-based filtering
    // If no country is explicitly set in filters, use the default country for the locale
    if (!updatedParams.country) {
      updatedParams.country = defaultCountry;
    }
    
    // Build query string from the combined parameters
    const queryString = buildQueryString(updatedParams);

    // --- START OF FIX ---
    // Get the current path without any existing query string
    const currentPath = location.split('?')[0]; 
    
    // Rebuild the URL using the current path, which preserves the locale prefix
    setLocation(`${currentPath}${queryString ? `?${queryString}` : ''}`);
    // --- END OF FIX ---
    
    setPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({
      ...searchParams,
      offset: (newPage - 1) * limit,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced SEO for LLM optimization */}
      <EnhancedSEO
        page="search"
        location={searchParams.city || searchParams.country}
        propertyType={searchParams.propertyType}
        locale={currentLanguage}
      />
      
      {/* Enhanced Schema.org markup for search results */}
      <EnhancedSchema
        properties={properties}
        context="search"
        location={searchParams.city || searchParams.country}
        searchQuery={searchParams.query}
        totalResults={total}
      />
      
      {/* Voice search optimization for search page */}
      <VoiceSearchOptimization
        context="search"
        location={searchParams.city || searchParams.country}
        propertyType={searchParams.propertyType}
      />
      
      {/* Machine-readable search data for LLMs */}
      <MachineReadableData
        properties={properties}
        context="search"
      />
      
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={canonicalUrl}
        type="website"
        structuredData={seoData.itemListSchema}
        locale={currentLanguage}
        alternateLocales={alternateLocales}
      />
      <AutoLocalSEO 
        currentLanguage={currentLanguage} 
        searchParams={searchParams}
      />
      
      {/* Enhanced SEO for Search Results */}
      <SearchResultsSEOEnhancer 
        searchResults={properties || []}
        searchQuery={searchParams.query}
        location={searchParams.city}
        locale={currentLanguage}
      />
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={generateBreadcrumbs.searchResults({
            query: searchParams.query,
            city: searchParams.city,
            country: searchParams.country,
            propertyType: searchParams.propertyType,
            listingType: searchParams.listingType
          }, currentLanguage)} 
        />
        
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            className="w-full"
            initialQuery={searchParams.query || ""}
            onSearch={(query) => {
              const newParams = { ...searchParams, query };
              updateUrlWithFilters(newParams);
            }}
            showOptions={false}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/4">
            <SearchFilters
              initialFilters={searchParams}
              onFilterChange={updateUrlWithFilters}
              className="sticky top-4"
            />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Multi-Country Search Strategy: Context Indicator */}
            {!isLoading && searchParams.country && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <i className="fas fa-globe-europe"></i>
                  <span>
                    {t('search.countryContext.showing', { country: searchParams.country }) || 
                     `Showing properties in ${searchParams.country}`}
                  </span>
                  {searchParams.query && (
                    <span className="ml-2 text-blue-600">
                      {t('search.countryContext.forQuery', { query: searchParams.query }) || 
                       `for "${searchParams.query}"`}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">
                {isLoading ? (
                  <div className="animate-pulse bg-neutral-200 h-8 w-48 rounded"></div>
                ) : (
                  t('search.foundProperties', { count: total })
                )}
              </h1>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading search results
              </div>
            )}

            {/* Results Views */}
            {!isLoading && !error && (
              <Tabs defaultValue={resultsView} onValueChange={(value: 'list' | 'map') => setResultsView(value as 'list' | 'map')}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                                    {resultsView === 'list' && (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewType === 'grid' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewType('grid')}
                            className="w-10 h-10"
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('search.viewType.grid') || 'Grid View'}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewType === 'list' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewType('list')}
                            className="w-10 h-10"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('search.viewType.list') || 'List View'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
                  </div>
                  <TabsList>
                    <TabsTrigger value="list">{t('search.listView')}</TabsTrigger>
                    <TabsTrigger value="map">{t('search.mapView')}</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="list">
                  <PropertyList
                    properties={properties}
                    total={total}
                    loading={isLoading}
                    page={page}
                    limit={limit}
                    onPageChange={handlePageChange}
                    viewType={viewType}
                    onViewChange={setViewType}
                    searchParams={searchParams}
                  />
                </TabsContent>

                <TabsContent value="map">
                  <PropertyMap
                    properties={properties}
                    loading={isLoading}
                    height="700px"
                    className="rounded-xl shadow-sm"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
        
        {/* Conversational FAQ Section - LLM Optimized */}
        {!isLoading && properties.length > 0 && (
          <div className="mt-12">
            <ConversationalFAQ
              context="search"
              location={searchParams.city || searchParams.country}
              propertyType={searchParams.propertyType}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
