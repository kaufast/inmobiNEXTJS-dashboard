import { useState } from "react";
import { useQuery } from "@tanstack/react-query"; // Removed UseQueryOptions
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyDraftButton from "@/components/property/PropertyDraftButton";
import BulkUploadForm from "@/components/dashboard/BulkUploadForm";
import ContactButton from "@/components/ui/contact-button";
import PropertiesManagement from "@/components/dashboard/PropertiesManagement";
import { DashboardTour } from "@/components/tours/DashboardTour";
import { useTour } from "@/hooks/use-tour";
import { TourTrigger } from "@/components/ui/tour-trigger";
import {
  LineChart,
  BarChart4,
  Building,
  Loader2,
  Mail,
  UserCircle,
  Users
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

// Define MessageType interface
interface MessageType {
  id: string | number;
  senderName?: string;
  createdAt: string;
  content: string;
  propertyTitle?: string;
}

export default function AgentDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Navigation helpers
  const navigateToProperty = (propertyId: string | number) => {
    setLocation(route(`/property/${propertyId}`));
  };

  const navigateToSettings = () => {
    setLocation(route('/dashboard/settings'));
  };

  const navigateToMessages = () => {
    setLocation(route('/dashboard/messages'));
  };

  // Button handler functions for interactive elements
  const handleButtonClick = (actionType: string, context?: any) => {
    switch (actionType) {
      case 'action':
        if (context?.messageId) {
          navigateToMessages();
        }
        break;
      case 'view-analytics':
        setLocation(route('/dashboard/analytics'));
        break;
      default:
        toast.info(`${actionType} feature coming soon`);
    }
  };

  const handleViewDetails = (item?: any) => {
    if (item?.id) {
      navigateToProperty(item.id);
    } else {
      toast.error('Property ID not found');
    }
  };

  const handleEdit = (item?: any) => {
    if (item?.id) {
      setLocation(route(`/property/${item.id}/edit`));
    } else {
      toast.error('Property ID not found');
    }
  };

  const handleDelete = (item?: any) => {
    if (!item?.id) {
      toast.error('Property ID not found');
      return;
    }
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;

    try {
      const response = await fetch(`/api/properties/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      toast.success(t('dashboard.agent.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('dashboard.agent.deleteError'));
    }
  };

  const handleAdd = (type?: string) => {
    switch (type) {
      case 'property':
        setLocation(route('/property/create'));
        break;
      case 'client':
        setLocation(route('/dashboard/clients/add'));
        break;
      default:
        setLocation(route('/property/create'));
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    toast.success(t('dashboard.agent.refreshed'));
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/properties/export', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('dashboard.agent.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('dashboard.agent.exportError'));
    }
  };

  const handleFilter = (filterType?: string) => {
    // This would integrate with existing PropertiesManagement component
    toast.info(`Filter by ${filterType} - integration with PropertiesManagement component`);
  };

  const handleSettings = () => {
    navigateToSettings();
  };

  const handleNotifications = () => {
    setLocation(route('/dashboard/notifications'));
  };
  const { t, i18n } = useTranslation('common');
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  
  // Dashboard tour management
  const { 
    runTour, 
    startTour, 
    stopTour, 
    markTourSeen 
  } = useTour({ 
    tourId: 'dashboard-agent', 
    autoStart: true,
    showOnce: true 
  });

  const { data: properties, isLoading: isLoadingProperties, error: propertiesError } = useQuery<Property[], Error>({
    queryKey: ["/api/properties", { limit: 6 }] as const,
    queryFn: async () => {
      const response = await fetch('/api/properties?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
  });

  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useQuery<MessageType[], Error>({
    queryKey: ["/api/messages", user?.id] as const,
    queryFn: async (): Promise<MessageType[]> => {
      if (!user) return [];
      const res = await fetch(`/api/messages/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!user,
  });

  // Analytics data (mock data for demonstration)
  const analyticsData = {
    propertyViews: {
      week: 128,
      month: 543,
      year: 6249
    },
    inquiries: {
      week: 15,
      month: 47,
      year: 312
    },
    conversions: {
      week: 3,
      month: 12,
      year: 37
    },
    revenue: {
      week: 4200,
      month: 15600,
      year: 187500
    }
  };

  const locale = i18n.language || 'en-GB';
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('dashboard.agent.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.agent.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <PropertyDraftButton />
            <ContactButton variant="inline" label={t('report.buttonText')} reportType="error" />
          </div>
        </div>

      {/* Stats Overview */}
      <div className="analytics-section grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.agent.propertyViews')}
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.propertyViews[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 12 : timeframe === "month" ? 23 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('dashboard.agent.fromPrevious', { timeframe })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.agent.inquiries')}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.inquiries[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 8 : timeframe === "month" ? 15 : 22}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('dashboard.agent.fromPrevious', { timeframe })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.agent.conversions')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversions[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 5 : timeframe === "month" ? 10 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('dashboard.agent.fromPrevious', { timeframe })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.agent.revenue')}
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenue[timeframe].toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 7 : timeframe === "month" ? 12 : 25}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('dashboard.agent.fromPrevious', { timeframe })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex rounded-md bg-neutral-100">
          <Button
            variant={timeframe === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("week")}
            className={timeframe === "week" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.week')}
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("month")}
            className={timeframe === "month" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.month')}
          </Button>
          <Button
            variant={timeframe === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("year")}
            className={timeframe === "year" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.year')}
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="search-section">
          <TabsTrigger value="overview">{t('dashboard.agent.tabs.properties')}</TabsTrigger>
          <TabsTrigger value="manage">Manage Properties</TabsTrigger>
          <TabsTrigger value="inquiries">{t('dashboard.agent.tabs.inquiries')}</TabsTrigger>
          <TabsTrigger value="performance">{t('dashboard.agent.tabs.performance')}</TabsTrigger>
          <TabsTrigger value="bulk-upload">{t('dashboard.agent.tabs.bulkUpload')}</TabsTrigger>
        </TabsList>

        {/* Properties Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="add-property-btn grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProperties ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : properties && properties.length > 0 ? (
              properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <h3 className="text-lg font-medium mb-2">{t('dashboard.agent.noProperties.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.agent.noProperties.description')}
                </p>
                <PropertyDraftButton />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Properties Management Tab */}
        <TabsContent value="manage" className="space-y-4">
          <PropertiesManagement />
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="messaging-section rounded-md border">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="divide-y">
                {messages.map((message: MessageType) => (
                  <div key={message.id} className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{message.senderName || "Client"}</h4>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{message.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center text-xs text-neutral-500">
                          <Building className="mr-1 h-3 w-3" />
                          <span>{message.propertyTitle || "Property Inquiry"}</span>
                        </div>
                        <Button onClick={() => handleButtonClick("action")} size="sm" variant="outline">
                          {t('dashboard.agent.reply')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">{t('dashboard.agent.noInquiries.title')}</h3>
                <p className="text-muted-foreground">
                  {t('dashboard.agent.noInquiries.description')}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="calendar-section">
            <CardHeader>
              <CardTitle>{t('dashboard.agent.performance.overview')}</CardTitle>
              <CardDescription>
                {t('dashboard.agent.performance.metrics', { timeframe })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('dashboard.agent.performance.topProperties')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample performance data */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded bg-neutral-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-[#131313]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {t('dashboard.agent.performance.luxuryApartment', { number: i })}
                            </p>
                            <div className="flex items-center text-xs text-neutral-500">
                              <span>
                                {t('dashboard.agent.performance.views', { count: 120 + i * 30 })}
                              </span>
                              <span className="mx-1">•</span>
                              <span>
                                {t('dashboard.agent.performance.inquiries', { count: 5 + i * 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('dashboard.agent.performance.conversionRate')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px] flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">
                        {analyticsData.inquiries[timeframe] > 0 ? Math.round((analyticsData.conversions[timeframe] / analyticsData.inquiries[timeframe]) * 100) : 0}%
                      </div>
                      <p className="text-sm text-neutral-500">
                        {t('dashboard.agent.performance.inquiryToSale')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-4">
          <BulkUploadForm />
        </TabsContent>
      </Tabs>
      
      {/* Tour Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TourTrigger
          onClick={startTour}
          variant="default"
          size="default"
          icon="help"
          showBadge={true}
          badgeText="Tour"
        >
          Dashboard Guide
        </TourTrigger>
      </div>
      
      {/* Dashboard Tour */}
      <DashboardTour
        run={runTour}
        onComplete={() => {
          stopTour();
          markTourSeen();
        }}
        onSkip={() => {
          stopTour();
          markTourSeen();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Property"
        description={t('dashboard.agent.confirmDelete')}
        confirmText={t('dashboard.general.delete')}
        cancelText={t('dashboard.general.cancel')}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
    </>
  );
}