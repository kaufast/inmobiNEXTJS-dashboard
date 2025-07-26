import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export default function SubscriptionPage() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useTranslation(["dashboard", "common"]);
  
  const handlePlanSelect = (planId: string) => {
    // This function will be called when a plan is selected
    console.log(`Selected plan: ${planId}`);
  };
  
  return (
    <DashboardLayout>
      <div className="container py-8 max-w-6xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common:general.backToHome')}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{t('subscription.plans.title')}</h1>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">{t('subscription.plans.chooseRightPlan')}</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                {t('subscription.plans.description')}
              </p>
              
              <div className="flex items-center justify-center mt-6">
                <Label htmlFor="billing-toggle" className={isYearly ? 'text-neutral-500' : 'font-medium'}>
                  {t('subscription.billing.monthly')}
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="mx-3 [&[data-state=checked]]:bg-black"
                />
                <div className="flex items-center">
                  <Label htmlFor="billing-toggle" className={!isYearly ? 'text-neutral-500' : 'font-medium'}>
                    {t('subscription.billing.yearly')}
                  </Label>
                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                    {t('subscription.billing.savePercent', { percent: 40 })}
                  </span>
                </div>
              </div>
            </div>
            
            <SubscriptionPlans isYearly={isYearly} onPlanSelect={handlePlanSelect} />
            
            <div className="mt-12 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">{t('subscription.plans.allPlansInclude')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  t('subscription.plans.features.allListings'),
                  t('subscription.plans.features.secureMessaging'),
                  t('subscription.plans.features.saveProperties'),
                  t('subscription.plans.features.mobileAccess'),
                  t('subscription.plans.features.regularUpdates'),
                  t('subscription.plans.features.support')
                ].map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle2 className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">{t('subscription.faq.title')}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{t('subscription.faq.cancel.question')}</h4>
                <p className="text-neutral-600">{t('subscription.faq.cancel.answer')}</p>
              </div>
              <div>
                <h4 className="font-medium">{t('subscription.faq.payment.question')}</h4>
                <p className="text-neutral-600">{t('subscription.faq.payment.answer')}</p>
              </div>
              <div>
                <h4 className="font-medium">{t('subscription.faq.refund.question')}</h4>
                <p className="text-neutral-600">{t('subscription.faq.refund.answer')}</p>
              </div>
              <div>
                <h4 className="font-medium">{t('subscription.faq.teamDiscount.question')}</h4>
                <p className="text-neutral-600">{t('subscription.faq.teamDiscount.answer')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}