import { useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Card } from "@/components/ui/card";
import { WizardNav } from "./WizardNav";
import { WizardFooter } from "./WizardFooter";
import { StepBasicInfoAndLocation } from "./wizard-steps/StepBasicInfoAndLocation";
import { StepPricingAndDetails } from "./wizard-steps/StepPricingAndDetails";
import { StepFeatures } from "./wizard-steps/StepFeatures";
import { StepImagesCloudinary } from "./wizard-steps/StepImagesCloudinary";
import { StepDescription } from "./wizard-steps/StepDescription";
import { StepAISummary } from "./wizard-steps/StepAISummary";
import { StepReview } from "./wizard-steps/StepReview";
import { PropertyWizardTour } from "@/components/tours/PropertyWizardTour";
import { useTour } from "@/hooks/use-tour";
import { TourTrigger } from "@/components/ui/tour-trigger";

export default function PropertyWizard() {
  const { currentStep, propertyData } = usePropertyWizard();
  
  // Tour management
  const { 
    runTour, 
    startTour, 
    stopTour, 
    markTourSeen 
  } = useTour({ 
    tourId: 'property-wizard', 
    autoStart: true,
    showOnce: true 
  });

  // Note: Auto-save is handled by use-property-wizard.tsx to avoid conflicts
  // This component only renders the current step

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic-info":
      case "location":
        return <StepBasicInfoAndLocation />;
      case "pricing":
      case "details":
        return <StepPricingAndDetails />;
      case "features":
        return <StepFeatures />;
      case "images":
        return <StepImagesCloudinary />;
      case "description":
        return <StepDescription />;
      case "ai-summary":
        return <StepAISummary />;
      case "review":
        return <StepReview />;
      default:
        return <StepBasicInfoAndLocation />;
    }
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto border border-gray-100 shadow-lg rounded-xl overflow-hidden bg-white">
        <div className="border-b border-gray-100 bg-white">
          <WizardNav />
        </div>
        <div className="transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>
        <WizardFooter />
      </Card>
      
      {/* Tour Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TourTrigger
          onClick={startTour}
          variant="default"
          size="default"
          icon="sparkles"
          showBadge={true}
          badgeText="Tour"
        >
          Property Guide
        </TourTrigger>
      </div>
      
      {/* Property Wizard Tour */}
      <PropertyWizardTour
        run={runTour}
        onComplete={() => {
          stopTour();
          markTourSeen();
        }}
        onSkip={() => {
          stopTour();
          markTourSeen();
        }}
      />
    </>
  );
}