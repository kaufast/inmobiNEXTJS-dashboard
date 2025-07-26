import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

interface OnboardingPopupProps {
  delayMs?: number;
}

export default function OnboardingPopup({ delayMs = 17000 }: OnboardingPopupProps) {
  const { t } = useTranslation(['dashboard']);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding or dismissed it
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    const hasDismissedOnboarding = localStorage.getItem('onboarding_dismissed');
    
    if (hasCompletedOnboarding || hasDismissedOnboarding || hasShownOnce) {
      return;
    }

    // Set timer to show onboarding popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShownOnce(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, hasShownOnce]);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as dismissed so it doesn't show again in this session
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  const handleComplete = () => {
    setIsOpen(false);
    // Mark as completed so it never shows again
    localStorage.setItem('onboarding_completed', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <OnboardingWizard onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 