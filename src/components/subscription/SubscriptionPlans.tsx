import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

interface PlanFeature {
  name: string;
  translationKey: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  nameKey: string;
  price: number;
  yearlyPrice: number;
  descriptionKey: string;
  features: PlanFeature[];
  buttonTextKey: string;
  highlight?: boolean;
  popular?: boolean;
}

interface SubscriptionPlansProps {
  isYearly?: boolean;
  onPlanSelect?: (planId: string) => void;
}

export default function SubscriptionPlans({ 
  isYearly = false, 
  onPlanSelect 
}: SubscriptionPlansProps) {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  
  // Calculate yearly price with 40% discount
  const getYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12;
    const discount = yearlyPrice * 0.4; // 40% discount
    return yearlyPrice - discount;
  };
  
  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      nameKey: 'subscription.plans.tiers.basic.name',
      price: 0,
      yearlyPrice: 0,
      descriptionKey: 'subscription.plans.tiers.basic.description',
      features: [
        { name: 'Basic property listing', translationKey: 'subscription.plans.features.basicListing', included: true },
        { name: 'Save favorite properties', translationKey: 'subscription.plans.features.saveFavorites', included: true },
        { name: 'Contact property owners', translationKey: 'subscription.plans.features.contactOwners', included: true },
        { name: 'Premium property listings', translationKey: 'subscription.plans.features.premiumListings', included: false },
        { name: 'Bulk property uploads', translationKey: 'subscription.plans.features.bulkUploads', included: false },
        { name: 'Advanced analytics', translationKey: 'subscription.plans.features.analytics', included: false },
        { name: 'Priority support', translationKey: 'subscription.plans.features.prioritySupport', included: false },
        { name: 'Featured property placement', translationKey: 'subscription.plans.features.featuredPlacement', included: false },
      ],
      buttonTextKey: 'subscription.plans.tiers.basic.buttonText',
      highlight: false,
    },
    {
      id: 'premium',
      nameKey: 'subscription.plans.tiers.premium.name',
      price: 19.99,
      yearlyPrice: getYearlyPrice(19.99),
      descriptionKey: 'subscription.plans.tiers.premium.description',
      features: [
        { name: 'Basic property listing', translationKey: 'subscription.plans.features.basicListing', included: true },
        { name: 'Save favorite properties', translationKey: 'subscription.plans.features.saveFavorites', included: true },
        { name: 'Contact property owners', translationKey: 'subscription.plans.features.contactOwners', included: true },
        { name: 'Premium property listings', translationKey: 'subscription.plans.features.premiumListings', included: true },
        { name: 'Bulk property uploads', translationKey: 'subscription.plans.features.bulkUploads', included: true },
        { name: 'Advanced analytics', translationKey: 'subscription.plans.features.analytics', included: true },
        { name: 'Priority support', translationKey: 'subscription.plans.features.prioritySupport', included: true },
        { name: 'Featured property placement', translationKey: 'subscription.plans.features.featuredPlacement', included: true },
      ],
      buttonTextKey: 'subscription.plans.tiers.premium.buttonText',
      highlight: true,
      popular: true,
    },
    {
      id: 'enterprise',
      nameKey: 'subscription.plans.tiers.enterprise.name',
      price: 49.99,
      yearlyPrice: getYearlyPrice(49.99),
      descriptionKey: 'subscription.plans.tiers.enterprise.description',
      features: [
        { name: 'Basic property listing', translationKey: 'subscription.plans.features.basicListing', included: true },
        { name: 'Save favorite properties', translationKey: 'subscription.plans.features.saveFavorites', included: true },
        { name: 'Contact property owners', translationKey: 'subscription.plans.features.contactOwners', included: true },
        { name: 'Premium property listings', translationKey: 'subscription.plans.features.premiumListings', included: true },
        { name: 'Unlimited bulk property uploads', translationKey: 'subscription.plans.features.unlimitedBulkUploads', included: true },
        { name: 'Advanced analytics & reporting', translationKey: 'subscription.plans.features.advancedAnalytics', included: true },
        { name: 'Priority 24/7 support', translationKey: 'subscription.plans.features.priorityAllHoursSupport', included: true },
        { name: 'Featured property placement', translationKey: 'subscription.plans.features.featuredPlacement', included: true },
        { name: 'Custom branding', translationKey: 'subscription.plans.features.customBranding', included: true },
        { name: 'API access', translationKey: 'subscription.plans.features.apiAccess', included: true },
        { name: 'White-label solution', translationKey: 'subscription.plans.features.whiteLabel', included: true },
      ],
      buttonTextKey: 'subscription.plans.tiers.enterprise.buttonText',
      highlight: false,
    },
  ];

  const handlePlanClick = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return t('subscription.plans.free');
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const price = isYearly ? plan.yearlyPrice : plan.price;
        const isPremiumUser = user?.subscriptionTier === 'premium';
        const isEnterpriseUser = user?.subscriptionTier === 'enterprise';
        const isCurrentPlan = 
          (plan.id === 'free' && (!user?.subscriptionTier || user.subscriptionTier === 'free')) ||
          (plan.id === 'premium' && isPremiumUser) ||
          (plan.id === 'enterprise' && isEnterpriseUser);
        
        return (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[#131313] text-white px-3 py-1 text-xs font-bold tracking-wider transform translate-y-[-50%] rounded-full">
                {t('subscription.plans.popular')}
              </div>
            )}
            <CardHeader>
              <CardTitle>{t(plan.nameKey)}</CardTitle>
              <CardDescription>{t(plan.descriptionKey)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatPrice(price)}</span>
                {price > 0 && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {isYearly ? t('subscription.plans.perYear') : t('subscription.plans.perMonth')}
                  </span>
                )}
                
                {isYearly && price > 0 && (
                  <div className="mt-1 text-sm text-emerald-600 font-semibold">
                    {t('subscription.plans.saveWithYearly').replace('{percent}', '40')}
                  </div>
                )}
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-neutral-300 mr-2 shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-neutral-500'}>
                      {t(feature.translationKey)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan ? (
                <Button 
                  className="w-full"
                  variant={plan.id === 'premium' ? 'current-plan' : 'default'}
                  disabled
                >
                  {t('subscription.plans.currentPlan')}
                </Button>
              ) : plan.id === 'enterprise' ? (
                <Button 
                  className="w-full"
                  variant="shadcn-black"
                  onClick={() => handlePlanClick(plan.id)}
                  asChild
                >
                  <Link href="/contact">{t('subscription.plans.contactSales')}</Link>
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  variant="shadcn-black"
                  onClick={() => handlePlanClick(plan.id)}
                  asChild
                >
                  <Link href={`/subscribe?plan=${plan.id}${isYearly ? '&billing=yearly' : ''}`}>
                    {t(plan.buttonTextKey)}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}