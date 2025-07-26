import PropertyCard from "@/components/property/PropertyCard";
import { Pagination } from "@/components/ui/pagination";
import { Property } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { getDefaultCountryFromLocale } from "@/lib/locale-utils";

interface PropertyListProps {
  properties: Property[];
  total: number;
  loading?: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  viewType?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
  searchParams?: {
    query?: string;
    city?: string;
    country?: string;
    propertyType?: string;
    listingType?: string;
  };
}

export default function PropertyList({
  properties,
  total,
  loading = false,
  page,
  limit,
  onPageChange,
  viewType = 'grid',
  onViewChange,
  searchParams,
}: PropertyListProps) {
  const { t } = useTranslation('search');
  const { currentLanguage } = useLanguage();

  const totalPages = Math.ceil(total / limit);

  // Multi-Country Search Strategy: Fallback Messages
  // Show contextual "no results" messages based on search parameters and user locale
  if (!loading && properties?.length === 0) {
    const userCountry = getDefaultCountryFromLocale(currentLanguage);
    const searchCountry = searchParams?.country || userCountry;
    const searchQuery = searchParams?.query;
    const searchCity = searchParams?.city;
    
    console.log("🔍 Multi-Country Search: No results found", {
      userCountry,
      searchCountry,
      searchQuery,
      searchCity,
      locale: currentLanguage
    });

    let fallbackTitle = t('propertyList.noPropertiesFound');
    let fallbackMessage = t('propertyList.noPropertiesDescription');
    
    // Strategy 5: Search Fallbacks
    // Provide context-aware messages based on search type and user locale
    if (searchQuery && searchCity) {
      // City + query search within user's locale country
      fallbackTitle = t('search.noResults.cityAndQuery.title', { 
        query: searchQuery, 
        city: searchCity, 
        country: searchCountry 
      }) || `No "${searchQuery}" properties found in ${searchCity}`;
      fallbackMessage = t('search.noResults.cityAndQuery.message', { 
        country: searchCountry 
      }) || `No properties matching "${searchQuery}" were found in ${searchCity}, ${searchCountry}. Try broadening your search or check back soon!`;
    } else if (searchCity) {
      // City search within user's locale country
      fallbackTitle = t('search.noResults.city.title', { 
        city: searchCity, 
        country: searchCountry 
      }) || `No properties found in ${searchCity}`;
      fallbackMessage = t('search.noResults.city.message', { 
        city: searchCity, 
        country: searchCountry 
      }) || `No properties found in ${searchCity}, ${searchCountry}. Try broadening your search or check back soon!`;
    } else if (searchQuery) {
      // Generic keyword search within user's locale country
      fallbackTitle = t('search.noResults.query.title', { 
        query: searchQuery, 
        country: searchCountry 
      }) || `No "${searchQuery}" properties found`;
      fallbackMessage = t('search.noResults.query.message', { 
        query: searchQuery, 
        country: searchCountry 
      }) || `No properties matching "${searchQuery}" were found in ${searchCountry}. Try different keywords or check back soon!`;
    } else {
      // No search query, showing default country properties
      fallbackTitle = t('search.noResults.country.title', { 
        country: searchCountry 
      }) || `No properties found in ${searchCountry}`;
      fallbackMessage = t('search.noResults.country.message', { 
        country: searchCountry 
      }) || `No properties are currently available in ${searchCountry}. Please check back soon as we're always adding new listings!`;
    }

    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <i className="fas fa-search text-4xl text-neutral-300 mb-4"></i>
        <h3 className="font-heading text-xl font-bold mb-2">{fallbackTitle}</h3>
        <p className="text-neutral-600 mb-4">{fallbackMessage}</p>
        
        {/* Multi-Country Search Strategy: Country Context Indicator */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <i className="fas fa-globe-europe mr-2"></i>
            {t('search.noResults.countryContext', { country: searchCountry }) || 
             `Showing properties available in ${searchCountry}`}
          </p>
        </div>
      </div>
    );
  }

  // Enhanced skeleton loading animation
  if (loading) {
    return (
      <div className="space-y-4">
        {/* View Type Toggle */}
        <div className="flex justify-between items-center">
          <div className="text-neutral-600">
            <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-9 w-9 bg-neutral-200 animate-pulse rounded"></div>
            <div className="h-9 w-9 bg-neutral-200 animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Cards */}
        {viewType === 'grid' ? (
          // Grid view skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md animate-pulse h-72">
                <div className="rounded-lg bg-neutral-200 h-40 mb-3"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          // List view skeleton
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row md:h-48 w-full"
              >
                <div className="md:w-1/4 h-48 md:h-auto bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:400%_100%] animate-shimmer"></div>
                <div className="p-4 md:p-5 flex-1">
                  <div className="h-5 w-1/2 bg-neutral-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-1/3 bg-neutral-200 animate-pulse rounded mb-3"></div>
                  <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skeleton Pagination */}
        <div className="flex justify-center mt-6">
          <div className="h-9 w-40 bg-neutral-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex justify-between items-center">
        <div className="text-neutral-600">
          {t('search.propertyList.showing')} {(page - 1) * limit + 1}-{Math.min(page * limit, total)} {t('search.propertyList.of')} {total} {t('search.propertyList.properties')}
        </div>
      </div>

      {/* Property Cards */}
      {viewType === 'grid' ? (
        // Grid layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              variant="default"
              className="h-full"
            />
          ))}
        </div>
      ) : (
        // List layout
        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              variant="horizontal"
              className="w-full"
            />
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <Pagination.Content>
              <Pagination.Previous 
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
              />

              {/* Optimized pagination display logic */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                
                // Always show first, last, current page, and pages directly adjacent to current
                const isFirstPage = pageNumber === 1;
                const isLastPage = pageNumber === totalPages;
                const isCurrentPage = pageNumber === page;
                const isAdjacentPage = Math.abs(pageNumber - page) === 1;
                
                // Show page number if it meets our criteria
                if (isFirstPage || isLastPage || isCurrentPage || isAdjacentPage) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={isCurrentPage}
                      onClick={() => onPageChange(pageNumber)}
                      className={isCurrentPage ? 'bg-black text-white' : ''}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                }
                
                // Add ellipsis between non-consecutive pages
                if (pageNumber === page - 2 || pageNumber === page + 2) {
                  return <Pagination.Ellipsis key={`ellipsis-${pageNumber}`} />;
                }
                
                return null;
              })}

              <Pagination.Next 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}
