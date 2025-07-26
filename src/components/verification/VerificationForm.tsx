import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Building2, FileText, Loader2, ShieldCheck, User, CheckCircle, AlertCircle, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface VerificationFormProps {
  onSuccess: () => void;
}

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf']
};

// File validation utility
const validateFile = (file: File, t: any): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return t('verification.validation.fileSizeError');
  }
  
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return t('verification.validation.fileTypeError');
  }
  
  return null;
};

export function VerificationForm({ onSuccess }: VerificationFormProps) {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  
  const [verificationType, setVerificationType] = useState<'user' | 'agency'>('user');
  const [verificationMethod, setVerificationMethod] = useState<'didit' | 'manual'>('didit');
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const startVerificationMutation = useMutation({
    mutationFn: async (data: { type: 'user' | 'agency'; method: 'didit' | 'manual' }) => {
      const response = await apiRequest('POST', '/api/verification/start-verification', data);
      return response;
    },
    onSuccess: (data) => {
      if (verificationMethod === 'didit' && data.redirectUrl) {
        // Redirect to DIDiT verification process
        window.location.href = data.redirectUrl;
      } else {
        onSuccess?.();
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('verification.error.title'),
        description: error.message || t('verification.error.description'),
      });
    }
  });

  // Enhanced file validation
  const validateAllFiles = useCallback((): boolean => {
    const errors: string[] = [];
    setFileErrors({});
    
    if (verificationMethod === 'manual') {
      const requiredFiles = verificationType === 'user'
        ? ['government_id', 'proof_of_address']
        : ['business_registration', 'real_estate_license', 'business_address_proof', 'agent_id'];
      
      requiredFiles.forEach(fileType => {
        const file = files[fileType];
        if (!file) {
          const documentType = t(`verification.validation.documentTypes.${fileType}`);
          errors.push(t('verification.validation.fileRequired', { documentType }));
        } else {
          const validationError = validateFile(file, t);
          if (validationError) {
            setFileErrors(prev => ({ ...prev, [fileType]: validationError }));
            const documentType = t(`verification.validation.documentTypes.${fileType}`);
            errors.push(`${documentType}: ${validationError}`);
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [files, verificationType, verificationMethod]);

  // Enhanced file upload with progress tracking
  const uploadFileWithProgress = async (file: File, fileType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', fileType);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [fileType]: progress }));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));
          resolve();
        } else {
          reject(new Error(t('verification.validation.uploadError', { error: xhr.statusText })));
        }
      };
      
      xhr.onerror = () => reject(new Error(t('verification.validation.uploadError', { error: 'Network error' })));
      
      xhr.open('POST', '/api/verification/submit-documents');
      xhr.setRequestHeader('credentials', 'include');
      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all files before submission
    if (!validateAllFiles()) {
      toast({
        variant: "destructive",
        title: t('verification.error.title'),
        description: t('verification.validation.fixErrors'),
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress({});

    try {
      if (verificationMethod === 'manual') {
        // Get file inputs based on verification type
        const fileInputs = verificationType === 'user'
          ? ['government_id', 'proof_of_address']
          : ['business_registration', 'real_estate_license', 'business_address_proof', 'agent_id'];

        // Upload files with progress tracking
        const uploadPromises = fileInputs.map(async (fileType) => {
          const file = files[fileType];
          if (file) {
            await uploadFileWithProgress(file, fileType);
          }
        });
        
        await Promise.all(uploadPromises);

        // After all files uploaded successfully, start verification
        startVerificationMutation.mutate({
          type: verificationType,
          method: verificationMethod,
        });
      } else {
        // Start DIDiT verification
        startVerificationMutation.mutate({
          type: verificationType,
          method: verificationMethod
        });
      }
    } catch (error) {
      console.error('Error in verification submission:', error);
      toast({
        variant: "destructive",
        title: t('verification.error.title'),
        description: error instanceof Error ? error.message : t('verification.error.description'),
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  // Enhanced file handler with validation
  const handleFileChange = useCallback((fileType: string, file: File | null) => {
    if (!file) {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileType];
        return newFiles;
      });
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileType];
        return newErrors;
      });
      return;
    }
    
    const validationError = validateFile(file);
    if (validationError) {
      setFileErrors(prev => ({ ...prev, [fileType]: validationError }));
      return;
    }
    
    setFiles(prev => ({ ...prev, [fileType]: file }));
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileType];
      return newErrors;
    });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">{t('verification.form.type')}</h3>
        <RadioGroup
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          defaultValue={verificationType}
          onValueChange={(value) => setVerificationType(value as 'user' | 'agency')}
        >
          <div>
            <RadioGroupItem
              value="user"
              id="type-user"
              className="peer sr-only"
            />
            <Label
              htmlFor="type-user"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <User className="mb-3 h-6 w-6" />
              <p className="font-medium">{t('verification.form.user')}</p>
              <p className="text-sm text-muted-foreground text-center">
                {t('verification.form.user_description')}
              </p>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="agency"
              id="type-agency"
              className="peer sr-only"
            />
            <Label
              htmlFor="type-agency"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Building2 className="mb-3 h-6 w-6" />
              <p className="font-medium">{t('verification.form.agency')}</p>
              <p className="text-sm text-muted-foreground text-center">
                {t('verification.form.agency_description')}
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">{t('verification.form.method')}</h3>
        <RadioGroup
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          defaultValue={verificationMethod}
          onValueChange={(value) => setVerificationMethod(value as 'didit' | 'manual')}
        >
          <div>
            <RadioGroupItem
              value="didit"
              id="method-didit"
              className="peer sr-only"
            />
            <Label
              htmlFor="method-didit"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <ShieldCheck className="mb-3 h-6 w-6" />
              {t('verification.form.digital')}
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="manual"
              id="method-manual"
              className="peer sr-only"
            />
            <Label
              htmlFor="method-manual"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <FileText className="mb-3 h-6 w-6" />
              {t('verification.form.manual')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {verificationMethod === 'manual' && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('verification.form.documents')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verificationType === 'user' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="government_id">{t('verification.form.government_id')}</Label>
                  <Input
                    id="government_id"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('government_id', file);
                    }}
                  />
                  {fileErrors.government_id && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.government_id}
                    </div>
                  )}
                  {files.government_id && !fileErrors.government_id && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.government_id.name} ({Math.round(files.government_id.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.government_id !== undefined && (
                    <Progress value={uploadProgress.government_id} className="h-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proof_of_address">{t('verification.form.proof_of_address')}</Label>
                  <Input
                    id="proof_of_address"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('proof_of_address', file);
                    }}
                  />
                  {fileErrors.proof_of_address && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.proof_of_address}
                    </div>
                  )}
                  {files.proof_of_address && !fileErrors.proof_of_address && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.proof_of_address.name} ({Math.round(files.proof_of_address.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.proof_of_address !== undefined && (
                    <Progress value={uploadProgress.proof_of_address} className="h-2" />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_registration">{t('verification.form.business_registration')}</Label>
                  <Input
                    id="business_registration"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('business_registration', file);
                    }}
                  />
                  {fileErrors.business_registration && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.business_registration}
                    </div>
                  )}
                  {files.business_registration && !fileErrors.business_registration && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.business_registration.name} ({Math.round(files.business_registration.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.business_registration !== undefined && (
                    <Progress value={uploadProgress.business_registration} className="h-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="real_estate_license">{t('verification.form.real_estate_license')}</Label>
                  <Input
                    id="real_estate_license"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('real_estate_license', file);
                    }}
                  />
                  {fileErrors.real_estate_license && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.real_estate_license}
                    </div>
                  )}
                  {files.real_estate_license && !fileErrors.real_estate_license && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.real_estate_license.name} ({Math.round(files.real_estate_license.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.real_estate_license !== undefined && (
                    <Progress value={uploadProgress.real_estate_license} className="h-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address_proof">{t('verification.form.business_address_proof')}</Label>
                  <Input
                    id="business_address_proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('business_address_proof', file);
                    }}
                  />
                  {fileErrors.business_address_proof && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.business_address_proof}
                    </div>
                  )}
                  {files.business_address_proof && !fileErrors.business_address_proof && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.business_address_proof.name} ({Math.round(files.business_address_proof.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.business_address_proof !== undefined && (
                    <Progress value={uploadProgress.business_address_proof} className="h-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_id">{t('verification.form.agent_id')}</Label>
                  <Input
                    id="agent_id"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('agent_id', file);
                    }}
                  />
                  {fileErrors.agent_id && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fileErrors.agent_id}
                    </div>
                  )}
                  {files.agent_id && !fileErrors.agent_id && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {files.agent_id.name} ({Math.round(files.agent_id.size / 1024)}KB)
                    </div>
                  )}
                  {uploadProgress.agent_id !== undefined && (
                    <Progress value={uploadProgress.agent_id} className="h-2" />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('verification.form.submitting')}
          </>
        ) : (
          t('verification.form.submit')
        )}
      </Button>
    </form>
  );
}