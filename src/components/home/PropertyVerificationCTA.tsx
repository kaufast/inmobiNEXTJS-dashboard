import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  FileSignature, 
  FileSearch, 
  Calendar, 
  Lock, 
  ArrowRight, 
  QrCode, 
  Info,
  CheckCircle,
  Clock,
  UserCheck,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PropertyVerificationCTA() {
  const { t, i18n } = useTranslation(['home', 'security', 'common']);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  
  // Force re-render when language changes
  useEffect(() => {
    console.log('PropertyVerificationCTA - Language changed to:', i18n.language);
  }, [i18n.language]);

  const features = [
    {
      icon: MapPin,
      title: t('common:securityFeatures.features.visitProof.title'),
      description: t('common:securityFeatures.features.visitProof.description'),
      isPremium: false,
      highlight: t('common:securityFeatures.features.visitProof.tag')
    },
    {
      icon: FileSignature,
      title: t('common:securityFeatures.features.electronicSignature.title'),
      description: t('common:securityFeatures.features.electronicSignature.description'),
      isPremium: false,
      highlight: t('common:securityFeatures.features.electronicSignature.tag')
    },
    {
      icon: FileSearch,
      title: t('common:securityFeatures.features.documentVerification.title'),
      description: t('common:securityFeatures.features.documentVerification.description'),
      isPremium: true,
      highlight: t('common:securityFeatures.features.documentVerification.tag')
    },
    {
      icon: Clock,
      title: t('common:securityFeatures.features.appointmentReminders.title'),
      description: t('common:securityFeatures.features.appointmentReminders.description'),
      isPremium: true,
      highlight: t('common:securityFeatures.features.appointmentReminders.tag')
    },
    {
      icon: UserCheck,
      title: t('common:securityFeatures.features.identityCrossVerification.title'),
      description: t('common:securityFeatures.features.identityCrossVerification.description'),
      isPremium: true,
      highlight: t('common:securityFeatures.features.identityCrossVerification.tag')
    }
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: t('qrCode.steps.generation.title'),
      description: t('qrCode.steps.generation.description'),
      icon: QrCode
    },
    {
      step: 2,
      title: t('qrCode.steps.delivery.title'),
      description: t('qrCode.steps.delivery.description'),
      icon: Calendar
    },
    {
      step: 3,
      title: t('qrCode.steps.usage.title'),
      description: t('qrCode.steps.usage.description'),
      icon: Shield
    },
    {
      step: 4,
      title: t('qrCode.steps.checkin.title'),
      description: t('qrCode.steps.checkin.description'),
      icon: CheckCircle
    },
    {
      step: 5,
      title: t('qrCode.steps.verification.title'),
      description: t('qrCode.steps.verification.description'),
      icon: FileSignature
    }
  ];

  return (
    <TooltipProvider>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-black/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
               {t('common:securityFeatures.title')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
              {t('common:securityFeatures.subtitle')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              {t('common:securityFeatures.description')}
            </p>
          </div>

          {/* Enhanced Main Content */}
          <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl border border-gray-200/10 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 text-sm sm:text-base">
                  <QrCode className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{t('common:securityFeatures.qrCodeVisits')}</span>
                  <span className="text-white/70">—</span>
                  <span className="text-white font-medium">{t('common:securityFeatures.simpleSecureVerified')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="group">
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${feature.isPremium ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                              {feature.isPremium ? (
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                              ) : (
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                              <h4 className="font-semibold text-white text-base sm:text-lg leading-tight">
                                {feature.title}
                              </h4>
                              {feature.isPremium && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                                  <Star className="w-3 h-3 mr-1" />
                                  {t('common:securityFeatures.premium')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">
                              {feature.description}
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
                              <Zap className="w-3 h-3" />
                              {feature.highlight}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Identity Verification Section */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg sm:text-xl mb-2">
                      {t('common:securityFeatures.features.identityVerification.title')}
                    </h4>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {t('common:securityFeatures.features.identityVerification.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 justify-center">
                <Dialog open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('common:securityFeatures.cta.howItWorks')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <QrCode className="w-6 h-6" />
                        {t('common:securityFeatures.cta.howItWorks')} — {t('common:securityFeatures.forAgentsAndAgencies')}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {t('common:securityFeatures.adminOnlyDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {howItWorksSteps.map((step) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={step.step} className="flex items-start gap-3 sm:gap-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">{t('common:securityFeatures.step')} {step.step}</span>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                                  {step.title}
                                </h4>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

              </div>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}