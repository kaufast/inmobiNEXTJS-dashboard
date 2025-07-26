import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePendingVerifications, useVerifyDocument } from '@/hooks/use-verification';
import { format } from 'date-fns';
import { Check, Eye, FileText, Loader2, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define interfaces for document verification
interface VerificationDocument {
  id: number;
  userId: number;
  documentType: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  verifiedBy?: number;
  verificationNotes?: string;
}

interface VerifyDocumentParams {
  documentId: number;
  type: 'user' | 'agency';
  notes?: string;
}

export default function AdminVerificationPanel() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationType, setVerificationType] = useState<'user' | 'agency'>('user');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { 
    data: pendingVerifications = [], 
    isLoading, 
    error,
    refetch
  } = usePendingVerifications();
  
  const verifyDocumentMutation = useVerifyDocument();
  
  const { t } = useTranslation('dashboard');
  
  const handleApprove = async () => {
    if (!selectedDocument) return;
    
    try {
      await verifyDocumentMutation.mutateAsync({
        documentId: selectedDocument.id,
        type: verificationType,
        notes: verificationNotes
      });
      
      toast({
        title: 'Document approved',
        description: 'The user has been successfully verified.',
      });
      
      setDialogOpen(false);
      setSelectedDocument(null);
      setVerificationNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleReject = async () => {
    if (!selectedDocument) return;
    
    try {
      await verifyDocumentMutation.mutateAsync({
        documentId: selectedDocument.id,
        type: verificationType,
        notes: verificationNotes
      });
      
      toast({
        title: 'Document rejected',
        description: 'The verification request has been rejected.',
      });
      
      setDialogOpen(false);
      setSelectedDocument(null);
      setVerificationNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleViewDocument = (document: VerificationDocument) => {
    if (!document.filePath || !document.mimeType || !document.fileSize) {
      toast({
        title: 'Error',
        description: 'Document data is incomplete',
        variant: 'destructive',
      });
      return;
    }
    setSelectedDocument(document);
    setVerificationType(document.documentType.includes('business') ? 'agency' : 'user');
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error loading verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'An error occurred while loading pending verifications'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> {t('admin.title')}
          </CardTitle>
          <CardDescription>
            {t('admin.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">{t('admin.pending', { count: pendingVerifications?.length || 0 })}</TabsTrigger>
              <TabsTrigger value="history">{t('admin.verificationHistory')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingVerifications && pendingVerifications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.userId')}</TableHead>
                      <TableHead>{t('admin.documentType')}</TableHead>
                      <TableHead>{t('admin.submitted')}</TableHead>
                      <TableHead>{t('admin.status')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.userId}</TableCell>
                        <TableCell>{doc.documentType}</TableCell>
                        <TableCell>
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {t('admin.statusPending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDocument(doc)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>{t('admin.review')}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium mb-1">{t('admin.noPendingVerifications')}</h3>
                  <p className="text-sm text-gray-500">
                    {t('admin.noPendingVerificationsDesc')}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <div className="p-8 text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">{t('admin.verificationHistory')}</h3>
                <p className="text-sm text-gray-500">
                  {t('admin.verificationHistoryDesc')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('admin.reviewVerificationDocument')}</DialogTitle>
            <DialogDescription>
              {t('admin.reviewVerificationDesc')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('admin.userId')}</h4>
                  <p className="text-sm">{selectedDocument.userId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('admin.documentType')}</h4>
                  <p className="text-sm">{selectedDocument.documentType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('admin.submittedOn')}</h4>
                  <p className="text-sm">
                    {format(new Date(selectedDocument.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('admin.fileSize')}</h4>
                  <p className="text-sm">{Math.round((selectedDocument.fileSize || 0) / 1024)} KB</p>
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <h4 className="text-sm font-medium mb-2">{t('admin.documentPreview')}</h4>
                {selectedDocument.filePath && selectedDocument.filePath.includes('manual_verification') ? (
                  <div className="p-4 bg-gray-100 rounded text-center">
                    <p className="text-sm text-gray-500">{t('admin.manualVerification')}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded text-center">
                    {selectedDocument.mimeType && selectedDocument.mimeType.includes('image') ? (
                      <img 
                        src={`/uploads/verification/${selectedDocument.filePath?.split('/').pop() || ''}`}
                        alt={t('admin.verificationDocument')}
                        className="max-h-40 mx-auto object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-500" />
                        <span className="text-sm">{selectedDocument.filePath?.split('/').pop() || t('admin.unknownFile')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">{t('admin.verificationType')}</h4>
                <RadioGroup 
                  value={verificationType} 
                  onValueChange={(value) => setVerificationType(value as 'user' | 'agency')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="verify-user" />
                    <Label htmlFor="verify-user">{t('admin.individualUser')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agency" id="verify-agency" />
                    <Label htmlFor="verify-agency">{t('admin.realEstateAgency')}</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">{t('admin.verificationNotes')}</h4>
                <Textarea
                  placeholder={t('admin.verificationNotesPlaceholder')}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={verifyDocumentMutation.isPending}
              className="flex-1 mr-2"
            >
              {verifyDocumentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {t('admin.reject')}
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={verifyDocumentMutation.isPending}
              className="flex-1 ml-2 bg-black hover:bg-gray-800 text-white"
            >
              {verifyDocumentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {t('admin.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}