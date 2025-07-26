/**
 * Security management hook
 * Handles password updates and 2FA setup with proper validation
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface TwoFactorSetupResponse {
  success: boolean;
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

interface TwoFactorStatusResponse {
  success: boolean;
  enabled: boolean;
}

export const useSecurity = () => {
  const queryClient = useQueryClient();

  // Get 2FA status
  const {
    data: twoFactorStatus,
    isLoading: statusLoading,
    error: statusError
  } = useQuery<TwoFactorStatusResponse>({
    queryKey: ['security', '2fa-status'],
    queryFn: async () => {
      const response = await fetch('/api/security/2fa/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch 2FA status');
      }
      return response.json();
    }
  });

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: async (data: PasswordUpdateData) => {
      const response = await fetch('/api/security/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update password');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  // Setup 2FA mutation
  const setup2FA = useMutation({
    mutationFn: async (): Promise<TwoFactorSetupResponse> => {
      const response = await fetch('/api/security/2fa/setup', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to setup 2FA');
      }
      
      return result;
    }
  });

  // Verify and enable 2FA mutation
  const verify2FA = useMutation({
    mutationFn: async ({ token, secret }: { token: string; secret: string }) => {
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, secret })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify 2FA');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', '2fa-status'] });
    }
  });

  // Disable 2FA mutation
  const disable2FA = useMutation({
    mutationFn: async (currentPassword: string) => {
      const response = await fetch('/api/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to disable 2FA');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', '2fa-status'] });
    }
  });

  // Password validation helper
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    // 2FA status
    twoFactorStatus,
    statusLoading,
    statusError,
    
    // Password operations
    updatePassword,
    validatePassword,
    
    // 2FA operations
    setup2FA,
    verify2FA,
    disable2FA,
    
    // Loading states
    isUpdatingPassword: updatePassword.isPending,
    isSettingUp2FA: setup2FA.isPending,
    isVerifying2FA: verify2FA.isPending,
    isDisabling2FA: disable2FA.isPending
  };
};