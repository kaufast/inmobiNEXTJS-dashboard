import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { Property } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Eye, Heart, MessageSquare, Building, ArrowRight, Loader2, Calendar } from "lucide-react";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyTours } from "@/components/dashboard/PropertyTours";

export default function UserDashboard() {
  // Button handler functions for interactive elements
  const handleButtonClick = (actionType: string, context?: any) => {
    console.log(`${actionType} button clicked`, context || '');
  };

  const handleViewDetails = (item?: any) => {
    console.log('View details clicked', item);
  };

  const handleEdit = (item?: any) => {
    console.log('Edit clicked', item);
  };

  const handleDelete = (item?: any) => {
    console.log('Delete clicked', item);
  };

  const handleAdd = (type?: string) => {
    console.log('Add clicked', type);
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleFilter = (filterType?: string) => {
    console.log('Filter clicked', filterType);
  };

  const handleSettings = () => {
    console.log('Settings clicked');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
  };
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { t, i18n } = useTranslation(['common', 'properties']);
  const locale = i18n.language || 'en-GB';
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
  
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties", { limit: 3 }],
  });
  
  const { data: favoriteProperties, isLoading: isLoadingFavorites } = useQuery<Property[]>({
    queryKey: ["/api/favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/favorites/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: !!user && favorites.length > 0,
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/messages/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!user,
  });

  // Query for property tours data
  const { data: tours, isLoading: isLoadingTours } = useQuery({
    queryKey: ["/api/property-tours", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/property-tours/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch property tours');
      return res.json();
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('dashboard.welcome', { name: user?.fullName || user?.username })}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.overview')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleViewDetails()}  variant="default" className="bg-[#131313] hover:bg-[#131313]/90">
            {t('dashboard.browseProperties')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.savedProperties.title')}
              </CardTitle>
              <ReportIssueButton sectionName={t('dashboard.stats.savedProperties.title')} size="sm" variant="ghost" className="h-7 px-2" />
            </div>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.savedProperties.description')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.recentViews.title')}
              </CardTitle>
              <ReportIssueButton sectionName={t('dashboard.stats.recentViews.title')} size="sm" variant="ghost" className="h-7 px-2" />
            </div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.recentViews.description')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.messages.title')}
              </CardTitle>
              <ReportIssueButton sectionName={t('dashboard.stats.messages.title')} size="sm" variant="ghost" className="h-7 px-2" />
            </div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.messages.description')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.propertyTours.title', { defaultValue: "Property Tours" })}
              </CardTitle>
              <ReportIssueButton sectionName={t('dashboard.stats.propertyTours.title', { defaultValue: "Property Tours" })} size="sm" variant="ghost" className="h-7 px-2" />
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tours?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.propertyTours.description', { defaultValue: "Scheduled property tours" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="favorites">{t('dashboard.tabs.savedProperties')}</TabsTrigger>
          <TabsTrigger value="messages">{t('dashboard.tabs.messages')}</TabsTrigger>
          <TabsTrigger value="tours">{t('dashboard.tabs.tours', { defaultValue: 'Property Tours' })}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('dashboard.tabs.recommendations')}</TabsTrigger>
        </TabsList>
        
        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{t('dashboard.tabs.savedProperties')}</h3>
            <ReportIssueButton sectionName={t('dashboard.tabs.savedProperties')} size="sm" variant="outline" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingFavorites ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : favoriteProperties && favoriteProperties.length > 0 ? (
              favoriteProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <h3 className="text-lg font-medium mb-2">{t('errors.notFound.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('errors.notFound.message')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('errors.notFound.hint')}
                </p>
                <Button onClick={() => handleButtonClick("action")} asChild className="bg-[#131313] text-white hover:bg-white hover:text-black">
                  <Link href={route("/")}>
                    {t('general.home')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{t('dashboard.messages.recent')}</h3>
                <ReportIssueButton sectionName={t('dashboard.tabs.messages')} size="sm" variant="ghost" className="h-7 px-2" />
              </div>
              <Button onClick={() => handleViewDetails()}  asChild variant="default" className="bg-[#131313] hover:bg-[#131313]/90">
                <Link href={route("/messages")}>{t('dashboard.messages.viewAll')}</Link>
              </Button>
            </div>
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="divide-y">
                {messages.slice(0, 3).map((message: any) => (
                  <div key={message.id} className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
                      {message.senderName?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{message.senderName || t('dashboard.messages.agent')}</h4>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{message.content}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {message.propertyTitle || t('dashboard.messages.propertyInquiry')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length > 3 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <Button onClick={() => handleViewDetails()}  asChild variant="link" size="sm">
                      <Link href={route("/messages")}>{t('dashboard.messages.viewAllCount', { count: messages.length })}</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">{t('dashboard.messages.empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.messages.empty.description')}
                </p>
                <Button onClick={() => handleButtonClick("action")} asChild variant="default" className="bg-[#131313] hover:bg-[#131313]/90">
                  <Link href={route("/messages")}>{t('dashboard.messages.goToMessages')}</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Property Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{t('dashboard.tabs.tours', { defaultValue: 'Property Tours' })}</h3>
            <ReportIssueButton sectionName={t('dashboard.tabs.tours', { defaultValue: 'Property Tours' })} size="sm" variant="outline" />
          </div>
          <PropertyTours />
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{t('dashboard.tabs.recommendations')}</h3>
            <ReportIssueButton sectionName={t('dashboard.tabs.recommendations')} size="sm" variant="outline" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="text-lg font-medium mb-2">{t('dashboard.recommendations.empty.title', { defaultValue: 'No Recommendations' })}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.recommendations.empty.description', { defaultValue: 'We don\'t have any recommendations for you yet.' })}
                </p>
                <Button onClick={() => handleButtonClick("action")} asChild variant="default" className="bg-[#131313] hover:bg-[#131313]/90">
                  <Link href={route("/properties")}>
                    {t('dashboard.browseProperties')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}