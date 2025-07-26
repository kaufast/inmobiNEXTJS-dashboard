import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { X, Upload } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumFeatureWrapper from "@/components/subscription/PremiumFeatureWrapper";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Country configurations from wizard
const countryConfigurations = {
  US: { name: "USA" },
  GB: { name: "United Kingdom" },
  MX: { name: "Mexico" },
  ES: { name: "Spain" },
  DE: { name: "Germany" },
  AT: { name: "Austria" },
};

// Helper function to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

// Define a simpler schema without extending
const propertyFormSchema = z.object({
  title: z.string().min(5, "property.add.validation.titleMinLength"),
  description: z.string().min(0, "property.add.validation.descriptionMinLength"),
  price: z.coerce.number().min(1, "property.add.validation.priceMin"),
  bedrooms: z.coerce.number().min(0, "property.add.validation.bedroomsMin"),
  bathrooms: z.coerce.number().min(0, "property.add.validation.bathroomsMin"),
  squareFeet: z.coerce.number().min(1, "property.add.validation.squareFeetMin"),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  propertyType: z.string(),
  listingType: z.string(),
  isPremium: z.boolean(),
  isVirtual: z.boolean(),
  features: z.array(z.string()),
  images: z.array(z.string()),
  featureImage: z.string().optional(),
  ownerId: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation(['properties', 'common']);
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  // Local state for sliders
  const [priceValue, setPriceValue] = useState<number[]>([250000]);
  const [bedroomValue, setBedroomValue] = useState<number[]>([2]);
  const [bathroomValue, setBathroomValue] = useState<number[]>([2]);
  const [squareFeetValue, setSquareFeetValue] = useState<number[]>([1000]);

  console.log('🔍 [EditPropertyPage] Component render with id:', id);

  // Fetch existing property data
  const { data: property, isLoading: isLoadingProperty, isError: isPropertyError } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: async () => {
      console.log('🔍 [EditPropertyPage] Making API call to:', `/api/properties/${id}`);
      try {
        const res = await apiRequest('GET', `/api/properties/${id}`);
        console.log('🔍 [EditPropertyPage] API response status:', res.status);
        const data = await res.json();
        console.log('🔍 [EditPropertyPage] API response data:', data);
        return data;
      } catch (error) {
        console.error('❌ [EditPropertyPage] API call failed:', error);
        throw error;
      }
    },
    enabled: !!id,
  });

  // Debug query states
  console.log('🔍 [EditPropertyPage] Query states:', {
    isLoading: isLoadingProperty,
    isError: isPropertyError,
    hasProperty: !!property,
    propertyId: property?.id
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      address: "",
      city: "",
      state: "",
      country: "",
      propertyType: "",
      listingType: "",
      isPremium: false,
      isVirtual: false,
      features: [],
      images: [],
      featureImage: "",
    },
  });

  console.log('🔍 [EditPropertyPage] Form object created:', { formId: form.formState?.dirtyFields ? 'initialized' : 'not-initialized' });

  // Update form when property data loads
  useEffect(() => {
    console.log('🏠 [EditPropertyPage] Property effect triggered with property:', !!property);
    if (property) {
      console.log('🏠 [EditPropertyPage] Resetting form with property data:', {
        id: property.id,
        title: property.title,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size
      });
      
      form.reset({
        title: property.title || "",
        description: property.description || "",
        price: property.price || 0,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        squareFeet: property.size || 0,
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        country: property.country || "",
        propertyType: property.propertyType || "",
        listingType: property.listingType || "",
        isPremium: property.isPremium || false,
        isVirtual: property.isVirtual || false,
        features: Array.isArray(property.features) ? property.features : [],
        images: Array.isArray(property.images) 
          ? property.images.map(img => typeof img === 'string' ? img : img.url || img.src || img)
          : [],
        featureImage: property.featureImage || "",
      });
      setUploadedImages(Array.isArray(property.images) ? property.images : []);
      // Initialize slider values
      console.log('🎚️ [EditPropertyPage] Setting slider values from property data');
      setPriceValue([property.price || 250000]);
      setBedroomValue([property.bedrooms || 2]);
      setBathroomValue([property.bathrooms || 2]);
      setSquareFeetValue([property.size || 1000]);
    }
  }, [property]);

  // Sync uploadedImages with form whenever images change
  useEffect(() => {
    console.log('🖼️ [EditPropertyPage] Syncing uploaded images with form:', uploadedImages.length);
    const imageUrls = uploadedImages.map(img => 
      typeof img === 'string' ? img : img.url || img.src || img
    );
    form.setValue('images', imageUrls, { shouldValidate: true, shouldDirty: true });
  }, [uploadedImages, form]);

  // Sync sliders with form (with controlled re-rendering)
  useEffect(() => {
    console.log('🔄 [EditPropertyPage] Price slider effect triggered:', priceValue[0]);
    form.setValue('price', priceValue[0], { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [priceValue]);

  useEffect(() => {
    console.log('🔄 [EditPropertyPage] Bedroom slider effect triggered:', bedroomValue[0]);
    form.setValue('bedrooms', bedroomValue[0], { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [bedroomValue]);

  useEffect(() => {
    console.log('🔄 [EditPropertyPage] Bathroom slider effect triggered:', bathroomValue[0]);
    form.setValue('bathrooms', bathroomValue[0], { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [bathroomValue]);

  useEffect(() => {
    console.log('🔄 [EditPropertyPage] SquareFeet slider effect triggered:', squareFeetValue[0]);
    form.setValue('squareFeet', squareFeetValue[0], { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [squareFeetValue]);

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      console.log('🔥 [EditPropertyPage] Mutation triggered with data:', data);
      console.log('🔥 [EditPropertyPage] API URL:', `/api/properties/${id}`);
      const res = await apiRequest('PUT', `/api/properties/${id}`, {
        ...data,
        images: uploadedImages,
        size: data.squareFeet,
      });
      console.log('🔥 [EditPropertyPage] API response status:', res.status);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('property.edit.success.title'),
        description: t('property.edit.success.description'),
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['my-properties', user?.id] });
      setLocation('/dashboard/properties');
    },
    onError: (error: any) => {
      console.error('❌ [EditPropertyPage] Update failed:', error);
      
      let errorMessage = t('property.edit.error.description');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle Zod validation errors
        const validationErrors = error.response.data.errors.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        errorMessage = `Validation errors:\n${validationErrors}`;
      }
      
      toast({
        title: t('property.edit.error.title'),
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Longer duration for detailed error messages
      });
    },
  });

  // Handle adding new images via Cloudinary
  const handleAddImage = () => {
    // Create a temporary Cloudinary widget instance for adding images
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dlenyoj86',
          uploadPreset: 'property_images',
          multiple: false,
          maxFiles: 1,
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return;
          }
          
          if (result.event === 'success') {
            console.log('🖼️ [EditPropertyPage] New image uploaded:', result.info.secure_url);
            const newImage = {
              id: result.info.public_id,
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };
            
            // Add to uploaded images array
            setUploadedImages(prev => [...prev, newImage]);
          }
        }
      );
      
      widget.open();
    } else {
      console.error('Cloudinary widget not available');
    }
  };

  const onSubmit = (data: PropertyFormData) => {
    console.log('🚀 [EditPropertyPage] Form submitted with data:', data);
    console.log('🚀 [EditPropertyPage] Slider values:', {
      price: priceValue[0],
      bedrooms: bedroomValue[0], 
      bathrooms: bathroomValue[0],
      squareFeet: squareFeetValue[0]
    });
    updateMutation.mutate(data);
  };

  const availableFeatures = [
    "parking", "balcony", "garden", "swimming_pool", "gym", "security",
    "elevator", "furnished", "air_conditioning", "heating", "fireplace",
    "dishwasher", "washing_machine", "dryer", "internet", "cable_tv"
  ];

  if (isLoadingProperty) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4 text-muted-foreground">{t('common.loading')}</p>
          <div className="mt-4 text-xs text-muted-foreground">
            Debug: Loading property ID: {id}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isPropertyError || !property) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">Property Not Found</h3>
          <p className="text-muted-foreground mb-4">The property you're trying to edit could not be found.</p>
          <div className="mb-4 text-xs text-muted-foreground space-y-1">
            <div>Debug Info:</div>
            <div>• Property ID: {id}</div>
            <div>• Is Error: {isPropertyError ? 'Yes' : 'No'}</div>
            <div>• Has Property: {!!property ? 'Yes' : 'No'}</div>
            <div>• User ID: {user?.id}</div>
          </div>
          <Button onClick={() => setLocation('/dashboard/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="ml-[10px]">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard/properties')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t('property.edit.title')}</h2>
            <p className="text-muted-foreground">
              {t('property.edit.description')}
            </p>
          </div>
          <div className="mr-[10px]">
            <ReportIssueButton />
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('property.edit.form.title')}</CardTitle>
            <CardDescription>
              {t('property.edit.form.description')}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('property.add.sections.basic')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('property.add.fields.title')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('property.add.fields.description')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>{t('property.add.fields.price')}</FormLabel>
                            <span className="font-medium">{formatPrice(priceValue[0])}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={50000}
                              max={5000000}
                              step={10000}
                              value={priceValue}
                              onValueChange={setPriceValue}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>$50,000</span>
                            <span>$5,000,000</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>{t('property.add.fields.squareFeet')}</FormLabel>
                            <span className="font-medium">{squareFeetValue[0].toLocaleString()} sq ft</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={100}
                              max={10000}
                              step={50}
                              value={squareFeetValue}
                              onValueChange={setSquareFeetValue}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>100 sq ft</span>
                            <span>10,000 sq ft</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>{t('property.add.fields.bedrooms')}</FormLabel>
                            <span className="font-medium">{bedroomValue[0]} bedroom{bedroomValue[0] !== 1 ? 's' : ''}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={bedroomValue}
                              onValueChange={setBedroomValue}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Studio</span>
                            <span>10+ bedrooms</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>{t('property.add.fields.bathrooms')}</FormLabel>
                            <span className="font-medium">{bathroomValue[0]} bathroom{bathroomValue[0] !== 1 ? 's' : ''}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={bathroomValue}
                              onValueChange={setBathroomValue}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 bathroom</span>
                            <span>10+ bathrooms</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('property.add.sections.location')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('property.add.fields.address')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('property.add.fields.city')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('property.add.fields.state')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('property.add.fields.country')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(countryConfigurations).map(([code, config]) => (
                                <SelectItem key={code} value={config.name}>
                                  {config.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('property.add.sections.details')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('property.add.fields.propertyType')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">{t('property.types.apartment')}</SelectItem>
                              <SelectItem value="house">{t('property.types.house')}</SelectItem>
                              <SelectItem value="condo">{t('property.types.condo')}</SelectItem>
                              <SelectItem value="townhouse">{t('property.types.townhouse')}</SelectItem>
                              <SelectItem value="villa">{t('property.types.villa')}</SelectItem>
                              <SelectItem value="studio">{t('property.types.studio')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('property.add.fields.listingType')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rent">{t('property.listingTypes.rent')}</SelectItem>
                              <SelectItem value="sale">{t('property.listingTypes.sale')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('property.add.sections.features')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('property.add.fields.features')}</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {availableFeatures.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        className="data-[state=checked]:bg-black data-[state=checked]:text-white border-gray-300"
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, feature])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== feature
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {t(`property.features.${feature}`)}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('property.add.sections.images')}</h3>
                  
                  <PropertyImageCarousel
                    images={uploadedImages}
                    onImagesChange={setUploadedImages}
                    onAddImage={handleAddImage}
                    maxImages={10}
                  />
                </div>

                {/* Premium Features */}
                <PremiumFeatureWrapper>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('property.add.sections.premium')}</h3>
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="isPremium"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t('property.add.fields.isPremium')}
                              </FormLabel>
                              <FormDescription>
                                {t('property.add.fields.isPremiumDescription')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isVirtual"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t('property.add.fields.isVirtual')}
                              </FormLabel>
                              <FormDescription>
                                {t('property.add.fields.isVirtualDescription')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </PremiumFeatureWrapper>
              </CardContent>
              <CardFooter>
                {/* Debug: Form validation state */}
                {console.log('🔍 [EditPropertyPage] Form state before submit:', {
                  isValid: form.formState.isValid,
                  errors: form.formState.errors,
                  isSubmitting: form.formState.isSubmitting,
                  isDirty: form.formState.isDirty
                })}
                {console.log('🚨 [EditPropertyPage] DETAILED ERRORS:', JSON.stringify(form.formState.errors, null, 2))}
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="w-full"
                  onClick={() => console.log('🔍 [EditPropertyPage] Submit button clicked!')}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('property.edit.submit')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}