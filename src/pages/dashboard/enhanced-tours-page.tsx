import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EnhancedPropertyTours } from "@/components/calendar/EnhancedPropertyTours";
import { useTranslation } from "react-i18next";

/**
 * Enhanced Tours Page with full month calendar view
 * This page provides a modern Google Calendar-style interface for managing property tours
 * 
 * Features:
 * - Full month calendar view
 * - Event creation and editing
 * - Drag and drop functionality (future enhancement)
 * - Mobile-responsive design
 * - Integration with existing tour data
 */
export default function EnhancedToursPage() {
  const { t } = useTranslation(['dashboard', 'properties']);

  return (
    <DashboardLayout>
      <Helmet>
        <title>
          {t('tours.title', { defaultValue: 'Property Tours Calendar' })} | {t('dashboard:title')}
        </title>
        <meta 
          name="description" 
          content="Manage property tours and appointments with a modern calendar interface" 
        />
      </Helmet>
      
      <div className="p-6 space-y-6">
        <EnhancedPropertyTours />
      </div>
    </DashboardLayout>
  );
}