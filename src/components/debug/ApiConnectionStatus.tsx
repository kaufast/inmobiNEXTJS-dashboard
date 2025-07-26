import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { testApiConnection } from '@/lib/api-config';

export function ApiConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    const currentApiUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : process.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8090`;
    
    setApiUrl(currentApiUrl);
    const connected = await testApiConnection(currentApiUrl);
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={isConnected === false ? 'destructive' : 'default'}>
        <AlertDescription className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected === null ? 'bg-gray-400' :
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              API: {isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {apiUrl}
          </div>
          {isConnected === false && (
            <div className="space-y-1">
              <div className="text-xs text-red-600">
                Cannot connect to backend. Check:
              </div>
              <ul className="text-xs text-red-600 ml-2">
                <li>• Server running on port 8090?</li>
                <li>• Correct VITE_API_URL in .env?</li>
              </ul>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={checkConnection}
                disabled={isChecking}
                className="w-full mt-2"
              >
                {isChecking ? 'Checking...' : 'Retry'}
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}