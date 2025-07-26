import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  DollarSign, 
  Home, 
  Building, 
  Map, 
  Briefcase, 
  Warehouse,
  Ruler, 
  CalendarClock, 
  Car, 
  BedDouble, 
  Bath 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function StepPricingAndDetails() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { t } = useTranslation('properties');
  
  // Local state for price slider
  const [priceValue, setPriceValue] = useState<number[]>(
    propertyData.price ? [propertyData.price] : [250000]
  );
  
  // Local state for details sliders
  const [bedroomValue, setBedroomValue] = useState<number[]>(
    propertyData.bedrooms ? [propertyData.bedrooms] : [2]
  );
  const [bathroomValue, setBathroomValue] = useState<number[]>(
    propertyData.bathrooms ? [propertyData.bathrooms] : [2]
  );
  const [areaValue, setAreaValue] = useState<number[]>(
    propertyData.squareFeet ? [propertyData.squareFeet] : [1000]
  );
  const [garageValue, setGarageValue] = useState<number[]>([0]);
  const [yearBuilt, setYearBuilt] = useState<number>(
    propertyData.yearBuilt || new Date().getFullYear() - 10
  );

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Property types for radio selection
  const propertyTypes = [
    { value: "apartment", label: t('wizard.steps.pricing.propertyTypes.apartment'), icon: <Building className="h-5 w-5" /> },
    { value: "villa", label: t('wizard.steps.pricing.propertyTypes.villa'), icon: <Home className="h-5 w-5" /> },
    { value: "penthouse", label: t('wizard.steps.pricing.propertyTypes.penthouse'), icon: <Building className="h-5 w-5" /> },
    { value: "townhouse", label: t('wizard.steps.pricing.propertyTypes.townhouse'), icon: <Home className="h-5 w-5" /> },
    { value: "office", label: t('wizard.steps.pricing.propertyTypes.office'), icon: <Briefcase className="h-5 w-5" /> },
    { value: "retail", label: t('wizard.steps.pricing.propertyTypes.retail'), icon: <Warehouse className="h-5 w-5" /> },
    { value: "land", label: t('wizard.steps.pricing.propertyTypes.land'), icon: <Map className="h-5 w-5" /> },
  ];

  // Listing types for radio selection
  const listingTypes = [
    { value: "sell", label: t('wizard.steps.pricing.forSale') },
    { value: "rent", label: t('wizard.steps.pricing.forRent') }
  ];

  // Update property data when price slider changes
  useEffect(() => {
    updatePropertyData({ price: priceValue[0] });
  }, [priceValue, updatePropertyData]);

  // Update property data when details sliders change
  useEffect(() => {
    updatePropertyData({ bedrooms: bedroomValue[0] });
  }, [bedroomValue, updatePropertyData]);

  useEffect(() => {
    updatePropertyData({ bathrooms: bathroomValue[0] });
  }, [bathroomValue, updatePropertyData]);

  useEffect(() => {
    updatePropertyData({ squareFeet: areaValue[0] });
  }, [areaValue, updatePropertyData]);

  // Update year built
  useEffect(() => {
    updatePropertyData({ yearBuilt });
  }, [yearBuilt, updatePropertyData]);

  return (
    <div className="property-pricing">
      <h2 className="text-xl font-bold px-8 py-4 border-b border-black">
        {t('wizard.steps.pricingAndDetails.title', t('wizard.steps.pricing.title') + ' & ' + t('wizard.steps.details.title'))}
      </h2>
      
      <div className="p-8 space-y-8">
        {/* Pricing & Type Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-black" />
            {t('wizard.steps.pricingAndDetails.pricingSection')}
          </h3>
          
          {/* Price slider */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="price">{t('wizard.steps.pricing.priceLabel')}</Label>
              <span className="font-medium">{formatPrice(priceValue[0])}</span>
            </div>
            
            <Slider
              id="price"
              min={50000}
              max={5000000}
              step={10000}
              value={priceValue}
              onValueChange={setPriceValue}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>$50,000</span>
              <span>$5,000,000</span>
            </div>

            <div className="mt-2">
              <Label htmlFor="exact-price">{t('wizard.steps.pricing.exactPriceLabel')}</Label>
              <Input
                id="exact-price"
                type="number"
                min={0}
                value={priceValue[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setPriceValue([value]);
                }}
                className="mt-1 border-black focus:border-black focus:ring-black"
                placeholder={t('wizard.steps.pricing.pricePlaceholder')}
              />
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-4 pt-4">
            <Label className="text-base">{t('wizard.steps.pricing.propertyTypeLabel')}</Label>
            <RadioGroup 
              value={propertyData.propertyType || 'apartment'} 
              onValueChange={(value) => updatePropertyData({ propertyType: value })}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {propertyTypes.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={`property-type-${type.value}`}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    propertyData.propertyType === type.value 
                      ? 'bg-black text-white border-black' 
                      : 'hover:bg-gray-50 border-black'
                  }`}
                >
                  <RadioGroupItem 
                    value={type.value} 
                    id={`property-type-${type.value}`} 
                    className="sr-only" 
                  />
                  <div className={`p-1.5 rounded-full ${
                    propertyData.propertyType === type.value 
                      ? 'text-white bg-gray-700' 
                      : 'text-black bg-gray-100'
                  }`}>
                    {type.icon}
                  </div>
                  <span className={propertyData.propertyType === type.value ? 'font-medium' : ''}>
                    {type.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Listing Types */}
          <div className="space-y-4 pt-4">
            <Label className="text-base">{t('wizard.steps.pricing.listingTypeLabel')}</Label>
            <RadioGroup 
              value={propertyData.listingType || 'sell'} 
              onValueChange={(value) => updatePropertyData({ listingType: value })}
              className="grid grid-cols-2 gap-3"
            >
              {listingTypes.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={`listing-type-${type.value}`}
                  className={`flex items-center justify-center p-3 rounded-lg border border-black cursor-pointer transition-colors ${
                    propertyData.listingType === type.value 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem 
                    value={type.value} 
                    id={`listing-type-${type.value}`} 
                    className="sr-only" 
                  />
                  <span className={propertyData.listingType === type.value ? 'font-medium' : ''}>
                    {type.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        {/* Property Details Section */}
        <div className="space-y-6 pt-4 border-t border-black">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Ruler className="h-5 w-5 text-black" />
            {t('wizard.steps.pricingAndDetails.detailsSection')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bedrooms */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="bedrooms" className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-black" />
                  {t('wizard.steps.details.bedroomsLabel')}
                </Label>
                <span className="font-medium">{bedroomValue[0]}</span>
              </div>
              
              <Slider
                id="bedrooms"
                min={0}
                max={15}
                step={1}
                value={bedroomValue}
                onValueChange={setBedroomValue}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>15+</span>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="bathrooms" className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-black" />
                  {t('wizard.steps.details.bathroomsLabel')}
                </Label>
                <span className="font-medium">{bathroomValue[0]}</span>
              </div>
              
              <Slider
                id="bathrooms"
                min={0}
                max={10}
                step={0.5}
                value={bathroomValue}
                onValueChange={setBathroomValue}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>10+</span>
              </div>
            </div>
          </div>

          {/* Area (sq ft) */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="area" className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-black" />
                {t('wizard.steps.details.sizeLabel')}
              </Label>
              <span className="font-medium">{new Intl.NumberFormat().format(areaValue[0])} sq ft</span>
            </div>
            
            <Slider
              id="area"
              min={100}
              max={10000}
              step={100}
              value={areaValue}
              onValueChange={setAreaValue}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>100 sq ft</span>
              <span>10,000+ sq ft</span>
            </div>
            
            <div className="mt-2">
              <Label htmlFor="exact-area">{t('wizard.steps.details.sizePlaceholder')}</Label>
              <Input
                id="exact-area"
                type="number"
                min={0}
                value={areaValue[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setAreaValue([value]);
                }}
                className="mt-1 border-black focus:border-black focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Year Built */}
            <div className="space-y-3">
              <Label htmlFor="year-built" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-black" />
                {t('wizard.steps.details.yearBuiltLabel')}
              </Label>
              <Input
                id="year-built"
                type="number"
                min={1800}
                max={new Date().getFullYear()}
                value={yearBuilt}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || new Date().getFullYear();
                  setYearBuilt(value);
                }}
                placeholder={t('wizard.steps.details.yearBuiltPlaceholder')}
                className="border-black focus:border-black focus:ring-black"
              />
            </div>

            {/* Parking Spaces */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="garage" className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-black" />
                  {t('wizard.steps.details.parkingLabel')}
                </Label>
                <span className="font-medium">{garageValue[0]}</span>
              </div>
              
              <Slider
                id="garage"
                min={0}
                max={6}
                step={1}
                value={garageValue}
                onValueChange={setGarageValue}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>6+</span>
              </div>
            </div>
          </div>
                  </div>
        </div>
      </div>
    );
} 