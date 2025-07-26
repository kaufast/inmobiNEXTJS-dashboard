import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { X, Upload } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumFeatureWrapper from "@/components/subscription/PremiumFeatureWrapper";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CloudinaryWidgetUploader from "@/components/property/CloudinaryWidgetUploader";

// Define a simpler schema without extending
const propertyFormSchema = z.object({
  title: z.string().min(5, "property.add.validation.titleMinLength"),
  description: z.string().min(20, "property.add.validation.descriptionMinLength"),
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

// Constants for image limits
const MAX_IMAGES_TOTAL = 12; 
const MAX_IMAGES_PER_UPLOAD = 5;

export default function AddPropertyPage() {
  const { t } = useTranslation(['properties', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated and has the correct role
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    } else if (user.role !== "agent" && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Return null if user doesn't have permission
  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    return null;
  }
  
  // Common property features
  const propertyFeatures = [
    t('add.features.swimmingPool'),
    t('add.features.nearSea'),
    t('add.features.balcony'),
    t('add.features.airConditioning'),
    t('add.features.parking'),
    t('add.features.gym'),
    t('add.features.securitySystem'),
    t('add.features.garden'),
    t('add.features.oceanViews'),
    t('add.features.furnished'),
    t('add.features.petFriendly'),
    t('add.features.wifi'),
  ];
  
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
      address: "",
      city: "Barcelona",
      country: "Spain",
      propertyType: "apartment",
      listingType: "sell",
      isPremium: false,
      isVirtual: false,
      features: [],
      images: ["/images/apartment-interior.jpg"],
      featureImage: "",
      ownerId: user?.id?.toString(),
    }
  });
  
  // Property creation mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (newProperty: PropertyFormData) => {
      const response = await apiRequest("POST", "/api/properties", newProperty);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('add.success.title'),
        description: t('add.success.description'),
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      form.reset();
      setLocation("/dashboard/properties");
    },
    onError: (error) => {
      toast({
        title: t('add.error.title'),
        description: t('add.error.description', { message: error.message }),
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('add.title')}</h1>
            <p className="text-muted-foreground">
              {t('add.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <ReportIssueButton 
              context={t('add.title')} 
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313]"
              variant="default"
            />
            <Button variant="outline" onClick={() => setLocation("/dashboard/properties")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t('add.backToProperties')}
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('add.title')}</CardTitle>
            <CardDescription>
              {t('add.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.basicInfo.title')}</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.titleLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('add.basicInfo.titlePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.priceLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('add.basicInfo.pricePlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('add.basicInfo.descriptionLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('add.basicInfo.descriptionPlaceholder')}
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.location.title')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('add.location.addressLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('add.location.addressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.location.cityLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('add.location.cityPlaceholder')} {...field} />
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
                          <FormLabel>{t('add.location.stateLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('add.location.statePlaceholder')} {...field} />
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
                          <FormLabel>{t('add.basicInfo.countryLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('add.basicInfo.countryPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.basicInfo.title')}</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.propertyTypeLabel')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('add.propertyTypeSelectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="apartment">{t('propertyTypes.apartment')}</SelectItem>
                                <SelectItem value="villa">{t('propertyTypes.villa')}</SelectItem>
                                <SelectItem value="penthouse">{t('propertyTypes.penthouse')}</SelectItem>
                                <SelectItem value="townhouse">{t('propertyTypes.townhouse')}</SelectItem>
                                <SelectItem value="office">{t('propertyTypes.office', { ns: 'properties'})}</SelectItem>
                                <SelectItem value="retail">{t('propertyTypes.retail', { ns: 'properties'})}</SelectItem>
                                <SelectItem value="land">{t('propertyTypes.land')}</SelectItem>
                                <SelectItem value="house">{t('propertyTypes.house')}</SelectItem>
                                <SelectItem value="studio">{t('propertyTypes.studio')}</SelectItem>
                                <SelectItem value="commercial">{t('propertyTypes.commercial')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.listingTypeLabel')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('add.listingTypeSelectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="buy">{t('listingTypes.sale')}</SelectItem> 
                                <SelectItem value="rent">{t('listingTypes.rent')}</SelectItem>
                                <SelectItem value="sell">{t('listingTypes.selling')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.bedroomsLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('add.basicInfo.bedroomsPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.bathroomsLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('add.basicInfo.bathroomsPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('add.basicInfo.squareFeetLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('add.basicInfo.squareFeetPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.features.title')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {propertyFeatures.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={feature}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, feature])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== feature
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {feature}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel>{t('add.premium.title')}</FormLabel>
                            <FormDescription>
                              {t('add.premium.benefits')}
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
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel>{t('add.virtual.title')}</FormLabel>
                            <FormDescription>
                              {t('add.virtual.benefits')}
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
                
                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.images.title')}</h3>
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('add.images.label')}</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {field.value?.length > 0 ? (
                              <>
                                {field.value.map((file: File, index: number) => (
                                  <div key={index} className="relative border rounded-md overflow-hidden h-40">
                                    <img 
                                      src={URL.createObjectURL(file)}
                                      alt={`Upload ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => {
                                        const newFiles = [...field.value];
                                        newFiles.splice(index, 1);
                                        field.onChange(newFiles);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <div className="absolute bottom-2 left-2 bg-white/80 rounded-full px-2 py-1 text-xs font-medium">
                                      {index + 1}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Display count of images */}
                                <div className="col-span-full mt-2 mb-2 text-sm">
                                  <span className={field.value.length >= MAX_IMAGES_TOTAL ? "text-red-500 font-medium" : ""}>
                                    {t('add.images.imagesCount', { 
                                      current: field.value.length, 
                                      max: MAX_IMAGES_TOTAL 
                                    })}
                                  </span>
                                </div>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-full min-h-[150px] flex flex-col gap-2 border-dashed"
                                  onClick={() => {
                                    // Don't allow more uploads if already at max
                                    if (field.value.length >= MAX_IMAGES_TOTAL) {
                                      toast({
                                        title: t('add.images.tooManyImages'),
                                        description: t('add.images.maxImagesReached', { max: MAX_IMAGES_TOTAL }),
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.multiple = true;
                                    input.onchange = (e) => {
                                      const files = Array.from((e.target as HTMLInputElement).files || []);
                                      // Limit to max 5 files per upload
                                      const filesToAdd = files.slice(0, MAX_IMAGES_PER_UPLOAD);
                                      // Check if adding would exceed total limit
                                      const newTotal = field.value.length + filesToAdd.length;
                                      if (newTotal > MAX_IMAGES_TOTAL) {
                                        const availableSlots = MAX_IMAGES_TOTAL - field.value.length;
                                        const addingCount = Math.min(availableSlots, filesToAdd.length);
                                        const newImages = [...field.value, ...filesToAdd.slice(0, addingCount)];
                                        field.onChange(newImages);
                                        
                                        toast({
                                          title: t('add.images.partialUpload'),
                                          description: t('add.images.reachedLimitAdded', { 
                                            added: addingCount,
                                            remaining: 0
                                          }),
                                          variant: "warning"
                                        });
                                      } else {
                                        const newImages = [...field.value, ...filesToAdd];
                                        field.onChange(newImages);
                                        
                                        if (filesToAdd.length < files.length) {
                                          toast({
                                            title: t('add.images.tooManySelected'),
                                            description: t('add.images.onlyAdding', { 
                                              count: filesToAdd.length,
                                              max: MAX_IMAGES_PER_UPLOAD
                                            }),
                                            variant: "warning"
                                          });
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  disabled={field.value.length >= MAX_IMAGES_TOTAL}
                                >
                                  <Upload className="h-8 w-8" />
                                  <span>{t('add.images.addMore')}</span>
                                  {field.value.length >= MAX_IMAGES_TOTAL && (
                                    <span className="text-xs text-red-500">
                                      {t('add.images.maxReached')}
                                    </span>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="col-span-full h-40 flex flex-col gap-2 border-dashed"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.multiple = true;
                                  input.onchange = (e) => {
                                    const files = Array.from((e.target as HTMLInputElement).files || []);
                                    // Limit to max 5 files per upload, and max 12 total
                                    const filesToAdd = files.slice(0, Math.min(MAX_IMAGES_PER_UPLOAD, MAX_IMAGES_TOTAL));
                                    field.onChange(filesToAdd);
                                    
                                    if (files.length > MAX_IMAGES_PER_UPLOAD) {
                                      toast({
                                        title: t('add.images.tooManySelected'),
                                        description: t('add.images.onlyAdding', { 
                                          count: filesToAdd.length,
                                          max: MAX_IMAGES_PER_UPLOAD
                                        }),
                                        variant: "warning"
                                      });
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                <Upload className="h-10 w-10" />
                                <span>{t('add.images.upload')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {t('add.images.formatHint')}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {t('add.images.uploadLimit', { 
                                    per: MAX_IMAGES_PER_UPLOAD, 
                                    total: MAX_IMAGES_TOTAL 
                                  })}
                                </span>
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t('add.images.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Feature Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('add.images.featureImageSectionTitle')}</h3>
                  <FormField
                    control={form.control}
                    name="featureImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('add.images.selectFeatureImageLabel')}</FormLabel>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <CloudinaryWidgetUploader
                              onUploadSuccess={(url, info) => {
                                field.onChange(url);
                                toast({
                                  title: t('add.images.featureImageUploadSuccessTitle'),
                                  description: t('add.images.featureImageUploadSuccessDesc'),
                                });
                              }}
                              onUploadError={(error) => {
                                toast({
                                  title: t('add.images.featureImageUploadErrorTitle'),
                                  description: t('add.images.featureImageUploadErrorDesc'),
                                  variant: "destructive",
                                });
                              }}
                              buttonText={t('add.images.featureImageUploadButtonText')}
                              className="w-full py-2 px-4 bg-[#131313] text-white hover:bg-gray-800 rounded-md"
                            />
                          </div>
                          
                          {field.value && (
                            <div className="relative w-full md:w-64 h-48 border rounded-md overflow-hidden">
                              <img 
                                src={field.value} 
                                alt={t('add.images.featureImageAlt')} 
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => field.onChange("")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormDescription>
                          {t('add.images.featureImageDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#131313] text-white hover:bg-white hover:text-[#131313]"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('add.buttons.creating')}
                      </>
                    ) : (
                      t('add.buttons.createProperty')
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}