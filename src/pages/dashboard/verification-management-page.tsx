import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { InputDialog } from "@/components/ui/input-dialog";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Building2,
    CheckCircle2,
    Download,
    Eye,
    FileCheck,
    Loader2,
    Search,
    UserCheck,
    XCircle,
    CheckSquare,
    Square,
    Filter,
    Wifi,
    WifiOff,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVerificationSSE } from '@/hooks/use-verification-sse';

// Interface for verification document
interface VerificationDocument {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  verifiedById?: number;
  notes?: string;
}

export default function VerificationManagementPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationType, setVerificationType] = useState<'user' | 'agency'>('user');
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // Setup SSE for real-time updates
  const {
    connectionStatus,
    lastEvent,
    eventCount,
    connectedClients,
    reconnect,
    isConnected,
    hasError
  } = useVerificationSSE({
    enableToasts: false, // We'll handle toasts manually to avoid duplicates
    onStatusChange: (data) => {
      console.log('Verification status changed:', data);
      // Automatically refresh the verification list
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
    },
    onNewRequest: (data) => {
      console.log('New verification request:', data);
      // Show toast for new requests (admin only)
      if (user?.role === 'admin') {
        toast({
          title: '📋 New Verification Request',
          description: `${data?.userName} submitted ${data?.documentType} for verification`,
        });
      }
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
    },
    onVerificationDeleted: (data) => {
      console.log('Verification deleted:', data);
      // Clear selected documents if any were deleted
      setSelectedDocs(new Set());
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
    }
  });
  
  // Fetch pending verification documents
  const { data: verificationDocs, isLoading } = useQuery<VerificationDocument[]>({
    queryKey: ['/api/verification/pending-verifications'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Mutation to manually verify a document
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({
      documentId, 
      type,
      notes
    }: {
      documentId: number;
      type: 'user' | 'agency';
      notes?: string;
    }) => {
      const response = await apiRequest(
        'POST', 
        `/api/verification/verify-document/${documentId}`, 
        { type, notes }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      
      // Show success toast
      toast({
        title: t('verificationSuccess'),
        description: t('verificationSuccessDesc'),
        variant: "default",
      });
      
      // Close dialogs
      setIsConfirmDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setVerificationNotes('');
    },
    onError: (error: any) => {
      toast({
        title: t('verificationError'),
        description: error.message || t('genericError'),
        variant: 'destructive',
      });
    },
  });
  
  // Bulk verification mutation
  const bulkVerifyMutation = useMutation({
    mutationFn: async ({ documentIds, action }: { documentIds: number[], action: 'approve' | 'reject' }) => {
      const promises = documentIds.map(id => 
        apiRequest('POST', `/api/verification/${action === 'approve' ? 'verify' : 'reject'}-document/${id}`, {
          type: 'user',
          notes: action === 'reject' ? 'Bulk rejection' : 'Bulk approval'
        })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      toast({
        title: `Bulk ${action === 'approve' ? 'Approval' : 'Rejection'} Complete`,
        description: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${selectedDocs.size} documents`,
      });
      setSelectedDocs(new Set());
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to complete bulk action',
        variant: 'destructive',
      });
    },
  });
  
  // Filter documents based on search query and status
  const filteredDocs = verificationDocs?.filter((doc) => {
    // Status filter
    if (statusFilter !== 'all' && doc.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (!searchQuery.trim()) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      doc.userName.toLowerCase().includes(search) ||
      doc.userEmail.toLowerCase().includes(search) ||
      doc.documentType.toLowerCase().includes(search)
    );
  });
  
  // Handle viewing document details
  const handleViewDetails = (doc: VerificationDocument) => {
    setSelectedDoc(doc);
    setIsDetailsDialogOpen(true);
    
    // Set verification type based on document type
    if (doc.documentType === 'business_verification') {
      setVerificationType('agency');
    } else {
      setVerificationType('user');
    }
  };
  
  // Handle verification approval
  const handleApproveVerification = () => {
    if (!selectedDoc) return;
    
    setIsConfirmDialogOpen(true);
  };

  // Handle verification rejection
  const handleRejectVerification = () => {
    if (!selectedDoc) return;
    setIsRejectionDialogOpen(true);
  };

  const handleRejectWithReason = async (reason: string) => {
    if (!selectedDoc || !reason.trim()) return;
    
    try {
      const response = await fetch(`/api/verification/reject-document/${selectedDoc.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject document');
      }

      toast({
        title: t('rejectionSuccess'),
        description: t('rejectionSuccessDesc'),
      });

      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      setIsDetailsDialogOpen(false);
    } catch (error) {
      toast({
        title: t('rejectionError'),
        description: t('rejectionErrorDesc'),
        variant: "destructive",
      });
    }
  };
  
  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedDocs.size === filteredDocs?.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs?.map(doc => doc.id) || []));
    }
  };
  
  const handleSelectDoc = (docId: number) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };
  
  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedDocs.size === 0) return;
    
    const confirmMessage = action === 'approve' 
      ? `Are you sure you want to approve ${selectedDocs.size} documents?`
      : `Are you sure you want to reject ${selectedDocs.size} documents?`;
    
    if (confirm(confirmMessage)) {
      bulkVerifyMutation.mutate({ documentIds: Array.from(selectedDocs), action });
    }
  };
  
  // Confirm verification
  const confirmVerification = () => {
    if (!selectedDoc) return;
    
    verifyDocumentMutation.mutate({
      documentId: selectedDoc.id,
      type: verificationType,
      notes: verificationNotes.trim() || undefined,
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
  
  // Get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    if (type === 'business_verification') {
      return (
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          <span>{t('businessVerification')}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <UserCheck className="h-4 w-4" />
        <span>{t('identityVerification')}</span>
      </div>
    );
  };
  
  // If not admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-700">{t('common:global.accessDenied')}</CardTitle>
              <CardDescription>{t('adminOnlyArea')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('noPermissionMessage')}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.history.back()}>
                {t('common:global.goBack')}
              </Button>
            </CardFooter>
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
            title={t('verificationManagement')}
            description={t('manageVerificationRequests')}
          />
          
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
        
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
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
            
            {selectedDocs.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedDocs.size} selected
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkVerifyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {bulkVerifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkVerifyMutation.isPending}
                >
                  {bulkVerifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bulk Reject
                </Button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">{t('common:global.loadingData')}</p>
          </div>
        ) : filteredDocs && filteredDocs.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-full"
                      >
                        {selectedDocs.size === filteredDocs?.length && filteredDocs?.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>{t('documentType')}</TableHead>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('requestDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('common:global.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id} className={selectedDocs.has(doc.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <button
                          onClick={() => handleSelectDoc(doc.id)}
                          className="flex items-center justify-center w-full"
                        >
                          {selectedDocs.has(doc.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>{getDocumentTypeDisplay(doc.documentType)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{doc.userName}</div>
                        <div className="text-sm text-muted-foreground">{doc.userEmail}</div>
                      </TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doc)}
                        >
                          {t('common:global.viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">{t('noPendingVerifications')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('allCaughtUp')}
            </p>
          </div>
        )}

        {/* Details Dialog */}
        {selectedDoc && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('verificationDetails')} - {getDocumentTypeDisplay(selectedDoc.documentType)}</DialogTitle>
                <DialogDescription>
                  {t('reviewAndApprove')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="font-semibold">{t('userName')}</Label>
                  <p>{selectedDoc.userName} ({selectedDoc.userEmail})</p>
                </div>
                <div>
                  <Label className="font-semibold">{t('requestDate')}</Label>
                  <p>{formatDate(selectedDoc.createdAt)}</p>
                </div>
                <div>
                  <Label className="font-semibold">{t('status')}</Label>
                  <div>{getStatusBadge(selectedDoc.status)}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">{t('verificationType')}</Label>
                  <RadioGroup 
                    defaultValue={verificationType}
                    onValueChange={(value: 'user' | 'agency') => setVerificationType(value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="type-user" />
                      <Label htmlFor="type-user">{t('userVerification')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="agency" id="type-agency" />
                      <Label htmlFor="type-agency">{t('agencyVerification')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="verificationNotes" className="font-semibold">
                    {t('additional_notes')}
                  </Label>
                  <Textarea 
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder={t('notes_placeholder')}
                  />
                </div>
                {/* Document preview/download link */}
                <div className="flex gap-2">
                  <a 
                    href={`/api/documents/${selectedDoc.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" /> {t('verification_guide_download')}
                    </Button>
                  </a>
                  <a 
                    href={`/api/documents/${selectedDoc.id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  {t('common:global.close')}
                </Button>
                {selectedDoc.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleApproveVerification}
                      disabled={verifyDocumentMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {verifyDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('approveVerification')}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleRejectVerification}
                      disabled={verifyDocumentMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('rejectVerification')}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog for Approval */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmApprovalTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmApprovalDescription', { 
                  type: verificationType === 'user' ? t('user') : t('agency'), 
                  user: selectedDoc?.userName 
                })}
                {verificationNotes.trim() && (
                  <div className="mt-2 text-sm">
                    <strong>{t('verification_guide_notes')}:</strong> {verificationNotes}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:global.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmVerification}
                disabled={verifyDocumentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {verifyDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('approve')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rejection Reason Dialog */}
        <InputDialog
          isOpen={isRejectionDialogOpen}
          onOpenChange={setIsRejectionDialogOpen}
          title={t('enterRejectionReason')}
          description={t('pleaseProvideRejectionReason')}
          placeholder={t('rejectionReasonPlaceholder')}
          label={t('rejectionReason')}
          confirmText={t('reject')}
          cancelText={t('cancel')}
          onConfirm={handleRejectWithReason}
          required
        />
      </div>
    </DashboardLayout>
  );
}