import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyWizardFooterProps {
  wizard: {
    currentStep: string;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    goToNext: () => void;
    goToPrevious: () => void;
    saveDraft: () => Promise<void>;
    submitApplication: () => Promise<boolean>;
    isSubmitting: boolean;
  };
}

export function AgencyWizardFooter({ wizard }: AgencyWizardFooterProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await wizard.saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (wizard.currentStep === 'review') {
      wizard.submitApplication();
    } else {
      wizard.goToNext();
    }
  };

  const getNextButtonText = () => {
    if (wizard.currentStep === 'review') {
      return wizard.isSubmitting ? 'Submitting...' : 'Submit Application';
    }
    return 'Continue';
  };

  return (
    <div className="mt-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={wizard.goToPrevious}
          disabled={!wizard.canGoPrevious()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        {/* Save Draft Button */}
        <Button
          variant="ghost"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </Button>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={!wizard.canGoNext() || wizard.isSubmitting}
        className={cn(
          "flex items-center space-x-2",
          wizard.currentStep === 'review' && "bg-green-600 hover:bg-green-700"
        )}
      >
        <span>{getNextButtonText()}</span>
        {wizard.currentStep !== 'review' && <ArrowRight className="w-4 h-4" />}
      </Button>
    </div>
  );
} 