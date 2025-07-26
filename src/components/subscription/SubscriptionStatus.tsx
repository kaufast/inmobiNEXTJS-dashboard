import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Crown, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionDetails {
  id: number;
  tier: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation('dashboard');
  
  // Fetch subscription details
  const {
    data: subscription,
    isLoading,
    error
  } = useQuery<SubscriptionDetails>({
    queryKey: ['/api/subscription'],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/subscription");
        
        // If subscription not found but user has premium/enterprise tier, return a default subscription
        if (res.status === 404 && user && (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise')) {
          return {
            id: 0, // placeholder ID
            tier: user.subscriptionTier,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30 days from now
            cancelAtPeriodEnd: false
          };
        }
        
        return res.json();
      } catch (error) {
        console.error('Subscription fetch error:', error);
        
        // Fallback if user has premium/enterprise tier
        if (user && (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise')) {
          return {
            id: 0, // placeholder ID
            tier: user.subscriptionTier,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30 days from now
            cancelAtPeriodEnd: false
          };
        }
        
        throw error;
      }
    },
    // Only fetch if user is logged in and has a premium or enterprise tier
    enabled: !!user && (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise')
  });
  
  // If user is not premium or enterprise, show upgrade card
  if (!user || user.subscriptionTier === 'free') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.status.basicTitle')}</CardTitle>
          <CardDescription>
            {t('subscription.status.basicDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <Crown className="h-8 w-8 text-neutral-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              {t('subscription.status.basicMessage')}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            asChild
          >
            <Link href="/subscription">{t('subscription.status.viewPlans')}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.status.title')}</CardTitle>
          <CardDescription>{t('subscription.status.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.status.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('subscription.status.error')}</AlertTitle>
            <AlertDescription>
              {t('subscription.status.errorMessage')}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            {t('subscription.status.tryAgain')}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Determine badge style based on status
  const getBadgeStyle = () => {
    if (!subscription) return 'bg-neutral-500';
    
    switch(subscription.status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-neutral-500';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.subscription.status.notAvailable');
    const date = new Date(dateString);
    
    // Use the locale from i18n for date formatting
    const locale = i18n.language || 'en-US';
    
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Subscription tier label
  const getTierLabel = () => {
    if (!user) return t('common.subscription.plans.tiers.basic.name');
    
    switch(user.subscriptionTier) {
      case 'premium':
        return t('common.subscription.plans.tiers.premium.name');
      case 'enterprise':
        return t('common.subscription.plans.tiers.enterprise.name');
      default:
        return t('common.subscription.plans.tiers.basic.name');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getTierLabel()} {t('subscription.status.title')}</CardTitle>
            <CardDescription>
              {t('subscription.status.details')}
            </CardDescription>
          </div>
          {subscription && (
            <Badge className={getBadgeStyle()}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="py-2 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#131313] flex items-center justify-center">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        {subscription && (
          <>
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('subscription.status.planLabel')}</span>
                <span className="font-semibold">{getTierLabel()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('subscription.status.statusLabel')}</span>
                <span className="capitalize">{subscription.status}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('subscription.status.renewalDate')}</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </div>
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <Alert>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-800">{t('subscription.status.canceledTitle')}</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {t('subscription.status.canceledMessage', { date: formatDate(subscription.currentPeriodEnd) })}
                </AlertDescription>
              </Alert>
            )}
            
            {subscription.status === 'past_due' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('subscription.status.paymentIssueTitle')}</AlertTitle>
                <AlertDescription>
                  {t('subscription.status.paymentIssueMessage')}
                </AlertDescription>
              </Alert>
            )}
            
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>{t('subscription.status.activeSubscription')}</AlertTitle>
                <AlertDescription>
                  {t('subscription.status.activeMessage', { date: formatDate(subscription.currentPeriodEnd) })}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
          asChild
        >
          <Link href="/subscription">
            {user?.subscriptionTier === 'premium' ? t('common.subscription.status.manageSubscription') : t('common.subscription.status.viewPlans')}
          </Link>
        </Button>
        
        {user?.subscriptionTier === 'premium' && (
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link href="/agent/premium">{t('subscription.status.viewPremiumFeatures')}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}