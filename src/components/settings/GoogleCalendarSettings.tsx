import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalendarStatus {
  connected: boolean;
  loading: boolean;
  error?: string;
}

export default function GoogleCalendarSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<CalendarStatus>({ connected: false, loading: true });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check connection status on component mount
  useEffect(() => {
    checkCalendarStatus();
  }, []);

  // Check for callback parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarConnected = urlParams.get('calendar_connected');
    const calendarError = urlParams.get('calendar_error');

    if (calendarConnected === 'true') {
      toast({
        title: 'Calendar Connected',
        description: 'Your Google Calendar has been successfully connected!',
        variant: 'default',
        className: 'bg-green-50 text-green-800 border-green-300',
      });
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh status
      checkCalendarStatus();
    }

    if (calendarError) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'You denied access to your Google Calendar.',
        'missing_parameters': 'Missing required parameters. Please try again.',
        'invalid_user': 'Invalid user session. Please log in again.',
        'token_exchange_failed': 'Failed to connect to Google Calendar. Please try again.',
        'callback_error': 'An error occurred during the connection process.'
      };

      const errorMessage = errorMessages[calendarError] || 'An unknown error occurred.';
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const checkCalendarStatus = async () => {
    if (!user) return;

    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await fetch('/api/auth/google/calendar/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ connected: data.connected, loading: false });
      } else {
        throw new Error('Failed to check calendar status');
      }
    } catch (error) {
      setStatus({ 
        connected: false, 
        loading: false, 
        error: 'Failed to check calendar status' 
      });
    }
  };

  const connectCalendar = async () => {
    if (!user) return;

    try {
      setIsConnecting(true);
      
      const response = await fetch('/api/auth/google/calendar/connect', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate calendar connection');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const disconnectCalendar = async () => {
    if (!user) return;

    try {
      setIsDisconnecting(true);
      
      const response = await fetch('/api/auth/google/calendar/disconnect', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setStatus({ connected: false, loading: false });
        toast({
          title: 'Calendar Disconnected',
          description: 'Your Google Calendar has been disconnected.',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to disconnect calendar');
      }
    } catch (error) {
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect Google Calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Please log in to manage your calendar integration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your property tours with your Google Calendar for better scheduling management.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
          <div className="flex items-center gap-3">
            {status.loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : status.connected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            
            <div>
              <p className="font-medium">
                {status.loading ? 'Checking...' : status.connected ? 'Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-gray-600">
                {status.loading 
                  ? 'Checking calendar connection status...'
                  : status.connected 
                    ? 'Your Google Calendar is connected and ready to sync'
                    : 'Connect your Google Calendar to sync property tours'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={status.connected ? "default" : "secondary"}
              className={status.connected ? "bg-green-100 text-green-800" : ""}
            >
              {status.connected ? 'Active' : 'Inactive'}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={checkCalendarStatus}
              disabled={status.loading}
              className="border-black"
            >
              <RefreshCw className={`h-4 w-4 ${status.loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {status.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}

        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-medium">When connected, you can:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Automatically sync property tours to your calendar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Check availability against your existing events
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Receive calendar reminders for scheduled tours
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Share tour details with clients automatically
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          {status.connected && (
            <>Last synced: Just now</>
          )}
        </div>
        
        <div className="flex gap-2">
          {status.connected ? (
            <Button
              variant="outline"
              onClick={disconnectCalendar}
              disabled={isDisconnecting}
              className="border-black text-black hover:bg-gray-100"
            >
              {isDisconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={connectCalendar}
              disabled={isConnecting || status.loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Google Calendar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}