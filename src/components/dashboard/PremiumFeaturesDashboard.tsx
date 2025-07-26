import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Upload, BarChart3, Star, Zap, Megaphone, Users, Calendar } from "lucide-react";

export default function PremiumFeaturesDashboard() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  const isEnterprise = user?.subscriptionTier === 'enterprise';
  
  // Premium features grouped by availability
  const premiumFeatures = [
    {
      id: 'bulk-upload',
      title: t('premium.features.bulkUpload.title'),
      description: t('premium.features.bulkUpload.description'),
      icon: <Upload className="h-5 w-5" />,
      path: '/agent/properties',
      available: isPremium,
      badge: 'Premium'
    },
    {
      id: 'analytics',
      title: t('premium.features.analytics.title'),
      description: t('premium.features.analytics.description'),
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/agent/analytics',
      available: isPremium,
      badge: 'Premium'
    },
    {
      id: 'featured-properties',
      title: t('premium.features.featuredProperties.title'),
      description: t('premium.features.featuredProperties.description'),
      icon: <Star className="h-5 w-5" />,
      path: '/agent/properties',
      available: isPremium,
      badge: 'Premium'
    },
    {
      id: 'priority-support',
      title: t('premium.features.prioritySupport.title'),
      description: t('premium.features.prioritySupport.description'),
      icon: <Zap className="h-5 w-5" />,
      path: '/support',
      available: isPremium,
      badge: 'Premium'
    },
    {
      id: 'marketing-tools',
      title: t('premium.features.marketingTools.title'),
      description: t('premium.features.marketingTools.description'),
      icon: <Megaphone className="h-5 w-5" />,
      path: '/agent/marketing',
      available: isEnterprise,
      badge: 'Enterprise'
    },
    {
      id: 'team-management',
      title: t('premium.features.teamManagement.title'),
      description: t('premium.features.teamManagement.description'),
      icon: <Users className="h-5 w-5" />,
      path: '/agent/team',
      available: isEnterprise,
      badge: 'Enterprise'
    },
    {
      id: 'tour-management',
      title: t('premium.features.tourManagement.title'),
      description: t('premium.features.tourManagement.description'),
      icon: <Calendar className="h-5 w-5" />,
      path: '/agent/tours',
      available: isPremium,
      badge: 'Premium'
    }
  ];
  
  // Function to render badge based on feature tier
  const renderBadge = (badge: string) => {
    if (badge === 'Premium') {
      return <Badge className="bg-[#131313] text-white">{t('premium.badges.premium')}</Badge>;
    } else if (badge === 'Enterprise') {
      return <Badge className="bg-indigo-600 text-white">{t('premium.badges.enterprise')}</Badge>;
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('premium.title')}</h2>
          <p className="text-muted-foreground">
            {isPremium 
              ? t('premium.subtitle.premium')
              : t('premium.subtitle.upgrade')}
          </p>
        </div>
        
        {!isPremium && (
          <Button 
            className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            asChild
          >
            <Link href="/subscription">
              <Crown className="mr-2 h-4 w-4" />
              {t('premium.actions.upgrade')}
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {premiumFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className={`overflow-hidden ${!feature.available ? 'opacity-75' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="bg-neutral-100 p-2 rounded-md">{feature.icon}</div>
                {renderBadge(feature.badge)}
              </div>
              <CardTitle className="mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              {feature.available ? (
                <Button 
                  className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                  asChild
                >
                  <Link href={feature.path}>{t('premium.actions.accessFeature')}</Link>
                </Button>
              ) : (
                <Button 
                  className="w-full bg-neutral-200 text-neutral-600 hover:bg-[#131313] hover:text-white transition-all"
                  asChild
                >
                  <Link href="/subscription">{t('premium.actions.upgradeRequired')}</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}