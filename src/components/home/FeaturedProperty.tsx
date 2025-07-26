import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import { useMediaQuery } from "@/hooks/use-mobile";
import { getFeatureArray, getImagesArray, normalizeProperty } from "@/lib/property-utils";
import { useTranslation } from "react-i18next";

interface FeaturedPropertyProps {
  property: Property;
}

export default function FeaturedProperty({ property: rawProperty }: FeaturedPropertyProps) {
  // Normalize property to ensure consistent data types
  const property = normalizeProperty(rawProperty);
  
  const { t, i18n } = useTranslation('common');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Force re-render when language changes
  useEffect(() => {
    console.log('FeaturedProperty - Language changed to:', i18n.language);
  }, [i18n.language]);
  
  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Use the current language for formatting
    const locale = i18n.language === 'es-ES' ? 'es-ES' : 
                   i18n.language === 'es-MX' ? 'es-MX' : 
                   i18n.language === 'fr-FR' ? 'fr-FR' : 
                   i18n.language === 'de-DE' ? 'de-DE' : 
                   i18n.language === 'de-AT' ? 'de-AT' : 
                   i18n.language === 'ca-ES' ? 'ca-ES' : 'en-US';
    
    // Use EUR for European locales, USD for others
    const currency = ['es-ES', 'fr-FR', 'de-DE', 'de-AT', 'ca-ES'].includes(i18n.language) ? 'EUR' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };
  
  // Use normalized property data which already has arrays
  const imagesArray = property.images || [];
  const featuresArray = property.features || [];
  
  // Extract main image and thumbnails
  const mainImage = imagesArray.length > 0 
    ? imagesArray[activeImageIndex] 
    : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  const thumbnails = imagesArray.slice(0, 4);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${t('propertyDetails.shareText')} ${property.title}`,
        url: window.location.origin + `/property/${property.id}`,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.origin + `/property/${property.id}`)
        .then(() => alert(t('propertyDetails.linkCopied')))
        .catch((error) => console.error('Could not copy text: ', error));
    }
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:space-x-8 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Property Image */}
        <div className="md:w-1/2">
          <div className="relative h-[400px]">
            <img 
              src={mainImage} 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
              }}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <Link href={`/search?lat=${property.latitude}&lng=${property.longitude}&radius=1`}>
              <Button variant="secondary" className="absolute bottom-4 left-4 bg-white bg-opacity-90 text-neutral-800 flex items-center px-3 py-2 rounded-lg text-sm font-medium">
                <i className="fas fa-map-marker-alt mr-2 text-primary"></i> {t('propertyDetails.viewOnMap')}
              </Button>
            </Link>
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white bg-opacity-90 text-primary hover:text-primary-dark"
                onClick={handleShare}
              >
                <i className="fas fa-share-alt"></i>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`bg-white bg-opacity-90 ${isFavorite(property.id) ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}
                onClick={() => toggleFavorite(property.id)}
              >
                <i className="fas fa-heart"></i>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="md:w-1/2 p-6">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('propertyDetails.minimalPrice')}</p>
                <h2 className="font-heading text-3xl font-bold">{formatPrice(property.price)}</h2>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 flex-wrap">
            <div className="flex items-center">
              <i className="fas fa-home text-primary mr-2"></i>
              <span>{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined text-primary mr-2"></i>
              <span>{property.squareFeet}m²</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-check-circle text-primary mr-2"></i>
              <span>{t('propertyDetails.ready')}</span>
            </div>
          </div>
          
          {property.installmentPlan && (
            <div className="border-t border-neutral-200 pt-4 mb-4">
              <p className="text-sm text-neutral-500">
                {t('propertyDetails.installmentPlan', { years: property.installmentPlan.years })}
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase text-neutral-500 mb-3">{t('propertyDetails.features')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {featuresArray.slice(0, 4).map((feature, index) => {
                let icon = 'fa-check';
                
                // Map common features to icons
                if (feature.toLowerCase().includes('pool')) icon = 'fa-swimming-pool';
                if (feature.toLowerCase().includes('sea') || feature.toLowerCase().includes('ocean')) icon = 'fa-water';
                if (feature.toLowerCase().includes('balcony')) icon = 'fa-sun';
                if (feature.toLowerCase().includes('air')) icon = 'fa-snowflake';
                if (feature.toLowerCase().includes('garage') || feature.toLowerCase().includes('parking')) icon = 'fa-car';
                if (feature.toLowerCase().includes('gym')) icon = 'fa-dumbbell';
                if (feature.toLowerCase().includes('security')) icon = 'fa-shield-alt';
                if (feature.toLowerCase().includes('garden')) icon = 'fa-leaf';
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="bg-neutral-100 p-2 rounded-full mr-3">
                      <i className={`fas ${icon} text-primary`}></i>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase text-neutral-500 mb-3">{t('propertyDetails.lifestyle')}</h3>
            <div className="inline-flex items-center bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm">
              <i className="fas fa-leaf mr-2"></i>
              <span>{t('propertyDetails.greenArea')}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {thumbnails.map((image, index) => (
              <div 
                key={index}
                className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer ${index === activeImageIndex ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={image} 
                  alt={`Property thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
