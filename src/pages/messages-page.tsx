import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MessagingDashboard from '@/components/messaging/MessagingDashboard';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'wouter';

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  // Show loading state while auth state is being determined
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="container mx-auto">
          <MessagingDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
}