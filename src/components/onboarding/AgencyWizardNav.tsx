import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyWizardNavProps {
  wizard: {
    currentStep: string;
    getCurrentStepIndex: () => number;
    getTotalSteps: () => number;
    getStepTitle: (step: string) => string;
    steps: string[];
    validateStep: (step: string) => boolean;
  };
}

export function AgencyWizardNav({ wizard }: AgencyWizardNavProps) {
  const currentIndex = wizard.getCurrentStepIndex();
  
  // Filter out welcome and completion steps for navigation
  const navigationSteps = wizard.steps.filter(
    step => step !== 'welcome' && step !== 'completion'
  );

  return (
    <div className="mb-8">
      <nav className="flex items-center justify-between max-w-3xl mx-auto">
        {navigationSteps.map((step, index) => {
          const stepIndex = wizard.steps.indexOf(step);
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;
          const isValid = wizard.validateStep(step);
          
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCompleted
                        ? "text-green-600"
                        : isCurrent
                        ? "text-blue-600"
                        : "text-gray-500"
                    )}
                  >
                    {wizard.getStepTitle(step)}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < navigationSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    isCompleted
                      ? "bg-green-600"
                      : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
} 