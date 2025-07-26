import React from 'react';
import { Step } from 'react-joyride';
import { Tour } from '@/components/ui/tour';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  DollarSign, 
  Star, 
  Image, 
  FileText, 
  Sparkles, 
  CheckCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PropertyWizardTourProps {
  run: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function PropertyWizardTour({ run, onComplete, onSkip }: PropertyWizardTourProps) {
  const { t } = useTranslation('tour');

  const steps: Step[] = [
    {
      target: '.wizard-nav',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5" />
              {t('propertyWizard.welcome.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.welcome.description')}
            </p>
            <Badge variant="secondary" className="text-xs">
              {t('propertyWizard.welcome.badge')}
            </Badge>
          </CardContent>
        </Card>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.property-basic-info',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5" />
              {t('propertyWizard.basicInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.basicInfo.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.basicInfo.tips.clearTitle')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.basicInfo.tips.accurateType')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.basicInfo.tips.completeAddress')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'right',
    },
    {
      target: '.property-pricing',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('propertyWizard.pricing.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.pricing.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.pricing.tips.competitivePrice')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.pricing.tips.accurateRooms')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.pricing.tips.propertySize')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'left',
    },
    {
      target: '.property-features',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('propertyWizard.features.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.features.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.features.tips.essentialAmenities')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.features.tips.uniqueFeatures')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.features.tips.propertyHighlights')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'top',
    },
    {
      target: '.property-images',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="w-5 h-5" />
              {t('propertyWizard.images.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.images.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.images.tips.highResolution')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.images.tips.allRoomsCovered')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.images.tips.virtualTour')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'bottom',
    },
    {
      target: '.property-description',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('propertyWizard.description.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.description.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.description.tips.engagingNarrative')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.description.tips.neighborhoodInfo')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.description.tips.lifestyleBenefits')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'left',
    },
    {
      target: '.property-ai-summary',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t('propertyWizard.aiSummary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.aiSummary.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.aiSummary.tips.automatedSummary')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.aiSummary.tips.seoOptimized')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.aiSummary.tips.professionalTone')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'right',
    },
    {
      target: '.property-review',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('propertyWizard.review.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('propertyWizard.review.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.review.tips.verifyInformation')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.review.tips.checkPhotos')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('propertyWizard.review.tips.readyToPublish')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'top',
    },
  ];

  return (
    <Tour
      steps={steps}
      run={run}
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
}

export default PropertyWizardTour; 