import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { queryClient } from '@/lib/queryClient';

interface VerificationStatusUpdate {
  userId: number;
  documentId: number;
  status: 'pending' | 'verified' | 'rejected';
  message?: string;
  timestamp: string;
}

export function useVerificationStatusUpdates() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<VerificationStatusUpdate | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/verification-updates`;
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Verification status WebSocket connected');
          setIsConnected(true);
          
          // Send authentication
          ws.send(JSON.stringify({
            type: 'auth',
            userId: user.id,
            token: user.token // Assuming user has a token
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const update: VerificationStatusUpdate = JSON.parse(event.data);
            console.log('Received verification status update:', update);
            
            setLastUpdate(update);
            
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ 
              queryKey: ['/api/verification/verification-status'] 
            });
            
            if (user.role === 'admin') {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/verification/pending-verifications'] 
              });
            }
          } catch (error) {
            console.error('Error parsing verification status update:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('Verification status WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('Verification status WebSocket error:', error);
          setIsConnected(false);
        };
        
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
        
        // Retry connection after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };
    
    // Initial connection
    connect();
    
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  return {
    isConnected,
    lastUpdate,
    clearLastUpdate: () => setLastUpdate(null)
  };
}

// Hook for displaying verification status notifications
export function useVerificationNotifications() {
  const { lastUpdate, clearLastUpdate } = useVerificationStatusUpdates();
  const [notifications, setNotifications] = useState<VerificationStatusUpdate[]>([]);

  useEffect(() => {
    if (lastUpdate) {
      setNotifications(prev => [lastUpdate, ...prev.slice(0, 4)]); // Keep last 5 notifications
      
      // Auto-clear after 10 seconds
      const timeout = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.timestamp !== lastUpdate.timestamp));
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [lastUpdate]);

  const dismissNotification = (timestamp: string) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
    if (lastUpdate?.timestamp === timestamp) {
      clearLastUpdate();
    }
  };

  return {
    notifications,
    dismissNotification,
    clearAll: () => {
      setNotifications([]);
      clearLastUpdate();
    }
  };
}