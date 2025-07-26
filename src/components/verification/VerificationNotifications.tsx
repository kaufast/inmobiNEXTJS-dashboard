import { useVerificationNotifications } from '@/hooks/use-verification-status';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export function VerificationNotifications() {
  const { notifications, dismissNotification, clearAll } = useVerificationNotifications();
  const { t } = useTranslation('verification');

  if (notifications.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string, documentId: number) => {
    switch (status) {
      case 'verified':
        return t('notifications.verified', { documentId });
      case 'rejected':
        return t('notifications.rejected', { documentId });
      case 'pending':
        return t('notifications.pending', { documentId });
      default:
        return t('notifications.updated', { documentId });
    }
  };

  const getAlertVariant = (status: string): 'default' | 'destructive' => {
    return status === 'rejected' ? 'destructive' : 'default';
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Verification Updates</h3>
        {notifications.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.timestamp}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              variant={getAlertVariant(notification.status)}
              className="relative pr-8 shadow-lg border-l-4"
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(notification.status)}
                <div className="flex-1">
                  <AlertDescription className="text-sm">
                    <div className="font-medium mb-1">
                      {getStatusMessage(notification.status, notification.documentId)}
                    </div>
                    {notification.message && (
                      <div className="text-xs text-muted-foreground">
                        {notification.message}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </AlertDescription>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => dismissNotification(notification.timestamp)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Status indicator for connection
export function VerificationStatusIndicator() {
  const { isConnected } = useVerificationNotifications();
  
  if (!isConnected) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        Real-time updates disconnected
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      Real-time updates active
    </div>
  );
}