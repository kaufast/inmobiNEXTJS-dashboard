import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Password reset schema
const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const { resetPasswordMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { t } = useTranslation("verification");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Set up form with zod validation
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    } else {
      // If no token, maybe redirect or show error. For now, this might be handled by later logic.
      // setError(t('resetPassword.invalidToken')); // Key needs to exist in verification.json
    }
  }, []);
  
  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      setError(t('resetPassword.invalidToken'));
      return;
    }
    
    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword: data.newPassword });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetPassword.error'));
    }
  };
  
  if (!token && !error && !success) {
    // Handling the case where there's no token from the start more explicitly
    // You might want a dedicated UI for this, or a redirect
    // For now, using the existing error for invalid token
    // This assumes 'resetPassword.invalidToken' is a valid key in your new verification.json
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>{t('resetPassword.invalidToken')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('resetPassword.title')}</CardTitle>
          <CardDescription>{t('resetPassword.description')}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{t('resetPassword.success')}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={t('resetPassword.enterNewPassword')}
                        disabled={resetPasswordMutation.isPending || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={t('resetPassword.enterConfirmPassword')}
                        disabled={resetPasswordMutation.isPending || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending || success}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : t('resetPassword.resetButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/auth')}
          >
            {t('resetPassword.backToLogin')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 