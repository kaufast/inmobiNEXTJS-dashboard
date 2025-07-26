import { useState, useEffect } from "react";
import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function StepAISummary() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { toast } = useToast();
  const { t } = useTranslation('properties');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState("");
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

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!canGenerateAIContent()) {
      toast({
        title: t('wizard.steps.features.aiSummary.missingInformation'),
        description: t('wizard.steps.features.aiSummary.missingInformationDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    
    try {
      // Prepare the prompt with property information
      const prompt = `
      Help me write a compelling property listing based on these details:
      - Type: ${propertyData.propertyType}
      - Location: ${propertyData.city}, ${propertyData.country} ${propertyData.address ? `(${propertyData.address})` : ''}
      - Price: ${propertyData.price ? `$${propertyData.price.toLocaleString()}` : 'Not specified'}
      - Bedrooms: ${propertyData.bedrooms}
      - Bathrooms: ${propertyData.bathrooms}
      - Size: ${propertyData.squareFeet} sq ft
      - Features: ${propertyData.features?.join(', ') || 'None specified'}
      ${propertyData.yearBuilt ? `- Year Built: ${propertyData.yearBuilt}` : ''}
      
      Current title: ${propertyData.title || 'No title yet'}
      Current description: ${propertyData.description || 'No description yet'}
      
      Please provide:
      1. A catchy title (maximum 100 characters)
      2. A detailed description (400-600 characters) highlighting the key selling points
      `;

      const response = await apiRequest("POST", "/api/ai/analyze", { prompt });
      const data = await response.json();
      
      if (data && data.content) {
        // Extract title and description from AI response
        // This is a simplified approach - in a real implementation, you'd want
        // more structured responses from your AI service
        const content = data.content;
        const titleMatch = content.match(/Title:(.*?)(?=Description:|$)/is);
        const descriptionMatch = content.match(/Description:(.*?)(?=$)/is);
        
        if (titleMatch && titleMatch[1]) {
          setSuggestedTitle(titleMatch[1].trim());
        }
        
        if (descriptionMatch && descriptionMatch[1]) {
          setSuggestedDescription(descriptionMatch[1].trim());
        }
        
        setShowSuccessAlert(true);
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setErrorMessage(t('wizard.steps.features.aiSummary.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept AI suggestions
  const acceptSuggestions = () => {
    if (suggestedTitle) {
      updatePropertyData({ title: suggestedTitle });
    }
    
    if (suggestedDescription) {
      updatePropertyData({ description: suggestedDescription });
    }
    
    toast({
      title: t('wizard.steps.features.aiSummary.save'),
      description: t('wizard.steps.features.aiSummary.appliedSuccess'),
    });
  };

  return (
    <QuestionCard
      title={t('wizard.steps.features.aiSummary.title')}
      description={t('wizard.steps.features.aiSummary.description')}
      icon={<Sparkles className="h-5 w-5" />}
      className="property-ai-summary"
    >
      <div className="space-y-6 p-6 rounded-lg" style={{ backgroundColor: "#000000", color: "white" }}>
        {!canGenerateAIContent() && (
          <Alert className="bg-black text-white border-0">
            <AlertTriangle className="h-4 w-4 text-white" />
            <AlertDescription>
              {t('wizard.steps.features.aiSummary.insufficientDetails')}
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {showSuccessAlert && (
          <Alert className="bg-black text-white border-0">
            <CheckCircle className="h-4 w-4 text-white" />
            <AlertDescription>
              {t('wizard.steps.features.aiSummary.suggestionsGenerated')}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-title" className="text-white">{t('wizard.steps.features.aiSummary.currentTitle')}</Label>
              <Input
                id="current-title"
                value={propertyData.title}
                onChange={(e) => updatePropertyData({ title: e.target.value })}
                placeholder={t('wizard.steps.features.aiSummary.currentTitlePlaceholder')}
                disabled={isGenerating}
                className="border-0 text-black placeholder:text-gray-600"
                style={{ backgroundColor: "white" }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suggested-title" className="text-white">{t('wizard.steps.features.aiSummary.suggestedTitle')}</Label>
              <Input
                id="suggested-title"
                value={suggestedTitle}
                onChange={(e) => setSuggestedTitle(e.target.value)}
                placeholder={t('wizard.steps.features.aiSummary.suggestedTitlePlaceholder')}
                disabled={isGenerating}
                className="border-0 text-black placeholder:text-gray-600"
                style={{ backgroundColor: "white" }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-description" className="text-white">{t('wizard.steps.features.aiSummary.currentDescription')}</Label>
              <Textarea
                id="current-description"
                value={propertyData.description}
                onChange={(e) => updatePropertyData({ description: e.target.value })}
                placeholder={t('wizard.steps.features.aiSummary.currentDescriptionPlaceholder')}
                className="min-h-[180px] border-0 text-black placeholder:text-gray-600"
                style={{ backgroundColor: "white" }}
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suggested-description" className="text-white">{t('wizard.steps.features.aiSummary.generatedSummary')}</Label>
              <Textarea
                id="suggested-description"
                value={suggestedDescription}
                onChange={(e) => setSuggestedDescription(e.target.value)}
                placeholder={t('wizard.steps.features.aiSummary.suggestedDescriptionPlaceholder')}
                className="min-h-[180px] border-0 text-black placeholder:text-gray-600"
                style={{ backgroundColor: "white" }}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={generateAISuggestions}
              disabled={isGenerating || !canGenerateAIContent()}
              className="gap-2 bg-transparent border-gray-400 text-white hover:bg-[#1E2937] px-6 py-2 text-base font-medium"
            >
              {isGenerating ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isGenerating ? t('wizard.steps.features.aiSummary.generating') : t('wizard.steps.features.aiSummary.regenerate')}
            </Button>
            
            <Button
              onClick={acceptSuggestions}
              disabled={isGenerating || (!suggestedTitle && !suggestedDescription)}
              className="gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 text-base font-medium"
            >
              <CheckCircle className="h-5 w-5" />
              {t('wizard.steps.features.aiSummary.save')}
            </Button>
          </div>
        </div>
      </div>
    </QuestionCard>
  );
}