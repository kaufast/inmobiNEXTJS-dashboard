import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, Home, Building, Warehouse, Briefcase, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function StepPricing() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { t } = useTranslation('properties');
  const [priceValue, setPriceValue] = useState<number[]>(
    propertyData.price ? [propertyData.price] : [500000]
  );

  // Update property data when price slider changes
  useEffect(() => {
    updatePropertyData({ price: priceValue[0] });
  }, [priceValue, updatePropertyData]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const propertyTypes = [
    { value: "apartment", label: t('wizard.steps.pricing.propertyTypes.apartment'), icon: <Building className="h-5 w-5" /> },
    { value: "villa", label: t('wizard.steps.pricing.propertyTypes.villa'), icon: <Home className="h-5 w-5" /> },
    { value: "penthouse", label: t('wizard.steps.pricing.propertyTypes.penthouse'), icon: <Building className="h-5 w-5" /> },
    { value: "townhouse", label: t('wizard.steps.pricing.propertyTypes.townhouse'), icon: <Home className="h-5 w-5" /> },
    { value: "office", label: t('wizard.steps.pricing.propertyTypes.office'), icon: <Briefcase className="h-5 w-5" /> },
    { value: "retail", label: t('wizard.steps.pricing.propertyTypes.retail'), icon: <Warehouse className="h-5 w-5" /> },
    { value: "land", label: t('wizard.steps.pricing.propertyTypes.land'), icon: <Map className="h-5 w-5" /> },
  ];

  return (
    <QuestionCard
      title={t('wizard.steps.pricing.title')}
      description={t('wizard.steps.pricing.description')}
      icon={<DollarSign className="h-5 w-5" />}
    >
      <div className="space-y-8">
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
          
          <div className="flex justify-between text-xs text-muted-foreground">
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
              className="mt-1"
            />
          </div>
        </div>

        {/* Listing type */}
        <div className="space-y-3">
          <Label>{t('wizard.steps.pricing.listingTypeLabel')}</Label>
          <RadioGroup
            value={propertyData.listingType}
            onValueChange={(value) => updatePropertyData({ listingType: value })}
            className="flex flex-wrap gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buy" id="listing-buy" />
              <Label htmlFor="listing-buy">{t('wizard.steps.pricing.forSale')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="listing-rent" />
              <Label htmlFor="listing-rent">{t('wizard.steps.pricing.forRent')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sell" id="listing-sell" />
              <Label htmlFor="listing-sell">{t('wizard.steps.pricing.lookingToSell')}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Property type */}
        <div className="space-y-3">
          <Label>{t('wizard.steps.pricing.propertyTypeLabel')}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                  propertyData.propertyType === type.value
                    ? "bg-[#131313] text-white border-[#131313]"
                    : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => updatePropertyData({ propertyType: type.value })}
              >
                {type.icon}
                <span className="mt-2 text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </QuestionCard>
  );
}