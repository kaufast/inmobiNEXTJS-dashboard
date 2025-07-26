import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
// import FeaturedProperties from "@/components/home/FeaturedProperties";
import FeaturedProperty from "@/components/home/FeaturedProperty";
import PropertyDescription from "@/components/home/PropertyDescription";
import PropertyGallery from "@/components/home/PropertyGallery";
import PropertyCards from "@/components/home/PropertyCards";
import MapSection from "@/components/home/MapSection";

import AIPropertyRecommendations from "@/components/property/AIPropertyRecommendations";

import { Newsletter } from "@/components/home/Newsletter";
import CrowdlendingCTA from "@/components/home/CrowdlendingCTA";
import PropertyVerificationCTA from "@/components/home/PropertyVerificationCTA";
import { SEOHead } from "@/components/seo/SEOHead";
import { AutoLocalSEO } from "@/components/seo/LocalSEO";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";

export default function HomePage() {
  const { t } = useTranslation(['home']);
  const { currentLanguage, alternateLocales } = useLanguage();
  const [, navigate] = useLocation();
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false); // Disabled for testing

  // Fetch featured property
  const { data: featuredProperty, isLoading: isLoadingFeatured } = useQuery<Property[]>({
    queryKey: ['featured-property'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/properties/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured property');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching featured property:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if user has seen onboarding - DISABLED FOR TESTING
  useEffect(() => {
    // Temporarily disabled for UploadCare testing
    // const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    // if (!hasSeenOnboarding) {
    //   setShowOnboardingDialog(true);
    // }
    
    // Set as seen to prevent popup
    localStorage.setItem('hasSeenOnboarding', 'true');
  }, []);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Inmobi Real Estate",
    "description": "Buy & Rent Properties in Barcelona & Mexico. AI-adapted search. Fast listings updates. Trusted by expats.",
    "url": "https://inmobi.mobi",
    "telephone": "+34-XXX-XXX-XXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Barcelona",
      "addressCountry": "ES"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Barcelona"
      },
      {
        "@type": "City", 
        "name": "Mexico City"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/inmobi",
      "https://www.linkedin.com/company/inmobi"
    ]
  };

  // Property structured data
  const propertyStructuredData = featuredProperty && featuredProperty.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": featuredProperty[0].title,
    "description": featuredProperty[0].description,
    "price": featuredProperty[0].price,
    "priceCurrency": featuredProperty[0].currency || "EUR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": featuredProperty[0].address,
      "addressLocality": featuredProperty[0].city,
      "addressCountry": featuredProperty[0].country
    },
    "numberOfBedrooms": featuredProperty[0].bedrooms,
    "numberOfBathrooms": featuredProperty[0].bathrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": featuredProperty[0].squareFeet,
      "unitCode": "MTK"
    }
  } : null;

  // Combine structured data
  const combinedStructuredData = propertyStructuredData 
    ? [structuredData, propertyStructuredData]
    : [structuredData];

  const handleStartOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboardingDialog(false);
    navigate('/onboarding');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <SEOHead
        title="Buy & Rent Properties | Inmobi Barcelona & Mexico"
        description="Discover top properties for sale & rent. AI-adapted search. Fast listings updates. Trusted by expats."
        keywords="real estate, properties, Barcelona, Mexico, buy, rent, AI search, expats, apartments, houses"
        canonical="/"
        type="website"
        structuredData={combinedStructuredData}
        locale={currentLanguage}
        alternateLocales={alternateLocales}
      />
      <AutoLocalSEO currentLanguage={currentLanguage} />
      <Navbar />
      
      <Hero />
      
      {/* {featuredProperties && featuredProperties.length > 0 && (
        <>
          <FeaturedPropertyCard property={featuredProperties[0]} />
          <PropertyDescription property={featuredProperties[0]} />
          <PropertyGallery property={featuredProperties[0]} />
        </>
      )} */}
      
      {featuredProperty && featuredProperty.length > 0 && (
        <>
          <FeaturedProperty property={featuredProperty[0]} />
          <PropertyDescription property={featuredProperty[0]} />
          <PropertyGallery property={featuredProperty[0]} />
        </>
      )}
      
      {/* AI Property Recommendations */}
      <AIPropertyRecommendations />
      

      
      <PropertyCards />
      <MapSection />
      
      {/* Property Verification CTA */}
      <PropertyVerificationCTA />
      
      {/* Crowdlending CTA */}
      <CrowdlendingCTA />
      
      {/* Newsletter Signup */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Newsletter />
        </div>
      </section>
      
      <Footer />

      {/* Onboarding Dialog */}
      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Welcome to Inmobi!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Let's get you started with a quick tour of our platform. You'll learn about our key features and how to make the most of your property search.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleStartOnboarding} className="flex-1">
                Start Tour
              </Button>
              <Button variant="outline" onClick={() => setShowOnboardingDialog(false)}>
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
