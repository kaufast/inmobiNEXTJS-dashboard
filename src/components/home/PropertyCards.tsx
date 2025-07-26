import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { normalizeProperties, getFeatureArray } from "@/lib/property-utils";
import { useTranslation } from "react-i18next";

export default function PropertyCards() {
  const { t } = useTranslation('common');
  const [readyToRender, setReadyToRender] = useState(false);
  
  const { data: rawProperties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured']
  });
  
  // Normalize properties to ensure consistent data types
  const properties = normalizeProperties(Array.isArray(rawProperties) ? rawProperties : []);
  
  // Handle query success
  useEffect(() => {
    if (!isLoading && rawProperties) {
      const data = rawProperties as Property[];
      console.log("PropertyCards: Loaded featured properties successfully");
      console.log("PropertyCards: Properties count:", data?.length || 0);
      if (data && data.length > 0) {
        const firstProperty = data[0];
        console.log("PropertyCards: First property sample:", {
          id: firstProperty.id,
          title: firstProperty.title,
          featuresType: typeof firstProperty.features,
          features: firstProperty.features,
          imagesType: typeof firstProperty.images,
          images: firstProperty.images,
        });
      } else {
        console.log("PropertyCards: No properties returned from API");
      }
      setTimeout(() => {
        setReadyToRender(true);
      }, 1000);
    }
  }, [isLoading, rawProperties]);

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error("PropertyCards: Error loading featured properties:", error);
      setReadyToRender(true);
    }
  }, [error]);
  
  // Reset readyToRender when query changes
  useEffect(() => {
    if (isLoading) {
      setReadyToRender(false);
      console.log("PropertyCards: Loading state activated");
    }
  }, [isLoading]);
  
  // Add effect to monitor properties changes
  useEffect(() => {
    if (properties) {
      console.log("PropertyCards: Properties data normalized, count:", properties.length);
    }
  }, [properties]);
  
  if (isLoading || !readyToRender) {
    // Removed Featured Properties loading skeleton
    return null;
  }
  
  if (error) {
    // Removed Featured Properties error state
    return null;
  }

  // Check if properties exist but are empty
  if (!properties || properties.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('featuredProperties.title')}</h2>
            <p className="text-gray-600">{t('featuredProperties.noProperties')}</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Display featured properties
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('featuredProperties.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('featuredProperties.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              variant="default"
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/search">
            <Button size="lg" className="bg-[#131313] hover:bg-[#2a2a2a] text-white">
              {t('featuredProperties.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
