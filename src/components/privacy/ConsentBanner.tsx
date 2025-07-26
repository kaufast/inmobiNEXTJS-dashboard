import React, { useEffect, useState } from 'react';
import { useUsercentrics } from '@/hooks/use-usercentrics';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, Settings, X } from 'lucide-react';

export function ConsentBanner() {
  const { t } = useTranslation('common');
  const {
    isInitialized,
    isLoading,
    consentStatus,
    showConsentBanner,
    showPrivacySettings,
    acceptAllConsents,
    denyAllConsents,
    hasServiceConsent,
    hasCategoryConsent,
    refreshConsent
  } = useUsercentrics();

  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isInitialized && consentStatus?.shouldCollectConsent) {
      setShowBanner(true);
    }
  }, [isInitialized, consentStatus]);

  const handleAcceptAll = async () => {
    await acceptAllConsents();
    setShowBanner(false);
  };

  const handleDenyAll = async () => {
    await denyAllConsents();
    setShowBanner(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = async () => {
    await showPrivacySettings();
    await refreshConsent();
    setShowSettings(false);
    setShowBanner(false);
  };

  if (isLoading || !isInitialized) {
    return null;
  }

  return (
    <>
      {/* Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
          <div className="max-w-6xl mx-auto p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="h-6 w-6 text-[#131313]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-[#131313]">
                  {t('privacy.banner.title')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('privacy.banner.description')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-[#131313] hover:bg-[#2a2a2a] text-white"
                  >
                    {t('privacy.banner.acceptAll')}
                  </Button>
                  <Button
                    onClick={handleDenyAll}
                    variant="outline"
                  >
                    {t('privacy.banner.denyAll')}
                  </Button>
                  <Button
                    onClick={handleShowSettings}
                    variant="ghost"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('privacy.banner.settings')}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('privacy.settings.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{t('privacy.categories.necessary')}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t('privacy.status.required')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('privacy.categories.necessaryDescription')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('privacy.status.alwaysActive')}</span>
                  <Switch checked={true} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Functional Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{t('privacy.categories.functional')}</span>
                  <Badge variant={hasCategoryConsent('functional') ? 'default' : 'secondary'}>
                    {hasCategoryConsent('functional') ? t('privacy.status.active') : t('privacy.status.inactive')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('privacy.categories.functionalDescription')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('privacy.categories.functional')}</span>
                  <Switch checked={hasCategoryConsent('functional')} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    {t('privacy.services.included')}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Google Maps</Badge>
                    <Badge variant="outline" className="text-xs">SendGrid</Badge>
                    <Badge variant="outline" className="text-xs">Zendesk</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{t('privacy.categories.analytics')}</span>
                  <Badge variant={hasCategoryConsent('analytics') ? 'default' : 'secondary'}>
                    {hasCategoryConsent('analytics') ? t('privacy.status.active') : t('privacy.status.inactive')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('privacy.categories.analyticsDescription')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('privacy.categories.analytics')}</span>
                  <Switch checked={hasCategoryConsent('analytics')} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    {t('privacy.services.included')}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Google Analytics</Badge>
                    <Badge variant="outline" className="text-xs">Hotjar</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{t('privacy.categories.marketing')}</span>
                  <Badge variant={hasCategoryConsent('marketing') ? 'default' : 'secondary'}>
                    {hasCategoryConsent('marketing') ? t('privacy.status.active') : t('privacy.status.inactive')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('privacy.categories.marketingDescription')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('privacy.categories.marketing')}</span>
                  <Switch checked={hasCategoryConsent('marketing')} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    {t('privacy.services.included')}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Facebook Pixel</Badge>
                    <Badge variant="outline" className="text-xs">Google Ads</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseSettings}>
              {t('privacy.settings.cancel')}
            </Button>
            <Button onClick={handleSaveSettings} className="bg-[#131313] hover:bg-[#2a2a2a]">
              {t('privacy.settings.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}