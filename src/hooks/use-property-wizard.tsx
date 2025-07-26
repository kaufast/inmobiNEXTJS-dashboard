import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { insertPropertySchema } from "@shared/schema";

// Define the property form schema
export const propertyWizardSchema = insertPropertySchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0").optional(),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be 0 or more"),
  squareFeet: z.coerce.number().min(1, "Square feet must be greater than 0"),
  yearBuilt: z.coerce.number().optional(),
  images: z.array(z.any()).min(1, "At least one image is required"),
  primaryImageIndex: z.number().min(0).optional(),
  featureImage: z.string().optional(),
  status: z.enum(["draft", "pending", "active"]).default("draft"),
});

export type PropertyWizardData = z.infer<typeof propertyWizardSchema>;

// Define the type for the wizard steps
export type WizardStep =
  | "basic-info"
  | "location"
  | "pricing"
  | "details"
  | "features"
  | "images"
  | "description"
  | "ai-summary"
  | "review";

// Define the initial state for the wizard
const initialPropertyState: PropertyWizardData = {
  title: "",
  description: "",
  price: undefined,
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  latitude: undefined,
  longitude: undefined,
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: 0,
  lotSize: undefined,
  propertyType: "apartment",
  features: [],
  images: [],
  primaryImageIndex: 0,
  featureImage: undefined,
  isPremium: false,
  listingType: "buy",
  status: "draft",
  contactEmail: "",
  phoneNumber: "",
  phoneCountryCode: "",
  isPhoneNumberPublic: true,
};

interface PropertyWizardContextType {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  propertyData: PropertyWizardData;
  updatePropertyData: (data: Partial<PropertyWizardData>) => void;
  resetPropertyData: () => void;
  saveDraft: () => Promise<boolean>; // Changed return type to boolean
  publishProperty: () => Promise<void>;
  isLoading: boolean;
  draftId: number | null;
  validateCurrentStep: () => boolean;
  goToNextStep: () => Promise<void>; // Changed to async
  goToPreviousStep: () => Promise<void>; // Changed to async
  isStepValid: (step: WizardStep) => boolean;
  uploadImages: (files: File[]) => Promise<void>;
  isSubmitting: boolean;
}

const PropertyWizardContext = createContext<PropertyWizardContextType | null>(null);

export const usePropertyWizard = () => {
  const context = useContext(PropertyWizardContext);
  if (!context) {
    throw new Error("usePropertyWizard must be used within a PropertyWizardProvider");
  }
  return context;
};

interface PropertyWizardProviderProps {
  children: ReactNode;
  initialData?: Partial<PropertyWizardData>;
  initialStep?: WizardStep;
  initialDraftId?: number;
  draftKey?: string;
}

export const PropertyWizardProvider = ({
  children,
  initialData,
  initialStep = "basic-info",
  initialDraftId = null,
  draftKey = "property_wizard_draft",
}: PropertyWizardProviderProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [propertyData, setPropertyData] = useState<PropertyWizardData>({
    ...initialPropertyState,
    ...initialData,
  });

  // Debug logging for initialization
  console.log('[PropertyWizardProvider] Initializing with:', {
    initialData,
    initialStep,
    resultingPropertyData: {
      ...initialPropertyState,
      ...initialData,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(initialDraftId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.propertyData) {
          setPropertyData(prev => ({ ...prev, ...parsed.propertyData }));
        }
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (error) {
      // Silently remove invalid draft
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]); // Run once on mount
  
  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyWizardData) => {
      // Convert squareFeet to areaSqm for database compatibility
      const { squareFeet, ...restData } = data;
      const dbData = {
        ...restData,
        areaSqm: squareFeet || 0,
      };
      const response = await apiRequest("POST", "/api/properties", dbData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Property has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setDraftId(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create property: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PropertyWizardData> }) => {
      // Convert squareFeet to areaSqm for database compatibility
      const { squareFeet, ...restData } = data;
      const dbData = {
        ...restData,
        ...(squareFeet !== undefined && { areaSqm: squareFeet }),
      };
      const response = await apiRequest("PATCH", `/api/properties/${id}`, dbData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Draft has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save draft: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update property data
  const updatePropertyData = useCallback((data: Partial<PropertyWizardData>) => {
    console.log('[PropertyWizardProvider] updatePropertyData called with:', data);
    setPropertyData((prev) => {
      const newData = { ...prev, ...data };
      console.log('[PropertyWizardProvider] New property data:', {
        oldImages: prev.images?.length || 0,
        newImages: newData.images?.length || 0,
        newData
      });
      
      // Save to localStorage immediately after state update
      setTimeout(() => {
        const draftState = {
          propertyData: newData,
          currentStep: currentStep
        };
        console.log('[PropertyWizardProvider] Auto-saving after update:', {
          images: newData.images?.length || 0,
          currentStep
        });
        localStorage.setItem(draftKey, JSON.stringify(draftState));
      }, 0);
      
      return newData;
    });
  }, [currentStep, draftKey]);

  // Reset property data
  const resetPropertyData = useCallback(() => {
    setPropertyData(initialPropertyState);
    setDraftId(null);
  }, []);

  // Save draft
  const saveDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Set status to draft
      const dataWithDraftStatus = { ...propertyData, status: "draft" };
      
      if (draftId) {
        // Update existing draft
        await updatePropertyMutation.mutateAsync({ id: draftId, data: dataWithDraftStatus });
        // Show a small toast notification
        toast({
          title: "Draft Saved",
          description: "Your changes have been saved to drafts",
          variant: "default",
          duration: 1500,
        });
      } else {
        // Create new draft
        const result = await createPropertyMutation.mutateAsync(dataWithDraftStatus);
        setDraftId(result.id);
        // Show a small toast notification
        toast({
          title: "Draft Created",
          description: "Your property has been saved to drafts",
          variant: "default",
          duration: 1500,
        });
      }
      return true; // Return true to indicate success
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Save Failed",
        description: "Could not save the draft. Please try again.",
        variant: "destructive",
      });
      return false; // Return false to indicate failure
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, draftId, createPropertyMutation, updatePropertyMutation, toast]);

  // Publish property
  const publishProperty = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Set status to pending approval
      const dataToPublish = { ...propertyData, status: "pending" };
      
      if (draftId) {
        // Update existing draft to publish
        await updatePropertyMutation.mutateAsync({ id: draftId, data: dataToPublish });
      } else {
        // Create and publish
        const result = await createPropertyMutation.mutateAsync(dataToPublish);
        setDraftId(result.id);
      }
      
      // Navigate to the properties dashboard
      navigate("/dashboard/properties");
      
      toast({
        title: "Success",
        description: "Property has been submitted for approval!",
      });
    } catch (error) {
      console.error("Error publishing property:", error);
      toast({
        title: "Error",
        description: "Failed to publish property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, draftId, createPropertyMutation, updatePropertyMutation, navigate, toast]);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    console.log('[PropertyWizard] Validating step:', currentStep, 'with data:', propertyData);
    try {
      // Define validation schema for each step
      switch (currentStep) {
        case "basic-info":
          z.object({
            title: z.string().min(5, "Title must be at least 5 characters"),
          }).parse(propertyData);
          break;
        case "location":
          // Location step is optional, but if city and country are provided, validate them
          if (propertyData.city || propertyData.country) {
            z.object({
              city: z.string().min(2, "City must be at least 2 characters"),
              country: z.string().min(2, "Country must be at least 2 characters"),
            }).parse(propertyData);
          }
          break;
        case "pricing":
          z.object({
            propertyType: z.string().min(1, "Property type is required"),
          }).parse(propertyData);
          break;
        case "details":
          z.object({
            bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
            bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
            squareFeet: z.number().min(1, "Square feet must be greater than 0"),
          }).parse(propertyData);
          break;
        case "images":
          if (!propertyData.images || propertyData.images.length === 0) {
            return false;
          }
          break;
        case "description":
          z.object({
            description: z.string().min(20, "Description must be at least 20 characters"),
          }).parse(propertyData);
          break;
        default:
          return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  }, [currentStep, propertyData]);

  // Check if a specific step is valid without changing state
  const isStepValid = useCallback(
    (step: WizardStep) => {
      try {
        // Define validation schema for each step without changing state
        switch (step) {
          case "basic-info":
            z.object({
              title: z.string().min(5, "Title must be at least 5 characters"),
            }).parse(propertyData);
            break;
          case "location":
            // Location step is optional, but if city and country are provided, validate them
            if (propertyData.city || propertyData.country) {
              z.object({
                city: z.string().min(2, "City must be at least 2 characters"),
                country: z.string().min(2, "Country must be at least 2 characters"),
              }).parse(propertyData);
            }
            break;
          case "pricing":
            z.object({
              propertyType: z.string().min(1, "Property type is required"),
            }).parse(propertyData);
            break;
          case "details":
            z.object({
              bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
              bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
              squareFeet: z.number().min(1, "Square feet must be greater than 0"),
            }).parse(propertyData);
            break;
          case "images":
            if (!propertyData.images || propertyData.images.length === 0) {
              return false;
            }
            break;
          case "description":
            z.object({
              description: z.string().min(20, "Description must be at least 20 characters"),
            }).parse(propertyData);
            break;
          default:
            return true;
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    [propertyData]
  );

  // Navigate to next step
  const goToNextStep = useCallback(async () => {
    console.log('goToNextStep called, current step:', currentStep);
    
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Define the next step mapping
    const nextStepMap: Record<WizardStep, WizardStep> = {
      "basic-info": "pricing",
      "location": "pricing",
      "pricing": "features",
      "details": "features",
      "features": "images",
      "images": "description",
      "description": "ai-summary",
      "ai-summary": "review",
      "review": "review" // Stay on review
    };

    try {
      console.log('About to save draft');
      // Auto-save draft when moving between steps and wait for completion
      const saveSuccess = await saveDraft();
      console.log('Draft saved with result:', saveSuccess);
      
      if (saveSuccess) {
        // Get the next step directly from the map
        const nextStep = nextStepMap[currentStep];
        console.log('Moving to next step:', nextStep);
        
        // Update the step state
        setCurrentStep(nextStep);
        console.log('Current step set to:', nextStep);
        
        // Immediately save the new step to localStorage after state update
        // Use setTimeout to ensure this runs after React's state batching
        setTimeout(() => {
          const draftState = {
            propertyData,
            currentStep: nextStep
          };
          localStorage.setItem(draftKey, JSON.stringify(draftState));
          console.log('Saved new step to localStorage:', nextStep);
        }, 0);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Navigation Error",
        description: "An error occurred while trying to proceed. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentStep, validateCurrentStep, saveDraft, toast]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(async () => {
    console.log('goToPreviousStep called, current step:', currentStep);

    // Define the previous step mapping
    const prevStepMap: Record<WizardStep, WizardStep> = {
      "basic-info": "basic-info", // Stay on basic-info
      "location": "basic-info",
      "pricing": "basic-info",
      "details": "basic-info",
      "features": "pricing",
      "images": "features",
      "description": "images",
      "ai-summary": "description",
      "review": "ai-summary",
    };

    try {
      // Auto-save draft when moving between steps and wait for completion
      console.log('About to save draft before going back');
      await saveDraft();
      console.log('Draft saved before going back');
      
      // Always navigate backward even if save fails
      const prevStep = prevStepMap[currentStep];
      console.log('Moving to previous step:', prevStep);
      
      // Force the state update to be synchronous by using a timeout
      setTimeout(() => {
        setCurrentStep(prevStep);
        console.log('Current step set to:', prevStep);
      }, 0);
    } catch (error) {
      console.error("Navigation error:", error);
      // Still navigate backward even if save fails
      const prevStep = prevStepMap[currentStep];
      console.log('Moving to previous step (error path):', prevStep);
      
      setTimeout(() => {
        setCurrentStep(prevStep);
      }, 0);
    }
  }, [currentStep, saveDraft]);

  // Upload images
  const uploadImages = useCallback(
    async (files: File[]) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would upload these files to a server/cloud storage
        // and receive URLs back. For now, we'll simulate this by using local object URLs.
        const fileObjects = files.map((file) => ({
          file,
          url: URL.createObjectURL(file),
          name: file.name,
        }));
        
        // Update property data with the new images
        updatePropertyData({
          images: [...fileObjects],
        });
        
        return Promise.resolve();
      } catch (error) {
        console.error("Error uploading images:", error);
        toast({
          title: "Error",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        });
        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [updatePropertyData, toast]
  );

  const value = {
    currentStep,
    setCurrentStep,
    propertyData,
    updatePropertyData,
    resetPropertyData,
    saveDraft,
    publishProperty,
    isLoading,
    draftId,
    validateCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isStepValid,
    uploadImages,
    isSubmitting: createPropertyMutation.isPending || updatePropertyMutation.isPending,
  };

  return <PropertyWizardContext.Provider value={value}>{children}</PropertyWizardContext.Provider>;
};