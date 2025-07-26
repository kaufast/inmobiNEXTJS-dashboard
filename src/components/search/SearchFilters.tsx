import { useState, useEffect, useCallback } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger as CollapsibleTriggerImport,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { getDefaultCountryFromLocale, getLocaleMapping } from "@/lib/locale-utils";
import { useLocaleCountryFilter } from "@/hooks/use-locale-country-filter";
import { normalizeFeatures, areFeaturesSimilar } from "@/lib/feature-mapping";

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
  minSquareFeet?: number;
  maxSquareFeet?: number;
  features?: string[];
};

interface SearchFiltersProps {
  initialFilters: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
  className?: string;
}

export default function SearchFilters({
  initialFilters,
  onFilterChange,
  className,
}: SearchFiltersProps) {
  const { t } = useTranslation('search');
  const [_location, navigate] = useWouterLocation();
  const { currentLanguage } = useLanguage();
  const { country: localeCountry } = useLocaleCountryFilter();
  const [filters, setFilters] = useState<PropertySearchFilters>(initialFilters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Try to get the country from the locale mapping first (most reliable)
  const localeMapping = getLocaleMapping(currentLanguage);
  const mappingCountry = localeMapping?.country;
  // Then try the hook (second most reliable) 
  // And finally fall back to the function (least reliable)
  const currentCountry = mappingCountry || localeCountry || getDefaultCountryFromLocale(currentLanguage);
  
  // Extended list of supported countries
  const supportedCountries = [
    { value: "Mexico", label: t('search.countries.mexico') },
    { value: "United States", label: t('search.countries.unitedStates') },
    { value: "United Kingdom", label: t('search.countries.unitedKingdom') },
    { value: "Spain", label: t('search.countries.spain') },
    { value: "Austria", label: t('search.countries.austria') },
    { value: "Germany", label: t('search.countries.germany') },
    { value: "France", label: t('search.countries.france') }
  ];

  // Initialize filters with defaults based on locale if not already set
  useEffect(() => {
    let changed = false;
    const updatedFilters = { ...filters };
    
    // Set default listingType if not provided
    if (!updatedFilters.listingType) {
      updatedFilters.listingType = "buy";
      changed = true;
    }
    
    // Only apply locale-based defaults on the initial render
    // This prevents defaults from overriding user choices later
    if (Object.keys(initialFilters).length <= 2) { // Only has limit and offset
      // We should only apply country default if no country or query is set in URL
      if (!updatedFilters.country && !updatedFilters.query) {
        if (currentCountry) {
          // Apply the country from the most reliable source
          updatedFilters.country = currentCountry;
          changed = true;
        }
      }
    }
    
    if (changed) {
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  // Only run this effect once on initial render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to apply changes when filters are updated and isDirty is true
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        onFilterChange(filters);
        setIsDirty(false);
      }, 800); // Debounce to avoid too many updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters, isDirty, onFilterChange]);

  const handleFilterChange = useCallback((newFilters: Partial<PropertySearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setIsDirty(true);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    handleFilterChange({ listingType: value });
  }, [handleFilterChange]);

  const handleBedroomsChange = useCallback((value: string) => {
    handleFilterChange({ bedrooms: value === "any" ? undefined : parseInt(value) });
  }, [handleFilterChange]);

  const handleBathroomsChange = useCallback((value: string) => {
    handleFilterChange({ bathrooms: value === "any" ? undefined : parseInt(value) });
  }, [handleFilterChange]);

  const handlePropertyTypeChange = useCallback((value: string) => {
    handleFilterChange({ propertyType: value === "any" ? undefined : value });
  }, [handleFilterChange]);

  const handleCountryChange = useCallback((value: string) => {
    // Force clearing the country filter when "any" is selected
    if (value === "any") {
      const { country, ...restFilters } = filters;
      setFilters(restFilters);
      setIsDirty(true);
    } else {
      handleFilterChange({ country: value });
    }
  }, [filters, handleFilterChange]);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    if (values.length === 2) {
      handleFilterChange({ minPrice: values[0], maxPrice: values[1] });
    }
  }, [handleFilterChange]);

  const handleSquareFeetChange = useCallback((values: number[]) => {
    if (values.length === 2) {
      handleFilterChange({ minSquareFeet: values[0], maxSquareFeet: values[1] });
    }
  }, [handleFilterChange]);

  const handleFeatureToggle = useCallback((feature: string, checked: boolean) => {
    const currentFeatures = filters.features || [];
    let newFeatures: string[];
    
    if (checked) {
      // Add the normalized features for better matching
      const normalizedFeatureTerms = normalizeFeatures(feature);
      // Add all normalized terms to ensure comprehensive matching
      const uniqueFeatures = new Set([...currentFeatures, ...normalizedFeatureTerms]);
      newFeatures = Array.from(uniqueFeatures);
    } else {
      // Remove the feature and all its normalized variants
      const normalizedFeatureTerms = normalizeFeatures(feature);
      newFeatures = currentFeatures.filter(f => {
        // Remove exact matches and similar features
        return !normalizedFeatureTerms.includes(f) && !areFeaturesSimilar(f, feature);
      });
    }
    
    handleFilterChange({ features: newFeatures.length > 0 ? newFeatures : undefined });
  }, [filters.features, handleFilterChange]);

  const clearFilters = useCallback(() => {
    // Keep only the query and listing type
    const clearedFilters = {
      query: filters.query,
      listingType: filters.listingType,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  }, [filters.query, filters.listingType, onFilterChange]);

  const handleClearAllFilters = useCallback(() => {
    const resetFilters = {
      query: undefined,
      city: undefined,
      country: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      propertyType: undefined,
      minSquareFeet: undefined,
      maxSquareFeet: undefined,
      features: undefined,
      // Preserve listing type (buy/rent) as it's a primary filter
      listingType: filters.listingType
    };
    
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsDirty(false);
  }, [filters.listingType, onFilterChange]);

  // Apply filters immediately on button click
  const applyFiltersNow = () => {
    onFilterChange(filters);
    setIsDirty(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs 
        value={filters.listingType || "buy"} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">{t('search.filters.buy')}</TabsTrigger>
          <TabsTrigger value="rent">{t('search.filters.rent')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div>
          <Label>{t('search.filters.location')}</Label>
          <div className="flex space-x-2 pt-1">
            <Select
              value={filters.country || "any"}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('search.filters.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('search.filters.anyCountry')}</SelectItem>
                {supportedCountries.map(country => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder={t('search.filters.cityPlaceholder')}
              value={filters.city || ""}
              onChange={(e) => handleFilterChange({ city: e.target.value })}
              className="max-w-xs"
            />
          </div>
        </div>

        <div>
          <Label>{t('search.filters.price')}</Label>
          <div className="pt-6 px-2">
            <Slider
              defaultValue={[
                filters.minPrice || 0,
                filters.maxPrice || 2000000,
              ]}
              value={[
                filters.minPrice || 0,
                filters.maxPrice || 2000000,
              ]}
              max={2000000}
              step={1000}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
            <div className="flex justify-between">
              <span className="text-sm">${(filters.minPrice || 0).toLocaleString()}</span>
              <span className="text-sm">${(filters.maxPrice || 2000000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="w-1/2">
            <Label>{t('search.filters.bedrooms')}</Label>
            <Select
              value={filters.bedrooms ? filters.bedrooms.toString() : "any"}
              onValueChange={handleBedroomsChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('search.filters.any')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('search.filters.any')}</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2">
            <Label>{t('search.filters.bathrooms')}</Label>
            <Select
              value={filters.bathrooms ? filters.bathrooms.toString() : "any"}
              onValueChange={handleBathroomsChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('search.filters.any')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('search.filters.any')}</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>{t('search.filters.propertyType')}</Label>
          <Select
            value={filters.propertyType || "any"}
            onValueChange={handlePropertyTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('search.filters.any')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('search.filters.any')}</SelectItem>
              <SelectItem value="apartment">{t('search.filters.apartment')}</SelectItem>
              <SelectItem value="house">{t('search.filters.house')}</SelectItem>
              <SelectItem value="condo">{t('search.filters.condo')}</SelectItem>
              <SelectItem value="townhouse">{t('search.filters.townhouse')}</SelectItem>
              <SelectItem value="land">{t('search.filters.land')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Collapsible
          open={showMoreFilters}
          onOpenChange={setShowMoreFilters}
          className="w-full space-y-4"
        >
          <div className="flex justify-between items-center">
            <Label>{t('search.filters.moreFilters')}</Label>
            <CollapsibleTriggerImport asChild>
              <Button variant="ghost" size="sm">
                {showMoreFilters ? t('search.filters.showLess') : t('search.filters.showMore')}
              </Button>
            </CollapsibleTriggerImport>
          </div>

          <CollapsibleContent className="space-y-4">
            <div>
              <Label>{t('search.filters.squareFeet')}</Label>
              <div className="pt-6 px-2">
                <Slider
                  value={[
                    filters.minSquareFeet || 0,
                    filters.maxSquareFeet || 5000,
                  ]}
                  max={5000}
                  step={50}
                  onValueChange={handleSquareFeetChange}
                  className="my-4"
                />
                <div className="flex justify-between">
                  <span className="text-sm">{(filters.minSquareFeet || 0).toLocaleString()} {t('search.filters.sqft')}</span>
                  <span className="text-sm">{(filters.maxSquareFeet || 5000).toLocaleString()} {t('search.filters.sqft')}</span>
                </div>
              </div>
            </div>

            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="amenities">
                  <AccordionTrigger>{t('search.filters.amenities')}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "pool", label: t('search.filters.pool') },
                        { id: "garden", label: t('search.filters.garden') },
                        { id: "parking", label: t('search.filters.parking') },
                        { id: "airConditioning", label: t('search.filters.airConditioning') },
                        { id: "gym", label: t('search.filters.gym') },
                        { id: "securitySystem", label: t('search.filters.securitySystem') },
                      ].map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature.id}
                            checked={
                              (filters.features || []).some(f => 
                                areFeaturesSimilar(f, feature.id)
                              )
                            }
                            onCheckedChange={(checked) =>
                              handleFeatureToggle(feature.id, !!checked)
                            }
                          />
                          <label
                            htmlFor={feature.id}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {feature.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={clearFilters}
          >
            {t('search.filters.clearFilters')}
          </Button>
          <Button
            className="flex-1 bg-black text-white hover:bg-gray-800"
            onClick={applyFiltersNow}
          >
            {t('search.filters.applyFilters')}
          </Button>
        </div>

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAllFilters}
          >
            {t('search.filters.clearAll')}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={applyFiltersNow}
          >
            {t('search.filters.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
