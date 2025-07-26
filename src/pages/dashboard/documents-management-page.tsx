import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    FileText,
    CheckCircle2,
    Eye,
    Loader2,
    Search,
    XCircle,
    CheckSquare,
    Square,
    Filter,
    Wifi,
    WifiOff,
    AlertCircle,
    Plus,
    Trash2,
    Upload,
    Shield
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentsSSE } from '@/hooks/use-documents-sse';

// Interface for document management
interface DocumentManagement {
  id: number;
  title: string;
  description: string;
  documentType: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedById: number;
  createdAt: string;
  updatedAt: string;
  metadata: any;
  uploadedBy?: {
    name: string;
    email: string;
  };
}

export default function DocumentsManagementPage() {
  const { t } = useTranslation(['auth', 'common', 'dashboard']);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentManagement | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationAction, setVerificationAction] = useState<'verify' | 'reject'>('verify');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentManagement | null>(null);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'verify' | 'reject' | 'delete' | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Setup SSE for real-time updates
  const {
    connectionStatus,
    lastEvent,
    eventCount,
    connectedClients,
    reconnect,
    isConnected,
    hasError
  } = useDocumentsSSE({
    enableToasts: false, // We'll handle toasts manually to avoid duplicates
    onStatusChange: (data) => {
      console.log('Document status changed:', data);
      // Automatically refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onNewSubmission: (data) => {
      console.log('New document submission:', data);
      // Show toast for new submissions (admin-only page)
      toast({
        title: '📄 New Document Submission',
        description: `${data?.userName} submitted ${data?.itemName} for review`,
      });
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
    },
    onDocumentDeleted: (data) => {
      console.log('Document deleted:', data);
      // Clear selected documents if any were deleted
      setSelectedDocuments(new Set());
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
    }
  });
  
  // Fetch pending documents
  const { data: pendingDocumentsData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['/api/documents/admin/pending'],
    enabled: !!user && user.role === 'admin',
  });

  // Fetch all documents
  const { data: allDocumentsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/documents'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Mutation to verify/reject a single document
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({
      documentId, 
      status,
      notes,
      rejectionReason
    }: {
      documentId: number;
      status: 'verified' | 'rejected';
      notes?: string;
      rejectionReason?: string;
    }) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/documents/bulk`, 
        { 
          documentIds: [documentId],
          action: status === 'verified' ? 'verify' : 'reject',
          notes,
          rejectionReason
        }
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Show success toast
      toast({
        title: variables.status === 'verified' ? '✅ Document Verified' : '❌ Document Rejected',
        description: variables.status === 'verified' 
          ? 'Document has been verified successfully'
          : 'Document has been rejected',
        variant: variables.status === 'verified' ? "default" : "destructive",
      });
      
      // Close dialogs
      setIsConfirmDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setVerificationNotes('');
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to process verification',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to delete a single document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: '🗑️ Document Deleted',
        description: 'Document has been deleted successfully',
      });
      setIsDetailsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    },
  });

  // Bulk verification mutation
  const bulkVerifyMutation = useMutation({
    mutationFn: async ({ documentIds, action, notes, rejectionReason }: { documentIds: number[], action: 'verify' | 'reject', notes?: string, rejectionReason?: string }) => {
      const response = await apiRequest('PATCH', '/api/documents/bulk', {
        documentIds,
        action,
        notes,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: (data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: `Bulk ${action === 'verify' ? 'Verification' : 'Rejection'} Complete`,
        description: `Successfully ${action === 'verify' ? 'verified' : 'rejected'} ${selectedDocuments.size} documents`,
      });
      setSelectedDocuments(new Set());
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to complete bulk action',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (documentIds: number[]) => {
      const response = await apiRequest('DELETE', '/api/documents/bulk', {
        documentIds
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: '🗑️ Bulk Delete Complete',
        description: `Successfully deleted ${selectedDocuments.size} documents`,
      });
      setSelectedDocuments(new Set());
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Delete Failed',
        description: error.message || 'Failed to delete documents',
        variant: 'destructive',
      });
    },
  });

  // Get the appropriate data based on active tab
  const getFilteredDocuments = () => {
    let documents: DocumentManagement[] = [];
    
    if (activeTab === 'all') {
      documents = allDocumentsData || [];
    } else if (activeTab === 'pending') {
      documents = pendingDocumentsData || [];
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      documents = documents.filter((d: DocumentManagement) => d.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      documents = documents.filter((d: DocumentManagement) => 
        d.title.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search) ||
        d.documentType.toLowerCase().includes(search)
      );
    }

    return documents;
  };

  const filteredDocuments = getFilteredDocuments();
  const isLoading = isLoadingPending || isLoadingAll;
  
  // Handle viewing document details
  const handleViewDetails = (document: DocumentManagement) => {
    setSelectedDocument(document);
    setIsDetailsDialogOpen(true);
  };
  
  // Handle document verification/rejection
  const handleVerificationAction = (action: 'verify' | 'reject') => {
    if (!selectedDocument) return;
    
    setVerificationAction(action);
    setIsConfirmDialogOpen(true);
  };

  // Handle individual delete
  const handleDelete = (document: DocumentManagement) => {
    setDocumentToDelete(document);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
      setDocumentToDelete(null);
    }
  };
  
  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments?.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments?.map(d => d.id) || []));
    }
  };
  
  const handleSelectDocument = (documentId: number) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };
  
  const handleBulkAction = (action: 'verify' | 'reject' | 'delete') => {
    if (selectedDocuments.size === 0) return;
    
    let confirmMessage = '';
    switch (action) {
      case 'verify':
        confirmMessage = `Are you sure you want to verify ${selectedDocuments.size} documents?`;
        break;
      case 'reject':
        confirmMessage = `Are you sure you want to reject ${selectedDocuments.size} documents?`;
        break;
      case 'delete':
        confirmMessage = `Are you sure you want to delete ${selectedDocuments.size} documents? This action cannot be undone.`;
        break;
    }
    
    setBulkAction(action);
    setIsBulkConfirmOpen(true);
  };

  const getBulkConfirmMessage = () => {
    if (!bulkAction) return '';
    
    switch (bulkAction) {
      case 'verify':
        return `Are you sure you want to verify ${selectedDocuments.size} documents?`;
      case 'reject':
        return `Are you sure you want to reject ${selectedDocuments.size} documents?`;
      case 'delete':
        return `Are you sure you want to delete ${selectedDocuments.size} documents? This action cannot be undone.`;
      default:
        return '';
    }
  };

  const handleBulkActionConfirm = () => {
    if (!bulkAction) return;
    
    if (bulkAction === 'delete') {
      bulkDeleteMutation.mutate(Array.from(selectedDocuments));
    } else {
      const notes = bulkAction === 'verify' ? 'Bulk verification' : undefined;
      const rejectionReason = bulkAction === 'reject' ? 'Bulk rejection' : undefined;
      bulkVerifyMutation.mutate({ 
        documentIds: Array.from(selectedDocuments), 
        action: bulkAction, 
        notes,
        rejectionReason 
      });
    }
    setSelectedDocuments(new Set());
    setBulkAction(null);
    setIsBulkConfirmOpen(false)
  };
  
  // Confirm verification/rejection
  const confirmVerification = () => {
    if (!selectedDocument) return;
    
    verifyDocumentMutation.mutate({
      documentId: selectedDocument.id,
      status: verificationAction,
      notes: verificationAction === 'verify' ? verificationNotes.trim() || undefined : undefined,
      rejectionReason: verificationAction === 'reject' ? rejectionReason.trim() || undefined : undefined,
    });
  };
  
  // Format timestamp
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // If not admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-700">🚫 Access Denied</CardTitle>
              <CardDescription>Administrator Access Required</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This area is restricted to administrators only. Document management can only be accessed by admin users.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your system administrator if you believe you should have access to this area.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title="Document Management"
            description="Review and manage document submissions"
          />
          
          <div className="flex items-center gap-4">
            {/* Add New Document Button */}
            <Button 
              onClick={() => window.open('/dashboard/documents', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
            
            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Live Updates</span>
                  </>
                ) : hasError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Connection Error</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={reconnect}
                      className="ml-2 h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600">Connecting...</span>
                  </>
                )}
              </div>
              {isConnected && (
                <Badge variant="outline" className="text-xs">
                  {connectedClients} connected
                </Badge>
              )}
              {eventCount > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {eventCount} events
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-8 pr-4 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {selectedDocuments.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedDocuments.size} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('verify')}
                    disabled={bulkVerifyMutation.isPending || bulkDeleteMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkVerifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Bulk Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('reject')}
                    disabled={bulkVerifyMutation.isPending || bulkDeleteMutation.isPending}
                  >
                    {bulkVerifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <XCircle className="mr-1 h-3 w-3" />
                    Bulk Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkVerifyMutation.isPending || bulkDeleteMutation.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {bulkDeleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-1 h-3 w-3" />
                    Bulk Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents Requiring Review
                </CardTitle>
                <CardDescription>
                  Review and manage document submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading documents...</p>
                  </div>
                ) : filteredDocuments && filteredDocuments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <button
                              onClick={handleSelectAll}
                              className="flex items-center justify-center w-full"
                            >
                              {selectedDocuments.size === filteredDocuments?.length && filteredDocuments?.length > 0 ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                          <TableRow key={document.id} className={selectedDocuments.has(document.id) ? 'bg-muted/50' : ''}>
                            <TableCell>
                              <button
                                onClick={() => handleSelectDocument(document.id)}
                                className="flex items-center justify-center w-full"
                              >
                                {selectedDocuments.has(document.id) ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{document.title}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {document.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {document.documentType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                            <TableCell>
                              <div>
                                <p>{document.uploadedBy?.name || 'Unknown User'}</p>
                                <p className="text-sm text-muted-foreground">{document.uploadedBy?.email || ''}</p>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(document.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(document.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(document)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(document)}
                                  disabled={deleteDocumentMutation.isPending}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  {deleteDocumentMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                  {!deleteDocumentMutation.isPending && <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No documents found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No documents match your current filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        {selectedDocument && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Document Details - {selectedDocument.title}</DialogTitle>
                <DialogDescription>
                  Review and verify this document submission
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{selectedDocument.title}</h3>
                    <p className="text-sm text-gray-500">{selectedDocument.documentType.replace('_', ' ')}</p>
                    <p className="text-sm font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm">{selectedDocument.description}</p>
                </div>

                <div>
                  <Label className="font-semibold">Upload Date</Label>
                  <p>{formatDate(selectedDocument.createdAt)}</p>
                </div>
                
                <div>
                  <Label className="font-semibold">Status</Label>
                  <div>{getStatusBadge(selectedDocument.status)}</div>
                </div>
                
                <div>
                  <Label className="font-semibold">File Type</Label>
                  <p className="text-sm">{selectedDocument.mimeType}</p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline"
                    onClick={() => handleDelete(selectedDocument)}
                    disabled={deleteDocumentMutation.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {deleteDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Document
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDetailsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    {selectedDocument.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleVerificationAction('verify')}
                          disabled={verifyDocumentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {verifyDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleVerificationAction('reject')}
                          disabled={verifyDocumentMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog for Verification/Rejection */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {verificationAction === 'verify' ? 'Verify Document' : 'Reject Document'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {verificationAction} this document submission?
                {selectedDocument && (
                  <div className="mt-2 text-sm">
                    <strong>Document:</strong> {selectedDocument.title}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              {verificationAction === 'verify' ? (
                <div>
                  <Label htmlFor="verificationNotes">Verification Notes (Optional)</Label>
                  <Textarea 
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add any notes about this verification..."
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason (Required)</Label>
                  <Textarea 
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmVerification}
                disabled={verifyDocumentMutation.isPending || (verificationAction === 'reject' && !rejectionReason.trim())}
                className={verificationAction === 'verify' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {verifyDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verificationAction === 'verify' ? 'Verify' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title="Delete Document"
          description={`Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />

        {/* Bulk Action Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isBulkConfirmOpen}
          onOpenChange={setIsBulkConfirmOpen}
          title={`Bulk ${bulkAction ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1) : ''}`}
          description={getBulkConfirmMessage()}
          confirmText={bulkAction ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1) : 'Confirm'}
          cancelText="Cancel"
          onConfirm={handleBulkActionConfirm}
          variant={bulkAction === 'delete' ? 'destructive' : 'default'}
        />
      </div>
    </DashboardLayout>
  );
}