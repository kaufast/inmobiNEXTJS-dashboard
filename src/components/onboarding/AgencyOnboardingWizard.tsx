import React from 'react';
import { useAgencyWizard } from '@/hooks/use-agency-wizard';
import { AgencyWizardNav } from './AgencyWizardNav';
import { AgencyWizardFooter } from './AgencyWizardFooter';

// Step components
import { AgencyStepWelcome } from './agency-steps/AgencyStepWelcome';
import { AgencyStepInfo } from './agency-steps/AgencyStepInfo';
import { AgencyStepLocation } from './agency-steps/AgencyStepLocation';
import { AgencyStepBusinessDetails } from './agency-steps/AgencyStepBusinessDetails';
import { AgencyStepAdminSetup } from './agency-steps/AgencyStepAdminSetup';
import { AgencyStepVerification } from './agency-steps/AgencyStepVerification';
import { AgencyStepReview } from './agency-steps/AgencyStepReview';
import { AgencyStepCompletion } from './agency-steps/AgencyStepCompletion';

export function AgencyOnboardingWizard() {
  const wizard = useAgencyWizard();
  
  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'welcome':
        return <AgencyStepWelcome wizard={wizard} />;
      case 'agency-info':
        return <AgencyStepInfo wizard={wizard} />;
      case 'location':
        return <AgencyStepLocation wizard={wizard} />;
      case 'business-details':
        return <AgencyStepBusinessDetails wizard={wizard} />;
      case 'admin-setup':
        return <AgencyStepAdminSetup wizard={wizard} />;
      case 'verification':
        return <AgencyStepVerification wizard={wizard} />;
      case 'review':
        return <AgencyStepReview wizard={wizard} />;
      case 'completion':
        return <AgencyStepCompletion wizard={wizard} />;
      default:
        return <AgencyStepWelcome wizard={wizard} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agency Registration
          </h1>
          <p className="text-gray-600">
            {wizard.currentStep === 'welcome' 
              ? 'Join our network of professional real estate agencies'
              : wizard.currentStep === 'completion'
              ? 'Your application has been submitted successfully'
              : `Step ${wizard.getCurrentStepIndex() + 1} of ${wizard.getTotalSteps()}`
            }
          </p>
        </div>

        {/* Navigation */}
        {wizard.currentStep !== 'welcome' && wizard.currentStep !== 'completion' && (
          <AgencyWizardNav wizard={wizard} />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        {wizard.currentStep !== 'welcome' && wizard.currentStep !== 'completion' && (
          <AgencyWizardFooter wizard={wizard} />
        )}
      </div>
    </div>
  );
} 