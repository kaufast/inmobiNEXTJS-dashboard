import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VerificationStatus {
  isVerified: boolean;
  verificationType?: 'user' | 'agency';
  verificationMethod?: string;
  verifiedAt?: string;
  pendingVerification: boolean;
}

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

// Hook for getting user verification status
export function useVerificationStatus(userId?: number) {
  return useQuery<VerificationStatus>({
    queryKey: ['/api/verification/verification-status'],
    // Using the default queryFn configured with the client
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId
  });
}

// Hook for starting the verification process with DIDiT
export function useStartVerification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      type
    }: { 
      type: 'user' | 'agency';
    }) => {
      const response = await apiRequest('POST', '/api/verification/start-verification', {
        type,
        method: 'didit'
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Don't invalidate queries here as we're redirecting to DIDiT
      if (data.redirectUrl) {
        // Redirect to DIDiT for verification
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: 'Verification started',
          description: 'Your verification process has been initiated.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Failed to start verification. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Hook for submitting document-based verification (fallback method)
export function useSubmitManualVerification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/verification/submit-documents', {
        method: 'POST',
        body: data,
        // Don't set content-type, let the browser set it with the boundary
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/verification-status'] });
      toast({
        title: 'Documents submitted',
        description: 'Your verification documents have been submitted successfully. They will be reviewed by our team.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to upload verification documents. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Hook for handling verification callback (after redirecting back from DIDiT)
export function useVerificationCallback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('GET', `/api/verification/verification-callback?session_id=${encodeURIComponent(sessionId)}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/verification-status'] });
      
      if (data.success) {
        toast({
          title: 'Verification complete',
          description: 'Your identity has been successfully verified.',
        });
      } else {
        toast({
          title: 'Verification pending',
          description: 'Your verification is being processed. We will notify you when it is complete.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification error',
        description: error.message || 'There was an issue with your verification. Please try again later.',
        variant: 'destructive',
      });
    },
  });
}

// Hook for getting all pending verifications (admin only)
export function usePendingVerifications() {
  return useQuery<VerificationDocument[]>({
    queryKey: ['/api/verification/pending-verifications'],
    // Using the default queryFn configured with the client
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for approving verification documents (admin only)
export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      type,
      notes 
    }: { 
      documentId: number; 
      type: 'user' | 'agency';
      notes?: string;
    }) => {
      const response = await apiRequest('POST', `/api/verification/verify-document/${documentId}`, {
        type,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      toast({
        title: 'Document verified',
        description: 'The verification has been approved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Failed to verify document.',
        variant: 'destructive',
      });
    },
  });
}

// Hook for rejecting verification documents (admin only)
export function useRejectDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      notes 
    }: { 
      documentId: number; 
      notes: string;
    }) => {
      const response = await apiRequest('POST', `/api/verification/reject-document/${documentId}`, {
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      toast({
        title: 'Document rejected',
        description: 'The verification has been rejected.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to reject document.',
        variant: 'destructive',
      });
    },
  });
}