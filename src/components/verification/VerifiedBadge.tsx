import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type VerifiedBadgeSize = 'sm' | 'md' | 'lg';
type VerifiedBadgeType = 'user' | 'agency';

interface VerifiedBadgeProps {
  size?: VerifiedBadgeSize;
  type?: VerifiedBadgeType;
  showText?: boolean;
  className?: string;
}

export const VerifiedBadge = ({
  size = 'md',
  type = 'user',
  showText = false,
  className
}: VerifiedBadgeProps) => {
  const { t } = useTranslation('common');
  
  const sizeClasses = {
    sm: 'h-4 min-w-4 px-1',
    md: 'h-5 min-w-5 px-1.5',
    lg: 'h-6 min-w-6 px-2'
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };
  
  const variants = {
    user: 'bg-blue-500 hover:bg-blue-600 border-blue-600',
    agency: 'bg-amber-500 hover:bg-amber-600 border-amber-600'
  };
  
  const text = type === 'agency' ? t('verified_agency') : t('verified');
  const Icon = type === 'agency' ? Shield : CheckCircle;
  
  return (
    <Badge 
      variant="default"
      className={cn(
        'rounded-full text-white font-medium flex items-center gap-1 border', 
        sizeClasses[size],
        variants[type],
        className
      )}
    >
      <Icon size={iconSizes[size]} className="inline-block" />
      {showText && <span className="ml-1">{text}</span>}
    </Badge>
  );
};

export default VerifiedBadge;