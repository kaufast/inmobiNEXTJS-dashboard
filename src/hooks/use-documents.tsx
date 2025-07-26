import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for documents
export interface Document {
  id: number;
  name: string;
  description: string | null;
  documentType: 'contract' | 'deed' | 'identification' | 'utility' | 'other';
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedById: number;
  propertyId: number | null;
  metadata: any;
  verified: boolean;
  verifiedAt: string | null;
  verifiedById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSignature {
  id: number;
  documentId: number;
  userId: number;
  signatureData: string;
  signedAt: string;
  ipAddress: string | null;
  metadata: any;
}

export interface UploadDocumentData {
  name: string;
  description?: string;
  documentType: 'contract' | 'deed' | 'identification' | 'utility' | 'other';
  propertyId?: number;
  file: File;
  metadata?: Record<string, any>;
}

export const useDocuments = () => {
  const { toast } = useToast();

  // Query to fetch all documents
  const documentsQuery = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/documents');
      return await response.json() as Document[];
    },
    retry: 1,
  });

  // Query to fetch a specific document
  const getDocument = (documentId: number) => {
    return useQuery({
      queryKey: ['/api/documents', documentId],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/documents/${documentId}`);
        return await response.json() as Document;
      },
      enabled: Boolean(documentId),
    });
  };

  // Mutation to upload a document
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: UploadDocumentData) => {
      const formData = new FormData();
      
      // Append file
      formData.append('document', data.file);
      
      // Append metadata
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('documentType', data.documentType);
      if (data.propertyId) formData.append('propertyId', data.propertyId.toString());
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
      
      const response = await apiRequest('POST', '/api/documents/upload', formData, false);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to sign a document
  const signDocumentMutation = useMutation({
    mutationFn: async ({ documentId, signatureData, metadata }: { documentId: number; signatureData: string; metadata?: any }) => {
      const response = await apiRequest('POST', `/api/documents/${documentId}/sign`, {
        signatureData,
        metadata,
      });
      return await response.json();
    },
    onSuccess: (_, { documentId }) => {
      toast({
        title: "Document signed",
        description: "Document has been signed successfully.",
      });
      // Invalidate document query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Signing failed",
        description: error.message || "Failed to sign document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to verify a document
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, notes }: { documentId: number; status: 'verified' | 'rejected' | 'pending'; notes?: string }) => {
      const response = await apiRequest('POST', `/api/documents/verify`, {
        documentId,
        status,
        notes,
      });
      return await response.json();
    },
    onSuccess: (_, { documentId, status }) => {
      toast({
        title: "Document status updated",
        description: `Document has been ${status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'updated'} successfully.`,
      });
      // Invalidate document query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to update document status. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    documentsQuery,
    getDocument,
    uploadDocumentMutation,
    signDocumentMutation,
    verifyDocumentMutation,
  };
};