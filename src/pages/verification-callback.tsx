import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useVerificationCallback } from '@/hooks/use-verification';
import { AlertCircle, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

type CallbackStatus = 'loading' | 'success' | 'error';

export default function VerificationCallback() {
  const { t } = useTranslation('auth');
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Get session ID from URL query parameters
  const getSessionId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_id');
  };
  
  // Use our hook for processing the callback
  const verificationCallbackMutation = useVerificationCallback();
  
  useEffect(() => {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      setStatus('error');
      setErrorMessage(t('verification_invalid_session'));
      return;
    }
    
    // Animation to show progress
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 5;
        if (nextProgress >= 100) {
          clearInterval(timer);
        }
        return nextProgress;
      });
    }, 100);
    
    // Make request to backend to process callback
    const processCallback = async () => {
      try {
        await verificationCallbackMutation.mutateAsync(sessionId);
        setStatus('success');
      } catch (error) {
        console.error('Error processing verification callback:', error);
        setStatus('error');
        if (error instanceof Error) {
          setErrorMessage(error.message || t('verification_generic_error'));
        } else {
          setErrorMessage(t('verification_network_error'));
        }
      }
    };
    
    // Give it a short delay to show the progress animation
    setTimeout(() => {
      processCallback();
    }, 1500);
    
    return () => clearInterval(timer);
  }, [t, verificationCallbackMutation]);
  
  // Render different content based on status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('verification_processing')}</CardTitle>
              <CardDescription>{t('verification_please_wait')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2 w-full" />
              <p className="mt-2 text-sm text-center text-muted-foreground">
                {t('verification_verifying_identity')}
              </p>
            </CardContent>
          </Card>
        );
        
      case 'success':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-6 w-6 text-green-600" />
                <CardTitle>{t('verification_complete')}</CardTitle>
              </div>
              <Separator className="my-2" />
              <CardDescription>{t('verification_success_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-500 bg-green-50">
                <Check className="h-5 w-5 text-green-600" />
                <AlertTitle>{t('verification_verified_successfully')}</AlertTitle>
                <AlertDescription>
                  {t('verification_verified_successfully_description')}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-[#131313] hover:bg-white hover:text-[#131313]"
                onClick={() => setLocation('/dashboard')}
              >
                {t('verification_go_to_dashboard')}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'error':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle>{t('verification_failed')}</CardTitle>
              </div>
              <Separator className="my-2" />
              <CardDescription>{t('verification_failed_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>{t('verification_error_occurred')}</AlertTitle>
                <AlertDescription>
                  {errorMessage || t('verification_generic_error')}
                </AlertDescription>
              </Alert>
              <p className="mt-4 text-sm text-muted-foreground">
                {t('verification_try_again_description')}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => setLocation('/dashboard')}
              >
                {t('verification_go_to_dashboard')}
              </Button>
              <Button 
                className="w-full sm:w-auto bg-[#131313] hover:bg-white hover:text-[#131313]"
                onClick={() => setLocation('/verification')}
              >
                {t('verification_try_again')}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };
  
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <Container maxWidth="md">
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-2xl font-bold">{t('verification_callback')}</h1>
        </div>
        
        {renderContent()}
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>{t('verification_contact_support')}</p>
        </div>
      </Container>
    </div>
  );
}