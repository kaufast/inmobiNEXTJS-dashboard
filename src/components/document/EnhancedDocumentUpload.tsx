import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  uploadDocumentToCloudinary, 
  uploadDocumentsBulk,
  validateDocument,
  getAllowedFileTypes,
  getMaxFileSize,
  formatFileSize,
  getDocumentTypeIcon,
  requiresVerification,
  DOCUMENT_CONFIGS
} from '@/services/document-upload';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Shield,
  Eye,
  Download,
  FileCheck,
  Loader2
} from 'lucide-react';

export interface EnhancedDocumentUploadProps {
  propertyId?: number;
  onUploadComplete?: (documents: any[]) => void;
  maxFiles?: number;
  allowedDocumentTypes?: string[];
  defaultDocumentType?: string;
}

interface UploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
  documentType?: string;
}

export function EnhancedDocumentUpload({
  propertyId,
  onUploadComplete,
  maxFiles = 10,
  allowedDocumentTypes,
  defaultDocumentType = 'other'
}: EnhancedDocumentUploadProps) {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [selectedDocumentType, setSelectedDocumentType] = useState(defaultDocumentType);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');

  // Document type categories for better UX
  const documentCategories = {
    'Legal Documents': [
      'contract', 'purchase_agreement', 'listing_agreement', 'lease_agreement',
      'deed', 'legal_document', 'disclosure'
    ],
    'Financial Documents': [
      'mortgage_document', 'tax_document', 'insurance_policy', 'appraisal_report'
    ],
    'Property Reports': [
      'inspection_report', 'title_report', 'survey', 'floor_plan'
    ],
    'Permits & Certificates': [
      'permit', 'certificate', 'hoa_documents'
    ],
    'Media & Other': [
      'property_photos', 'other'
    ]
  };

  // Get allowed file types for current document type
  const allowedTypes = getAllowedFileTypes(selectedDocumentType);
  const maxFileSize = getMaxFileSize(selectedDocumentType);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[], rejectedFiles) => {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          let message = `${file.name}: ${error.message}`;
          if (error.code === 'file-too-large') {
            message = `${file.name}: File too large. Maximum size: ${formatFileSize(maxFileSize)}`;
          } else if (error.code === 'file-invalid-type') {
            message = `${file.name}: Invalid file type for ${selectedDocumentType}`;
          }
          toast({
            title: "Upload Error",
            description: message,
            variant: "destructive"
          });
        });
      });

      // Process accepted files
      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        ...file,
        id: Math.random().toString(36).substring(7),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        uploaded: false,
        documentType: selectedDocumentType
      }));

      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));

      // Auto-fill document name if only one file
      if (acceptedFiles.length === 1 && !documentName) {
        setDocumentName(acceptedFiles[0].name.split('.')[0]);
      }
    }, [selectedDocumentType, maxFiles, maxFileSize, documentName, toast]),
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: maxFiles - files.length,
    disabled: uploading
  });

  // Remove file from upload queue
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      // Revoke object URLs to prevent memory leaks
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  // Upload files
  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate all files first
      files.forEach(file => {
        validateDocument(file, file.documentType || selectedDocumentType);
      });

      const uploadedDocuments = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Update progress for this file
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress: 0 } : f
          ));

          // Upload the file
          const result = await uploadDocumentToCloudinary(
            file,
            file.documentType || selectedDocumentType,
            user.id,
            propertyId
          );

          // Mark file as uploaded
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress: 100, uploaded: true } : f
          ));

          uploadedDocuments.push({
            name: documentName || file.name,
            description: documentDescription,
            documentType: file.documentType || selectedDocumentType,
            filePath: result.fileUrl,
            fileSize: file.size,
            mimeType: file.type,
            metadata: result.metadata,
            thumbnailUrl: result.thumbnailUrl,
            previewUrl: result.previewUrl
          });

          // Update overall progress
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' } : f
          ));
        }
      }

      if (uploadedDocuments.length > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${uploadedDocuments.length} document(s)`
        });

        onUploadComplete?.(uploadedDocuments);
        
        // Reset form
        setFiles([]);
        setDocumentName('');
        setDocumentDescription('');
        setUploadProgress(0);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload documents',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Get document type display name
  const getDocumentTypeDisplayName = (type: string): string => {
    const nameMap: Record<string, string> = {
      'contract': 'Contract',
      'purchase_agreement': 'Purchase Agreement',
      'listing_agreement': 'Listing Agreement',
      'lease_agreement': 'Lease Agreement',
      'property_deed': 'Property Deed',
      'deed': 'Deed',
      'title_report': 'Title Report',
      'inspection_report': 'Inspection Report',
      'appraisal_report': 'Appraisal Report',
      'insurance_policy': 'Insurance Policy',
      'mortgage_document': 'Mortgage Document',
      'tax_document': 'Tax Document',
      'permit': 'Permit',
      'certificate': 'Certificate',
      'floor_plan': 'Floor Plan',
      'survey': 'Survey',
      'disclosure': 'Disclosure',
      'hoa_documents': 'HOA Documents',
      'property_photos': 'Property Photos',
      'legal_document': 'Legal Document',
      'other': 'Other'
    };
    return nameMap[type] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Document Upload</span>
        </CardTitle>
        <CardDescription>
          Upload real estate documents with automatic validation and secure storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(documentCategories).map(([category, types]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      {category}
                    </div>
                    {types
                      .filter(type => !allowedDocumentTypes || allowedDocumentTypes.includes(type))
                      .map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            <span>{getDocumentTypeIcon(type)}</span>
                            <span>{getDocumentTypeDisplayName(type)}</span>
                            {requiresVerification(type) && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Requires Verification
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{getDocumentTypeDisplayName(selectedDocumentType)}</strong>
              <br />
              Allowed types: {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              <br />
              Maximum size: {formatFileSize(maxFileSize)}
              {requiresVerification(selectedDocumentType) && (
                <>
                  <br />
                  <Badge variant="outline" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    This document type requires admin verification
                  </Badge>
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., Purchase Agreement - 123 Main St"
            />
          </div>
          <div>
            <Label htmlFor="documentDescription">Description (Optional)</Label>
            <Input
              id="documentDescription"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Brief description of the document"
            />
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              ) : (
                <Upload className="h-6 w-6 text-gray-600" />
              )}
            </div>
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Files to Upload ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {getDocumentTypeDisplayName(file.documentType || selectedDocumentType)}
                    </p>
                    
                    {file.progress !== undefined && file.progress > 0 && (
                      <Progress value={file.progress} className="mt-1" />
                    )}
                    
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.uploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : file.error ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : uploading ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading documents...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {files.length > 0 && (
              <>
                {files.length} file{files.length > 1 ? 's' : ''} selected
                {requiresVerification(selectedDocumentType) && (
                  <Badge variant="outline" className="ml-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Will require verification
                  </Badge>
                )}
              </>
            )}
          </div>
          
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || !documentName.trim()}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Documents'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedDocumentUpload; 