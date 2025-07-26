import { useState } from "react";
import { useDocuments, type Document } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { 
  FileText, Upload, CheckCircle, XCircle, Clock, Pen, 
  Download, Trash, Eye, Shield, File, RefreshCw
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export interface DocumentManagerProps {
  propertyId?: number;
  showAll?: boolean;
}

export function DocumentManager({ propertyId, showAll = false }: DocumentManagerProps) {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const { documentsQuery, uploadDocumentMutation, verifyDocumentMutation } = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Form state for upload
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Dropzone for file uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        if (!documentName && acceptedFiles[0].name) {
          setDocumentName(acceptedFiles[0].name.split(".")[0]);
        }
      }
    },
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const handleUpload = () => {
    if (!uploadedFile || !documentName || !documentType) return;

    uploadDocumentMutation.mutate({
      name: documentName,
      description: documentDescription,
      documentType: documentType as any,
      propertyId: propertyId,
      file: uploadedFile,
    }, {
      onSuccess: () => {
        setShowUploadDialog(false);
        resetUploadForm();
      }
    });
  };

  const handleRejectDocument = async (documentId: number) => {
    if (!confirm(t('document.confirmReject'))) return;

    try {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: 'Admin/Agent rejection',
          feedback: 'Document does not meet verification requirements'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject document');
      }

      toast({
        title: t('document.rejectionSuccess'),
        description: t('document.rejectionSuccessDescription'),
      });

      // Refresh the documents list
      documentsQuery.refetch();
      setSelectedDocument(null);
    } catch (error) {
      toast({
        title: t('document.rejectionError'),
        description: t('document.rejectionErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const resetUploadForm = () => {
    setDocumentName("");
    setDocumentDescription("");
    setDocumentType("");
    setUploadedFile(null);
  };

  const handleVerifyDocument = (id: number, status: 'verified' | 'rejected') => {
    verifyDocumentMutation.mutate({
      documentId: id,
      status,
      notes: `${status} by ${user?.username} on ${new Date().toISOString()}`
    });
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> {t('document.statusLabels.verified')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> {t('document.statusLabels.rejected')}</Badge>;
      default:
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> {t('document.statusLabels.pending')}</Badge>;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'contract':
        return <Badge variant="secondary"><FileText className="mr-1 h-3 w-3" /> {t('document.types.contract')}</Badge>;
      case 'deed':
        return <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" /> {t('document.types.deed')}</Badge>;
      case 'identification':
        return <Badge variant="secondary"><Eye className="mr-1 h-3 w-3" /> {t('document.types.identification')}</Badge>;
      case 'utility':
        return <Badge variant="secondary"><File className="mr-1 h-3 w-3" /> {t('document.types.utility')}</Badge>;
      default:
        return <Badge variant="secondary"><File className="mr-1 h-3 w-3" /> {t('document.types.other')}</Badge>;
    }
  };

  // Filter documents based on the active tab
  const filteredDocuments = (Array.isArray(documentsQuery.data) ? documentsQuery.data : []).filter(doc => {
    if (propertyId && doc.propertyId !== propertyId) return false;
    
    switch (activeTab) {
      case 'pending':
        return doc.status === 'pending';
      case 'verified':
        return doc.status === 'verified';
      case 'rejected':
        return doc.status === 'rejected';
      default:
        return true;
    }
  });

  const isAgent = user?.role === 'agent';
  const isAdmin = user?.role === 'admin';
  const canVerify = isAdmin || isAgent;

  return (
    <Card className="w-full">
        <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>{t('document.title')}</span>
          <Button onClick={() => setShowUploadDialog(true)} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" /> {t('document.upload')}
          </Button>
        </CardTitle>
        <CardDescription>
          {t('document.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t('document.tabs.all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('document.tabs.pending')}</TabsTrigger>
            <TabsTrigger value="verified">{t('document.tabs.verified')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('document.tabs.rejected')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {documentsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : documentsQuery.isError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <XCircle className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-red-600">{t('document.error.title')}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {t('document.error.description')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => documentsQuery.refetch()}
                  className="mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> {t('document.error.retry')}
                </Button>
              </div>
            ) : (
              <>
                {filteredDocuments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">{t('document.empty.title')}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {activeTab === 'all' 
                        ? t('document.empty.uploadToStart')
                        : t('document.empty.noStatusDocuments', { status: activeTab })}
                    </p>
                    {activeTab === 'all' && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowUploadDialog(true)}
                        className="mt-4"
                      >
                        <Upload className="mr-2 h-4 w-4" /> {t('document.upload')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableCaption>{t('document.table.caption')}</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('document.table.name')}</TableHead>
                          <TableHead>{t('document.table.type')}</TableHead>
                          <TableHead>{t('document.table.status')}</TableHead>
                          <TableHead>{t('document.table.created')}</TableHead>
                          <TableHead>{t('document.table.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments?.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>{getDocumentTypeBadge(doc.documentType)}</TableCell>
                            <TableCell>{getDocumentStatusBadge(doc.status)}</TableCell>
                            <TableCell>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedDocument(doc)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {canVerify && doc.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleVerifyDocument(doc.id, 'verified')}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Document Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('document.uploadDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('document.uploadDialog.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="document-name">{t('document.uploadDialog.documentName')}</label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={t('document.uploadDialog.documentNamePlaceholder')}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="document-type">{t('document.uploadDialog.documentType')}</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('document.uploadDialog.documentTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">{t('document.types.contract')}</SelectItem>
                  <SelectItem value="deed">{t('document.types.deed')}</SelectItem>
                  <SelectItem value="identification">{t('document.types.identification')}</SelectItem>
                  <SelectItem value="utility">{t('document.types.utility')}</SelectItem>
                  <SelectItem value="other">{t('document.types.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="document-description">{t('document.uploadDialog.description')}</label>
              <Textarea
                id="document-description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder={t('document.uploadDialog.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label>{t('document.uploadDialog.file')}</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> {t('document.uploadDialog.changeFile')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">
                      {t('document.dragDropFile')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('document.supportedFormats')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadDialog(false);
                resetUploadForm();
              }}
            >
              {t('general.actions.cancel')}
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadedFile || !documentName || !documentType || uploadDocumentMutation.isPending}
            >
              {uploadDocumentMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t('document.uploading')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('document.upload')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document View Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedDocument.name}</span>
                  {getDocumentStatusBadge(selectedDocument.status)}
                </DialogTitle>
                <DialogDescription>
                  {t('document.viewDialog.uploadedAgo', { time: formatDistanceToNow(new Date(selectedDocument.createdAt), { addSuffix: true }) })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">{t('document.viewDialog.documentType')}</h4>
                    <p>{getDocumentTypeBadge(selectedDocument.documentType)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">{t('document.viewDialog.fileSize')}</h4>
                    <p>{(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  {selectedDocument.verified && (
                    <div className="col-span-2">
                      <h4 className="font-medium text-sm mb-1">{t('document.viewDialog.verifiedBy')}</h4>
                      <p>ID: {selectedDocument.verifiedById} on {selectedDocument.verifiedAt && new Date(selectedDocument.verifiedAt).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {selectedDocument.description && (
                    <div className="col-span-2">
                      <h4 className="font-medium text-sm mb-1">{t('document.viewDialog.descriptionLabel')}</h4>
                      <p className="text-gray-700">{selectedDocument.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3">{t('document.viewDialog.filePreview')}</h4>
                  <div className="border rounded-md p-4 flex items-center justify-center h-[200px]">
                    {selectedDocument.mimeType.startsWith('image/') ? (
                      <img 
                        src={`/api/documents/${selectedDocument.id}/preview`} 
                        alt={selectedDocument.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null; 
                          e.currentTarget.src = ''; 
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `
                            <div class="flex flex-col items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mb-2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              <p class="text-sm font-medium">Image not found</p>
                              <p class="text-xs text-gray-500">The image file could not be loaded</p>
                            </div>
                          `;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        {selectedDocument.mimeType === 'application/pdf' ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-16 w-16 text-red-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">{t('document.viewDialog.pdfDocument')}</p>
                            <a 
                              href={`/api/documents/${selectedDocument.id}/file`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                              {t('document.viewDialog.openPdfInNewTab')}
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">{t('document.viewDialog.previewNotAvailable')}</p>
                            <p className="text-xs">{t('document.viewDialog.downloadToView')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
                          handleVerifyDocument(selectedDocument.id, 'verified');
                          setSelectedDocument(null);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> {t('document.actions.verify')}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleVerifyDocument(selectedDocument.id, 'rejected');
                          setSelectedDocument(null);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> {t('document.actions.reject')}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`/api/documents/${selectedDocument.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      toast({
                        title: t('document.downloadStarted'),
                        description: t('document.downloadStartedDescription'),
                      });
                    }}
                  >
                    <Button>
                      <Download className="h-4 w-4 mr-2" /> {t('document.actions.download')}
                    </Button>
                  </a>
                  
                  {canVerify && selectedDocument.status === 'pending' && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleRejectDocument(selectedDocument.id)}
                      disabled={verifyDocumentMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> {t('document.actions.reject')}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}