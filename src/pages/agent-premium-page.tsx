import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PremiumFeaturesDashboard from '@/components/dashboard/PremiumFeaturesDashboard';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import PremiumFeatureWrapper from '@/components/subscription/PremiumFeatureWrapper';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function AgentPremiumPage() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  const { t } = useTranslation('common');
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('agent.premium.title')}</h2>
          <p className="text-muted-foreground">
            {isPremium 
              ? t('agent.premium.subtitle.premium')
              : t('agent.premium.subtitle.basic')}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-1">
            <SubscriptionStatus />
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('agent.premium.benefits.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <div className="bg-[#131313] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium">{t('agent.premium.benefits.propertyListings.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('agent.premium.benefits.propertyListings.description')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#131313] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">{t('agent.premium.benefits.bulkUpload.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('agent.premium.benefits.bulkUpload.description')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#131313] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium">{t('agent.premium.benefits.analytics.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('agent.premium.benefits.analytics.description')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#131313] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <h3 className="font-medium">{t('agent.premium.benefits.support.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('agent.premium.benefits.support.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList>
            <TabsTrigger value="features">{t('agent.premium.tabs.features')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('agent.premium.tabs.analytics')}</TabsTrigger>
            <TabsTrigger value="marketing">{t('agent.premium.tabs.marketing')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <PremiumFeaturesDashboard />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <PremiumFeatureWrapper 
              feature={t('agent.premium.featureWrapper.advancedAnalytics')}
              description={t('agent.premium.featureWrapper.analyticsDescription')}
              showUpgradePrompt={!isPremium}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('agent.premium.analytics.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-10 text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('agent.premium.analytics.comingSoon')}</h3>
                    <p className="text-muted-foreground">
                      {t('agent.premium.analytics.comingSoonDesc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PremiumFeatureWrapper>
          </TabsContent>
          
          <TabsContent value="marketing" className="space-y-4">
            <PremiumFeatureWrapper 
              feature={t('agent.premium.featureWrapper.marketingTools')}
              description={t('agent.premium.featureWrapper.marketingDescription')}
              showUpgradePrompt={!isPremium}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('agent.premium.marketing.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-10 text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('agent.premium.marketing.comingSoon')}</h3>
                    <p className="text-muted-foreground">
                      {t('agent.premium.marketing.comingSoonDesc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PremiumFeatureWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}