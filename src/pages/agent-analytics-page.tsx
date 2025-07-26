import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import PremiumFeatureWrapper from "@/components/subscription/PremiumFeatureWrapper";
import AnalyticsKPICard from "@/components/analytics/AnalyticsKPICard";
import AnalyticsFilters, { type AnalyticsFilters as AnalyticsFiltersType } from "@/components/analytics/AnalyticsFilters";
import PropertyPerformanceTable from "@/components/analytics/PropertyPerformanceTable";
import { useAnalytics } from "@/hooks/use-analytics";
import { 
  AlertCircle, 
  BarChart3, 
  Eye, 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Home,
  Target,
  Lightbulb
} from "lucide-react";

export default function AgentAnalyticsPage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  
  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    period: '30days',
    scope: 'agent',
    granularity: 'day'
  });

  const { data, loading, error, exportData } = useAnalytics(filters);

  const handleFiltersChange = (newFilters: AnalyticsFiltersType) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      await exportData('csv');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics for your property listings
          </p>
        </div>

        {isPremium ? (
          // Premium Analytics Dashboard
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Analytics Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <AnalyticsKPICard
                    title="Total Listings"
                    value={data?.kpis.totalListings || 0}
                    icon={<Home className="h-4 w-4" />}
                    loading={loading}
                  />
                  <AnalyticsKPICard
                    title="Total Views"
                    value={data?.kpis.totalViews || 0}
                    icon={<Eye className="h-4 w-4" />}
                    loading={loading}
                  />
                  <AnalyticsKPICard
                    title="Total Leads"
                    value={data?.kpis.totalLeads || 0}
                    icon={<Users className="h-4 w-4" />}
                    loading={loading}
                  />
                  <AnalyticsKPICard
                    title="Conversion Rate"
                    value={data?.kpis.conversionRate || 0}
                    format="percentage"
                    icon={<Target className="h-4 w-4" />}
                    loading={loading}
                  />
                </div>

                {/* Secondary KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <AnalyticsKPICard
                    title="Active Listings"
                    value={data?.kpis.activeListings || 0}
                    icon={<TrendingUp className="h-4 w-4" />}
                    loading={loading}
                  />
                  <AnalyticsKPICard
                    title="Total Revenue"
                    value={data?.kpis.totalRevenue || 0}
                    format="currency"
                    icon={<DollarSign className="h-4 w-4" />}
                    loading={loading}
                  />
                  <AnalyticsKPICard
                    title="Avg Deal Size"
                    value={data?.kpis.averageDealSize || 0}
                    format="currency"
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    loading={loading}
                  />
                </div>

                {/* Property Performance Table */}
                <PropertyPerformanceTable
                  properties={data?.topProperties || []}
                  loading={loading}
                />

                {/* Insights */}
                {data?.insights && data.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        AI-Generated Insights
                      </CardTitle>
                      <CardDescription>
                        Actionable recommendations based on your performance data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-blue-600 mt-0.5">
                              <Lightbulb className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-blue-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>
                      {filters.granularity === 'day' ? 'Daily' : 
                       filters.granularity === 'week' ? 'Weekly' : 'Monthly'} performance over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <BarChart3 className="h-16 w-16 text-neutral-300" />
                        <p className="text-muted-foreground">
                          Interactive charts will be implemented in the next phase
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Data available: {data?.timeseries?.length || 0} data points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <AnalyticsFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onExport={handleExport}
                  className="sticky top-6"
                />
              </div>
            </div>
          </div>
        ) : (
          // Basic Analytics Preview + Upgrade Prompt
          <PremiumFeatureWrapper
            feature="Professional Analytics Dashboard"
            description="Get comprehensive insights to grow your real estate business faster"
            showUpgradePrompt={true}
          >
            <div className="space-y-6">
              {/* Basic KPI Preview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 rounded-lg"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Listings
                    </CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">***</div>
                    <p className="text-xs text-muted-foreground">Upgrade to see trends</p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 rounded-lg"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Property Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">***</div>
                    <p className="text-xs text-muted-foreground">Upgrade to see trends</p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 rounded-lg"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Lead Generation
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">***</div>
                    <p className="text-xs text-muted-foreground">Upgrade to see trends</p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 rounded-lg"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Conversion Rate
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">***</div>
                    <p className="text-xs text-muted-foreground">Upgrade to see trends</p>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Features Preview */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Unlock Professional Analytics
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Take your real estate business to the next level with comprehensive analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3">📊 Key Performance Insights</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Real-time property view tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Lead generation & conversion analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Revenue & commission tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Property performance rankings
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3">🎯 Advanced Features</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          AI-powered insights & recommendations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Traffic source analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Custom date range reports
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          CSV export & email reports
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Why Analytics Matter</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Real estate professionals with analytics-driven strategies close <strong>23% more deals</strong> and 
                          increase their average commission by <strong>18%</strong> compared to those without data insights.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">2.3x</div>
                      <div className="text-xs text-blue-700">More qualified leads</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">18%</div>
                      <div className="text-xs text-blue-700">Higher conversion rate</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">$50k+</div>
                      <div className="text-xs text-blue-700">Average revenue increase</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blurred Preview Chart */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-90 z-10 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Interactive Performance Charts</p>
                    <p className="text-sm text-gray-500 mt-2">Upgrade to Premium to unlock detailed analytics</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Daily, weekly, and monthly performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px] bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg opacity-30"></div>
                </CardContent>
              </Card>
            </div>
          </PremiumFeatureWrapper>
        )}
      </div>
    </DashboardLayout>
  );
}