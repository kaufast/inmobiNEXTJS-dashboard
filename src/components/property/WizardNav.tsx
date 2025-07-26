import { usePropertyWizard, type WizardStep } from "@/hooks/use-property-wizard";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function WizardNav() {
  const { currentStep, setCurrentStep, isStepValid, isLoading } = usePropertyWizard();
  const { t } = useTranslation('properties');
  
  const steps: { id: WizardStep; label: string }[] = [
    { id: "basic-info", label: t('wizard.steps.basicInfoAndLocation.title') },
    { id: "pricing", label: t('wizard.steps.pricingAndDetails.title') },
    { id: "features", label: t('wizard.steps.features.title') },
    { id: "images", label: t('wizard.steps.images.title') },
    { id: "description", label: "Description" },
    { id: "ai-summary", label: "AI Summary" },
    { id: "review", label: t('wizard.steps.review.title') },
  ];
  
  const getStepStatus = (stepId: WizardStep) => {
    if (stepId === currentStep) return "current";
    
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentStepIndex) {
      return isStepValid(stepId) ? "completed" : "invalid";
    }
    
    return "upcoming";
  };
  
  // Handle combined steps navigation
  const handleStepClick = (stepId: WizardStep) => {
    if (isLoading) return;
    setCurrentStep(stepId);
  };

  return (
    <nav className="wizard-nav overflow-x-auto py-4 px-6 border-b border-black">
      <div className="flex space-x-1 min-w-max">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              disabled={isLoading || status === "upcoming"}
              className={cn(
                "flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                status === "current" && "bg-black text-white",
                status === "completed" && "text-black hover:bg-gray-100",
                status === "invalid" && "text-black hover:bg-gray-100",
                status === "upcoming" && "text-gray-400 cursor-not-allowed",
                (status !== "upcoming" && status !== "current") && "hover:bg-gray-100 cursor-pointer"
              )}
            >
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                status === "current" && "border-white bg-white text-black",
                status === "completed" && "border-black bg-black text-white",
                status === "invalid" && "border-black bg-white text-black",
                status === "upcoming" && "border-gray-300 bg-white text-gray-400",
              )}>
                {status === "completed" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "hidden md:inline-block",
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}