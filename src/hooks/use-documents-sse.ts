import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

export interface DocumentSSEEvent {
  type: 'document_status_changed' | 'new_document_submission' | 'document_deleted' | 'welcome' | 'heartbeat' | 'connected';
  data?: {
    itemId?: number;
    userId?: number;
    status?: string;
    userName?: string;
    itemType?: 'document';
    itemName?: string;
    timestamp: string;
    clientId?: string;
    role?: string;
    connectedClients?: number;
  };
  timestamp: string;
}

export interface UseDocumentsSSEOptions {
  onEvent?: (event: DocumentSSEEvent) => void;
  onStatusChange?: (data: DocumentSSEEvent['data']) => void;
  onNewSubmission?: (data: DocumentSSEEvent['data']) => void;
  onDocumentDeleted?: (data: DocumentSSEEvent['data']) => void;
  enableToasts?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useDocumentsSSE(options: UseDocumentsSSEOptions = {}) {
  const {
    onEvent,
    onStatusChange,
    onNewSubmission,
    onDocumentDeleted,
    enableToasts = true,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<DocumentSSEEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [connectedClients, setConnectedClients] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyDisconnectedRef = useRef(false);

  const showToast = useCallback((event: DocumentSSEEvent) => {
    if (!enableToasts) return;

    switch (event.type) {
      case 'document_status_changed':
        if (event.data?.status === 'verified') {
          toast({
            title: '✅ Document Verified',
            description: `${event.data.itemName} has been verified`,
            variant: 'default',
          });
        } else if (event.data?.status === 'rejected') {
          toast({
            title: '❌ Document Rejected',
            description: `${event.data.itemName} has been rejected`,
            variant: 'destructive',
          });
        }
        break;
      
      case 'new_document_submission':
        // Admin-only feature
        toast({
          title: '📄 New Document Submission',
          description: `${event.data?.userName} submitted ${event.data?.itemName} for review`,
        });
        break;
      
      case 'document_deleted':
        toast({
          title: '🗑️ Document Deleted',
          description: `A document has been deleted`,
          variant: 'destructive',
        });
        break;
    }
  }, [enableToasts, toast]);

  const handleEvent = useCallback((event: DocumentSSEEvent) => {
    setLastEvent(event);
    setEventCount(prev => prev + 1);

    // Update connected clients count if available
    if (event.data?.connectedClients !== undefined) {
      setConnectedClients(event.data.connectedClients);
    }

    // Call specific handlers
    switch (event.type) {
      case 'document_status_changed':
        onStatusChange?.(event.data);
        break;
      case 'new_document_submission':
        onNewSubmission?.(event.data);
        break;
      case 'document_deleted':
        onDocumentDeleted?.(event.data);
        break;
    }

    // Show toast notification
    showToast(event);

    // Call generic event handler
    onEvent?.(event);

    // Invalidate relevant queries for real-time updates
    if (event.type !== 'heartbeat' && event.type !== 'welcome' && event.type !== 'connected') {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
      
      // Admin-only documents system - invalidate admin specific queries
      queryClient.invalidateQueries({ queryKey: ['/api/documents/admin/stats'] });
    }
  }, [onEvent, onStatusChange, onNewSubmission, onDocumentDeleted, showToast]);

  const connect = useCallback(() => {
    if (!user || eventSourceRef.current) return;

    isManuallyDisconnectedRef.current = false;
    setConnectionStatus('connecting');

    try {
      const eventSource = new EventSource('/api/documents/events', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('Documents SSE connection opened');
        setConnectionStatus('connected');
        
        // Clear reconnect timeout if connection is successful
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: DocumentSSEEvent = JSON.parse(event.data);
          handleEvent(data);
        } catch (error) {
          console.error('Error parsing documents SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Documents SSE connection error:', error);
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
      console.error('Failed to create documents SSE connection:', error);
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