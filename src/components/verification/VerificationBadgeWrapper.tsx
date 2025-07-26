import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerifiedBadge } from './VerifiedBadge';
import { useQuery } from '@tanstack/react-query';

interface VerificationBadgeWrapperProps {
  userId: number;
  userRole: 'user' | 'agent' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  children?: ReactNode;
}

export const VerificationBadgeWrapper = ({
  userId,
  userRole,
  size = 'md',
  showTooltip = true,
  className = '',
  children
}: VerificationBadgeWrapperProps) => {
  const { t } = useTranslation('common');
  
  // Fetch verification status for the user
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['/api/verification/status', userId],
    // Using the default queryFn configured with the client
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId
  });
  
  // If still loading or user is not verified, don't show anything
  if (isLoading || !verificationStatus?.isVerified) {
    return <>{children}</>;
  }

  const tooltipText = userRole === 'agent' 
    ? t('verified_agency_tooltip') 
    : t('verified_user_tooltip');

  const badge = <VerifiedBadge size={size} type={userRole === 'agent' ? 'agency' : 'user'} className={className} />;
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">
              {badge}
              {children}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <span className="inline-flex">
      {badge}
      {children}
    </span>
  );
};

export default VerificationBadgeWrapper;