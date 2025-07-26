import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourTriggerProps {
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  icon?: 'play' | 'help' | 'sparkles';
  children?: React.ReactNode;
}

export function TourTrigger({
  onClick,
  variant = 'outline',
  size = 'default',
  className,
  showBadge = false,
  badgeText = 'New',
  icon = 'help',
  children
}: TourTriggerProps) {
  const getIcon = () => {
    switch (icon) {
      case 'play':
        return <Play className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'help':
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        className={cn('relative', className)}
      >
        {getIcon()}
        {children && <span className="ml-2">{children}</span>}
      </Button>
      {showBadge && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5"
        >
          {badgeText}
        </Badge>
      )}
    </div>
  );
}

export default TourTrigger; 