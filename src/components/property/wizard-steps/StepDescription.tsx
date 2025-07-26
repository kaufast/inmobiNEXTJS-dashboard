import { useState } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Sparkles, RefreshCw, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function StepDescription() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if we can generate AI content based on provided information
  const canGenerateAIContent = () => {
    return (
      propertyData.propertyType &&
      propertyData.bedrooms !== undefined &&
      propertyData.bathrooms !== undefined &&
      propertyData.squareFeet !== undefined &&
      propertyData.city &&
      propertyData.country
    );
  };

  // Generate AI suggestions for description
  const generateAIDescription = async () => {
    if (!canGenerateAIContent()) {
      toast({
        title: t('wizard.steps.description.aiError'),
        description: t('wizard.steps.aiSummary.missingInformationDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    
    try {
      // Prepare the prompt with property information
      const prompt = `
      Help me write a compelling property description based on these details:
      - Type: ${propertyData.propertyType}
      - Location: ${propertyData.city}, ${propertyData.country} ${propertyData.address ? `(${propertyData.address})` : ''}
      - Price: ${propertyData.price ? `$${propertyData.price.toLocaleString()}` : 'Not specified'}
      - Bedrooms: ${propertyData.bedrooms}
      - Bathrooms: ${propertyData.bathrooms}
      - Size: ${propertyData.squareFeet} sq ft
      - Features: ${propertyData.features?.join(', ') || 'None specified'}
      ${propertyData.yearBuilt ? `- Year Built: ${propertyData.yearBuilt}` : ''}
      
      Current title: ${propertyData.title || 'No title yet'}
      
      Please provide a detailed description (400-600 characters) highlighting the key selling points.
      Focus on the lifestyle, amenities, and what makes this property special.
      Use engaging language that appeals to emotions and helps buyers imagine living there.
      `;

      const response = await apiRequest("POST", "/api/ai/analyze", { prompt });
      const data = await response.json();
      
      if (data && data.content) {
        setSuggestedDescription(data.content.trim());
        setShowSuccessAlert(true);
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
      setErrorMessage(t('wizard.steps.description.aiError'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI suggested description
  const applyAIDescription = () => {
    if (suggestedDescription) {
      updatePropertyData({ description: suggestedDescription });
      
      toast({
        title: t('wizard.steps.description.aiInsert'),
        description: t('wizard.steps.aiSummary.appliedSuccess'),
      });
    }
  };

  return (
    <QuestionCard
      title={t('wizard.steps.description.title')}
      description={t('wizard.steps.description.description')}
      icon={<BookOpen className="h-5 w-5" />}
      className="property-description"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700" />
            {t('wizard.steps.description.descriptionLabel')}
          </h3>
          
          <Textarea
            id="description"
            placeholder={t('wizard.steps.description.descriptionPlaceholder')}
            value={propertyData.description}
            onChange={(e) => updatePropertyData({ description: e.target.value })}
            className="min-h-[180px] text-base"
            required
          />
          
          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
            <div>
              {propertyData.description.length > 0 ? 
                `${propertyData.description.length} characters` : 
                t('wizard.steps.description.descriptionHelp')
              }
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{t('wizard.steps.description.descriptionLabel')}</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl p-6" style={{ backgroundColor: "#000000", color: "white" }}>
          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('wizard.steps.description.aiAssistLabel')}
          </h3>
          
          {!canGenerateAIContent() && (
            <Alert className="mb-4 bg-black text-white border-0">
              <AlertTriangle className="h-4 w-4 text-white" />
              <AlertDescription>
                {t('wizard.steps.aiSummary.insufficientDetails')}
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {showSuccessAlert && (
            <Alert className="mb-4 bg-black text-white border-0">
              <CheckCircle className="h-4 w-4 text-white" />
              <AlertDescription>
                {t('wizard.steps.aiSummary.suggestionsGenerated')}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="rounded-lg p-4 mb-4">
            <Textarea
              id="ai-description"
              value={suggestedDescription}
              onChange={(e) => setSuggestedDescription(e.target.value)}
              placeholder={t('wizard.steps.aiSummary.suggestedDescriptionPlaceholder')}
              className="min-h-[180px] border-0 p-0 shadow-none focus-visible:ring-0 text-base text-black placeholder:text-gray-600"
              style={{ backgroundColor: "white" }}
              disabled={isGenerating}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={generateAIDescription}
              disabled={isGenerating || !canGenerateAIContent()}
              className="gap-2 bg-transparent border-gray-400 text-white hover:bg-[#1E2937] px-6 py-2 text-base font-medium"
            >
              {isGenerating ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isGenerating ? t('wizard.steps.description.aiGenerating') : t('wizard.steps.description.aiAssistButton')}
            </Button>
            
            <Button
              onClick={applyAIDescription}
              disabled={isGenerating || !suggestedDescription}
              className="gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 text-base font-medium"
            >
              <CheckCircle className="h-5 w-5" />
              {t('wizard.steps.description.aiInsert')}
            </Button>
          </div>
        </div>
      </div>
    </QuestionCard>
  );
}