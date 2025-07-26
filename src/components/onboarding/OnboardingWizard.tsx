import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Home, Building, Map, ArrowRight, MapPin, DollarSign, Check } from "lucide-react";

// Steps in the onboarding wizard
type Step = "welcome" | "location" | "propertyType" | "budget" | "features" | "ai-matching";

// User preferences for property search
interface PropertyPreferences {
  location: string;
  propertyType: string;
  budget: number;
  minBedrooms: number;
  features: string[];
}

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useTranslation(['dashboard']);
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [preferences, setPreferences] = useState<PropertyPreferences>({
    location: "",
    propertyType: "apartment",
    budget: 500000,
    minBedrooms: 2,
    features: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const handleBudgetChange = (value: number[]) => {
    setPreferences({
      ...preferences,
      budget: value[0]
    });
  };

  const handleBedroomChange = (value: number[]) => {
    setPreferences({
      ...preferences,
      minBedrooms: value[0]
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setPreferences(prev => {
      const updatedFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === "location" && !preferences.location) {
      toast({
        title: t('onboarding.errors.locationRequired'),
        description: t('onboarding.errors.locationRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    // Move to next step based on current step
    switch (currentStep) {
      case "welcome":
        setCurrentStep("location");
        break;
      case "location":
        setCurrentStep("propertyType");
        break;
      case "propertyType":
        setCurrentStep("budget");
        break;
      case "budget":
        setCurrentStep("features");
        break;
      case "features":
        setCurrentStep("ai-matching");
        performAIMatching();
        break;
      case "ai-matching":
        // Call onComplete if provided, otherwise navigate
        if (onComplete) {
          onComplete();
        } else {
          navigate(`/search?location=${encodeURIComponent(preferences.location)}&propertyType=${preferences.propertyType}&minPrice=0&maxPrice=${preferences.budget}&minBedrooms=${preferences.minBedrooms}&features=${preferences.features.join(",")}`);
        }
        break;
    }
  };

  const performAIMatching = async () => {
    setIsLoading(true);
    // In a real app, this would call an API endpoint that utilizes AI to match properties
    // For demo, we'll simulate a delay
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Render the specific step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.welcome.title')}
              </CardTitle>
              <CardDescription>
                {t('onboarding.welcome.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <div className="w-full max-w-md mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt={t('onboarding.welcome.imageAlt')}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-2 mr-4">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{t('onboarding.welcome.feature1Title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('onboarding.welcome.feature1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-2 mr-4">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{t('onboarding.welcome.feature2Title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('onboarding.welcome.feature2Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
      
      case "location":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.location.title')}
              </CardTitle>
              <CardDescription>
                {t('onboarding.location.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">{t('onboarding.location.label')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder={t('onboarding.location.placeholder')}
                      className="pl-10"
                      value={preferences.location}
                      onChange={(e) => setPreferences({...preferences, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">{t('onboarding.location.popularLocations')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {[t('onboarding.location.popularCity1'), 
                      t('onboarding.location.popularCity2'), 
                      t('onboarding.location.popularCity3'), 
                      t('onboarding.location.popularCity4'), 
                      t('onboarding.location.popularCity5')].map(city => (
                      <Button 
                        key={city} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPreferences({...preferences, location: city})}
                        className="rounded-full"
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
      
      case "propertyType":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Home className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.propertyType.title')}
              </CardTitle>
              <CardDescription>
                {t('onboarding.propertyType.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <RadioGroup 
                value={preferences.propertyType} 
                onValueChange={(value) => setPreferences({...preferences, propertyType: value})}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="apartment" 
                    id="apartment" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="apartment" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Building className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">{t('onboarding.propertyType.apartment')}</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="house" 
                    id="house" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="house" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">{t('onboarding.propertyType.house')}</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="townhouse" 
                    id="townhouse" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="townhouse" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">{t('onboarding.propertyType.townhouse')}</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="condo" 
                    id="condo" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="condo" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Building className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">{t('onboarding.propertyType.condo')}</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </>
        );
      
      case "budget":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.budget.title')}
              </CardTitle>
              <CardDescription>
                {t('onboarding.budget.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-8">
                <div>
                  <div className="mb-4 text-center">
                    <span className="text-3xl font-bold">${preferences.budget.toLocaleString()}</span>
                  </div>
                  <Slider
                    defaultValue={[preferences.budget]}
                    max={2000000}
                    min={100000}
                    step={50000}
                    onValueChange={handleBudgetChange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>$100,000</span>
                    <span>$2,000,000</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>{t('onboarding.budget.minBedrooms')}</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{preferences.minBedrooms}</span>
                    <Slider
                      defaultValue={[preferences.minBedrooms]}
                      max={5}
                      min={1}
                      step={1}
                      className="flex-1"
                      onValueChange={handleBedroomChange}
                    />
                    <span className="text-lg font-medium">5+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
      
      case "features":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.desiredFeatures.title')}
              </CardTitle>
              <CardDescription>
                {t('onboarding.desiredFeatures.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  t('onboarding.propertyFeatures.pool'), 
                  t('onboarding.propertyFeatures.garage'), 
                  t('onboarding.propertyFeatures.garden'), 
                  t('onboarding.propertyFeatures.balcony'), 
                  t('onboarding.propertyFeatures.gym'),
                  t('onboarding.propertyFeatures.security'), 
                  t('onboarding.propertyFeatures.airConditioning'), 
                  t('onboarding.propertyFeatures.furnished'),
                  t('onboarding.propertyFeatures.petFriendly'), 
                  t('onboarding.propertyFeatures.smartHome'), 
                  t('onboarding.propertyFeatures.oceanView'), 
                  t('onboarding.propertyFeatures.fireplace')
                ].map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox 
                      id={feature.toLowerCase().replace(" ", "-")} 
                      checked={preferences.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label
                      htmlFor={feature.toLowerCase().replace(" ", "-")}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );
      
      case "ai-matching":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                {t('onboarding.aiMatching.title')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('onboarding.aiMatching.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6 flex flex-col items-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-muted-foreground">{t('onboarding.aiMatching.analyzing')}</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('onboarding.aiMatching.matchesFound')}</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {t('onboarding.aiMatching.matchesDescription', { count: Math.floor(Math.random() * 20) + 5 })}
                  </p>
                </div>
              )}
            </CardContent>
          </>
        );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl rounded-xl overflow-hidden">
      {renderStepContent()}
      <CardFooter className="flex justify-between border-t px-6 py-4">
        {currentStep !== "welcome" && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prevStep => {
              switch (prevStep) {
                case "location": return "welcome";
                case "propertyType": return "location";
                case "budget": return "propertyType";
                case "features": return "budget";
                case "ai-matching": return "features";
                default: return "welcome";
              }
            })}
            disabled={isLoading}
          >
            {t('onboarding.actions.back')}
          </Button>
        )}
        <div className={currentStep === "welcome" ? "w-full" : ""}>
          <Button 
            className={`${currentStep === "welcome" ? "w-full" : ""} bg-black text-white hover:bg-white hover:text-black transition-all`}
            onClick={handleNext}
            disabled={isLoading}
          >
            {currentStep === "ai-matching" ? t('onboarding.aiMatching.matchesFound') : t('onboarding.actions.continue')} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}