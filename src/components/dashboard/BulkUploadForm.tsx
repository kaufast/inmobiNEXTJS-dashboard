import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  Check, 
  DownloadCloud, 
  Loader2, 
  UploadCloud, 
  X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ParsedProperty {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;
  listingType: string;
  isPremium: boolean;
  isVerified: boolean;
  status: string;
  images: string[];
  [key: string]: any;
}

export default function BulkUploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { t } = useTranslation(['dashboard', 'common']);

  // Mutation for uploading properties
  const uploadMutation = useMutation({
    mutationFn: async (properties: ParsedProperty[]) => {
      const res = await apiRequest("POST", "/api/properties/bulk", { properties, userId: user?.id });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      
      setUploadStatus('success');
      toast({
        title: t('premium.features.bulkUpload.messages.success.title'),
        description: t('premium.features.bulkUpload.messages.success.description', { count: data.inserted }),
      });
    },
    onError: (error: Error) => {
      setUploadStatus('error');
      toast({
        title: t('premium.features.bulkUpload.messages.error.title'),
        description: error.message || t('premium.features.bulkUpload.messages.error.default'),
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setValidationErrors({});
    setParsedData([]);
    setUploadStatus('idle');
  };

  // Parse CSV file
  const parseCSV = async () => {
    if (!file) return;

    try {
      setUploadStatus('processing');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n');
        if (rows.length < 2) {
          throw new Error(t('premium.features.bulkUpload.errors.emptyFile'));
        }

        const headers = rows[0].split(',').map(h => h.trim());
        const parsedProperties: ParsedProperty[] = [];
        const errors: Record<number, string[]> = {};

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const rowErrors: string[] = [];
          const values = rows[i].split(',').map(v => v.trim());
          const property: Partial<ParsedProperty> = {};
          
          headers.forEach((header, index) => {
            let value = values[index] || '';
            if (header === 'price' || header === 'bedrooms' || header === 'bathrooms' || 
                header === 'squareFeet' || header === 'lotSize') {
              const numValue = Number(value);
              if (isNaN(numValue) || numValue < 0) {
                rowErrors.push(t('premium.features.bulkUpload.errors.invalidNumber', { field: header, value }));
              } else {
                property[header] = numValue;
              }
            } 
            else if (header === 'isPremium' || header === 'isVerified') {
              property[header] = value.toLowerCase() === 'true';
            }
            else if (header === 'images' || header === 'features') {
              property[header] = value ? value.split(';').filter(item => item.trim()) : [];
            }
            else if (header === 'propertyType') {
              const validTypes = ['apartment', 'villa', 'penthouse', 'townhouse', 'office', 'retail', 'land'];
              if (!validTypes.includes(value)) {
                rowErrors.push(t('premium.features.bulkUpload.errors.invalidPropertyType', { value, types: validTypes.join(', ') }));
              } else {
                property[header] = value;
              }
            }
            else if (header === 'listingType') {
              const validTypes = ['buy', 'rent', 'sell'];
              if (!validTypes.includes(value)) {
                rowErrors.push(t('premium.features.bulkUpload.errors.invalidListingType', { value, types: validTypes.join(', ') }));
              } else {
                property[header] = value;
              }
            }
            else {
              property[header] = value;
            }
          });

          const requiredFields = ['title', 'price', 'address', 'propertyType', 'listingType'];
          requiredFields.forEach(field => {
            if (!property[field]) {
              rowErrors.push(t('premium.features.bulkUpload.errors.missingField', { field }));
            }
          });

          if (property.listingType && !['buy', 'rent', 'sell'].includes(property.listingType as string)) {
            rowErrors.push(t('premium.features.bulkUpload.errors.invalidListingType', { 
              value: property.listingType as string, 
              types: 'buy, rent, sell' 
            }));
          }

          if (rowErrors.length > 0) {
            errors[i] = rowErrors;
          }
          parsedProperties.push(property as ParsedProperty);
        }
        setParsedData(parsedProperties);
        setValidationErrors(errors);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setUploadStatus(Object.keys(errors).length ? 'error' : 'idle');
          }
        }, 100);
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: t('premium.features.bulkUpload.messages.parseError.title'),
        description: error instanceof Error ? error.message : t('premium.features.bulkUpload.messages.parseError.default'),
        variant: "destructive",
      });
      setUploadStatus('error');
    }
  };

  // Handle upload submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parsedData.length) {
      toast({
        title: t('premium.features.bulkUpload.messages.noData.title'),
        description: t('premium.features.bulkUpload.messages.noData.description'),
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(validationErrors).length) {
      toast({
        title: t('premium.features.bulkUpload.messages.validationError.title'),
        description: t('premium.features.bulkUpload.messages.validationError.description'),
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(parsedData);
  };

  // Download sample CSV template
  const downloadTemplate = () => {
    const headers = [
      'title', 'description', 'price', 'address', 'city', 'state', 'zipCode', 
      'country', 'bedrooms', 'bathrooms', 'squareFeet', 'lotSize', 'yearBuilt', 
      'propertyType', 'listingType', 'isPremium', 'isVerified', 'images'
    ];
    
    const sampleData = [
      'Luxury Beachfront Villa,Beautiful beachfront property with amazing views,1250000,123 Ocean Blvd,Miami,FL,33139,USA,4,3.5,3200,10000,2015,villa,buy,true,true,https://example.com/image1.jpg;https://example.com/image2.jpg',
      'Downtown Modern Apartment,Sleek modern apartment in the heart of downtown,2500,456 Main St Apt 7B,Chicago,IL,60601,USA,2,2,1200,0,2010,apartment,rent,false,true,https://example.com/image3.jpg'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'property_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasErrors = Object.keys(validationErrors).length > 0;
  const isProcessing = uploadStatus === 'processing' || uploadMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('premium.features.bulkUpload.title')}</CardTitle>
        <CardDescription>
          {t('premium.features.bulkUpload.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{t('premium.features.bulkUpload.downloadTemplate')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('premium.features.bulkUpload.useTemplateInstructions')}
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={downloadTemplate}
                className="gap-2"
              >
                <DownloadCloud className="h-4 w-4" />
                {t('premium.features.bulkUpload.downloadTemplateButton')}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{t('premium.features.bulkUpload.uploadFile')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('premium.features.bulkUpload.selectFileInstructions')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('csv-file')?.click()}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <UploadCloud className="h-4 w-4" />
                  {t('premium.features.bulkUpload.selectFileButton')}
                </Button>
                {file && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={parseCSV}
                    disabled={isProcessing}
                  >
                    {t('premium.features.bulkUpload.parseFileButton')}
                  </Button>
                )}
              </div>
            </div>
            
            {file && (
              <div className="py-2">
                <Badge variant="outline" className="text-xs">
                  {t('premium.features.bulkUpload.selectedFile')}: {file.name}
                </Badge>
              </div>
            )}
            
            {uploadStatus === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('premium.features.bulkUpload.processingFile')}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            {hasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('premium.features.bulkUpload.validation.validationErrors')}</AlertTitle>
                <AlertDescription>
                  {t('premium.features.bulkUpload.validation.fixErrorsBeforeUploading')}
                </AlertDescription>
              </Alert>
            )}
            
            {uploadStatus === 'success' && (
              <Alert variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                <Check className="h-4 w-4" />
                <AlertTitle>{t('premium.features.bulkUpload.uploadSuccessful')}</AlertTitle>
                <AlertDescription>
                  {t('premium.features.bulkUpload.propertiesSuccessfullyUploaded')}
                </AlertDescription>
              </Alert>
            )}
            
            {parsedData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">{t('premium.features.bulkUpload.previewData')}</h3>
                <div className="rounded-md border overflow-hidden max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>{t('general.title')}</TableHead>
                        <TableHead>{t('general.price')}</TableHead>
                        <TableHead>{t('general.type')}</TableHead>
                        <TableHead>{t('general.location')}</TableHead>
                        <TableHead className="w-24">{t('general.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((property, index) => {
                        const rowErrors = validationErrors[index + 1] || [];
                        const hasError = rowErrors.length > 0;
                        
                        return (
                          <TableRow key={index} className={hasError ? "bg-red-50" : ""}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{property.title || '-'}</TableCell>
                            <TableCell>
                              {property.price ? `$${property.price.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell>
                              {property.propertyType && property.listingType ? (
                                <Badge variant="outline">
                                  {property.propertyType}/{property.listingType}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {property.city && property.state 
                                ? `${property.city}, ${property.state}` 
                                : property.address || '-'}
                            </TableCell>
                            <TableCell>
                              {hasError ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <X className="h-3 w-3" />
                                  {t('premium.features.bulkUpload.validation.statusError')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  {t('premium.features.bulkUpload.validation.statusValid')}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {hasErrors && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-800 mb-2">{t('premium.features.bulkUpload.validation.validationErrors')}</h4>
                <div className="space-y-2">
                  {Object.entries(validationErrors).map(([row, errors]) => (
                    <div key={row} className="text-sm">
                      <strong>{t('premium.features.bulkUpload.validation.rowErrorDetails', { rowNumber: row })}</strong>
                      <ul className="list-disc pl-5 mt-1 text-red-700">
                        {errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 w-full gap-4">
          <div className="text-sm text-muted-foreground">
            {t('premium.features.bulkUpload.premiumFeatureNotice')}
          </div>
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => {
                setFile(null);
                setParsedData([]);
                setValidationErrors({});
                setUploadStatus('idle');
              }}
            >
              {t('actions.reset')}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isProcessing || 
                !parsedData.length || 
                hasErrors ||
                user?.subscriptionTier === 'free'
              }
              className="bg-[#131313]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('premium.features.bulkUpload.buttonLabels.uploading')}
                </>
              ) : (
                <>{t('premium.features.bulkUpload.buttonLabels.upload')}</>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}