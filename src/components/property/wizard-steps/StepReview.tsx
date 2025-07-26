import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Tag,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { QRCodeFlowInstructions } from "@/components/home/QRCodeFlowInstructions";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function StepReview() {
  const { propertyData, updatePropertyData, isStepValid, setCurrentStep } = usePropertyWizard();
  const { t } = useTranslation('properties');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Check for missing required fields
  useEffect(() => {
    const requiredFields: { field: keyof typeof propertyData; label: string }[] = [
      { field: "title", label: t('wizard.steps.review.requiredSections.title') },
      { field: "description", label: t('review.description2') },
      { field: "propertyType", label: t('wizard.steps.review.requiredSections.propertyType') },
      { field: "bedrooms", label: t('wizard.steps.details.bedroomsLabel') },
      { field: "bathrooms", label: t('wizard.steps.details.bathroomsLabel') },
      { field: "squareFeet", label: t('wizard.steps.details.sizeLabel') },
    ];
    
    const missing = requiredFields.filter(
      ({ field }) => !propertyData[field]
    ).map(({ label }) => label);
    
    if (!propertyData.images || propertyData.images.length === 0) {
      missing.push(t('wizard.steps.review.requiredSections.images'));
    }
    
    setMissingFields(missing);
  }, [propertyData, t]);

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return t('wizard.steps.review.notSpecified');
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper to get property type label
  const getPropertyTypeLabel = (type: string) => {
    if (!type) return t('wizard.steps.review.notSpecified');
    return t(`property.wizard.steps.pricing.propertyTypes.${type}`) || type;
  };

  // Helper to get listing type label
  const getListingTypeLabel = (type: string) => {
    if (!type) return t('wizard.steps.review.notSpecified');
    
    const types: Record<string, string> = {
      buy: t('wizard.steps.pricing.forSale'),
      rent: t('wizard.steps.pricing.forRent'),
      sell: t('wizard.steps.pricing.lookingToSell'),
    };
    
    return types[type] || type;
  };

  return (
    <QuestionCard
      title={t('wizard.steps.review.title')}
      description={t('review.description')}
      icon={<ClipboardCheck className="h-5 w-5" />}
      className="property-review"
    >
      <div className="space-y-6">
        {missingFields.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('wizard.steps.review.missingInfo')}: {missingFields.join(", ")}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Status selector */}
        <div className="space-y-2">
          <Label htmlFor="status">{t('wizard.steps.review.listingStatus')}</Label>
          <Select
            value={propertyData.status}
            onValueChange={(value) => updatePropertyData({ status: value } as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('wizard.steps.review.selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t('wizard.steps.review.saveDraftButton')}</SelectItem>
              <SelectItem value="pending">{t('wizard.steps.review.submitForApproval')}</SelectItem>
              <SelectItem value="active">{t('wizard.steps.review.publishImmediately')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t('wizard.steps.review.statusDescription')}
          </p>
        </div>
        
        {/* Summary sections */}
        <div className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.basicInfo')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.basicInfoSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge className={isStepValid("basic-info") ? "bg-green-600" : "bg-yellow-500"}>
                  {isStepValid("basic-info") ? t('wizard.steps.review.complete') : t('wizard.steps.review.incomplete')}
                </Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('basic-info')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="font-medium">{propertyData.title || t('wizard.steps.review.noTitle')}</p>
                <p className="text-sm text-muted-foreground">
                  {propertyData.description || t('wizard.steps.review.noDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.location')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.locationSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge variant="outline">{t('propertyWizard.common.optional')}</Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('location')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {propertyData.address && (
                  <p className="text-sm">
                    <span className="font-medium">{t('wizard.steps.location.addressLabel')}:</span> {propertyData.address}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.location.cityLabel')}:</span> {propertyData.city || t('wizard.steps.review.notSpecified')}
                </p>
                {propertyData.state && (
                  <p className="text-sm">
                    <span className="font-medium">{t('wizard.steps.location.stateLabel')}:</span> {propertyData.state}
                  </p>
                )}
                {propertyData.zipCode && (
                  <p className="text-sm">
                    <span className="font-medium">{t('wizard.steps.location.zipCodeLabel')}:</span> {propertyData.zipCode}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.location.countryLabel')}:</span> {propertyData.country || t('wizard.steps.review.notSpecified')}
                </p>
                
                {propertyData.latitude && propertyData.longitude && (
                  <p className="text-sm">
                    <span className="font-medium">{t('wizard.steps.review.coordinates')}:</span> {propertyData.latitude.toFixed(6)}, {propertyData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Property Type & Pricing */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.propertyTypePricing')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.propertyTypePricingSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge className={propertyData.propertyType ? "bg-green-600" : "bg-yellow-500"}>
                  {propertyData.propertyType ? t('wizard.steps.review.complete') : t('wizard.steps.review.incomplete')}
                </Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('pricing')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.pricing.propertyTypeLabel')}:</span> {getPropertyTypeLabel(propertyData.propertyType || '')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.pricing.listingTypeLabel')}:</span> {getListingTypeLabel(propertyData.listingType || '')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.pricing.priceLabel')}:</span> {formatPrice(propertyData.price)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.details')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.detailsSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge className={isStepValid("details") ? "bg-green-600" : "bg-yellow-500"}>
                  {isStepValid("details") ? t('wizard.steps.review.complete') : t('wizard.steps.review.incomplete')}
                </Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('details')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.details.bedroomsLabel')}:</span> {propertyData.bedrooms || t('wizard.steps.review.notSpecified')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.details.bathroomsLabel')}:</span> {propertyData.bathrooms || t('wizard.steps.review.notSpecified')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('wizard.steps.details.sizeLabel')}:</span> {propertyData.squareFeet ? `${propertyData.squareFeet} sq ft` : t('wizard.steps.review.notSpecified')}
                </p>
                {propertyData.yearBuilt && (
                  <p className="text-sm">
                    <span className="font-medium">{t('wizard.steps.details.yearBuiltLabel')}:</span> {propertyData.yearBuilt}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.features')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.featuresSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge variant="outline">{t('propertyWizard.common.optional')}</Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('features')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                {propertyData.features && propertyData.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {propertyData.features.map((feature: string) => (
                      <Badge key={feature} variant="secondary">
                        {t(`property.wizard.steps.features.amenities.${feature}`) || feature}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('wizard.steps.review.noFeatures')}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Images */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{t('wizard.steps.review.images')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wizard.steps.review.imagesSubtitle')}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                <Badge className={propertyData.images && propertyData.images.length > 0 ? "bg-green-600" : "bg-yellow-500"}>
                  {propertyData.images && propertyData.images.length > 0 ? 
                    `${propertyData.images.length} ${propertyData.images.length === 1 ? t('wizard.steps.images.imageLabel') : t('wizard.steps.images.imagesLabel')}` : 
                    t('wizard.steps.review.noImages')}
                </Badge>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800" 
                    onClick={() => setCurrentStep('images')}
                  >
                    {t('wizard.steps.review.editSection')}
                  </button>
                </div>
              </div>
              
              {propertyData.images && propertyData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {propertyData.images.slice(0, 3).filter(image => image != null).map((image: any, index: number) => {
                    console.log('[StepReview] Processing image:', image, 'type:', typeof image);
                    
                    // Handle both string URLs and object formats
                    let imageUrl = '';
                    if (typeof image === 'string') {
                      imageUrl = image;
                    } else if (image && typeof image === 'object') {
                      imageUrl = image.cloudinaryUrl || image.cdnUrl || image.url || '';
                    }
                    
                    console.log('[StepReview] Resolved imageUrl:', imageUrl);
                    
                    if (!imageUrl) {
                      console.log('[StepReview] No valid imageUrl found, skipping');
                      return null;
                    }
                    
                    return (
                      <div key={index} className="relative h-20 rounded-md overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {t('wizard.steps.images.mainImageLabel')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* QR Code Benefits for Property Tours */}
        <div className="mt-6">
          <QRCodeFlowInstructions 
            variant="compact" 
            showPremium={true}
            className="mb-4"
          />
          <Alert>
            <AlertDescription>
              <strong>Secure Property Tours:</strong> Once your property is published, potential buyers will receive QR codes for verified visits. This protects you from fake viewings and provides legal proof of all property visits.
            </AlertDescription>
          </Alert>
        </div>
        
        {/* List of requirements */}
        <div className="space-y-2">
          <h3 className="font-medium">{t('wizard.steps.review.listingRequirements')}</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center space-x-2">
              {propertyData.title ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>{t('wizard.steps.review.requiredSections.title')}</span>
            </li>
            <li className="flex items-center space-x-2">
              {propertyData.description ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>{t('review.description2')}</span>
            </li>
            <li className="flex items-center space-x-2">
              {propertyData.propertyType ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>{t('wizard.steps.review.requiredSections.propertyType')}</span>
            </li>
            <li className="flex items-center space-x-2">
              {propertyData.images && propertyData.images.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>{t('wizard.steps.review.requiredSections.images')}</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionCard>
  );
}