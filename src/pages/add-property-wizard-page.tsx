import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyWizard from "@/components/property/PropertyWizard";
import { useAuth } from "@/hooks/use-auth";
import { PropertyWizardProvider } from "@/hooks/use-property-wizard";
import 'leaflet/dist/leaflet.css';
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function AddPropertyWizardPage(): React.ReactElement {
  const { t } = useTranslation('properties');
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  console.log('[AddPropertyWizardPage] Initial render - Auth state:', { 
    isLoading, 
    hasUser: !!user,
    userRole: user?.role,
    isPremium: user?.isPremium
  });
  
  React.useEffect(() => {
    console.log('[AddPropertyWizardPage] Auth state changed:', {
      isLoading,
      hasUser: !!user,
      userRole: user?.role,
      isPremium: user?.isPremium
    });

    // Only make navigation decisions after loading is complete
    if (!isLoading) {
      if (!user) {
        console.log('[AddPropertyWizardPage] No user found, redirecting to /auth');
        navigate("/auth");
      } else if (user.role !== "agent" && user.role !== "admin") {
        console.log('[AddPropertyWizardPage] User lacks required role, redirecting to /dashboard');
        navigate("/dashboard");
      } else {
        console.log('[AddPropertyWizardPage] User authenticated and authorized:', {
          role: user.role,
          isPremium: user.isPremium
        });
      }
    }
  }, [user, isLoading, navigate]);

  // Check if there's a saved draft in localStorage
  const getSavedDraft = () => {
    const savedDraft = localStorage.getItem("property_wizard_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        console.log('[AddPropertyWizardPage] Found saved draft:', parsed);
        console.log('[AddPropertyWizardPage] Draft propertyData:', parsed.propertyData);
        console.log('[AddPropertyWizardPage] Draft images:', parsed.propertyData?.images);
        
        // Handle both old format (just propertyData) and new format (with currentStep)
        if (parsed.propertyData && parsed.currentStep) {
          return { propertyData: parsed.propertyData, currentStep: parsed.currentStep };
        } else {
          // Old format - just propertyData
          return { propertyData: parsed, currentStep: "basic-info" };
        }
      } catch (error) {
        console.error("[AddPropertyWizardPage] Error parsing saved draft:", error);
      }
    }
    return { propertyData: undefined, currentStep: "basic-info" };
  };

  // Show loading state while authentication is in progress
  if (isLoading) {
    console.log('[AddPropertyWizardPage] Still loading auth state, showing spinner');
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
    console.log('[AddPropertyWizardPage] User not authorized, rendering null');
    return null;
  }

  console.log('[AddPropertyWizardPage] Rendering wizard with user:', {
    role: user.role,
    isPremium: user.isPremium
  });

  const savedDraftState = getSavedDraft();
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t('wizard.title')}</h1>
        
        <PropertyWizardProvider 
          initialData={savedDraftState.propertyData}
          initialStep={savedDraftState.currentStep}
        >
          <PropertyWizard />
        </PropertyWizardProvider>
      </div>
    </DashboardLayout>
  );
}