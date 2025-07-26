import { useState, ChangeEvent } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Plus, 
  X,
  AlertCircle 
} from "lucide-react";
import { 
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { CheckedState } from "@radix-ui/react-checkbox"

// Define the custom feature type
interface CustomFeature {
  id: string;
  label: string;
}

export function StepFeatures() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>(propertyData.customFeatures || []);
  const [newFeature, setNewFeature] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Features configuration (could be moved to a config file or constants)
  const standardFeatures: { id: keyof typeof propertyData.features; label: string }[] = [
    { id: "airConditioning", label: t('property.wizard.steps.features.amenities.air-conditioning') },
    { id: "heating", label: t('property.wizard.steps.features.amenities.heating') },
    { id: "balconyPatio", label: t('property.wizard.steps.features.amenities.balcony-patio') },
    { id: "furnished", label: t('property.wizard.steps.features.amenities.furnished') },
    { id: "garage", label: t('property.wizard.steps.features.amenities.garage') },
    { id: "gym", label: t('property.wizard.steps.features.amenities.gym') },
    { id: "pool", label: t('property.wizard.steps.features.amenities.pool') },
    { id: "garden", label: t('property.wizard.steps.features.amenities.garden') },
    { id: "petFriendly", label: t('property.wizard.steps.features.amenities.pet-friendly') },
    { id: "oceanView", label: t('property.wizard.steps.features.amenities.ocean-view') },
    { id: "fireplace", label: t('property.wizard.steps.features.amenities.fireplace') },
    { id: "elevator", label: t('property.wizard.steps.features.amenities.elevator') },
    { id: "wheelchairAccess", label: t('property.wizard.steps.features.amenities.wheelchair-access') },
    { id: "securitySystem", label: t('property.wizard.steps.features.amenities.security-system') },
    { id: "concierge", label: t('property.wizard.steps.features.amenities.concierge') },
    { id: "laundryRoom", label: t('property.wizard.steps.features.amenities.laundry-room') }
  ];

  const handleStandardFeatureChange = (featureId: keyof typeof propertyData.features, checked: CheckedState) => {
    const currentFeatures = propertyData.features || [];
    
    if (checked === "indeterminate" || checked === false) {
      updatePropertyData({
        features: currentFeatures.filter((f) => f !== featureId),
      });
    } else {
      updatePropertyData({
        features: [...currentFeatures, featureId],
      });
    }
  };

  const handleAddCustomFeature = () => {
    if (newFeature.trim() === "") {
      setError(t('property.wizard.steps.features.errors.emptyFeature'));
      return;
    }
    if (customFeatures.length >= 5) {
      setError(t('property.wizard.steps.features.errors.maxCustomFeatures'));
      return;
    }
    if (customFeatures.find(f => f.label.toLowerCase() === newFeature.trim().toLowerCase())) {
      setError(t('property.wizard.steps.features.errors.duplicateFeature'));
      return;
    }
    const updatedCustomFeatures = [...customFeatures, { id: Date.now().toString(), label: newFeature.trim() }];
    setCustomFeatures(updatedCustomFeatures);
    updatePropertyData({ customFeatures: updatedCustomFeatures });
    setNewFeature("");
    setError(null);
    toast({
      title: t('property.wizard.steps.features.toast.featureAddedTitle'),
      description: t('property.wizard.steps.features.toast.featureAddedDescription', { feature: newFeature.trim() }),
      variant: "success",
    });
  };

  const handleRemoveCustomFeature = (featureId: string) => {
    const updatedCustomFeatures = customFeatures.filter((f) => f.id !== featureId);
    setCustomFeatures(updatedCustomFeatures);
    updatePropertyData({
      customFeatures: updatedCustomFeatures.map(f => f.label)
    });

    toast({
      title: t('wizard.steps.features.success.removed'),
      description: t('wizard.steps.features.success.removedDesc'),
    });
  };

  return (
    <QuestionCard
      title={t('wizard.steps.features.title')}
      description={t('wizard.steps.features.description')}
      icon={<Check className="h-5 w-5" />}
      className="property-features"
    >
      <div className="space-y-8">
        {/* Standard Features as Thickboxes */}
        <div>
          <h3 className="text-lg font-medium mb-4">{t('wizard.steps.features.standardTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {standardFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`
                  flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${propertyData.features?.includes(feature.id)
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-gray-50 border-gray-200'}
                `}
                onClick={() => handleStandardFeatureChange(feature.id, !propertyData.features?.includes(feature.id))}
              >
                <Checkbox
                  id={feature.id}
                  checked={propertyData.features?.includes(feature.id)}
                  onCheckedChange={(checked) => handleStandardFeatureChange(feature.id, checked)}
                  className={propertyData.features?.includes(feature.id) ? 'border-white' : ''}
                />
                <Label
                  htmlFor={feature.id}
                  className="cursor-pointer w-full"
                >
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Features Input */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">{t('property.wizard.steps.features.customTitle')}</h3>
          <div className="flex gap-2 items-start">
            <div className="flex-grow space-y-2">
              <Input
                type="text"
                value={newFeature}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewFeature(e.target.value)}
                placeholder={t('property.wizard.steps.features.customPlaceholder')}
                className="border-input"
              />
              {error && (
                <Alert variant="destructive" className="p-2 text-sm">
                  <AlertCircle className="h-4 w-4 inline-block mr-1" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button onClick={handleAddCustomFeature} className="bg-black text-white hover:bg-gray-800 h-10 px-4">
              <Plus className="h-4 w-4 mr-2" />
              {t('property.wizard.steps.features.addFeatureButton')}
            </Button>
          </div>
          {customFeatures.length > 0 && (
            <div className="space-y-2">
              {customFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg text-black"
                >
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCustomFeature(feature.id)}
                    aria-label={`Remove ${feature.label}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            These features will be highlighted in your property listing, making it
            easier for buyers to find properties that match their preferences.
          </p>
        </div>
      </div>
    </QuestionCard>
  );
}