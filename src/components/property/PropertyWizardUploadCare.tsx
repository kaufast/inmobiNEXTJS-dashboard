/**
 * PropertyWizardUploadCare - Property Wizard with UploadCare Integration
 * 
 * This component replaces PropertyWizard for UploadCare testing
 * Full property creation wizard with UploadCare for image uploads
 */

import { useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Card } from "@/components/ui/card";
import { WizardNav } from "./WizardNav";
import { WizardFooter } from "./WizardFooter";
import { StepBasicInfoAndLocation } from "./wizard-steps/StepBasicInfoAndLocation";
import { StepPricingAndDetails } from "./wizard-steps/StepPricingAndDetails";
import { StepFeatures } from "./wizard-steps/StepFeatures";
import { StepImagesUploadCare } from "./wizard-steps/StepImagesUploadCare";
import { StepDescription } from "./wizard-steps/StepDescription";
import { StepAISummary } from "./wizard-steps/StepAISummary";
import { StepReview } from "./wizard-steps/StepReview";
import { PropertyWizardTour } from "@/components/tours/PropertyWizardTour";
import { useTour } from "@/hooks/use-tour";
import { TourTrigger } from "@/components/ui/tour-trigger";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube } from "lucide-react";

export function PropertyWizardUploadCare() {
  const { currentStep, propertyData } = usePropertyWizard();
  
  // Tour management - disabled for testing
  const { 
    runTour, 
    startTour, 
    stopTour, 
    markTourSeen 
  } = useTour({ 
    tourId: 'property-wizard-uploadcare', 
    autoStart: false, // Disabled for testing
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
        return <StepImagesUploadCare />;
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
      {/* Test Status Banner */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <TestTube className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>UploadCare Integration Active</strong>
          <br />
          Current Step: <strong>{currentStep}</strong> | 
          Images: <strong>{propertyData.images?.length || 0}</strong> | 
          Draft Auto-Save: <strong>Enabled</strong>
        </AlertDescription>
      </Alert>

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
          badgeText="UploadCare Tour"
        >
          UploadCare Guide
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