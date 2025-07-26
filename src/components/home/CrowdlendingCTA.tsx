import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Shield, Euro, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CrowdlendingCTA = () => {
  const { t, i18n } = useTranslation('investment');
  
  // Force re-render when language changes
  useEffect(() => {
    console.log('CrowdlendingCTA - Language changed to:', i18n.language);
  }, [i18n.language]);
  const activeOpportunities = [
    {
      name: t('opportunities.projects.barcelonaApartments'),
      funded: 663000,
      target: 850000,
      return: '9.2%',
      color: 'bg-gray-600'
    },
    {
      name: t('opportunities.projects.madridRenovation'),
      funded: 420000,
      target: 650000,
      return: '11.5%',
      color: 'bg-gray-700'
    },
    {
      name: t('opportunities.projects.valenciaEcoHousing'),
      funded: 280000,
      target: 620000,
      return: '9.7%',
      color: 'bg-gray-800'
    }
  ];

  const stats = [
    {
      icon: Euro,
      label: t('features.minimumInvestment'),
      value: '€100',
      description: t('features.startSmall')
    },
    {
      icon: TrendingUp,
      label: t('features.avgReturns'),
      value: '10.1%',
      description: t('features.consistentPerformance')
    },
    {
      icon: Users,
      label: t('features.activeInvestors'),
      value: '12,500+',
      description: t('features.growingCommunity')
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (funded: number, target: number) => {
    return (funded / target) * 100;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <Badge 
                  variant="outline" 
                  className="bg-white/80 backdrop-blur-sm border-gray-300 text-gray-700 px-4 py-2"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('badge')}
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {t('title')}
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t('description')}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {stat.description}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Regulatory Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-700" />
                  <span>{t('trustIndicators.cnmvRegulated')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-700" />
                  <span>{t('trustIndicators.totalInvested')}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <Button 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('cta.startInvesting')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl"
                >
                  {t('cta.viewProjects')}
                </Button>
              </div>
            </div>

            {/* Right Column - Active Opportunities */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {t('opportunities.title')}
                    </h3>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1 self-start sm:self-auto">
                      6 {t('opportunities.projectsLabel')}
                    </Badge>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {activeOpportunities.map((opportunity, index) => (
                      <div key={index} className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-3 h-3 rounded-full", opportunity.color)} />
                            <span className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
                              {opportunity.name}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">
                            {opportunity.return}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress 
                            value={getProgressPercentage(opportunity.funded, opportunity.target)} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                            <span>
                              {formatCurrency(opportunity.funded)} / {formatCurrency(opportunity.target)} {t('opportunities.funded')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                        €1.36M
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{t('opportunities.total')}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{t('opportunities.invested')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                        94%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{t('opportunities.success')}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{t('opportunities.rate')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrowdlendingCTA;