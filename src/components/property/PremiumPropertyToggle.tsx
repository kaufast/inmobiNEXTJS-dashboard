import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Star, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

interface PremiumPropertyToggleProps {
  propertyId: number;
  isPremium: boolean;
}

export default function PremiumPropertyToggle({ propertyId, isPremium: initialIsPremium }: PremiumPropertyToggleProps) {
  const { t } = useTranslation('properties');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  
  const isPremiumUser = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  
  const updatePremiumStatus = useMutation({
    mutationFn: async (isPremium: boolean) => {
      const response = await apiRequest('PATCH', `/api/properties/${propertyId}/premium`, {
        isPremium
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('add.premium.failedToUpdate'));
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries related to properties to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: isPremium ? t('add.premium.markedAsPremium') : t('add.premium.statusRemoved'),
        description: isPremium 
          ? t('add.premium.extraVisibility') 
          : t('add.premium.noLongerPremium'),
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      // Revert the UI state on error
      setIsPremium(!isPremium);
      
      toast({
        title: t('add.premium.failedToUpdateStatus'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleToggle = (checked: boolean) => {
    if (!isPremiumUser) {
      toast({
        title: t('add.premium.subscriptionRequired'),
        description: t('add.premium.needSubscription'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsPremium(checked);
    updatePremiumStatus.mutate(checked);
  };
  
  if (!isPremiumUser) {
    return (
      <div className="space-y-2">
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>{t('add.premium.premiumFeature')}</AlertTitle>
          <AlertDescription>
            {t('add.premium.helpStandOut')}
          </AlertDescription>
        </Alert>
        <Button 
          className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
          asChild
        >
          <Link href="/subscription">{t('add.premium.upgradeToPremium')}</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id={`premium-toggle-${propertyId}`} 
          checked={isPremium}
          onCheckedChange={handleToggle}
          disabled={updatePremiumStatus.isPending}
        />
        <Label 
          htmlFor={`premium-toggle-${propertyId}`}
          className="cursor-pointer flex items-center"
        >
          <span>{t('add.premium.markAsPremium')}</span>
          {updatePremiumStatus.isPending && (
            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
          )}
          {!updatePremiumStatus.isPending && isPremium && (
            <Star className="ml-2 h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </Label>
      </div>
      
      {isPremium && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <AlertTitle>{t('add.premium.premiumProperty')}</AlertTitle>
          <AlertDescription>
            {t('add.premium.priorityPlacement')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}