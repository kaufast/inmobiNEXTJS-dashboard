import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PropertyTours } from "@/components/dashboard/PropertyTours";
import { useTranslation } from "react-i18next";

export default function ToursPage() {
  const { t } = useTranslation(['dashboard', 'properties']);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('tours.title', { defaultValue: 'Property Tours' })} | {t('dashboard.title')}</title>
      </Helmet>
      
      <div className="p-6 space-y-6">
        <PropertyTours />
      </div>
    </DashboardLayout>
  );
}