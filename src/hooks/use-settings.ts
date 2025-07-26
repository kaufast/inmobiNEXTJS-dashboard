/**
 * Settings management hook
 * Handles system and personal settings with real-time updates
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SystemSettings {
  general: {
    siteName: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
  };
  security: {
    requireTwoFactor: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationEmail: string;
  };
  integrations: {
    googleMapsApiKey: string;
    stripeApiKey: string;
    smtpServer: string;
  };
}

interface PersonalSettings {
  emailPreferences: {
    messageNotifications: boolean;
    propertyInquiries: boolean;
    systemNotifications: boolean;
    emailOptOut: boolean;
    emailFrequency: 'immediate' | 'daily' | 'weekly';
  };
  general: {
    preferredLanguage: string;
  };
}

export const useSettings = () => {
  const queryClient = useQueryClient();
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);

  // System settings query (admin only)
  const {
    data: systemSettings,
    isLoading: systemLoading,
    error: systemError
  } = useQuery<SystemSettings>({
    queryKey: ['settings', 'system'],
    queryFn: async () => {
      const response = await fetch('/api/settings/system', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }
      return response.json();
    },
    retry: 1
  });

  // Personal settings query
  const {
    data: personalSettings,
    isLoading: personalLoading,
    error: personalError
  } = useQuery<PersonalSettings>({
    queryKey: ['settings', 'personal'],
    queryFn: async () => {
      const response = await fetch('/api/settings/personal', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch personal settings');
      }
      return response.json();
    }
  });

  // Update system settings mutations
  const updateGeneralSettings = useMutation({
    mutationFn: async (data: SystemSettings['general']) => {
      const response = await fetch('/api/settings/system/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update general settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
    }
  });

  const updateSecuritySettings = useMutation({
    mutationFn: async (data: SystemSettings['security']) => {
      const response = await fetch('/api/settings/system/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update security settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
    }
  });

  const updateNotificationSettings = useMutation({
    mutationFn: async (data: SystemSettings['notifications']) => {
      const response = await fetch('/api/settings/system/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
    }
  });

  const updateIntegrationSettings = useMutation({
    mutationFn: async (data: SystemSettings['integrations']) => {
      const response = await fetch('/api/settings/system/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update integration settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
    }
  });

  // Update personal settings mutation
  const updatePersonalSettings = useMutation({
    mutationFn: async (data: Partial<PersonalSettings>) => {
      const response = await fetch('/api/settings/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update personal settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'personal'] });
    }
  });

  // Set up SSE for real-time updates (admin only)
  useEffect(() => {
    // Only set up SSE for system settings if we have access
    if (systemSettings && !systemError) {
      const eventSource = new EventSource('/api/settings/events', {
        withCredentials: true
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'settings_updated') {
            // Invalidate and refetch settings
            queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };

      setSseConnection(eventSource);

      return () => {
        eventSource.close();
      };
    }
  }, [systemSettings, systemError, queryClient]);

  return {
    // System settings (admin only)
    systemSettings,
    systemLoading,
    systemError,
    updateGeneralSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateIntegrationSettings,

    // Personal settings
    personalSettings,
    personalLoading,
    personalError,
    updatePersonalSettings,

    // Real-time connection status
    isConnected: sseConnection?.readyState === EventSource.OPEN
  };
};