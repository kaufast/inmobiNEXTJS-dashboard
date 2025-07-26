import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AlertCircle, FileUp, Gift, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import PremiumFeatureWrapper from '../subscription/PremiumFeatureWrapper';

interface BulkUploadResponse {
  message: string;
  inserted: number;
  properties: any[];
  isFirstFreeUse?: boolean;
}

export function BulkPropertyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [hasUsedFreeUpload, setHasUsedFreeUpload] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation('common, properties');
  
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';

  // Check if user has already used their free upload
  useEffect(() => {
    const checkFreeUploadStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/bulk/upload-status");
        const data = await response.json();
        setHasUsedFreeUpload(data.hasUsedFreeUpload);
        setIsCheckingStatus(false);
      } catch (error) {
        console.error("Error checking free upload status:", error);
        setIsCheckingStatus(false);
      }
    };
    
    checkFreeUploadStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type (only CSV and JSON allowed)
      if (selectedFile.type !== 'text/csv' && selectedFile.type !== 'application/json') {
        toast({
          title: t('bulkUpload.toasts.invalidFileType.title'),
          description: t('bulkUpload.toasts.invalidFileType.description'),
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: t('bulkUpload.toasts.noFile.title'),
        description: t('bulkUpload.toasts.noFile.description'),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // API expects properties array in JSON format
      // Parse the file contents to create a proper payload
      const fileReader = new FileReader();
      
      // Create a Promise to handle the FileReader async operation
      const readFilePromise = new Promise<any[]>((resolve, reject) => {
        fileReader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            let properties: any[] = [];
            
            if (file.type === 'application/json') {
              // For JSON files, parse the content directly
              properties = JSON.parse(content);
            } else if (file.type === 'text/csv') {
              // For CSV files, convert to JSON objects
              // Basic CSV parser (can be expanded for more robust handling)
              const lines = content.split('\n');
              const headers = lines[0].split(',').map(h => h.trim());
              
              for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue; // Skip empty lines
                
                const values = lines[i].split(',').map(v => v.trim());
                const property: any = {};
                
                headers.forEach((header, index) => {
                  if (values[index] !== undefined) {
                    property[header] = values[index];
                  }
                });
                
                properties.push(property);
              }
            }
            
            resolve(properties);
          } catch (error) {
            reject(error);
          }
        };
        
        fileReader.onerror = () => reject(new Error('Error reading file'));
      });
      
      // Start reading the file
      if (file.type === 'application/json') {
        fileReader.readAsText(file);
      } else if (file.type === 'text/csv') {
        fileReader.readAsText(file);
      }
      
      // Wait for the file to be read and processed
      const properties = await readFilePromise;
      
      // Make the API request with the processed properties
      const response = await apiRequest("POST", "/api/properties/bulk", { properties });
      
      const result: BulkUploadResponse = await response.json();
      
      // The endpoint always returns status 201 on success, so we don't need to check a success flag
      setUploadSuccess(true);
      setUploadCount(result.inserted);
      
      if (result.isFirstFreeUse) {
        setHasUsedFreeUpload(true);
        // Invalidate user data to refresh subscription status
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        toast({
          title: t('bulkUpload.toasts.firstUploadComplete.title'),
          description: t('bulkUpload.toasts.firstUploadComplete.description', { count: result.inserted }),
          variant: "default",
        });
      } else {
        toast({
          title: t('bulkUpload.toasts.uploadSuccess.title'),
          description: t('bulkUpload.toasts.uploadSuccess.description', { count: result.inserted }),
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: t('bulkUpload.toasts.uploadFailed.title'),
        description: error.message || t('bulkUpload.toasts.uploadFailed.description'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // If user has premium or hasn't used free upload yet, show the bulk upload interface
  const canUseFeature = isPremium || !hasUsedFreeUpload;
  
  // Show different UI if user is non-premium but gets a free first use
  const renderContent = () => {
    if (isCheckingStatus) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!canUseFeature) {
      // User has used their free upload and is not premium
      return (
        <div className="text-center py-6 space-y-4">
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{t('bulkUpload.upgradeNeeded.title')}</h3>
            <p className="text-neutral-600 mb-4">
              {t('bulkUpload.upgradeNeeded.description')}
            </p>
            <Button 
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
              asChild
            >
              <Link href="/subscription">{t('bulkUpload.upgradeNeeded.button')}</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <>
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <div className="space-y-2">
            <p>{t('premium.features.bulkUpload.dragAndDrop')}</p>
            <Input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="max-w-xs mx-auto"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {t('premium.features.bulkUpload.maxFileSize')}
            </p>
          </div>
        </div>
        
        {file && (
          <div className="bg-muted p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileUp className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {t('bulkUpload.fileInfo', { size: (file.size / 1024).toFixed(2) })}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFile(null)}
            >
              {t('bulkUpload.remove')}
            </Button>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-green-800 font-medium">
              {t('bulkUpload.uploadSuccess', { count: uploadCount })}
            </p>
          </div>
        )}
        
        {!isPremium && !hasUsedFreeUpload && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <Gift className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">{t('bulkUpload.firstFreeUse.title')}</p>
                <p className="text-sm text-blue-700 mt-1">
                  {t('bulkUpload.firstFreeUse.description')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-amber-50 p-3 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">{t('premium.features.bulkUpload.formatRequirements.title')}</p>
              <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                <li>{t('premium.features.bulkUpload.formatRequirements.csvHeaders')}</li>
                <li>{t('premium.features.bulkUpload.formatRequirements.jsonArray')}</li>
                <li>{t('premium.features.bulkUpload.formatRequirements.requiredFields')}</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <PremiumFeatureWrapper 
      feature={t('premium.features.bulkUpload.title')}
      description={t('premium.features.bulkUpload.description')}
      showUpgradePrompt={!isPremium && hasUsedFreeUpload}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('premium.features.bulkUpload.title')}</CardTitle>
            <CardDescription>
              {t('premium.features.bulkUpload.description')}
            </CardDescription>
          </div>
          {!isPremium && !hasUsedFreeUpload && (
            <Badge className="bg-blue-600">
              {t('bulkUpload.firstFreeUse.badge')}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderContent()}
        </CardContent>
        {canUseFeature && (
          <CardFooter>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('premium.features.bulkUpload.buttonLabels.uploading', 'Uploading...')}
                </>
              ) : (
                t('premium.features.bulkUpload.buttonLabels.upload', 'Upload Properties')
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </PremiumFeatureWrapper>
  );
}

export default BulkPropertyUpload;