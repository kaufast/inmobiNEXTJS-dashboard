import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AgentDashboard from "@/components/dashboard/AgentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { t: tDashboard } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#131313]" aria-label={tCommon("general.loading", { defaultValue: "Loading..." })} />
      </div>
    );
  }

  // This should never happen because of the ProtectedRoute component,
  // but we'll handle it just in case
  if (!user) {
    return null;
  }

  let DashboardComponent;
  
  // Determine which dashboard to render based on user role
  switch (user.role) {
    case "admin":
      DashboardComponent = AdminDashboard;
      break;
    case "agent":
      DashboardComponent = AgentDashboard;
      break;
    default:
      DashboardComponent = UserDashboard;
  }

  return (
    <DashboardLayout>
      <DashboardComponent />
    </DashboardLayout>
  );
} 