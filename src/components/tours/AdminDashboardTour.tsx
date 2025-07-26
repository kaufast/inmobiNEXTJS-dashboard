import React from 'react';
import { Step } from 'react-joyride';
import { Tour } from '@/components/ui/tour';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  Settings, 
  BarChart3,
  Shield,
  Activity,
  Package,
  DollarSign
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminDashboardTourProps {
  run: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function AdminDashboardTour({ run, onComplete, onSkip }: AdminDashboardTourProps) {
  const { t, i18n } = useTranslation('tour');
  
  // Debug: Log current language and translation test
  React.useEffect(() => {
    console.log('🌐 Current language:', i18n.language);
    console.log('🧪 Translation test:', t('dashboard.admin.title'));
    console.log('🧪 Translation test (agencyConfiguration):', t('dashboard.admin.features.agencyConfiguration'));
  }, [i18n.language, t]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Welcome to Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Welcome! This is your admin dashboard where you can manage all platform features.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Sidebar</Badge>
                <span>Navigate using the left sidebar</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Features</Badge>
                <span>Access users, messages, verification, analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      placement: 'center',
      disableBeacon: true,
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

export default AdminDashboardTour; 