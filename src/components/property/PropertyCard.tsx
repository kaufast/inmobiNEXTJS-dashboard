import React from 'react';
import { Link } from 'wouter';
import { Property } from '@shared/schema';
import { PropertyService } from '@/lib/property-service';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, Share2, ArrowRight, Building2, Map, BedDouble, Bath, AreaChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumPropertyBadge from './PremiumPropertyBadge';
import { VerificationBadgeWrapper } from '@/components/verification/VerificationBadgeWrapper';
import { PropertyCardImage } from '@/components/ui/OptimizedImage';
import { getFeatureArray, getImagesArray, normalizeProperty } from '@/lib/property-utils';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/use-language';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'horizontal' | 'simple';
  showActions?: boolean;
  className?: string;
}

export default function PropertyCard({ 
  property: rawProperty, 
  variant = 'default', 
  showActions = true, 
  className 
}: PropertyCardProps) {
  const { t } = useTranslation('properties');
  const { currentLanguage } = useLanguage();
  // Normalize property data to ensure consistent types
  const property = normalizeProperty(rawProperty);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = user ? isFavorite(property.id) : false;
  
  // Convert property data format - this is now handled by normalizeProperty
  // but we keep these variables for readability
  const propertyImages = property.images || [];
  const propertyFeatures = property.features || [];
  
  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !property) {
      // If not logged in, redirect to login page
      window.location.href = '/auth';
      return;
    }
    
    await toggleFavorite(property.id);
  };
  
  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!property) return;
    
    // Create a share URL
    const shareUrl = `${window.location.origin}/property/${property.id}`;
    
    // Use native sharing if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${t('propertyCard.shareMessage')}: ${property.title}`,
        url: shareUrl,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(t('propertyCard.linkCopied'));
      }).catch((err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };
  
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('propertyCard.invalidDate');
    }
  };
  
  // Get first image with fallback
  const mainImage = propertyImages.length > 0 
    ? propertyImages[0] 
    : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  

  
  // Handle image loading errors
  const handleImageError = (e: any) => {
    console.log('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  };
  
  // If we couldn't get any property data, show an error card
  if (!property || !property.id) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-3">
          <div className="text-center py-4">
            <h3 className="font-medium text-lg mb-2">{t('propertyCard.errorTitle')}</h3>
            <p className="text-sm text-neutral-500">{t('propertyCard.errorMessage')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render different card layouts based on variant
  if (variant === 'horizontal') {
    return (
      <Card className={cn("overflow-hidden group h-full", className)}>
        <div className="flex flex-col md:flex-row h-full">
          <div className="relative md:w-1/3 lg:w-1/4">
            <AspectRatio ratio={16/9} className="bg-muted md:h-full">
              <Link href={`/property/${property.id}`} className="absolute inset-0">
                <PropertyCardImage
                  src={mainImage}
                  propertyTitle={property.title}
                  propertyLocation={`${property.city}, ${property.country}`}
                  propertyType={property.propertyType}
                  className="object-cover w-full h-full"
                />
              </Link>
              
              {/* Tags */}
              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                {property.isPremium && (
                  <PremiumPropertyBadge size="sm" />
                )}
                <Badge variant="secondary" className="bg-white text-black text-xs">
                  {property.listingType === 'rent' ? t('propertyCard.forRent') : t('propertyCard.forSale')}
                </Badge>
              </div>
              
              {/* Action buttons */}
              {showActions && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="rounded-full w-7 h-7 bg-white hover:bg-white/90"
                    onClick={handleFavoriteClick}
                  >
                    <Heart 
                      className={cn("h-3.5 w-3.5", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} 
                    />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="rounded-full w-7 h-7 bg-white hover:bg-white/90"
                    onClick={handleShareClick}
                  >
                    <Share2 className="h-3.5 w-3.5 text-neutral-600" />
                  </Button>
                </div>
              )}
            </AspectRatio>
          </div>
          
          <div className="flex flex-col justify-between p-3 md:p-4 flex-1">
            <div>
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="inline-flex items-center">
                  <Building2 className="h-3.5 w-3.5 text-primary mr-1" />
                  <span className="capitalize text-xs">{PropertyService.getPropertyTypeName(property.propertyType)}</span>
                </span>
                
                {property.city && (
                  <span className="inline-flex items-center">
                    <span className="w-1 h-1 rounded-full bg-neutral-300 mx-1"></span>
                    <Map className="h-3.5 w-3.5 text-primary mr-1" />
                    <span className="text-xs truncate">{property.city}</span>
                  </span>
                )}
              </div>
              
              <Link href={`/property/${property.id}`}>
                <h3 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors duration-200 mb-1">
                  {property.title}
                </h3>
              </Link>
              
              <p className="text-xs text-neutral-500 line-clamp-1 mb-2">{property.description}</p>
              
              <div className="flex flex-wrap gap-3 mb-2">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs">{property.bedrooms}</span>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs">{property.bathrooms}</span>
                  </div>
                )}
                
                {property.areaSqm && (
                  <div className="flex items-center gap-1">
                    <AreaChart className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs">{PropertyService.formatArea(property.areaSqm, currentLanguage)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div>
                <p className="text-base font-semibold text-[#131313]">
                  {PropertyService.formatPrice(property.price, property.listingType === 'rent', currentLanguage)}
                </p>
                {property.listingType === 'rent' && (
                  <p className="text-xs text-neutral-500">{t('propertyCard.perMonth')}</p>
                )}
              </div>
              
              <Link href={`/property/${property.id}`}>
                <Button size="sm" className="rounded-xl bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all h-10 text-sm px-6 font-medium shadow-lg hover:shadow-xl">
                  {t('propertyCard.viewDetails')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (variant === 'simple') {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-muted">
            <Link href={`/property/${property.id}`}>
              <PropertyCardImage
                src={mainImage}
                propertyTitle={property.title}
                propertyLocation={`${property.city}, ${property.country}`}
                propertyType={property.propertyType}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </AspectRatio>
          
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {property.isPremium && (
              <PremiumPropertyBadge size="sm" />
            )}
            <Badge variant="secondary" className="bg-white text-black">
              {property.listingType === 'rent' ? t('propertyCard.forRent') : t('propertyCard.forSale')}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/property/${property.id}`}>
              <h3 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {property.title}
              </h3>
            </Link>
            {property.ownerId && (
              <VerificationBadgeWrapper userId={property.ownerId} userRole="agent" size="sm" />
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-[#131313]">
              {PropertyService.formatPrice(property.price, property.listingType === 'rent', currentLanguage)}
            </p>
            
            <div className="flex items-center text-xs text-neutral-500">
              <Clock className="mr-1 h-3 w-3" />
              {formatDate(property.createdAt?.toString() || new Date().toISOString())}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default card variant - more compact for new grid layout
  return (
    <Card className={cn("overflow-hidden group h-full flex flex-col", className)}>
      <div className="relative">
        <AspectRatio ratio={3/2} className="bg-muted">
          <Link href={`/property/${property.id}`}>
            <PropertyCardImage
              src={mainImage}
              propertyTitle={property.title}
              propertyLocation={`${property.city}, ${property.country}`}
              propertyType={property.propertyType}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          
          {/* Tags */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {property.isPremium && (
              <PremiumPropertyBadge size="sm" />
            )}
            <Badge variant="secondary" className="bg-white text-black text-xs">
              {property.listingType === 'rent' ? t('propertyCard.forRent') : t('propertyCard.forSale')}
            </Badge>
          </div>
          
          {/* Action buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-7 h-7 bg-white hover:bg-white/90"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={cn("h-3.5 w-3.5", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} 
                />
              </Button>
              
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-7 h-7 bg-white hover:bg-white/90"
                onClick={handleShareClick}
              >
                <Share2 className="h-3.5 w-3.5 text-neutral-600" />
              </Button>
            </div>
          )}
          
          {/* Price tag */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-lg font-semibold text-white">
              {PropertyService.formatPrice(property.price, property.listingType === 'rent', currentLanguage)}
              {property.listingType === 'rent' && <span className="text-xs font-normal">{t('propertyCard.perMonthShort')}</span>}
            </p>
          </div>
        </AspectRatio>
      </div>
      
      <CardContent className="p-3 flex-grow">
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="capitalize">{PropertyService.getPropertyTypeName(property.propertyType)}</span>
          
          {property.city && (
            <>
              <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
              <Map className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[100px]">{property.city}</span>
            </>
          )}
        </div>
        
        <Link href={`/property/${property.id}`}>
          <h3 className="font-medium text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex flex-wrap gap-3 justify-between">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs">{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs">{property.bathrooms}</span>
            </div>
          )}
          
                          {property.areaSqm && (
                  <div className="flex items-center gap-1">
                    <AreaChart className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs">{PropertyService.formatArea(property.areaSqm, currentLanguage)}</span>
                  </div>
                )}
        </div>
      </CardContent>
      
      <CardFooter className="px-3 pb-3 pt-0 mt-auto">
        <Link href={`/property/${property.id}`} className="w-full">
          <Button className="w-full rounded-xl text-sm h-10 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all font-medium shadow-lg hover:shadow-xl">
            {t('propertyCard.viewDetails')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}