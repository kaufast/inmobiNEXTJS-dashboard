import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { insertPropertySchema } from "@shared/schema";
import { useTranslation } from "react-i18next";

// Simplified form schema
const propertyFormSchema = insertPropertySchema.pick({
  title: true,
  description: true,
  price: true,
  address: true,
  city: true,
  country: true,
  bedrooms: true,
  bathrooms: true,
  squareFeet: true,
  propertyType: true,
  listingType: true,
  features: true,
  isPremium: true,
  images: true,
}).extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be 0 or more"),
  squareFeet: z.coerce.number().min(1, "Square feet must be greater than 0"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
  const { t } = useTranslation('properties');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create form with default values
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      city: "Barcelona",
      propertyType: "apartment",
      listingType: "sell",
      isPremium: false,
      features: [],
      address: "",
      country: "Spain",
      images: [],
    }
  });
  
  // Property creation mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (newProperty: PropertyFormData) => {
      const response = await apiRequest("POST", "/api/properties", newProperty);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('add.success.title'),
        description: t('add.success.description'),
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('add.error.title'),
        description: t('add.error.description', { message: error.message || 'Unknown error' }),
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };

  // Common property features
  const propertyFeatures = [
    "Swimming Pool",
    "Near the Sea",
    "Balcony",
    "Air-conditioning",
    "Parking",
    "Gym",
    "Security System",
    "Garden",
    "Ocean Views",
    "Furnished",
    "Pet Friendly",
    "WiFi",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[80vh] overflow-auto bg-white border-2 border-red-500">
        <DialogHeader className="bg-blue-100 p-4">
          <DialogTitle className="text-xl font-bold text-red-600">TEST DIALOG</DialogTitle>
          <DialogDescription className="text-green-600">
            This is a test to see if the issue persists
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 bg-yellow-50">
          <div className="space-y-4">
            <div className="p-4 bg-white border border-gray-300 rounded">
              <label className="block text-sm font-medium mb-2">Test Title</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded bg-white"
                placeholder="Enter title here"
              />
            </div>
            
            <div className="p-4 bg-white border border-gray-300 rounded">
              <label className="block text-sm font-medium mb-2">Test Price</label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded bg-white"
                placeholder="Enter price"
              />
            </div>
            
            <div className="p-4 bg-white border border-gray-300 rounded">
              <label className="block text-sm font-medium mb-2">Test Description</label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded bg-white h-24"
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-6 mt-6 border-t-2 border-gray-300 bg-gray-50 p-4 rounded">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              TEST CANCEL
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              TEST SUBMIT
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}