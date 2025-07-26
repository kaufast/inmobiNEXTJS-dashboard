import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Mail, Smartphone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

interface QRCodeFlowInstructionsProps {
  variant?: 'compact' | 'detailed' | 'inline';
  showPremium?: boolean;
  className?: string;
}

export function QRCodeFlowInstructions({ 
  variant = 'compact', 
  showPremium = true,
  className = '' 
}: QRCodeFlowInstructionsProps) {
  const { t } = useTranslation(['home']);

  const steps = [
    {
      icon: Mail,
      title: t('home:qrCode.overview.step1'),
      description: t('home:qrCode.steps.delivery.detail'),
      color: 'text-blue-600'
    },
    {
      icon: Smartphone,
      title: t('home:qrCode.overview.step2'),
      description: t('home:qrCode.steps.usage.detail'),
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      title: t('home:qrCode.overview.step3'),
      description: t('home:qrCode.steps.verification.detail'),
      color: 'text-purple-600'
    }
  ];

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <QrCode className="w-4 h-4" />
        <span>{t('home:qrCode.overview.step1')}</span>
        <ArrowRight className="w-3 h-3" />
        <span>{t('home:qrCode.overview.step2')}</span>
        <ArrowRight className="w-3 h-3" />
        <span>{t('home:qrCode.overview.step3')}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="w-5 h-5 text-blue-600" />
            {t('home:qrCode.title')}
            {showPremium && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {t('home:qrCode.premium.badge')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <IconComponent className={`w-3 h-3 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <QrCode className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">{t('home:qrCode.howItWorks')}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Card key={index} className="relative">
              <CardHeader className="text-center pb-3">
                <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3`}>
                  <IconComponent className={`w-6 h-6 ${step.color}`} />
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">{step.description}</p>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden md:block">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {showPremium && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-100 text-amber-800">
              {t('home:qrCode.premium.badge')}
            </Badge>
            <span className="font-medium text-amber-900">{t('home:qrCode.premium.title')}</span>
          </div>
          <p className="text-sm text-amber-700">{t('home:qrCode.premium.description')}</p>
        </div>
      )}
    </div>
  );
}