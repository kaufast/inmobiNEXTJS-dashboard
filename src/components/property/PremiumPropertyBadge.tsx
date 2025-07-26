import React from 'react';
import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from 'react-i18next';

interface PremiumPropertyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * A badge component that indicates a property has featured status
 */
export function PremiumPropertyBadge({ 
  size = 'md', 
  showLabel = false,
  className = ''
}: PremiumPropertyBadgeProps) {
  const { t } = useTranslation('common');
  
  // Sizes for the badge
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Base badge component
  const FeaturedBadge = () => (
    <div className={`inline-flex items-center gap-1 bg-[#131313] text-white px-2 py-1 rounded-full ${className}`}>
      <Star className={sizes[size]} />
      {showLabel && <span className="text-xs font-medium">{t('premiumProperty.featured')}</span>}
    </div>
  );

  // Use tooltip if not showing label
  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <FeaturedBadge />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('premiumProperty.featuredProperty')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Return just the badge if showing label
  return <FeaturedBadge />;
}

export default PremiumPropertyBadge;