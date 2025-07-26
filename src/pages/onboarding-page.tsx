import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to home if already logged in
  useEffect(() => {
    // This could be more sophisticated in the future with a proper completed onboarding field
    // For now, just check if user exists (is logged in)
    if (user) {
      // You could add a check for user preferences or onboarding status later
      // navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome to inMobi</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Let's find your perfect property with our AI-powered search
        </p>
      </div>
      
      <OnboardingWizard />
    </div>
  );
}