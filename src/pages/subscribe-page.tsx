import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from "@/hooks/use-language";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useLocation } from 'wouter';

const STRIPE_ENABLED = !!(import.meta.env.VITE_STRIPE_PUBLIC_KEY && !import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes('placeholder'));

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ planId, isYearly, planName, returnToPlans }: { 
  planId: string, 
  isYearly: boolean, 
  planName: string,
  returnToPlans: () => void
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currentLanguage: locale } = useLanguage();
  const { t } = useTranslation('dashboard');

  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Use locale-aware return_url
        return_url: `${window.location.origin}${route('/subscription-success')}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 mb-6">
        <div className="flex justify-between border-b pb-4">
          <div className="font-medium">
            {planName} {t('subscription.plans.tiers.' + planId + '.name')} 
            ({isYearly ? t('subscription.plans.perYear') : t('subscription.plans.perMonth')})
          </div>
          <div className="font-semibold">
            {isYearly ? 
              `$${(planId === 'premium' ? 19.99 * 12 * 0.6 : 49.99 * 12 * 0.6).toFixed(2)}` : 
              `$${planId === 'premium' ? '19.99' : '49.99'}`}
            /{isYearly ? t('subscription.plans.perYear') : t('subscription.plans.perMonth')}
          </div>
        </div>
        
        {isYearly && (
          <div className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center">
            {t('subscription.plans.saveWithYearly').replace('{percent}', '40')}
          </div>
        )}
      </div>
      
      <PaymentElement />
      
      <div className="flex gap-3">
        <Button 
          type="button"
          variant="shadcn-black"
          onClick={returnToPlans}
          disabled={isLoading}
        >
          {t('subscription.status.viewPlans')}
        </Button>
        <Button 
          type="submit"
          variant="shadcn-black"
          disabled={!stripe || !elements || isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              {t('ui.processing')}
            </>
          ) : (
            t('subscription.plans.tiers.' + planId + '.buttonText')
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SubscribePage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [planName, setPlanName] = useState("Premium");
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { currentLanguage: locale } = useLanguage();
  const { t } = useTranslation('dashboard');
  
  const planId = searchParams.get('plan') || 'premium';
  const isYearly = searchParams.get('billing') === 'yearly';

  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }
    
    // Get plan details based on planId
    if (planId === 'premium') {
      setPlanName('Premium');
    } else if (planId === 'enterprise') {
      setPlanName('Enterprise');
    }

    // Create a PaymentIntent as soon as the page loads
    async function createPaymentIntent() {
      try {
        setIsLoading(true);
        const response = await apiRequest("POST", "/api/get-or-create-subscription", {
          planId,
          isYearly
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create subscription");
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to set up payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    createPaymentIntent();
  }, [planId, isYearly, user, setLocation, toast]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#131313',
    },
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  const returnToPlans = () => {
    setLocation(route('/subscription'));
  };

  if (!STRIPE_ENABLED) {
    return (
      <DashboardLayout>
        <div className="container py-8 max-w-2xl">
          <div className="mb-6 flex items-center">
            <Button 
              variant="shadcn-black" 
              className="mr-2"
              onClick={returnToPlans}
            >
              <span className="h-4 w-4 mr-2">←</span>
              {t('subscription.status.viewPlans')}
            </Button>
            <h1 className="text-2xl font-bold">{t('subscription.status.title')}</h1>
          </div>
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('subscription.status.errorMessage')}</h2>
            <p className="text-gray-600 mb-4">
              {t('subscription.status.canceledMessage', { date: '' })}
            </p>
            <Button 
              onClick={returnToPlans}
              variant="shadcn-black"
            >
              {t('subscription.status.viewPlans')}
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="shadcn-black" 
            className="mr-2"
            onClick={returnToPlans}
          >
            <span className="h-4 w-4 mr-2">←</span>
            {t('subscription.status.viewPlans')}
          </Button>
          <h1 className="text-2xl font-bold">{t('subscription.status.title')} {planName}</h1>
        </div>
        
        <Card className="p-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <span className="h-8 w-8 inline-block border-2 border-t-transparent border-black rounded-full animate-spin mb-4"></span>
              <p>{t('subscription.status.loading')}</p>
            </div>
          ) : !clientSecret ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">{t('subscription.status.error')}</h2>
              <p className="text-gray-600 mb-4">
                {t('subscription.status.errorMessage')}
              </p>
              <Button 
                onClick={returnToPlans}
                variant="shadcn-black"
              >
                {t('subscription.status.viewPlans')}
              </Button>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                planId={planId} 
                isYearly={isYearly} 
                planName={planName}
                returnToPlans={returnToPlans}
              />
            </Elements>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}