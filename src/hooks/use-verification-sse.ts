import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

export interface VerificationSSEEvent {
  type: 'verification_status_changed' | 'new_verification_request' | 'verification_deleted' | 'welcome' | 'heartbeat' | 'connected';
  data?: {
    documentId?: number;
    userId?: number;
    status?: string;
    userName?: string;
    documentType?: string;
    timestamp: string;
    clientId?: string;
    role?: string;
    connectedClients?: number;
  };
  timestamp: string;
}

export interface UseVerificationSSEOptions {
  onEvent?: (event: VerificationSSEEvent) => void;
  onStatusChange?: (data: VerificationSSEEvent['data']) => void;
  onNewRequest?: (data: VerificationSSEEvent['data']) => void;
  onVerificationDeleted?: (data: VerificationSSEEvent['data']) => void;
  enableToasts?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useVerificationSSE(options: UseVerificationSSEOptions = {}) {
  const {
    onEvent,
    onStatusChange,
    onNewRequest,
    onVerificationDeleted,
    enableToasts = true,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<VerificationSSEEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [connectedClients, setConnectedClients] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyDisconnectedRef = useRef(false);

  const showToast = useCallback((event: VerificationSSEEvent) => {
    if (!enableToasts) return;

    switch (event.type) {
      case 'verification_status_changed':
        if (event.data?.status === 'verified') {
          toast({
            title: '✅ Verification Approved',
            description: `${event.data.userName}'s ${event.data.documentType} has been verified`,
            variant: 'default',
          });
        } else if (event.data?.status === 'rejected') {
          toast({
            title: '❌ Verification Rejected',
            description: `${event.data.userName}'s ${event.data.documentType} has been rejected`,
            variant: 'destructive',
          });
        }
        break;
      
      case 'new_verification_request':
        // Only show to admins
        if (user?.role === 'admin') {
          toast({
            title: '📋 New Verification Request',
            description: `${event.data?.userName} submitted ${event.data?.documentType} for verification`,
          });
        }
        break;
      
      case 'verification_deleted':
        toast({
          title: '🗑️ Verification Deleted',
          description: `A verification request has been deleted`,
          variant: 'destructive',
        });
        break;
    }
  }, [enableToasts, toast, user?.role]);

  const handleEvent = useCallback((event: VerificationSSEEvent) => {
    setLastEvent(event);
    setEventCount(prev => prev + 1);

    // Update connected clients count if available
    if (event.data?.connectedClients !== undefined) {
      setConnectedClients(event.data.connectedClients);
    }

    // Call specific handlers
    switch (event.type) {
      case 'verification_status_changed':
        onStatusChange?.(event.data);
        break;
      case 'new_verification_request':
        onNewRequest?.(event.data);
        break;
      case 'verification_deleted':
        onVerificationDeleted?.(event.data);
        break;
    }

    // Show toast notification
    showToast(event);

    // Call generic event handler
    onEvent?.(event);

    // Invalidate relevant queries for real-time updates
    if (event.type !== 'heartbeat' && event.type !== 'welcome' && event.type !== 'connected') {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/pending-verifications'] });
      
      // Also invalidate user verification status if it affects the current user
      if (event.data?.userId === user?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/verification/verification-status'] });
      }
    }
  }, [onEvent, onStatusChange, onNewRequest, onVerificationDeleted, showToast, user?.id]);

  const connect = useCallback(() => {
    if (!user || eventSourceRef.current) return;

    isManuallyDisconnectedRef.current = false;
    setConnectionStatus('connecting');

    try {
      const eventSource = new EventSource('/api/verification/events', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnectionStatus('connected');
        
        // Clear reconnect timeout if connection is successful
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: VerificationSSEEvent = JSON.parse(event.data);
          handleEvent(data);
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setConnectionStatus('error');
        
        // Close the connection
        eventSource.close();
        eventSourceRef.current = null;

        // Auto-reconnect if enabled and not manually disconnected
        if (autoReconnect && !isManuallyDisconnectedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isManuallyDisconnectedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setConnectionStatus('error');
    }
  }, [user, handleEvent, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    isManuallyDisconnectedRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 100); // Small delay to ensure clean disconnection
  }, [disconnect, connect]);

  // Auto-connect when user is available
  useEffect(() => {
    if (user && connectionStatus === 'disconnected') {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect, connectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    lastEvent,
    eventCount,
    connectedClients,
    connect,
    disconnect,
    reconnect,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
  };
}