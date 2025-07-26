import React from 'react';
import { Step } from 'react-joyride';
import { Tour } from '@/components/ui/tour';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Plus,
  BarChart3,
  Users,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardTourProps {
  run: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function DashboardTour({ run, onComplete, onSkip }: DashboardTourProps) {
  const { t } = useTranslation('tour');

  const steps: Step[] = [
    {
      target: '.navbar',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5" />
              {t('dashboard.welcome.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.welcome.description')}
            </p>
            <Badge variant="secondary" className="text-xs">
              {t('dashboard.welcome.badge')}
            </Badge>
          </CardContent>
        </Card>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.add-property-btn',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('dashboard.addProperty.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.addProperty.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.addProperty.features.stepByStep')}</Badge>
                <span>{t('dashboard.addProperty.features.guidedWizard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.addProperty.features.aiPowered')}</Badge>
                <span>{t('dashboard.addProperty.features.smartSuggestions')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.addProperty.features.professional')}</Badge>
                <span>{t('dashboard.addProperty.features.marketReady')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'bottom',
    },
    {
      target: '.search-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('dashboard.search.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.search.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.search.features.filters')}</Badge>
                <span>{t('dashboard.search.features.priceLocationType')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.search.features.mapView')}</Badge>
                <span>{t('dashboard.search.features.visualPropertySearch')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.search.features.saved')}</Badge>
                <span>{t('dashboard.search.features.favoritesAlerts')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'left',
    },
    {
      target: '.messaging-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t('dashboard.messaging.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.messaging.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.messaging.features.realtime')}</Badge>
                <span>{t('dashboard.messaging.features.instantMessaging')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.messaging.features.organized')}</Badge>
                <span>{t('dashboard.messaging.features.folderSystem')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.messaging.features.notifications')}</Badge>
                <span>{t('dashboard.messaging.features.neverMissMessage')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'right',
    },
    {
      target: '.calendar-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('dashboard.calendar.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.calendar.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.calendar.features.scheduling')}</Badge>
                <span>{t('dashboard.calendar.features.easyTourBooking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.calendar.features.sync')}</Badge>
                <span>{t('dashboard.calendar.features.googleCalendar')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.calendar.features.reminders')}</Badge>
                <span>{t('dashboard.calendar.features.neverMissAppointments')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'top',
    },
    {
      target: '.analytics-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('dashboard.analytics.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.analytics.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.analytics.features.views')}</Badge>
                <span>{t('dashboard.analytics.features.propertyPerformance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.analytics.features.inquiries')}</Badge>
                <span>{t('dashboard.analytics.features.leadTracking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.analytics.features.reports')}</Badge>
                <span>{t('dashboard.analytics.features.monthlyInsights')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'left',
    },
    {
      target: '.admin-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('dashboard.admin.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.admin.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.admin.features.roles')}</Badge>
                <span>{t('dashboard.admin.features.agentPermissions')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.admin.features.team')}</Badge>
                <span>{t('dashboard.admin.features.manageMembers')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.admin.features.settings')}</Badge>
                <span>{t('dashboard.admin.features.agencyConfiguration')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'right',
    },
    {
      target: '.settings-section',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('dashboard.settings.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t('dashboard.settings.description')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.settings.features.profile')}</Badge>
                <span>{t('dashboard.settings.features.accountSettings')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.settings.features.notifications')}</Badge>
                <span>{t('dashboard.settings.features.emailPushAlerts')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{t('dashboard.settings.features.language')}</Badge>
                <span>{t('dashboard.settings.features.multiLanguageSupport')}</span>
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

export default DashboardTour; 