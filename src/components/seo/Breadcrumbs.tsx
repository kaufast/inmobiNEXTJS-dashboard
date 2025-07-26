import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const { currentLanguage } = useLanguage();

  // Generate schema.org structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && {
        "item": {
          "@type": "WebPage",
          "@id": `https://inmobi.mobi${item.href}`
        }
      })
    }))
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Visual breadcrumbs */}
      <nav 
        className={`flex items-center space-x-2 text-sm text-neutral-600 mb-4 ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {items.map((item, index) => (
            <li 
              key={index}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={(index + 1).toString()} />
              
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-neutral-400 mx-2" />
              )}
              
              {item.href && !item.isCurrentPage ? (
                <Link href={item.href}>
                  <a 
                    className="hover:text-primary transition-colors duration-200 flex items-center"
                    itemProp="item"
                  >
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    <span itemProp="name">{item.label}</span>
                  </a>
                </Link>
              ) : (
                <span 
                  className={`flex items-center ${item.isCurrentPage ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}
                  itemProp="name"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

// Helper function to generate common breadcrumb patterns
export const generateBreadcrumbs = {
  home: (locale: string = 'en-GB'): BreadcrumbItem => ({
    label: 'Home',
    href: `/${locale}`
  }),
  
  search: (locale: string = 'en-GB'): BreadcrumbItem => ({
    label: 'Search Properties',
    href: `/${locale}/search`
  }),
  
  property: (propertyTitle: string, propertyId: number, locale: string = 'en-GB'): BreadcrumbItem => ({
    label: propertyTitle,
    href: `/${locale}/property/${propertyId}`,
    isCurrentPage: true
  }),
  
  favorites: (locale: string = 'en-GB'): BreadcrumbItem => ({
    label: 'Favorites',
    href: `/${locale}/favorites`
  }),
  
  dashboard: (locale: string = 'en-GB'): BreadcrumbItem => ({
    label: 'Dashboard',
    href: `/${locale}/dashboard`
  }),
  
  // For property details page
  propertyDetails: (propertyTitle: string, propertyId: number, city?: string, country?: string, locale: string = 'en-GB'): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      generateBreadcrumbs.home(locale),
      generateBreadcrumbs.search(locale)
    ];
    
    if (city && country) {
      breadcrumbs.push({
        label: `${city}, ${country}`,
        href: `/${locale}/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      });
    }
    
    breadcrumbs.push({
      label: propertyTitle,
      isCurrentPage: true
    });
    
    return breadcrumbs;
  },
  
  // For search results
  searchResults: (searchParams: { query?: string; city?: string; country?: string; propertyType?: string; listingType?: string }, locale: string = 'en-GB'): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      generateBreadcrumbs.home(locale),
      generateBreadcrumbs.search(locale)
    ];
    
    if (searchParams.country) {
      breadcrumbs.push({
        label: searchParams.country,
        href: `/${locale}/search?country=${encodeURIComponent(searchParams.country)}`
      });
    }
    
    if (searchParams.city) {
      breadcrumbs.push({
        label: searchParams.city,
        href: `/${locale}/search?city=${encodeURIComponent(searchParams.city)}&country=${encodeURIComponent(searchParams.country || '')}`
      });
    }
    
    if (searchParams.propertyType) {
      breadcrumbs.push({
        label: searchParams.propertyType.charAt(0).toUpperCase() + searchParams.propertyType.slice(1),
        isCurrentPage: true
      });
    }
    
    return breadcrumbs;
  }
};