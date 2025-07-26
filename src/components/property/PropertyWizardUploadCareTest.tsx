/**
 * PropertyWizardUploadCareTest - TEST/DEV VERSION
 * 
 * This is a TEST component for evaluating UploadCare integration
 * DO NOT USE IN PRODUCTION - This is for testing purposes only
 * 
 * Copy of PropertyWizard with UploadCare integration for image uploads
 * All other functionality remains the same as the original wizard
 */

import { useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardNav } from "./WizardNav";
import { WizardFooter } from "./WizardFooter";
import { StepBasicInfoAndLocation } from "./wizard-steps/StepBasicInfoAndLocation";
import { StepPricingAndDetails } from "./wizard-steps/StepPricingAndDetails";
import { StepFeatures } from "./wizard-steps/StepFeatures";
import { StepImagesUploadCare } from "./wizard-steps/StepImagesUploadCare"; // UploadCare version
import { StepDescription } from "./wizard-steps/StepDescription";
import { StepAISummary } from "./wizard-steps/StepAISummary";
import { StepReview } from "./wizard-steps/StepReview";
import { PropertyWizardTour } from "@/components/tours/PropertyWizardTour";
import { useTour } from "@/hooks/use-tour";
import { TourTrigger } from "@/components/ui/tour-trigger";
import { 
  TestTube, 
  AlertTriangle, 
  Settings, 
  Upload,
  Info
} from "lucide-react";

export default function PropertyWizardUploadCareTest() {
  const { currentStep, propertyData } = usePropertyWizard();
  
  // Tour management (same as original)
  const { 
    runTour, 
    startTour, 
    stopTour, 
    markTourSeen 
  } = useTour({ 
    tourId: 'property-wizard-uploadcare-test', 
    autoStart: false, // Don't auto-start for test version
    showOnce: false   // Allow multiple runs for testing
  });

  // Log test version usage
  useEffect(() => {
    // Add test marker to localStorage
    localStorage.setItem('property_wizard_test_version', 'uploadcare');
  }, [currentStep, propertyData]);

  // Same step rendering logic as original, but with UploadCare for images
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
        // THIS IS THE KEY DIFFERENCE - Using UploadCare instead of Cloudinary
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
    <div className="space-y-6">
      {/* TEST VERSION WARNING */}
      <Alert className="border-orange-200 bg-orange-50">
        <TestTube className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>TEST VERSION - UploadCare Integration</strong>
              <br />
              This is a test implementation for evaluating UploadCare file uploads.
              <br />
              <strong>DO NOT USE IN PRODUCTION.</strong> Use the original wizard for production.
            </div>
            <Badge variant="destructive" className="ml-4">
              TEST ONLY
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Configuration Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <strong className="text-blue-900">UploadCare Configuration:</strong>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '0765b66fa520b9cf0789' ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <div className="text-sm text-blue-800">
              <p>Public Key: {import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '0765b66fa520b9cf0789'}</p>
              <p>CDN: ucarecdn.com</p>
              <p>Widget Version: 3.x</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Test Instructions */}
      <Alert className="border-gray-200 bg-gray-50">
        <Info className="h-4 w-4 text-gray-600" />
        <AlertDescription>
          <div className="space-y-2">
            <strong className="text-gray-900">Testing Instructions:</strong>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complete the wizard normally - all steps work except images</li>
              <li>• The "Images" step uses UploadCare instead of Cloudinary</li>
              <li>• Test file upload, drag-and-drop, and external sources</li>
              <li>• Verify CDN URLs and image transformations</li>
              <li>• Check console for debugging information</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Navigation Indicator */}
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          Current Step: <strong>{currentStep}</strong>
          {currentStep === 'images' && (
            <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
              UploadCare Active
            </Badge>
          )}
        </span>
      </div>

      {/* Main Wizard Card */}
      <Card className="max-w-4xl mx-auto border-2 border-orange-200 shadow-lg rounded-xl overflow-hidden bg-white">
        <div className="border-b border-orange-100 bg-orange-50">
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
          variant="outline"
          size="default"
          icon="sparkles"
          showBadge={true}
          badgeText="Test Tour"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          Test Guide
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

      {/* Debug Panel */}
      <Card className="max-w-4xl mx-auto border border-gray-200 bg-gray-50">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Debug Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p><strong>Current Step:</strong> {currentStep}</p>
              <p><strong>Images Count:</strong> {propertyData.images?.length || 0}</p>
              <p><strong>Primary Image:</strong> {propertyData.primaryImageIndex || 0}</p>
              <p><strong>Test Version:</strong> UploadCare</p>
            </div>
            <div>
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
              <p><strong>Public Key Set:</strong> {import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || '0765b66fa520b9cf0789' ? 'Yes' : 'No'}</p>
              <p><strong>Widget Status:</strong> {typeof window !== 'undefined' && window.uploadcare ? 'Loaded' : 'Not Loaded'}</p>
              <p><strong>Draft Saved:</strong> {localStorage.getItem('property_wizard_draft') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}