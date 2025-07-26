import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from './VerifiedBadge';
import { useVerificationStatus } from '@/hooks/use-verification';

interface VerificationStatusProps {
  userId: number;
  onStartVerification: () => void;
}

export function VerificationStatus({ userId, onStartVerification }: VerificationStatusProps) {
  const { t } = useTranslation('verification');
  
  // Use our custom hook for getting verification status
  const { data, isLoading, error } = useVerificationStatus(userId);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md flex gap-3 items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800">{t('error_loading_status')}</h3>
          <p className="text-sm text-red-700">{t('try_refreshing')}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-red-700 hover:text-red-800 hover:bg-red-100 p-0"
            onClick={() => window.location.reload()}
          >
            {t('refresh_page')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Use data from API with proper typing
  const status = data || {
    isVerified: false,
    verificationType: undefined,
    verificationMethod: undefined,
    verifiedAt: undefined,
    pendingVerification: false
  };
  
  if (status.isVerified) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-md">
          <ShieldCheck className="h-10 w-10 text-green-500" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-green-800">{t('verified')}</h3>
              <VerifiedBadge size="md" type={status.verificationType as 'user' | 'agency'} />
            </div>
            <p className="text-sm text-green-700">
              {status.verificationType === 'agency' 
                ? t('agency_verified') 
                : t('user_verified')}
            </p>
            {status.verifiedAt && (
              <p className="text-xs text-green-600 mt-1">
                {t('verified_on', { date: new Date(status.verifiedAt).toLocaleDateString() })}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">{t('verification_benefits')}</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>{t('benefit_badge')}</li>
            <li>{t('benefit_priority_responses')}</li>
            <li>{t('benefit_trustworthiness')}</li>
          </ul>
        </div>
      </div>
    );
  }
  
  if (status.pendingVerification) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
          <Clock className="h-10 w-10 text-yellow-500" />
          <div>
            <h3 className="font-medium text-yellow-800">{t('verification_pending')}</h3>
            <p className="text-sm text-yellow-700">
              {t('verification_in_progress')}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">{t('what_happens_next')}</h3>
          <p className="text-sm mb-3">{t('verification_timeline')}</p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>{t('check_email')}</li>
            <li>{t('notifications_enabled')}</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 border border-gray-200 bg-gray-50 rounded-md">
        <AlertCircle className="h-10 w-10 text-gray-400" />
        <div>
          <h3 className="font-medium">{t('not_verified')}</h3>
          <p className="text-sm text-gray-600">
            {t('verification_not_started')}
          </p>
        </div>
      </div>
      
      <Button 
        className="w-full bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-colors" 
        onClick={onStartVerification}
      >
        {t('get_verified')}
      </Button>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">{t('why_get_verified')}</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>{t('build_trust')}</li>
          <li>{t('access_features')}</li>
          <li>{t('priority_responses')}</li>
        </ul>
      </div>
    </div>
  );
}