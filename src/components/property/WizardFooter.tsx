import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, ArrowRight, Send, Home, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useLocalizedRoute } from "@/hooks/use-localized-route";

export function WizardFooter() {
  const { 
    currentStep, 
    goToNextStep, 
    goToPreviousStep, 
    saveDraft, 
    publishProperty,
    isLoading,
    isSubmitting,
    resetPropertyData
  } = usePropertyWizard();
  const { t } = useTranslation('properties');

  const isFirstStep = currentStep === "basic-info";
  const isLastStep = currentStep === "review";
  
  return (
    <div className="sticky bottom-0 bg-white border-t border-black px-8 py-5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isLoading}
              className="border-black text-black hover:bg-gray-100 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('wizard.navigation.back')}
            </Button>
          )}
          <Link href={getLocalizedPath("/dashboard/properties", useLanguage().currentLanguage)}>
            <Button variant="ghost" className="hover:bg-gray-100 text-gray-700 hover:text-black">
              <Home className="w-4 h-4 mr-2" />
              {t('wizard.navigation.cancel')}
            </Button>
          </Link>
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={isLoading || isSubmitting}
            className="border-black text-black hover:bg-gray-100 hover:text-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('wizard.navigation.saveDraft')}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={resetPropertyData}
            disabled={isLoading || isSubmitting}
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('wizard.navigation.deleteDraft')}
          </Button>
          
          {isLastStep ? (
            <Button
              variant="default"
              onClick={publishProperty}
              disabled={isLoading || isSubmitting}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('wizard.navigation.publishing')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('wizard.navigation.publish')}
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={goToNextStep}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {t('wizard.navigation.next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Step progress indicator */}
      <div className="flex justify-center mt-4">
        <div className="text-xs text-gray-500">
          {t('wizard.navigation.step')} {getStepNumber(currentStep)} {t('wizard.navigation.of')} 7
        </div>
      </div>
    </div>
  );
}

function getStepNumber(step: string): number {
  const stepMap: Record<string, number> = {
    "basic-info": 1,
    "location": 1, // Same as basic-info since they're combined
    "pricing": 2,
    "details": 2, // Same as pricing since they're combined
    "features": 3,
    "images": 4,
    "description": 5,
    "ai-summary": 6,
    "review": 7
  };
  return stepMap[step] || 1;
}

export function getLocalizedPath(path: string, locale: string) {
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}