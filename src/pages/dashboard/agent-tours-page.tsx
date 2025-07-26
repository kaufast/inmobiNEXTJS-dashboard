import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyToursList from "@/components/property/PropertyToursList";
import PremiumFeatureWrapper from "@/components/subscription/PremiumFeatureWrapper";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PropertyTourService } from "@/lib/property-tour-service";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function AgentToursPage() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  
  // Fetch tour stats
  const { data: tours, isLoading } = useQuery({
    queryKey: ["property-tours", "agent", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await PropertyTourService.getAgentTours(user.id);
    },
    enabled: !!user?.id,
  });
  
  // Calculate stats
  const pendingTours = tours?.filter(tour => tour.status === "pending").length || 0;
  const confirmedTours = tours?.filter(tour => tour.status === "confirmed").length || 0;
  const completedTours = tours?.filter(tour => tour.status === "completed").length || 0;
  
  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('tours.agentTitle')} | Inmobi</title>
      </Helmet>
      
      <PremiumFeatureWrapper
        feature={t('tours.agentTitle')}
        description={t('tours.agentDescription')}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('tours.agentTitle')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('tours.agentDescription')}
            </p>
          </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t('tours.pendingTours')}
              </CardTitle>
              <CardDescription>
                {t('tours.pendingToursDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <div>{isLoading ? "-" : pendingTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t('tours.confirmedTours')}
              </CardTitle>
              <CardDescription>
                {t('tours.confirmedToursDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <div>{isLoading ? "-" : confirmedTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t('tours.completedTours')}
              </CardTitle>
              <CardDescription>
                {t('tours.completedToursDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              <div>{isLoading ? "-" : completedTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t('tours.totalClients')}
              </CardTitle>
              <CardDescription>
                {t('tours.totalClientsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <User className="h-5 w-5 mr-2 text-violet-500" />
              <div>{isLoading ? "-" : "0"}</div>
            </CardContent>
          </Card>
        </div>
        
        <PropertyToursList type="agent" />
      </div>
      </PremiumFeatureWrapper>
    </DashboardLayout>
  );
}