/**
 * UploadCare Property Wizard Test Page
 * Full property creation wizard with UploadCare integration
 */

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { PropertyWizardProvider } from "@/hooks/use-property-wizard";
import 'leaflet/dist/leaflet.css';
import { Loader2, TestTube, AlertTriangle } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PropertyWizardUploadCare } from "@/components/property/PropertyWizardUploadCare";

export default function AddPropertyWizardUploadCareTestPage(): React.ReactElement {
  const { t } = useTranslation('properties');
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  console.log('[AddPropertyWizardUploadCareTestPage] Initial render - Auth state:', { 
    isLoading, 
    hasUser: !!user,
    userRole: user?.role,
    isPremium: user?.isPremium
  });
  
  React.useEffect(() => {
    console.log('[AddPropertyWizardUploadCareTestPage] Auth state changed:', {
      isLoading,
      hasUser: !!user,
      userRole: user?.role,
      isPremium: user?.isPremium
    });

    // Only make navigation decisions after loading is complete
    if (!isLoading) {
      if (!user) {
        console.log('[AddPropertyWizardUploadCareTestPage] No user found, redirecting to /auth');
        navigate("/auth");
      } else if (user.role !== "agent" && user.role !== "admin") {
        console.log('[AddPropertyWizardUploadCareTestPage] User lacks required role, redirecting to /dashboard');
        navigate("/dashboard");
      } else {
        console.log('[AddPropertyWizardUploadCareTestPage] User authenticated and authorized:', {
          role: user.role,
          isPremium: user.isPremium
        });
      }
    }
  }, [user, isLoading, navigate]);

  // Check if there's a saved draft in localStorage
  const getSavedDraft = () => {
    const savedDraft = localStorage.getItem("property_wizard_uploadcare_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        console.log('[AddPropertyWizardUploadCareTestPage] Found saved draft:', parsed);
        console.log('[AddPropertyWizardUploadCareTestPage] Draft propertyData:', parsed.propertyData);
        console.log('[AddPropertyWizardUploadCareTestPage] Draft images:', parsed.propertyData?.images);
        
        // Handle both old format (just propertyData) and new format (with currentStep)
        if (parsed.propertyData && parsed.currentStep) {
          return { propertyData: parsed.propertyData, currentStep: parsed.currentStep };
        } else {
          // Old format - just propertyData
          return { propertyData: parsed, currentStep: "basic-info" };
        }
      } catch (error) {
        console.error("[AddPropertyWizardUploadCareTestPage] Error parsing saved draft:", error);
      }
    }
    return { propertyData: undefined, currentStep: "basic-info" };
  };

  // Show loading state while authentication is in progress
  if (isLoading) {
    console.log('[AddPropertyWizardUploadCareTestPage] Still loading auth state, showing spinner');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // After loading, if user is invalid or lacks the role, render nothing
  // The useEffect above has already initiated the redirect
  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    console.log('[AddPropertyWizardUploadCareTestPage] User not authorized, rendering null');
    return null;
  }

  console.log('[AddPropertyWizardUploadCareTestPage] Rendering wizard with user:', {
    role: user.role,
    isPremium: user.isPremium
  });

  const savedDraftState = getSavedDraft();
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        {/* Test Warning */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <TestTube className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>UploadCare Test Version - Property Wizard</strong>
            <br />
            This is a test implementation of the property wizard using UploadCare for image uploads.
            <br />
            <strong>Testing Phase:</strong> Full property creation flow with UploadCare integration and database storage.
          </AlertDescription>
        </Alert>

        <h1 className="text-3xl font-bold mb-8">
          {t('wizard.title')} - UploadCare Test
        </h1>
        
        <PropertyWizardProvider 
          initialData={savedDraftState.propertyData}
          initialStep={savedDraftState.currentStep}
          draftKey="property_wizard_uploadcare_draft"
        >
          <PropertyWizardUploadCare />
        </PropertyWizardProvider>
      </div>
    </DashboardLayout>
  );
}