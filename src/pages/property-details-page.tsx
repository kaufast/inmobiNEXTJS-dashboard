import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PropertyTourScheduling from "@/components/property/PropertyTourScheduling";
import { AgentContactCard } from "@/components/property/PropertyContactButton";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs, generateBreadcrumbs } from "@/components/seo/Breadcrumbs";
import { EnhancedSEO } from "@/components/seo/EnhancedSEO";
import { ConversationalFAQ } from "@/components/seo/ConversationalFAQ";
import { EnhancedSchema } from "@/components/seo/EnhancedSchema";
import { VoiceSearchOptimization } from "@/components/seo/VoiceSearchOptimization";
import { MachineReadableData } from "@/components/seo/MachineReadableData";
// import { AutoLocalSEO } from "@/components/seo/LocalSEO";
// import { PropertySEOEnhancer } from "@/components/seo/PropertySEOEnhancer";
// import { ImageSEO, CriticalImagePreloader } from "@/components/seo/ImageSEO";
import { PropertyImageGallery } from "@/components/ui/OptimizedImage";
// import { PropertyFAQSchema, PropertyFAQDisplay } from "@/components/seo/PropertyFAQSchema";
// import { VirtualTourSchema, VirtualTourDisplay, useVirtualTours } from "@/components/seo/VirtualTourSchema";
// import { AgentReviewSchema, AgentReviewDisplay, useAgentReviews } from "@/components/seo/AgentReviewSchema";
// import { PropertyViewTracking } from "@/components/analytics/PropertyViewTracking";
// import { GoogleAnalytics4 } from "@/components/analytics/GoogleAnalytics4";
// import { SearchConsoleIntegration } from "@/components/analytics/SearchConsoleIntegration";
// import { SEOPerformanceMonitor } from "@/components/analytics/SEOPerformanceMonitor";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFavorites } from "@/hooks/use-favorites";
import { useLanguage } from "@/hooks/use-language";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRoute } from "wouter";
import { PropertyContactButton } from "@/components/property/PropertyContactButton";
import { Users, BedDouble, Bath, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyDetailsPage() {
  const [_, params] = useRoute<{ id: string }>("/property/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { t } = useTranslation(['properties', 'common', 'dashboard', 'tours']);
  const { currentLanguage } = useLanguage();
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: id > 0,
  });
  
  // New hooks for enhanced features - temporarily disabled for white screen debugging
  // const { tours: virtualTours, loading: toursLoading } = useVirtualTours(property || {} as Property);
  // const { reviews: agentReviews, loading: reviewsLoading } = useAgentReviews('1'); // Default agent ID

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Generate SEO data for property details
  const generatePropertySEO = () => {
    if (!property) return null;

    const title = `${property.title} | ${property.city}, ${property.country} | Inmobi`;
    const description = `${property.description?.slice(0, 150)}... ${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} for ${property.listingType} in ${property.city}. ${formatPrice(property.price)}`;
    const keywords = [
      property.propertyType,
      property.city,
      property.country,
      property.listingType,
      'real estate',
      'property',
      `${property.bedrooms} bedroom`,
      `${property.bathrooms} bathroom`,
      'Inmobi'
    ].join(', ');

    // Product structured data schema
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://inmobi.mobi/property/${property.id}`,
      "name": property.title,
      "description": property.description,
      "image": property.images?.map(img => typeof img === 'string' ? img : img?.url || img?.src || img) || ["/images/family-home.webp"],
      "url": `https://inmobi.mobi/property/${property.id}`,
      "sku": `PROP-${property.id}`,
      "category": "Real Estate",
      "brand": {
        "@type": "Organization",
        "name": "Inmobi"
      },
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "EUR",
        "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Inmobi",
          "url": "https://inmobi.mobi"
        },
        "validFrom": new Date().toISOString(),
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": property.price,
          "priceCurrency": "EUR",
          "valueAddedTaxIncluded": false
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
          "value": property.squareFeet,
          "unitText": "square feet"
        },
        {
          "@type": "PropertyValue",
          "name": "propertyType",
          "value": property.propertyType
        },
        {
          "@type": "PropertyValue",
          "name": "listingType",
          "value": property.listingType
        }
      ]
    };

    // Place structured data schema
    const placeSchema = {
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": `https://inmobi.mobi/property/${property.id}#place`,
      "name": property.title,
      "description": property.description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address,
        "addressLocality": property.city,
        "addressRegion": property.state,
        "addressCountry": property.country
      },
      ...(property.latitude && property.longitude && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": property.latitude,
          "longitude": property.longitude
        }
      }),
      "amenityFeature": property.features?.map(feature => ({
        "@type": "LocationFeatureSpecification",
        "name": feature,
        "value": true
      })) || []
    };

    // Real Estate Listing structured data
    const realEstateSchema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "@id": `https://inmobi.mobi/property/${property.id}#listing`,
      "name": property.title,
      "description": property.description,
      "url": `https://inmobi.mobi/property/${property.id}`,
      "datePosted": property.createdAt || new Date().toISOString(),
      "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      "provider": {
        "@type": "Organization",
        "name": "Inmobi",
        "url": "https://inmobi.mobi"
      },
      "realEstateAgent": {
        "@type": "Person",
        "name": "Areeya al Shams",
        "email": "areeya@inmobi.mobi",
        "jobTitle": "Real Estate Agent",
        "worksFor": {
          "@type": "Organization",
          "name": "Inmobi"
        }
      }
    };

    // Combined structured data
    const combinedSchema = {
      "@context": "https://schema.org",
      "@graph": [productSchema, placeSchema, realEstateSchema]
    };

    return { title, description, keywords, combinedSchema };
  };

  const seoData = generatePropertySEO();

  // Generate alternate locales
  const alternateLocales = [
    { locale: "en-US", url: `/property/${id}` },
    { locale: "es-ES", url: `/property/${id}` },
    { locale: "ca-ES", url: `/property/${id}` },
    { locale: "es-MX", url: `/property/${id}` }
  ];

  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    // We'll initialize the map only when the map tab is active
    // The map container may not exist initially in our new layout
    const mapContainer = document.getElementById('property-map');
    if (property?.latitude && property.longitude && mapContainer) {
      try {
        // Initialize map
        const map = L.map('property-map', {
          center: [property.latitude, property.longitude],
          zoom: 15,
        });
        
        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        
        // Add marker
        const marker = L.marker([property.latitude, property.longitude]).addTo(map);
        marker.bindPopup(`<b>${property.title}</b><br>${property.address}`).openPopup();
        
        return () => {
          map.remove();
        };
      } catch (error) {
        console.log("Map initialization error:", error);
      }
    }
  }, [property]);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || "Property",
        text: `${t('common:propertyDetails.shareText')} ${property?.title}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(t('common:propertyDetails.linkCopied')))
        .catch((error) => console.error('Could not copy text: ', error));
    }
  };
  
  const handleNextImage = () => {
    if (!property) return;
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % property.images.length);
  };
  
  const handlePrevImage = () => {
    if (!property) return;
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length);
  };
  
  // This method is replaced by PropertyTourScheduling component
  const handleRequestTour = () => {
    // We'll keep this for now as a fallback for backward compatibility
    // with existing button handlers until we fully replace them
    console.log('Tour scheduling functionality moved to PropertyTourScheduling component');
  };
  


  // Convert feature keys to readable text
  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">{t('common:propertyDetails.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <h1 className="font-heading text-2xl font-bold mb-4">{t('propertyDetails.notFound.title', 'Property Not Found')}</h1>
            <p className="text-neutral-600 mb-6">{t('propertyDetails.notFound.message', "The property you're looking for doesn't exist or there was an error loading it.")}</p>
            <Link href="/search">
              <Button className="bg-primary text-white">{t('common:actions.browse', 'Browse Properties')}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Enhanced SEO for LLM optimization */}
        <EnhancedSEO
          property={property}
          page="property"
          locale={currentLanguage}
        />
        
        {/* Enhanced Schema.org markup for AI understanding */}
        <EnhancedSchema
          property={property}
          context="property"
        />
        
        {/* Voice search optimization */}
        <VoiceSearchOptimization
          property={property}
          context="property"
        />
        
        {/* Machine-readable property data for LLMs */}
        <MachineReadableData
          property={property}
          context="property"
        />
        
        {seoData && (
          <SEOHead
            title={seoData.title}
            description={seoData.description}
            keywords={seoData.keywords}
            canonical={`/property/${id}`}
            type="product"
            image={property?.images?.[0] ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url || property.images[0]?.src || property.images[0]) : "/images/family-home.webp"}
            structuredData={seoData.combinedSchema}
            locale={currentLanguage}
            alternateLocales={alternateLocales}
          />
        )}
        {/* Enhanced SEO Schemas - temporarily disabled for debugging */}
        {/* <PropertyFAQSchema 
          property={property}
          locale={currentLanguage}
        />
        
        <VirtualTourSchema 
          property={property}
          virtualTours={virtualTours}
          locale={currentLanguage}
        />
        
        <AgentReviewSchema 
          agent={{
            id: '1',
            name: 'Areeya al Shams',
            title: 'Senior Real Estate Agent',
            company: 'Inmobi Real Estate',
            email: 'areeya@inmobi.mobi'
          }}
          reviews={agentReviews}
          property={property}
          locale={currentLanguage}
        /> */}
        
        <Navbar />
      
        <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={generateBreadcrumbs.propertyDetails(
            property.title, 
            property.id, 
            property.city, 
            property.country, 
            currentLanguage
          )} 
        />
        
        {/* Main layout with left content + right image - Enhanced with semantic HTML */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left side - Property details with semantic structure */}
          <article className="w-full lg:w-1/2" itemScope itemType="https://schema.org/RealEstateListing">
            {/* Hidden structured data for LLMs */}
            <div className="sr-only">
              <h1 itemProp="name">Property Details: {property.title}</h1>
              <div itemProp="description">{property.description}</div>
              <span itemProp="price">{property.price}</span>
              <span itemProp="priceCurrency">EUR</span>
              <span itemProp="availabilityStarts">{new Date().toISOString()}</span>
            </div>
            {/* Property Title */}
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-neutral-600 mb-6">
              {[property.address, property.city, property.state, property.country].filter(Boolean).join(', ')}
            </p>
            
            {/* Price section */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold">
                ${property.price.toLocaleString()}
                {property.listingType === 'rent' && <span className="text-lg font-normal text-neutral-600"> /night</span>}
              </h2>
            </div>
            
            {/* Property Tour Scheduling */}
            <div className="mb-8">
              <PropertyTourScheduling 
                propertyId={property.id}
              />
            </div>
            
            {/* Property features - icons*/}
            <div className="flex justify-between mb-12 border-b border-gray-200 pb-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help group">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white border border-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-300 shadow-sm">
                      <Users className="w-8 h-8 text-gray-800" />
                    </div>
                    <p className="text-neutral-700 font-medium">{t('common:propertyDetails.guests', { count: property.bedrooms || 2 })}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common:propertyDetails.tooltips.maxGuests')}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help group">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white border border-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-300 shadow-sm">
                      <BedDouble className="w-8 h-8 text-gray-800" />
                    </div>
                    <p className="text-neutral-700 font-medium">{t('common:propertyDetails.bedrooms', { count: property.bedrooms || 2 })}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common:propertyDetails.tooltips.bedrooms')}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help group">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white border border-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-300 shadow-sm">
                      <Bath className="w-8 h-8 text-gray-800" />
                    </div>
                    <p className="text-neutral-700 font-medium">{t('common:propertyDetails.bathrooms', { count: property.bathrooms || 2 })}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common:propertyDetails.tooltips.bathrooms')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Property description */}
            <div className="mb-8">
              <p className="text-neutral-700 whitespace-pre-line">
                {property.description}
              </p>
              <Button 
                variant="link" 
                className="text-neutral-700 p-0 mt-2 underline font-medium"
                onClick={() => alert('More description would show here')}
              >
                {t('propertyDetails.readMore')}
              </Button>
            </div>
            
            {/* Property amenities */}
            <div className="mb-8">
              <h3 className="font-heading text-xl font-bold mb-4">{t('propertyDetails.amenities', 'Amenities')}</h3>
              <div className="grid grid-cols-2 gap-y-4">
                {property.features && property.features.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <i className="fas fa-arrow-right text-neutral-700 mt-1 mr-2"></i>
                    <span className="text-neutral-700">{formatFeatureName(feature)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ratings section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="text-2xl font-bold flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center cursor-help">
                        <i className="fas fa-star mr-2"></i>
                        4.82 <span className="text-neutral-600 text-lg font-normal ml-2">· 55 reviews</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('common:propertyDetails.tooltips.rating')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Review preview */}
              <div className="flex gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-neutral-600 font-medium">K</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold">{t('common:propertyDetails.reviews.sampleReviewer')}</p>
                  <p className="text-neutral-600 text-sm">{t('common:propertyDetails.reviews.sampleDate')}</p>
                  <p className="mt-2">{t('common:propertyDetails.reviews.sampleReview')}</p>
                </div>
              </div>
            </div>
          </article>
          
          {/* Right side - Optimized Images */}
          <div className="w-full lg:w-1/2">
            <PropertyImageGallery
              images={property.images}
              propertyTitle={property.title}
              propertyLocation={`${property.city}, ${property.country}`}
              propertyType={property.propertyType}
              className="h-[500px]"
              priority={true}
            />
          </div>
        </div>

        {/* Property Details section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">{t('propertyDetails.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.propertyId')}</span>
              <span className="font-medium">{property.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.propertyType')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium capitalize cursor-help">{property.propertyType}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common:propertyDetails.tooltips.propertyType')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.bedrooms')}</span>
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.bathrooms')}</span>
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.size')}</span>
              <span className="font-medium">{property.squareFeet} {t('common:propertyDetails.propertyInfo.sqft')}</span>
            </div>
            {property.lotSize && (
              <div className="flex flex-col">
                <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.lotSize')}</span>
                <span className="font-medium">{property.lotSize} {t('common:propertyDetails.propertyInfo.sqft')}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.status')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium capitalize cursor-help">
                    {property.listingType === 'rent' ? t('common:propertyDetails.propertyInfo.forRent') : t('common:propertyDetails.propertyInfo.forSale')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common:propertyDetails.tooltips.listingType', { type: property.listingType === 'rent' ? t('common:propertyDetails.tooltips.listingTypeRent') : t('common:propertyDetails.tooltips.listingTypeSale') })}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">{t('common:propertyDetails.propertyInfo.verification')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`font-medium cursor-help ${property.isVerified ? 'text-green-500' : 'text-amber-500'}`}>
                    {property.isVerified ? t('common:propertyDetails.propertyInfo.verified') : t('common:propertyDetails.propertyInfo.pending')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {property.isVerified 
                      ? t('common:propertyDetails.tooltips.verification') 
                      : t('common:propertyDetails.tooltips.verificationPending')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        
        
        {/* Optimized Gallery Section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">{t('propertyDetails.gallery')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <div key={index} className="rounded-xl overflow-hidden">
                <PropertyImageGallery
                  images={[image]}
                  propertyTitle={property.title}
                  propertyLocation={`${property.city}, ${property.country}`}
                  propertyType={property.propertyType}
                  className="w-full h-64 transition-transform hover:scale-105 cursor-pointer"
                  priority={index < 6}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Test Contact Button */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">{t('propertyDetails.quickContact')}</h3>
          <PropertyContactButton
            property={property}
            agent={{
              id: 1,
              fullName: "Areeya al Shams",
              username: "areeya@inmobi.mobi",
              role: "agent"
            }}
            variant="default"
            size="default"
            showPhone={false}
            fullWidth={false}
          />
        </div>

        {/* Temporarily disabled for white screen debugging */}
        {/* Virtual Tours Section */}
        {/* {!toursLoading && virtualTours.length > 0 && (
          <VirtualTourDisplay 
            property={property}
            virtualTours={virtualTours}
            locale={currentLanguage}
          />
        )} */}
        
        {/* Property FAQ Section */}
        {/* <PropertyFAQDisplay 
          property={property}
          locale={currentLanguage}
        /> */}
        
        {/* Agent Reviews Section */}
        {/* {!reviewsLoading && agentReviews.length > 0 && (
          <AgentReviewDisplay 
            agent={{
              id: '1',
              name: 'Areeya al Shams',
              title: 'Senior Real Estate Agent',
              company: 'Inmobi Real Estate',
              email: 'areeya@inmobi.mobi'
            }}
            reviews={agentReviews}
            property={property}
            locale={currentLanguage}
          />
        )} */}
        
        {/* SEO Performance Monitoring (Development Only) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <SEOPerformanceMonitor 
            property={property}
            enableRealTimeMonitoring={true}
          />
        )} */}

        {/* Conversational FAQ Section - LLM Optimized */}
        <ConversationalFAQ
          property={property}
          context="property"
          className="mb-6"
        />

        {/* Agent Information */}
        <AgentContactCard 
          property={{
            ...property,
            isPhoneNumberPublic: true,
            phoneNumber: "679680000",
            phoneCountryCode: "+44"
          }}
          agent={{
            id: 1,
            fullName: "Areeya al Shams",
            username: "areeya@inmobi.mobi",
            role: "agent",
            avatar: null
          }}
          className="mb-6"
        />
        </div>
      
        <Footer />
      </div>
    </TooltipProvider>
  );
}
