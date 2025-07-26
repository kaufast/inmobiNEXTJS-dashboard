/**
 * Main Bulk Property Upload Component
 */

import React, { useState, useCallback } from 'react';
import { PropertyRow, parseFile, validateProperties, ParsedData } from '@/lib/csv-parser';
import { PropertyPreviewGrid } from './PropertyPreviewGrid';
import { AmenitiesModal, PropertyAmenities } from './AmenitiesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download,
  RefreshCw,
  Settings,
  Database,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface BulkPropertyUploadProps {
  className?: string;
  onUploadComplete?: (result: { uploaded: number; skipped: number }) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  stage: 'idle' | 'parsing' | 'validating' | 'saving' | 'completed' | 'error';
  error?: string;
}

export function BulkPropertyUpload({ className, onUploadComplete }: BulkPropertyUploadProps) {
  const { toast } = useToast();
  
  // File and parsing state
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: 'idle'
  });
  
  // Selection and amenities state
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<PropertyAmenities[]>([]);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = uploadedFile.name.toLowerCase().substring(uploadedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setFile(uploadedFile);
    setUploadState({ isUploading: true, progress: 10, stage: 'parsing' });

    try {
      // Parse file
      const parsedProperties = await parseFile(uploadedFile);
      setUploadState({ isUploading: true, progress: 50, stage: 'validating' });

      // Validate properties
      const validationResult = validateProperties(parsedProperties);
      
      setUploadState({ isUploading: false, progress: 100, stage: 'completed' });
      setParsedData(validationResult);
      setProperties(validationResult.properties);

      toast({
        title: "File processed successfully",
        description: `Found ${validationResult.totalRows} properties. ${validationResult.validRows} valid, ${validationResult.invalidRows} invalid.`
      });

    } catch (error) {
      setUploadState({ 
        isUploading: false, 
        progress: 0, 
        stage: 'error',
        error: error instanceof Error ? error.message : 'Failed to process file'
      });
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle property changes from preview grid
  const handlePropertiesChange = useCallback((updatedProperties: PropertyRow[]) => {
    setProperties(updatedProperties);
    
    // Update parsed data
    if (parsedData) {
      const validationResult = validateProperties(updatedProperties);
      setParsedData(validationResult);
    }
  }, [parsedData]);

  // Handle amenities modal
  const handleOpenAmenities = useCallback((propertyIds: string[]) => {
    setSelectedPropertyIds(propertyIds);
    setIsAmenitiesModalOpen(true);
  }, []);

  const handleSaveAmenities = useCallback((amenities: PropertyAmenities[]) => {
    setPropertyAmenities(amenities);
    
    toast({
      title: "Amenities saved",
      description: `Updated amenities for ${amenities.length} properties`
    });
  }, [toast]);

  // Handle final upload to server
  const handleUploadToServer = useCallback(async () => {
    if (!parsedData || parsedData.validRows === 0) {
      toast({
        title: "No valid properties",
        description: "Please ensure you have at least one valid property to upload",
        variant: "destructive"
      });
      return;
    }

    setUploadState({ isUploading: true, progress: 0, stage: 'saving' });

    try {
      const validProperties = properties.filter(p => p.isValid);
      
      const uploadData = {
        properties: validProperties,
        amenities: propertyAmenities
      };

      const response = await fetch('/api/bulk-upload/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadState({ isUploading: false, progress: 100, stage: 'completed' });
      
      toast({
        title: "Upload completed",
        description: `Successfully uploaded ${result.data.uploaded} properties`
      });

      // Reset state
      setFile(null);
      setParsedData(null);
      setProperties([]);
      setPropertyAmenities([]);
      setSelectedPropertyIds([]);

      // Callback to parent
      if (onUploadComplete) {
        onUploadComplete(result.data);
      }

    } catch (error) {
      setUploadState({ 
        isUploading: false, 
        progress: 0, 
        stage: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive"
      });
    }
  }, [parsedData, properties, propertyAmenities, toast, onUploadComplete]);

  // Download template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/bulk-upload/template');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get template');
      }

      // Create CSV content
      const csvContent = [
        result.data.headers.join(','),
        ...result.data.sampleData.map((row: string[]) => row.join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk-upload-template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'Failed to download template',
        variant: "destructive"
      });
    }
  }, [toast]);

  // Reset form
  const handleReset = useCallback(() => {
    setFile(null);
    setParsedData(null);
    setProperties([]);
    setPropertyAmenities([]);
    setSelectedPropertyIds([]);
    setUploadState({ isUploading: false, progress: 0, stage: 'idle' });
    
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Property Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload">Upload CSV or Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploadState.isUploading}
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadState.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{uploadState.stage}...</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} className="h-2" />
              </div>
            )}

            {/* Upload Status */}
            {uploadState.stage === 'error' && uploadState.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}

            {/* File Info */}
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Processing Summary */}
          {parsedData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{parsedData.totalRows}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{parsedData.validRows}</div>
                <div className="text-sm text-gray-600">Valid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{parsedData.invalidRows}</div>
                <div className="text-sm text-gray-600">Invalid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {properties.filter(p => p.warnings.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {parsedData && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUploadToServer}
                disabled={uploadState.isUploading || parsedData.validRows === 0}
                className="flex items-center gap-2"
              >
                {uploadState.isUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Upload {parsedData.validRows} Properties
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={uploadState.isUploading}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Preview Grid */}
      {properties.length > 0 && (
        <PropertyPreviewGrid
          properties={properties}
          onPropertiesChange={handlePropertiesChange}
          onSelectedPropertiesChange={setSelectedPropertyIds}
          onOpenAmenities={handleOpenAmenities}
        />
      )}

      {/* Amenities Modal */}
      <AmenitiesModal
        isOpen={isAmenitiesModalOpen}
        onClose={() => setIsAmenitiesModalOpen(false)}
        properties={properties}
        selectedPropertyIds={selectedPropertyIds}
        onSave={handleSaveAmenities}
        initialAmenities={propertyAmenities}
      />
    </div>
  );
}