import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  QrCode, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Building, 
  Clock,
  Shield,
  Smartphone,
  ArrowRight,
  Info,
  Crown,
  BarChart3,
  Palette
} from 'lucide-react';

export default function QRCodeVisitExplanation() {
  const { t } = useTranslation(['home']);

  const steps = [
    {
      icon: QrCode,
      title: t('home:qrCode.steps.generation.title'),
      description: t('home:qrCode.steps.generation.description'),
      detail: t('home:qrCode.steps.generation.detail'),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    },
    {
      icon: Mail,
      title: t('home:qrCode.steps.delivery.title'),
      description: t('home:qrCode.steps.delivery.description'),
      detail: t('home:qrCode.steps.delivery.detail'),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    },
    {
      icon: Smartphone,
      title: t('home:qrCode.steps.usage.title'),
      description: t('home:qrCode.steps.usage.description'),
      detail: t('home:qrCode.steps.usage.detail'),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    },
    {
      icon: MapPin,
      title: t('home:qrCode.steps.checkin.title'),
      description: t('home:qrCode.steps.checkin.description'),
      detail: t('home:qrCode.steps.checkin.detail'),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    },
    {
      icon: CheckCircle,
      title: t('home:qrCode.steps.verification.title'),
      description: t('home:qrCode.steps.verification.description'),
      detail: t('home:qrCode.steps.verification.detail'),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: t('home:qrCode.benefits.security.title'),
      description: t('home:qrCode.benefits.security.description')
    },
    {
      icon: Clock,
      title: t('home:qrCode.benefits.efficiency.title'),
      description: t('home:qrCode.benefits.efficiency.description')
    },
    {
      icon: Building,
      title: t('home:qrCode.benefits.branding.title'),
      description: t('home:qrCode.benefits.branding.description')
    }
  ];

  const premiumFeatures = [
    {
      icon: Crown,
      title: "Custom Agency Branding",
      description: "Display your agency's logo on QR codes for professional branding"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track visit patterns, conversion rates, and visitor demographics"
    },
    {
      icon: Palette,
      title: "Custom QR Code Design",
      description: "Personalize QR code colors and styling to match your brand"
    }
  ];

  return (
    <TooltipProvider>
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {t('home:qrCode.title')}
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{t('home:qrCode.tooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('home:qrCode.subtitle')}
            </p>
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('home:qrCode.overview.step1')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('home:qrCode.overview.step2')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('home:qrCode.overview.step3')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('home:qrCode.overview.step4')}
              </p>
            </div>
          </div>

          {/* Premium Features - MOVED TO TOP */}
          <div className="mb-12">
            <div className="bg-black dark:bg-white rounded-2xl p-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-white dark:text-black" />
                  <h3 className="text-2xl font-bold text-white dark:text-black">
                    {t('home:qrCode.premium.title')}
                  </h3>
                  <Badge className="bg-white text-black dark:bg-black dark:text-white">
                    {t('home:qrCode.premium.badge')}
                  </Badge>
                </div>
                <p className="text-gray-300 dark:text-gray-700 mb-8 max-w-2xl mx-auto">
                  {t('home:qrCode.premium.description')}
                </p>
                
                {/* Premium Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {premiumFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Card key={index} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-black flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">{feature.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 dark:text-gray-300">
                            {feature.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                    {t('home:qrCode.premium.upgrade')}
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black dark:border-black dark:text-black dark:hover:bg-black dark:hover:text-white">
                    {t('home:qrCode.premium.learnMore')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('home:qrCode.howItWorks')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="relative hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900 dark:text-white">{step.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {t('home:qrCode.step')} {index + 1}
                            </span>
                            {index < steps.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mb-2">
                        {step.description}
                      </CardDescription>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {step.detail}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('home:qrCode.benefits.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home:qrCode.cta.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              {t('home:qrCode.cta.description')}
            </p>
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100">
              {t('home:qrCode.cta.button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}