import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Ruler, CalendarClock, Car, BedDouble, Bath } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StepDetails() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { t } = useTranslation('common');
  
  // Local state for sliders
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

  // Update property data when sliders change
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
    <QuestionCard
      title={t('wizard.steps.details.title')}
      description={t('wizard.steps.details.description')}
      icon={<Ruler className="h-5 w-5" />}
    >
      <div className="space-y-8">
        {/* Bedrooms */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="bedrooms" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
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
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>15+</span>
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="bathrooms" className="flex items-center gap-2">
              <Bath className="h-4 w-4" />
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
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>10+</span>
          </div>
        </div>

        {/* Area (sq ft) */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="area" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
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
          
          <div className="flex justify-between text-xs text-muted-foreground">
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
              className="mt-1"
            />
          </div>
        </div>

        {/* Year Built (optional) */}
        <div className="space-y-3">
          <Label htmlFor="year-built" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
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
          />
        </div>

        {/* Garage Spaces (optional) */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="garage" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
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
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>6+</span>
          </div>
        </div>
      </div>
    </QuestionCard>
  );
}