import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Upload, CheckCircle, XCircle, Clock, Download, 
  Trash, Eye, Shield, File, RefreshCw, Plus, Search, Filter,
  FolderOpen, Star, Archive, Share, Edit3, MoreVertical
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, formatDistanceToNow } from "date-fns";

// Uploadcare imports
import { Widget } from "@uploadcare/react-widget";
import React from "react"; // Added missing import
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UploadcareWidgetFileInfo } from '@/types/uploadcare.types';

interface Document {
  id: number;
  name: string;
  description?: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  mimeType: string;
  fileSize: number;
  uploadcareFileId?: string;
  uploadcareUrl?: string;
  propertyId?: number;
  userId: number;
  userName?: string;
  verified: boolean;
  verifiedById?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: string;
  isStarred?: boolean;
  isArchived?: boolean;
}

interface UploadcareDocumentManagerProps {
  propertyId?: number;
  showAll?: boolean;
  adminView?: boolean;
}

export function UploadcareDocumentManager({ 
  propertyId, 
  showAll = false, 
  adminView = false 
}: UploadcareDocumentManagerProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form state for document metadata
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentCategory, setDocumentCategory] = useState("");
  const [documentTags, setDocumentTags] = useState("");
  const [uploadcareFileInfo, setUploadcareFileInfo] = useState<UploadcareWidgetFileInfo | null>(null);

  // Check for Uploadcare environment variables
  const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;

  // Fetch documents query
  const { data: documentsResponse, isLoading, error } = useQuery({
    queryKey: ['documents', propertyId, showAll, adminView],
    queryFn: async () => {
      const endpoint = adminView 
        ? '/api/admin/documents' 
        : propertyId 
          ? `/api/documents/property/${propertyId}`
          : '/api/documents';
      
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      
      // Documents API response received
      
      return data;
    },
  });

  // Extract documents array from API response
  const documents = React.useMemo(() => {
    if (!documentsResponse) return [];
    
    // Handle different API response formats
    if (Array.isArray(documentsResponse)) {
      return documentsResponse;
    } else if (documentsResponse.documents && Array.isArray(documentsResponse.documents)) {
      return documentsResponse.documents;
    } else {
      // Unexpected documents response format
      return [];
    }
  }, [documentsResponse]);

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      documentType: string;
      category: string;
      tags: string[];
      propertyId?: number;
      uploadcareFileId: string;
      uploadcareUrl: string;
      fileSize: number;
      mimeType: string;
    }) => {
      // Making API request to /api/documents/uploadcare
      
      const response = await fetch('/api/documents/uploadcare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      // API response received
      
      if (!response.ok) {
        const errorText = await response.text();
        // API error response
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      // API success response
      return result;
    },
    onSuccess: (data) => {
      // Upload mutation success
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('document.uploadSuccess') || 'Upload Successful',
        description: t('document.uploadSuccessDescription') || 'Your document has been uploaded successfully.',
      });
      resetUploadForm();
      setShowUploadDialog(false);
    },
    onError: (error) => {
      // Upload mutation error
      
      toast({
        title: t('document.uploadError') || 'Upload Failed',
        description: error.message || t('document.uploadErrorDescription') || 'Failed to upload document. Please try again.',
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('document.deleteSuccess'),
        description: t('document.deleteSuccessDescription'),
      });
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t('document.deleteError'),
        description: t('document.deleteErrorDescription'),
        variant: "destructive",
      });
    },
  });

  // Verify document mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: async (data: { documentId: number; status: 'verified' | 'rejected'; notes?: string }) => {
      const response = await fetch(`/api/documents/${data.documentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: data.status, notes: data.notes }),
      });
      
      if (!response.ok) throw new Error('Failed to verify document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('document.verificationSuccess'),
        description: t('document.verificationSuccessDescription'),
      });
    },
  });

  // Handle Uploadcare file upload
  const handleUploadcareUpload = (fileInfo: UploadcareWidgetFileInfo) => {
    // Uploadcare file info received
    
    setUploadcareFileInfo(fileInfo);
    
    // Auto-populate document name if not set
    if (!documentName && fileInfo?.name) {
      setDocumentName(fileInfo.name.split('.')[0]);
    } else if (!documentName && fileInfo?.originalFilename) {
      setDocumentName(fileInfo.originalFilename.split('.')[0]);
    }
  };

  // Handle document submission
  const handleUploadDocument = () => {
    // Starting document upload

    if (!uploadcareFileInfo || !documentName || !documentType) {
      // Missing required fields
      
      toast({
        title: t('document.missingFields') || 'Missing Fields',
        description: t('document.missingFieldsDescription') || 'Please fill in all required fields',
        variant: "destructive",
      });
      return;
    }

    // Validate that we have the necessary Uploadcare data
    if (!uploadcareFileInfo.uuid || !uploadcareFileInfo.cdnUrl) {
      // Invalid Uploadcare file info
      toast({
        title: 'Upload Error',
        description: 'Invalid file information from Uploadcare. Please try uploading again.',
        variant: "destructive",
      });
      return;
    }

    const tags = documentTags.split(',').map(tag => tag.trim()).filter(Boolean);

    // Submitting document with data

    uploadDocumentMutation.mutate({
      name: documentName,
      description: documentDescription,
      documentType,
      category: documentCategory,
      tags,
      propertyId,
      uploadcareFileId: uploadcareFileInfo.uuid,
      uploadcareUrl: uploadcareFileInfo.cdnUrl,
      fileSize: uploadcareFileInfo.size,
      mimeType: uploadcareFileInfo.mimeType,
    });
  };

  // Reset upload form
  const resetUploadForm = () => {
    setDocumentName("");
    setDocumentDescription("");
    setDocumentType("");
    setDocumentCategory("");
    setDocumentTags("");
    setUploadcareFileInfo(null);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "starred" && doc.isStarred) ||
                      (activeTab === "archived" && doc.isArchived) ||
                      doc.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesTab;
  });

  // Get document status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };

  // Get document type icon
  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('image')) return <Eye className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes('word')) return <File className="h-4 w-4 text-blue-600" />;
    if (mimeType.includes('excel')) return <File className="h-4 w-4 text-green-600" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  // Handle document deletion
  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };

  // Check if user can verify documents
  const canVerify = user?.role === 'admin' || user?.role === 'agent';

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert className="border-red-300 bg-red-50">
        <AlertDescription className="text-red-700">
          <strong>Error loading documents:</strong> {error instanceof Error ? error.message : 'Unknown error'}
          <br />
          <span className="text-sm">Please try refreshing the page or contact support if this persists.</span>
        </AlertDescription>
      </Alert>
    );
  }

  // Show Uploadcare configuration warning if not configured
  if (!UPLOADCARE_PUBLIC_KEY) {
    return (
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Uploadcare Configuration Required
          </CardTitle>
          <CardDescription className="text-yellow-700">
            To use document management with Uploadcare, please set up your environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">Add the following to your <code>.env</code> file:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs">
VITE_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key
            </pre>
            <p className="text-xs text-gray-600">
              Get your Uploadcare keys from: <a href="https://uploadcare.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Uploadcare Dashboard</a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">
            Upload, organize, and manage your documents with Uploadcare
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowUploadDialog(true)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="deed">Deeds</SelectItem>
                <SelectItem value="identification">ID Documents</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Tabs and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredDocuments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {searchTerm ? "Try adjusting your search or filters" : "Upload your first document to get started"}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowUploadDialog(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document: Document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getDocumentIcon(document.mimeType)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{document.name}</h4>
                          <p className="text-xs text-gray-500">
                            {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedDocument(document)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {document.uploadcareUrl && (
                            <DropdownMenuItem asChild>
                              <a href={document.uploadcareUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </DropdownMenuItem>
                          )}
                          {canVerify && document.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => verifyDocumentMutation.mutate({ 
                                  documentId: document.id, 
                                  status: 'verified' 
                                })}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => verifyDocumentMutation.mutate({ 
                                  documentId: document.id, 
                                  status: 'rejected' 
                                })}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDocument(document)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {getStatusBadge(document.status)}
                      {document.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
                        {adminView && document.userName && (
                          <span>by {document.userName}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Upload and organize your documents using Uploadcare's secure platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Uploadcare Widget */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="mb-4 text-xs text-gray-500">
                  <p>Uploadcare Public Key: {UPLOADCARE_PUBLIC_KEY ? `${UPLOADCARE_PUBLIC_KEY.slice(0, 10)}...` : 'Not configured'}</p>
                  <p>Widget Status: Ready</p>
                </div>
                <Widget
                  publicKey={UPLOADCARE_PUBLIC_KEY}
                  onChange={handleUploadcareUpload}
                  onError={(error) => {
                    // Uploadcare Widget error
                    toast({
                      title: 'Widget Error',
                      description: `Uploadcare error: ${error.message || 'Unknown error'}`,
                      variant: "destructive",
                    });
                  }}
                  onProgress={(progress) => {
                    // Upload progress
                  }}
                  tabs="file url facebook gdrive gphotos dropbox instagram"
                  multiple={false}
                  systemDialog={true}
                  clearable={true}
                  imageShrink="1024x1024"
                  effects="crop,rotate,enhance,grayscale"
                  previewStep={true}
                  value={uploadcareFileInfo?.uuid || ''}
                />
                {uploadcareFileInfo && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        File uploaded: {uploadcareFileInfo.name || uploadcareFileInfo.originalFilename}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Size: {(uploadcareFileInfo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-green-600">
                      UUID: {uploadcareFileInfo.uuid}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Name *</label>
                <Input
                  value={documentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type *</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="deed">Deed</SelectItem>
                    <SelectItem value="identification">ID Document</SelectItem>
                    <SelectItem value="utility">Utility Bill</SelectItem>
                    <SelectItem value="legal_document">Legal Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={documentCategory} onValueChange={setDocumentCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="property">Property Related</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={documentTags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentTags(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500">
                Add tags to help organize and find your documents later
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={documentDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDocumentDescription(e.target.value)}
                placeholder="Optional description of the document"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false);
              resetUploadForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadDocument}
              disabled={!uploadcareFileInfo || !documentName || !documentType || uploadDocumentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadDocumentMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open: boolean) => !open && setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    {getDocumentIcon(selectedDocument.mimeType)}
                    <span>{selectedDocument.name}</span>
                  </span>
                  {getStatusBadge(selectedDocument.status)}
                </DialogTitle>
                <DialogDescription>
                  Uploaded {formatDistanceToNow(new Date(selectedDocument.createdAt), { addSuffix: true })}
                  {adminView && selectedDocument.userName && ` by ${selectedDocument.userName}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Document Preview */}
                {selectedDocument.uploadcareUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    {selectedDocument.mimeType.startsWith('image/') ? (
                      <img 
                        src={selectedDocument.uploadcareUrl}
                        alt={selectedDocument.name}
                        className="w-full max-h-64 object-contain bg-gray-50"
                      />
                    ) : (
                      <div className="flex items-center justify-center p-8 bg-gray-50">
                        {getDocumentIcon(selectedDocument.mimeType)}
                        <div className="ml-3">
                          <p className="font-medium">{selectedDocument.name}</p>
                          <p className="text-sm text-gray-500">
                            {selectedDocument.mimeType} • {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Document Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{selectedDocument.documentType}</span>
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>
                    <span className="ml-2">{(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  {selectedDocument.category && (
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 capitalize">{selectedDocument.category}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{format(new Date(selectedDocument.createdAt), 'PPp')}</span>
                  </div>
                </div>

                {selectedDocument.description && (
                  <div>
                    <span className="font-medium text-sm">Description:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedDocument.description}</p>
                  </div>
                )}

                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDocument.tags.map((tag, index) => (
                        <Badge variant="outline" className="text-xs" key={index}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <div>
                  {canVerify && selectedDocument.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => {
                          verifyDocumentMutation.mutate({ 
                            documentId: selectedDocument.id, 
                            status: 'verified' 
                          });
                          setSelectedDocument(null);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          verifyDocumentMutation.mutate({ 
                            documentId: selectedDocument.id, 
                            status: 'rejected' 
                          });
                          setSelectedDocument(null);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedDocument.uploadcareUrl && (
                    <Button asChild variant="outline">
                      <a 
                        href={selectedDocument.uploadcareUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteDocument(selectedDocument)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}