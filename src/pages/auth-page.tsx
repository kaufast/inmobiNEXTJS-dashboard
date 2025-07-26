import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema } from '@shared/schema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { logInfo } from '@/utils/server-logger';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { FaGoogle, FaKey } from 'react-icons/fa';

// Login schema with validation
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Register schema extending the insert schema with validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useTranslation(['auth', 'common']);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Redirect if user is already logged in
  if (user) {
    navigate('/');
    return null;
  }

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'user',
      subscriptionTier: 'free',
      preferredLanguage: 'en',
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword as it's not in the database schema
    const { confirmPassword, ...userData } = data;
    
    registerMutation.mutate(userData, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  // Function to handle passkey login
  async function handlePasskeyLogin() {
    try {
      const optionsResponse = await apiRequest("POST", "/api/auth/passkey/login-options");
      
      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({ message: 'Failed to get authentication options' }));
        throw new Error(errorData.message || t('errors.failedToGetOptions'));
      }
      
      const options = await optionsResponse.json();
      
      if (!options?.challenge) {
        throw new Error(t('errors.invalidServerResponse'));
      }
      
      if (!window.PublicKeyCredential) {
        toast({
          title: t('errors.browserNotSupported'),
          description: t('errors.webAuthnNotSupported'),
          variant: "destructive"
        });
        return;
      }
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          rpId: options.rpId,
          timeout: options.timeout,
          userVerification: options.userVerification
        }
      }) as PublicKeyCredential;
      
      if (!credential) {
        console.log('Passkey login cancelled by user');
        return;
      }
      
      const verifyResponse = await apiRequest("POST", "/api/auth/passkey/login-verify", {
        id: credential.id,
        challenge: options.challenge,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).clientDataJSON)),
          authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
          signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
        },
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({ message: 'Failed to verify credential' }));
        throw new Error(errorData.message || t('errors.failedToVerify'));
      }
      
      const result = await verifyResponse.json();
      
      if (result?.success) {
        navigate('/');
      } else {
        throw new Error(result?.message || t('errors.verificationFailed'));
      }
    } catch (error) {
      console.error('Passkey login error:', error);
      toast({
        title: t('errors.authFailed'),
        description: error instanceof Error ? error.message : t('errors.couldNotAuthenticate'),
        variant: "destructive"
      });
    }
  }

  // Add this function to handle Google OAuth login
  function handleGoogleLogin() {
    // For local development, use local server URLs
    if (process.env.NODE_ENV === 'development') {
      // First, request a redirect URL from our server that includes proper local callback URL
      apiRequest("GET", "/api/auth/google/initialize")
        .then(res => res.json())
        .then(data => {
          // Redirect to the proper Google URL with local callback
          window.location.href = data.url;
        })
        .catch(error => {
          console.error('Error initializing Google auth:', error);
          toast({
            title: "Authentication Error",
            description: "Could not initialize Google login. Please try again.",
            variant: "destructive"
          });
        });
    } else {
      // In production, use the direct URL
      window.location.href = '/api/auth/google';
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Auth Form Side */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8">
        <div className="mx-auto w-full max-w-md">
          <div>
            <h1 className="text-3xl font-bold mb-8 text-center">{t('welcome')}</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">{t('tabs.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('tabs.register')}</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
                  <CardDescription>
                    {t('login.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.username')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('form.usernamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.password')}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('login.loggingIn')}
                          </>
                        ) : (
                          t('login.submit')
                        )}
                      </Button>
                      
                      {/* Social login section */}
                      <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t('login.continueWith')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-full flex items-center justify-center"
                          onClick={handleGoogleLogin}
                        >
                          <FaGoogle className="mr-2" />
                          {t('login.providers.google')}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-full flex items-center justify-center"
                          onClick={() => handlePasskeyLogin()}
                        >
                          <FaKey className="mr-2" />
                          {t('login.providers.passkey')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('login.noAccount')}{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab('register')}
                    >
                      {t('login.registerLink')}
                    </Button>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => navigate('/forgot-password')}
                    >
                      {t('login.forgotPassword')}
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
                  <CardDescription>
                    {t('register.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.username')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('form.usernamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.fullName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('form.fullNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.email')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('form.emailPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.password')}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.confirmPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('register.creatingAccount')}
                          </>
                        ) : (
                          t('register.submit')
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    {t('register.hasAccount')}{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab('login')}
                    >
                      {t('register.loginLink')}
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-8">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">{t('hero.title')}</h2>
          <p className="text-lg mb-8">
            {t('hero.description')}
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('hero.features.listings')}</p>
            </li>
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('hero.features.agents')}</p>
            </li>
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <p>{t('hero.features.search')}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}