import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, AlertCircle, Loader2, TrendingUp, Users, Shield, Sparkles, Globe, Bell, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsletterProps {
  className?: string;
}

export const Newsletter: React.FC<NewsletterProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation('newsletter');
  const { toast } = useToast();
  
  // Force re-render when language changes
  useEffect(() => {
    console.log('Newsletter - Language changed to:', i18n.language);
  }, [i18n.language]);
  
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animated statistics
  const stats = [
    { icon: Users, value: '25,000+', label: t('stats.happySubscribers'), color: 'text-blue-500' },
    { icon: TrendingUp, value: '150+', label: t('stats.weeklyProperties'), color: 'text-green-500' },
    { icon: Star, value: '4.9/5', label: t('stats.averageRating'), color: 'text-yellow-500' },
    { icon: Globe, value: '12', label: t('stats.countriesServed'), color: 'text-purple-500' }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous states
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError(t('common:form.validation.emailRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('common:form.validation.emailInvalid'));
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          source: 'homepage',
          preferences: {
            propertyUpdates: true,
            marketInsights: true,
            newFeatures: true
          }
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('home:newsletter.errors.alreadySubscribed'));
        } else {
          setError(data.message || t('home:newsletter.errors.subscriptionFailed'));
        }
        return;
      }

      // Success
      setIsSubscribed(true);
      setEmail('');
      
      toast({
        title: t('home:newsletter.success.title'),
        description: t('home:newsletter.success.description'),
        duration: 5000,
      });

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setError(t('home:newsletter.errors.networkError'));
      
      toast({
        title: t('home:newsletter.errors.title'),
        description: t('home:newsletter.errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 animate-fade-in">
                  {t('home:newsletter.success.title')} 🎉
                </h3>
                <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                  {t('home:newsletter.success.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <Bell className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">{t('home:newsletter.frequency.weekly')}</p>
                  <p className="text-xs text-gray-600">Within 24 hours</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">{t('home:newsletter.frequency.weekly')}</p>
                  <p className="text-xs text-gray-600">Every Tuesday</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">{t('home:newsletter.frequency.secure')}</p>
                  <p className="text-xs text-gray-600">{t('home:newsletter.frequency.unsubscribe')}</p>
                </div>
              </div>

              <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium px-4 py-2">
                ✅ {t('home:newsletter.success.badge')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-black border border-gray-800">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent)] pointer-events-none"></div>
        
        {/* Animated Background Dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className={`space-y-6 lg:space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              {/* Header */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700 to-black rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-gray-600">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce">
                      <Sparkles className="w-3 h-3 text-black" />
                    </div>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                     {t('subscribers')}
                  </Badge>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white leading-tight">
                    {t('title')}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                    {t('description')}
                  </p>
                </div>
              </div>

              {/* Animated Stats */}
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 ${stats[currentStat].color.replace('text-', 'bg-').replace('-500', '-500/20')}`}>
                      {React.createElement(stats[currentStat].icon, {
                        className: `w-5 h-5 sm:w-6 sm:h-6 ${stats[currentStat].color}`
                      })}
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-light text-white">{stats[currentStat].value}</div>
                      <div className="text-gray-300 text-xs sm:text-sm">{stats[currentStat].label}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {stats.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentStat ? 'bg-blue-500' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {[
                  { icon: Bell, text: t('features.newPropertyAlerts'), color: "text-blue-500" },
                  { icon: TrendingUp, text: t('features.marketInsights'), color: "text-blue-500" },
                  { icon: Star, text: t('features.exclusiveOffers'), color: "text-blue-500" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 text-white bg-white/10 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                    {React.createElement(benefit.icon, {
                      className: `w-5 h-5 ${benefit.color} flex-shrink-0`
                    })}
                    <span className="font-medium text-xs sm:text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <form onSubmit={handleSubscribe} className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder={t('form.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm sm:text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl"
                        disabled={isSubscribing}
                        data-testid="newsletter-email-input"
                      />
                      {error && (
                        <div className="flex items-center mt-2 text-sm text-red-400">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubscribing || !email.trim()}
                      className="w-full bg-white hover:bg-gray-100 text-black h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      data-testid="newsletter-subscribe-button"
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('subscribing')}
                        </>
                      ) : (
                        <>
                          {t('form.subscribe')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-300" />
                      <span>{t('trust.secure')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-gray-300" />
                      <span>{t('trust.weeklyUpdates')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-300" />
                      <span>{t('trust.noSpam')}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center">
                    {t('disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};