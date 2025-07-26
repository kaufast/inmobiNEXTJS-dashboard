import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Shield, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface AgencyStepVerificationProps {
  wizard: {
    data: any;
    updateData: (data: any) => void;
    uploadFile: (file: File, type: 'logo' | 'document') => Promise<string>;
  };
}

export function AgencyStepVerification({ wizard }: AgencyStepVerificationProps) {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only PDF, JPG, or PNG files');
      return;
    }

    // Validate file sizes (10MB limit per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each file must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => wizard.uploadFile(file, 'document'));
      const urls = await Promise.all(uploadPromises);
      
      const currentDocs = wizard.data.verificationDocuments || [];
      const newDocs = urls.map((url, index) => ({
        url,
        name: files[index].name,
        type: files[index].type,
        uploadedAt: new Date().toISOString()
      }));
      
      wizard.updateData({ 
        verificationDocuments: [...currentDocs, ...newDocs] 
      });
      
      toast.success(`Successfully uploaded ${files.length} document(s)`);
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    const currentDocs = wizard.data.verificationDocuments || [];
    const updatedDocs = currentDocs.filter((_: any, i: number) => i !== index);
    wizard.updateData({ verificationDocuments: updatedDocs });
  };

  const handleTermsChange = (checked: boolean) => {
    wizard.updateData({ termsAccepted: checked });
    if (errors.termsAccepted) {
      setErrors(prev => ({ ...prev, termsAccepted: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!wizard.data.verificationDocuments?.length) {
      newErrors.verificationDocuments = 'At least one verification document is required';
    }
    
    if (!wizard.data.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const documents = wizard.data.verificationDocuments || [];

  return (
    <div className="p-8 space-y-6">
      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Verification Documents</span>
          </CardTitle>
          <CardDescription>
            Upload documents to verify your agency's legitimacy. This helps us maintain a trusted network 
            of professional real estate agencies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Documents List */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Required Documents (upload at least one):</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real estate license certificate</li>
              <li>• Business registration/incorporation documents</li>
              <li>• Professional liability insurance certificate</li>
              <li>• MLS membership certificate</li>
              <li>• Professional association membership (NAR, state association)</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {uploading ? 'Uploading...' : 'Upload verification documents'}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, JPG, PNG up to 10MB each
                    </span>
                  </label>
                  <input
                    id="document-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleDocumentUpload}
                    disabled={uploading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={uploading}
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {errors.verificationDocuments && (
              <p className="text-sm text-red-600">{errors.verificationDocuments}</p>
            )}
          </div>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Uploaded Documents:</h4>
              {documents.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Terms & Conditions</span>
          </CardTitle>
          <CardDescription>
            Please review and accept our terms to complete your agency registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={wizard.data.termsAccepted || false}
              onCheckedChange={handleTermsChange}
              className={errors.termsAccepted ? 'border-red-500' : ''}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the Terms of Service and Privacy Policy *
              </Label>
              <p className="text-xs text-gray-500">
                By checking this box, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-600">{errors.termsAccepted}</p>
          )}
        </CardContent>
      </Card>

      {/* Verification Process Info */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>What happens next?</strong> Once you submit your application, our team will review 
          your documents and verify your agency credentials. This process typically takes 2-3 business days. 
          You'll receive an email notification once your agency is approved and ready to start using the platform.
        </AlertDescription>
      </Alert>
    </div>
  );
} 