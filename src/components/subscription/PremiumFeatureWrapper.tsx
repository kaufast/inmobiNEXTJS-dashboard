import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Crown, Loader2, Lock } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';

export interface PremiumFeatureWrapperProps {
  children: React.ReactNode;
  feature: string;
  description: string;
  showUpgradePrompt?: boolean;
}

export default function PremiumFeatureWrapper({
  children,
  feature,
  description,
  showUpgradePrompt = false,
}: PremiumFeatureWrapperProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const [, navigate] = useLocation();
  
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  const showContent = isPremium || showUpgradePrompt === false;

  useEffect(() => {
    if (!isAuthLoading && !showContent && !showUpgradePrompt) {
      navigate('/premium-required');
    }
  }, [isAuthLoading, showContent, showUpgradePrompt, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showContent) {
    return <>{children}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="text-center space-y-6 py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
            <Lock className="h-8 w-8 text-neutral-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{feature}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="max-w-xs mx-auto space-y-4">
            <Button 
              asChild 
              className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            >
              <Link href="/subscription">
                <Crown className="mr-2 h-4 w-4" />
                {t('errors.premiumRequired.buttonText')}
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('errors.premiumRequired.hint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}