import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { QrCode, Info, Shield, Clock, MapPin } from 'lucide-react';

interface QRCodeInfoTooltipProps {
  variant?: 'icon' | 'badge' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QRCodeInfoTooltip({ 
  variant = 'icon', 
  size = 'md',
  className = '' 
}: QRCodeInfoTooltipProps) {
  const { t } = useTranslation(['home']);

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const tooltipContent = (
    <div className="max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-white">{t('home:qrCode.title')}</span>
      </div>
      <p className="text-sm text-gray-200 mb-3">
        {t('home:qrCode.tooltip')}
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 text-green-400" />
          <span className="text-gray-300">{t('home:qrCode.overview.step1')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="text-gray-300">{t('home:qrCode.overview.step2')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3 h-3 text-purple-400" />
          <span className="text-gray-300">{t('home:qrCode.overview.step3')}</span>
        </div>
      </div>
    </div>
  );

  const renderTrigger = () => {
    switch (variant) {
      case 'badge':
        return (
          <Badge 
            variant="secondary" 
            className={`cursor-help bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ${className}`}
          >
            <QrCode className={`${iconSizes[size]} mr-1`} />
            QR Code
          </Badge>
        );
      case 'inline':
        return (
          <span className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-help transition-colors ${className}`}>
            <QrCode className={iconSizes[size]} />
            <span className="text-sm font-medium">QR Code Visit</span>
          </span>
        );
      default:
        return (
          <Info className={`${iconSizes[size]} text-gray-500 hover:text-gray-700 cursor-help transition-colors ${className}`} />
        );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderTrigger()}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-gray-900 border-gray-700 text-white p-4"
          sideOffset={5}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}