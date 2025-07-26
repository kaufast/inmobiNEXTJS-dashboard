import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// Email schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Verification code schema
const verificationCodeSchema = z.object({
  code: z.string().min(1, 'Please enter the verification code'),
});

// Secret answer schema
const secretAnswerSchema = z.object({
  answer: z.string().min(1, 'Please enter your answer'),
});

// New password schema
const newPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const [, navigate] = useLocation();
  const [step, setStep] = useState<'email' | 'methods' | 'email-code' | 'secret-question' | 'new-password' | 'success'>('email');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Email form
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  });

  // Verification code form
  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: '' }
  });

  // Secret answer form
  const secretAnswerForm = useForm<{ answer: string }>({
    resolver: zodResolver(secretAnswerSchema),
    defaultValues: { answer: '' }
  });

  // New password form
  const passwordForm = useForm<{ password: string, confirmPassword: string }>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  // Submit email form
  const onEmailSubmit = async (data: { email: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axios.post('/api/forgot-password', { email: data.email });
      
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setUserId(response.data.userId);
        
        if (response.data.availableMethods && response.data.availableMethods.length > 0) {
          setMethods(response.data.availableMethods);
          setStep('methods');
        } else {
          setError(t('forgotPassword.noVerificationMethods'));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgotPassword.requestFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Select verification method
  const selectMethod = (method: any) => {
    setSelectedMethod(method);
    
    if (method.type === 'email_code') {
      setStep('email-code');
    } else if (method.type === 'secret_question') {
      setStep('secret-question');
    }
  };

  // Send email verification code
  const sendVerificationCode = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await axios.post('/api/verify-identity/email-code', { 
        resetToken, 
        requestCode: true 
      });
      
      setSuccess(t('forgotPassword.codeSent'));
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgotPassword.failedToSendCode'));
    } finally {
      setIsLoading(false);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Verify email code
  const onVerifyCodeSubmit = async (data: { code: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await axios.post('/api/verify-identity/email-code', { 
        resetToken, 
        code: data.code 
      });
      
      setStep('new-password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify secret answer
  const onSecretAnswerSubmit = async (data: { answer: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await axios.post('/api/verify-identity/secret-question', { 
        resetToken, 
        secretAnswer: data.answer 
      });
      
      setStep('new-password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid answer');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const onPasswordSubmit = async (data: { password: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await axios.post('/api/reset-password', { 
        resetToken, 
        newPassword: data.password 
      });
      
      setSuccess('Your password has been reset successfully');
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate temporary password
  const generateTemporaryPassword = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axios.post('/api/reset-password', { 
        resetToken, 
        generateTemporary: true 
      });
      
      setSuccess(response.data.message);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate temporary password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Password Recovery</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {step === 'email' && 'Forgot Password'}
                {step === 'methods' && 'Choose Verification Method'}
                {step === 'email-code' && 'Email Verification'}
                {step === 'secret-question' && 'Security Question'}
                {step === 'new-password' && 'Create New Password'}
                {step === 'success' && 'Password Reset Successful'}
              </CardTitle>
              <CardDescription>
                {step === 'email' && 'Enter your email address to reset your password'}
                {step === 'methods' && 'Select a verification method to continue'}
                {step === 'email-code' && 'Enter the verification code sent to your email'}
                {step === 'secret-question' && 'Answer your security question'}
                {step === 'new-password' && 'Create a new password for your account'}
                {step === 'success' && 'Your password has been reset successfully'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              {/* Email Step */}
              {step === 'email' && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('forgotPassword.email')}</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('forgotPassword.checking')}
                        </>
                      ) : (
                        t('continue')
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              
              {/* Methods Step */}
              {step === 'methods' && (
                <div className="space-y-3">
                  {methods.map((method, index) => (
                    <div 
                      key={index}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectMethod(method)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {method.type === 'email_code' && (
                            <p className="text-sm text-gray-500">{method.partialEmail}</p>
                          )}
                          {method.type === 'secret_question' && (
                            <p className="text-sm text-gray-500">{method.question}</p>
                          )}
                        </div>
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Email Code Step */}
              {step === 'email-code' && (
                <div className="space-y-4">
                  {!success && (
                    <div>
                      <p className="mb-2 text-sm">Send a verification code to your email:</p>
                      <p className="text-sm font-medium">{selectedMethod?.partialEmail}</p>
                      <Button
                        onClick={sendVerificationCode}
                        className="w-full mt-2"
                        disabled={isLoading || resendCountdown > 0}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : resendCountdown > 0 ? (
                          `Resend in ${resendCountdown}s`
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {success && (
                    <Form {...codeForm}>
                      <form onSubmit={codeForm.handleSubmit(onVerifyCodeSubmit)} className="space-y-4">
                        <FormField
                          control={codeForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forgotPassword.verificationCode')}</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter code" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
                              <p className="text-xs text-gray-500">This code will expire in 5 minutes</p>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-between items-center">
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto"
                            onClick={sendVerificationCode}
                            disabled={resendCountdown > 0}
                          >
                            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('forgotPassword.verifying')}
                              </>
                            ) : (
                              t('forgotPassword.verifyCode')
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              )}
              
              {/* Secret Question Step */}
              {step === 'secret-question' && (
                <Form {...secretAnswerForm}>
                  <form onSubmit={secretAnswerForm.handleSubmit(onSecretAnswerSubmit)} className="space-y-4">
                    <p className="font-medium text-sm">{selectedMethod?.question}</p>
                    <FormField
                      control={secretAnswerForm.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('forgotPassword.yourAnswer')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('forgotPassword.verifying')}
                        </>
                      ) : (
                        t('forgotPassword.verifyAnswer')
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              
              {/* New Password Step */}
              {step === 'new-password' && (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('forgotPassword.resettingPassword')}
                        </>
                      ) : (
                        t('forgotPassword.resetPassword')
                      )}
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={generateTemporaryPassword}
                        disabled={isLoading}
                      >
                        {t('forgotPassword.generateTempPassword')}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              {/* Success Step */}
              {step === 'success' && (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{t('forgotPassword.success')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{success}</p>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="mt-6"
                  >
                    {t('forgotPassword.back')}
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="link" 
                className="px-0"
                onClick={() => {
                  if (step === 'methods' || step === 'email-code' || step === 'secret-question') {
                    setStep('email');
                  } else if (step !== 'email' && step !== 'success') {
                    navigate('/auth');
                  }
                }}
                disabled={step === 'email' || step === 'success'}
              >
                {step === 'email' ? '' : step === 'methods' || step === 'email-code' || step === 'secret-question' 
                  ? t('forgotPassword.backToEmail') 
                  : t('forgotPassword.back')}
              </Button>
              <Button 
                variant="link" 
                className="px-0"
                onClick={() => navigate('/auth')}
              >
                {t('forgotPassword.back')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Hero Section - Only on larger screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-8">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">{t('forgotPassword.title')}</h2>
          <p className="text-lg mb-8">
            {t('forgotPassword.subtitle')}
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('forgotPassword.secureVerification')}</p>
            </li>
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('forgotPassword.multipleOptions')}</p>
            </li>
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('forgotPassword.easyReset')}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 