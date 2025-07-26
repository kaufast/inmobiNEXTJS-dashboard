import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

export interface ApprovalSSEEvent {
  type: 'property_status_changed' | 'agent_status_changed' | 'new_property_submission' | 'new_agent_application' | 'approval_deleted' | 'welcome' | 'heartbeat' | 'connected';
  data?: {
    itemId?: number;
    userId?: number;
    status?: string;
    userName?: string;
    itemType?: 'property' | 'agent';
    itemName?: string;
    timestamp: string;
    clientId?: string;
    role?: string;
    connectedClients?: number;
  };
  timestamp: string;
}

export interface UseApprovalsSSEOptions {
  onEvent?: (event: ApprovalSSEEvent) => void;
  onStatusChange?: (data: ApprovalSSEEvent['data']) => void;
  onNewSubmission?: (data: ApprovalSSEEvent['data']) => void;
  onApprovalDeleted?: (data: ApprovalSSEEvent['data']) => void;
  enableToasts?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useApprovalsSSE(options: UseApprovalsSSEOptions = {}) {
  const {
    onEvent,
    onStatusChange,
    onNewSubmission,
    onApprovalDeleted,
    enableToasts = true,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<ApprovalSSEEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [connectedClients, setConnectedClients] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyDisconnectedRef = useRef(false);

  const showToast = useCallback((event: ApprovalSSEEvent) => {
    if (!enableToasts) return;

    switch (event.type) {
      case 'property_status_changed':
        if (event.data?.status === 'approved') {
          toast({
            title: '✅ Property Approved',
            description: `${event.data.itemName} has been approved`,
            variant: 'default',
          });
        } else if (event.data?.status === 'rejected') {
          toast({
            title: '❌ Property Rejected',
            description: `${event.data.itemName} has been rejected`,
            variant: 'destructive',
          });
        }
        break;
      
      case 'agent_status_changed':
        if (event.data?.status === 'approved') {
          toast({
            title: '✅ Agent Approved',
            description: `${event.data.itemName} has been approved as an agent`,
            variant: 'default',
          });
        } else if (event.data?.status === 'rejected') {
          toast({
            title: '❌ Agent Application Rejected',
            description: `${event.data.itemName}'s application has been rejected`,
            variant: 'destructive',
          });
        }
        break;
      
      case 'new_property_submission':
        // Admin-only feature
        toast({
          title: '🏠 New Property Submission',
          description: `${event.data?.userName} submitted ${event.data?.itemName} for approval`,
        });
        break;
      
      case 'new_agent_application':
        // Admin-only feature
        toast({
          title: '👤 New Agent Application',
          description: `${event.data?.userName} applied to become an agent`,
        });
        break;
      
      case 'approval_deleted':
        toast({
          title: '🗑️ Approval Deleted',
          description: `An approval request has been deleted`,
          variant: 'destructive',
        });
        break;
    }
  }, [enableToasts, toast, user?.role]);

  const handleEvent = useCallback((event: ApprovalSSEEvent) => {
    setLastEvent(event);
    setEventCount(prev => prev + 1);

    // Update connected clients count if available
    if (event.data?.connectedClients !== undefined) {
      setConnectedClients(event.data.connectedClients);
    }

    // Call specific handlers
    switch (event.type) {
      case 'property_status_changed':
      case 'agent_status_changed':
        onStatusChange?.(event.data);
        break;
      case 'new_property_submission':
      case 'new_agent_application':
        onNewSubmission?.(event.data);
        break;
      case 'approval_deleted':
        onApprovalDeleted?.(event.data);
        break;
    }

    // Show toast notification
    showToast(event);

    // Call generic event handler
    onEvent?.(event);

    // Invalidate relevant queries for real-time updates
    if (event.type !== 'heartbeat' && event.type !== 'welcome' && event.type !== 'connected') {
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
      
      // Admin-only approvals system - no need to invalidate user-specific queries
    }
  }, [onEvent, onStatusChange, onNewSubmission, onApprovalDeleted, showToast, user?.id]);

  const connect = useCallback(() => {
    if (!user || eventSourceRef.current) return;

    isManuallyDisconnectedRef.current = false;
    setConnectionStatus('connecting');

    try {
      const eventSource = new EventSource('/api/property-approval/events', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('Approvals SSE connection opened');
        setConnectionStatus('connected');
        
        // Clear reconnect timeout if connection is successful
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ApprovalSSEEvent = JSON.parse(event.data);
          handleEvent(data);
        } catch (error) {
          console.error('Error parsing approvals SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Approvals SSE connection error:', error);
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
      console.error('Failed to create approvals SSE connection:', error);
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