import { useTranslation } from "react-i18next";
import { useState } from "react";
import { AdminAPI } from "@/services/AdminAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarAdminDashboard } from "@/components/admin/CalendarAdminDashboard";
import { 
  Users, 
  Building2, 
  ExternalLink, 
  BarChart4, 
  Cog, 
  Check, 
  X, 
  Loader2,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Ban,
  AlertTriangle,
  Package,
  Crown,
  Building,
  UserPlus,
  Star,
  Activity,
  Calendar,
  DollarSign,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  BadgeCheck,
  Award,
  Briefcase
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AdminDashboardTour } from "@/components/tours/AdminDashboardTour";
import { useTour } from "@/hooks/use-tour";
import { TourTrigger } from "@/components/ui/tour-trigger";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";

// Enhanced interfaces for comprehensive admin management
interface EnhancedAdminUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin' | 'agency_admin' | 'agency_agent';
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  agencyId?: number | null;
  agencyName?: string;
  isVerified: boolean;
  subscriptionTier: 'free' | 'premium' | 'enterprise' | 'custom';
  suspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: number;
  verifiedAt?: string;
  verifiedBy?: number;
  lastLoginAt?: string;
  customFeatures?: string[];
  subscriptionExpiresAt?: string;
}

interface Agency {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  licenseNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  userCount?: number;
  propertyCount?: number;
  verifiedAt?: string;
  verifiedBy?: number;
}

interface CustomPackage {
  id: number;
  userId: number;
  packageName: string;
  features: string[];
  price: number;
  duration: number;
  description?: string;
  expiresAt: string;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: string;
  createdBy: number;
  user?: {
    username: string;
    fullName: string;
    email: string;
  };
}

interface SystemAnalytics {
  users: {
    total: number;
    new: number;
    verified: number;
    suspended: number;
  };
  agencies: {
    total: number;
    verified: number;
    active: number;
  };
  subscriptions: {
    free: number;
    premium: number;
    enterprise: number;
    custom: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
}




// Status Dropdown Component
function StatusDropdown({ user }: { user: EnhancedAdminUser }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => AdminAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    }
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "User status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user status", description: error.message, variant: "destructive" });
    }
  });

  const handleStatusChange = (action: string) => {
    switch (action) {
      case 'verify':
        updateUserStatusMutation.mutate({ 
          userId: user.id, 
          data: { isVerified: true, status: 'active' } 
        });
        break;
      case 'suspend':
        updateUserStatusMutation.mutate({ 
          userId: user.id, 
          data: { status: 'suspended', suspended: true, suspensionReason: 'Admin action' } 
        });
        break;
      case 'activate':
        updateUserStatusMutation.mutate({ 
          userId: user.id, 
          data: { status: 'active', suspended: false } 
        });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
          deleteUserMutation.mutate(user.id);
        }
        break;
    }
    setIsOpen(false);
  };

  const getStatusDisplay = () => {
    if (user.suspended || user.status === 'suspended') return { text: 'Suspended', color: 'bg-red-100 text-red-800' };
    if (user.isVerified && user.status === 'active') return { text: 'Verified', color: 'bg-green-100 text-green-800' };
    if (user.status === 'active') return { text: 'Unverified', color: 'bg-yellow-100 text-yellow-800' };
    return { text: user.status || 'Inactive', color: 'bg-gray-100 text-gray-800' };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Select value="" onValueChange={handleStatusChange} open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger className="w-32 h-8">
        <Badge className={`${statusDisplay.color} border-0`}>
          {statusDisplay.text}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {!user.isVerified && (
          <SelectItem value="verify" className="text-green-600">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Verify</span>
            </div>
          </SelectItem>
        )}
        {(user.status !== 'suspended' && !user.suspended) && (
          <SelectItem value="suspend" className="text-orange-600">
            <div className="flex items-center space-x-2">
              <Ban className="h-4 w-4" />
              <span>Suspend</span>
            </div>
          </SelectItem>
        )}
        {(user.status === 'suspended' || user.suspended) && (
          <SelectItem value="activate" className="text-blue-600">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Activate</span>
            </div>
          </SelectItem>
        )}
        <SelectItem value="delete" className="text-red-600">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function EnhancedAdminDashboard() {
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
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin dashboard tour management
  const { 
    runTour, 
    startTour, 
    stopTour, 
    markTourSeen 
  } = useTour({ 
    tourId: 'dashboard-admin', 
    autoStart: false,
    showOnce: false 
  });

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [userFilters, setUserFilters] = useState({
    role: '',
    status: '',
    subscriptionTier: '',
    search: '',
    verified: ''
  });

  // Dialog states
  const [suspendUserDialog, setSuspendUserDialog] = useState<{ user: EnhancedAdminUser | null; reason: string }>({ user: null, reason: '' });
  const [verifyUserDialog, setVerifyUserDialog] = useState<{ user: EnhancedAdminUser | null; method: string; notes: string }>({ user: null, method: '', notes: '' });
  const [subscriptionDialog, setSubscriptionDialog] = useState<{ user: EnhancedAdminUser | null; tier: string; features: string[]; expiresAt: string }>({ user: null, tier: '', features: [], expiresAt: '' });
  const [createAgencyDialog, setCreateAgencyDialog] = useState<{ open: boolean; data: any }>({ open: false, data: {} });
  const [customPackageDialog, setCustomPackageDialog] = useState<{ user: EnhancedAdminUser | null; data: any }>({ user: null, data: {} });
  const [trialDialog, setTrialDialog] = useState<{ user: EnhancedAdminUser | null; trialDays: number; tier: string; reason: string; templateId?: number }>({ user: null, trialDays: 14, tier: 'premium', reason: '' });
  const [discountDialog, setDiscountDialog] = useState<{ user: EnhancedAdminUser | null; discountType: string; discountValue: string; reason: string; duration: string }>({ user: null, discountType: 'percentage', discountValue: '', reason: '', duration: 'once' });

  // Queries
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers', userFilters],
    queryFn: () => AdminAPI.getUsers({ ...userFilters, limit: 50 })
  });

  const { data: agenciesData, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['adminAgencies'],
    queryFn: () => AdminAPI.getAgencies({ limit: 20 })
  });

  const { data: customPackagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['adminCustomPackages'],
    queryFn: () => AdminAPI.getCustomPackages({ limit: 20 })
  });

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => AdminAPI.getAnalytics('30d'),
    retry: 1, // Only retry once to avoid infinite loops
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Trials & Discounts data
  const { data: trialTemplatesData, isLoading: isLoadingTrialTemplates } = useQuery({
    queryKey: ['adminTrialTemplates'],
    queryFn: () => AdminAPI.getTrialTemplates()
  });

  const { data: discountCouponsData, isLoading: isLoadingDiscountCoupons } = useQuery({
    queryKey: ['adminDiscountCoupons'],
    queryFn: () => AdminAPI.getDiscountCoupons()
  });

  const { data: subscriptionHistoryData, isLoading: isLoadingSubscriptionHistory } = useQuery({
    queryKey: ['adminSubscriptionHistory'],
    queryFn: () => AdminAPI.getSubscriptionHistory({ limit: 50 })
  });

  // Active trials and discounts (filtered from users data)
  const activeTrials = usersData?.users?.filter((user: EnhancedAdminUser) => 
    user.subscriptionTier !== 'free' && user.status === 'trialing'
  ) || [];

  const activeDiscounts = usersData?.users?.filter((user: EnhancedAdminUser) => 
    user.customFeatures?.includes('discount_active')
  ) || [];

  // Mutations
  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) => AdminAPI.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "User suspended successfully" });
      setSuspendUserDialog({ user: null, reason: '' });
    },
    onError: (error: any) => {
      toast({ title: "Failed to suspend user", description: error.message, variant: "destructive" });
    }
  });

  const verifyUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.verifyUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "User verified successfully" });
      setVerifyUserDialog({ user: null, method: '', notes: '' });
    },
    onError: (error: any) => {
      toast({ title: "Failed to verify user", description: error.message, variant: "destructive" });
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.updateUserSubscription(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "Subscription updated successfully" });
      setSubscriptionDialog({ user: null, tier: '', features: [], expiresAt: '' });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update subscription", description: error.message, variant: "destructive" });
    }
  });

  const createCustomPackageMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.createCustomPackage(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCustomPackages', 'adminUsers'] });
      toast({ title: "Custom package created successfully" });
      setCustomPackageDialog({ user: null, data: {} });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create custom package", description: error.message, variant: "destructive" });
    }
  });

  const setTrialMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.setUserTrial(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "Trial period set successfully" });
      setTrialDialog({ user: null, trialDays: 14, tier: 'premium', reason: '' });
    },
    onError: (error: any) => {
      toast({ title: "Failed to set trial period", description: error.message, variant: "destructive" });
    }
  });

  const applyDiscountMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => AdminAPI.applyUserDiscount(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "Discount applied successfully" });
      setDiscountDialog({ user: null, discountType: 'percentage', discountValue: '', reason: '', duration: 'once' });
    },
    onError: (error: any) => {
      toast({ title: "Failed to apply discount", description: error.message, variant: "destructive" });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ userIds, updates }: { userIds: number[]; updates: any }) => AdminAPI.bulkUpdateUsers(userIds, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: `Bulk update completed`, description: `Updated ${data.updatedCount} users` });
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({ title: "Bulk update failed", description: error.message, variant: "destructive" });
    }
  });

  // Utility functions
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agency_admin': return 'bg-purple-100 text-purple-800';
      case 'agent': 
      case 'agency_agent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced verification badge component
  const getVerificationBadge = (user: EnhancedAdminUser) => {
    if (!user.isVerified) return null;

    const verificationConfig = {
      agent: {
        icon: Award,
        text: 'Verified Agent',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconClassName: 'text-emerald-600'
      },
      agency_admin: {
        icon: BadgeCheck,
        text: 'Verified Agency Admin',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        iconClassName: 'text-blue-600'
      },
      agency_agent: {
        icon: Briefcase,
        text: 'Verified Agency Agent',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconClassName: 'text-indigo-600'
      },
      admin: {
        icon: ShieldCheck,
        text: 'Verified Admin',
        className: 'bg-red-50 text-red-700 border-red-200',
        iconClassName: 'text-red-600'
      },
      user: {
        icon: UserCheck,
        text: 'Verified User',
        className: 'bg-green-50 text-green-700 border-green-200',
        iconClassName: 'text-green-600'
      }
    };

    const config = verificationConfig[user.role as keyof typeof verificationConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge 
        variant="outline" 
        className={`${config.className} text-xs font-medium`}
        title={`${config.text} - Verified on ${user.verifiedAt ? format(new Date(user.verifiedAt), 'MMM dd, yyyy') : 'Unknown'}`}
      >
        <IconComponent className={`h-3 w-3 mr-1 ${config.iconClassName}`} />
        Verified
      </Badge>
    );
  };

  // Agency verification badge
  const getAgencyVerificationBadge = (agency: Agency) => {
    if (!agency.isVerified) return null;

    return (
      <Badge 
        variant="outline" 
        className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium"
        title={`Verified Agency - Verified on ${agency.verifiedAt ? format(new Date(agency.verifiedAt), 'MMM dd, yyyy') : 'Unknown'}`}
      >
        <Building className="h-3 w-3 mr-1 text-blue-600" />
        Verified Agency
      </Badge>
    );
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 admin-dashboard">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t('admin.title')}</h2>
          <div className="flex items-center space-x-2">
            <ReportIssueButton context="dashboard" variant="outline" />
            <Button onClick={() => handleExport()}  variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" data-tabs-trigger="overview">
              <BarChart4 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" data-tabs-trigger="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="agencies" data-tabs-trigger="agencies">
              <Building className="mr-2 h-4 w-4" />
              Agencies
            </TabsTrigger>
            <TabsTrigger value="packages" data-tabs-trigger="packages">
              <Package className="mr-2 h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="trials-discounts" data-tabs-trigger="trials-discounts">
              <DollarSign className="mr-2 h-4 w-4" />
              Trials & Discounts
            </TabsTrigger>
            <TabsTrigger value="calendar" data-tabs-trigger="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" data-tabs-trigger="analytics">
              <Activity className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" data-tabs-trigger="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 admin-section">
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading analytics...</span>
              </div>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.analytics?.users?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analyticsData?.analytics?.users?.new || 0} new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agencies</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.analytics?.agencies?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData?.analytics?.agencies?.verified || 0} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.analytics?.subscriptions?.premium || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analyticsData?.analytics?.subscriptions?.enterprise || 0} enterprise
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analyticsData?.analytics?.revenue?.monthly || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analyticsData?.analytics?.revenue?.growth || 0}% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usersData?.users?.slice(0, 5).map((user: EnhancedAdminUser) => (
                      <div key={user.id} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Verification Rate</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.analytics?.users?.verified && analyticsData?.analytics?.users?.total ? Math.round((analyticsData.analytics.users.verified / analyticsData.analytics.users.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Verified Agents</span>
                      <span className="text-sm font-medium">
                        {usersData?.users?.filter((u: EnhancedAdminUser) => u.role === 'agent' && u.isVerified).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Verified Agency Staff</span>
                      <span className="text-sm font-medium">
                        {usersData?.users?.filter((u: EnhancedAdminUser) => (u.role === 'agency_admin' || u.role === 'agency_agent') && u.isVerified).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Agency Verification Rate</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.analytics?.agencies?.verified && analyticsData?.analytics?.agencies?.total ? Math.round((analyticsData.analytics.agencies.verified / analyticsData.analytics.agencies.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium Conversion Rate</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.analytics?.subscriptions?.premium && analyticsData?.analytics?.subscriptions?.enterprise && analyticsData?.analytics?.users?.total ? Math.round(((analyticsData.analytics.subscriptions.premium + analyticsData.analytics.subscriptions.enterprise) / analyticsData.analytics.users.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-64"
                />
                <Select value={userFilters.role || 'all'} onValueChange={(value) => setUserFilters(prev => ({ ...prev, role: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="agency_admin">Agency Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userFilters.status || 'all'} onValueChange={(value) => setUserFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userFilters.verified || 'all'} onValueChange={(value) => setUserFilters(prev => ({ ...prev, verified: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{selectedUsers.length} selected</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      // Bulk suspend
                      bulkUpdateMutation.mutate({ userIds: selectedUsers, updates: { suspended: true } });
                    }}>
                      <Ban className="mr-1 h-3 w-3" />
                      Suspend
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      // Bulk verify
                      bulkUpdateMutation.mutate({ userIds: selectedUsers, updates: { isVerified: true } });
                    }}>
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      Verify
                    </Button>
                  </div>
                )}
                <Button onClick={() => handleButtonClick("action")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === usersData?.users?.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(usersData?.users?.map((u: EnhancedAdminUser) => u.id) || []);
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData?.users?.map((user: EnhancedAdminUser) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getVerificationBadge(user)}
                              {user.suspended && (
                                <Badge variant="destructive" className="text-xs">
                                  <Ban className="h-3 w-3 mr-1" />
                                  Suspended
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusDropdown user={user} />
                        </TableCell>
                        <TableCell>
                          <Badge className={getSubscriptionBadgeColor(user.subscriptionTier)}>
                            {user.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.agencyName || '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setVerifyUserDialog({ user, method: '', notes: '' })} title="Verify User">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSuspendUserDialog({ user, reason: '' })} title="Suspend User">
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSubscriptionDialog({ user, tier: user.subscriptionTier, features: user.customFeatures || [], expiresAt: user.subscriptionExpiresAt || '' })} title="Manage Subscription">
                              <Crown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setTrialDialog({ user, trialDays: 14, tier: 'premium', reason: '' })} title="Set Trial Period">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDiscountDialog({ user, discountType: 'percentage', discountValue: '', reason: '' })} title="Apply Discount">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCustomPackageDialog({ user, data: {} })} title="Custom Package">
                              <Package className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Agencies Tab */}
          <TabsContent value="agencies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Agency Management</h3>
              <Button onClick={() => setCreateAgencyDialog({ open: true, data: {} })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Agency
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAgencies ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Loading agencies...
                      </TableCell>
                    </TableRow>
                  ) : (
                    agenciesData?.agencies?.map((agency: Agency) => (
                      <TableRow key={agency.id}>
                        <TableCell>
                          <div className="flex flex-col space-y-2">
                          <div>
                            <div className="font-medium">{agency.name}</div>
                            <div className="text-sm text-muted-foreground">{agency.website}</div>
                            </div>
                            {getAgencyVerificationBadge(agency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{agency.email}</div>
                            <div className="text-sm text-muted-foreground">{agency.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{agency.licenseNumber || '-'}</TableCell>
                        <TableCell>{agency.userCount || 0}</TableCell>
                        <TableCell>
                            <Badge className={agency.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {agency.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(agency.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title={agency.isVerified ? "Unverify Agency" : "Verify Agency"}
                              onClick={() => {
                                // TODO: Implement agency verification toggle
                                toast({ 
                                  title: agency.isVerified ? "Agency Unverified" : "Agency Verified",
                                  description: `${agency.name} has been ${agency.isVerified ? 'unverified' : 'verified'}`
                                });
                              }}
                            >
                              {agency.isVerified ? <Shield className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                            </Button>
                            <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Edit Agency">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Custom Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Custom Packages</h3>
              <Button onClick={() => handleViewDetails()} >
                <Plus className="mr-2 h-4 w-4" />
                Create Package Template
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPackages ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Loading packages...
                      </TableCell>
                    </TableRow>
                  ) : (
                    customPackagesData?.packages?.map((pkg: CustomPackage) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pkg.packageName}</div>
                            <div className="text-sm text-muted-foreground">{pkg.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{pkg.user?.fullName}</div>
                            <div className="text-sm text-muted-foreground">{pkg.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {pkg.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {pkg.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${pkg.price}</TableCell>
                        <TableCell>{pkg.duration} days</TableCell>
                        <TableCell>
                          <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleEdit()}  variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Trials and Discounts Tab */}
          <TabsContent value="trials-discounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Trials & Discount Management</h3>
              <div className="flex space-x-2">
                <Button onClick={() => handleButtonClick("action")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Trial Template
                </Button>
                <Button onClick={() => handleAdd()}  variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Discount Coupon
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeTrials.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {trialTemplatesData?.templates?.length || 0} templates available
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeDiscounts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {discountCouponsData?.coupons?.length || 0} coupons available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                  <BarChart4 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriptionHistoryData?.history?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Subscription changes logged
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="trials" className="w-full">
              <TabsList>
                <TabsTrigger value="trials">Active Trials</TabsTrigger>
                <TabsTrigger value="discounts">Active Discounts</TabsTrigger>
                <TabsTrigger value="templates">Trial Templates</TabsTrigger>
                <TabsTrigger value="coupons">Discount Coupons</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="trials" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active User Trials</CardTitle>
                    <CardDescription>Users currently on trial subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Days Left</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingUsers ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                              Loading trials...
                            </TableCell>
                          </TableRow>
                        ) : activeTrials.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No active trials found
                            </TableCell>
                          </TableRow>
                        ) : (
                          activeTrials.map((user: EnhancedAdminUser) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getSubscriptionBadgeColor(user.subscriptionTier)}>
                                  {user.subscriptionTier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {user.subscriptionExpiresAt ? format(new Date(user.subscriptionExpiresAt), 'MMM dd, yyyy') : 'No expiry set'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-blue-600">
                                  {user.subscriptionExpiresAt 
                                    ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                                    : '-'
                                  } days
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Extend Trial">
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Convert to Paid">
                                    <Crown className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="End Trial">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discounts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active User Discounts</CardTitle>
                    <CardDescription>Users with active discount pricing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Discount Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Applied</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Savings</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No active discounts found
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trial Templates</CardTitle>
                    <CardDescription>Reusable trial configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Name</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Applicable Tiers</TableHead>
                          <TableHead>Usage Count</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingTrialTemplates ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                              Loading trial templates...
                            </TableCell>
                          </TableRow>
                        ) : trialTemplatesData?.templates?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No trial templates found
                            </TableCell>
                          </TableRow>
                        ) : (
                          trialTemplatesData?.templates?.map((template: any) => (
                            <TableRow key={template.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-sm text-muted-foreground">{template.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>{template.trialDays} days</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {template.applicableTiers?.map((tier: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tier}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{template.timesUsed || 0}</TableCell>
                              <TableCell>
                                <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {template.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Edit Template">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleEdit()}  variant="ghost" size="sm" title="Use Template">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Delete Template">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coupons" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Discount Coupons</CardTitle>
                    <CardDescription>Reusable discount codes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingDiscountCoupons ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                              Loading discount coupons...
                            </TableCell>
                          </TableRow>
                        ) : discountCouponsData?.coupons?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                              No discount coupons found
                            </TableCell>
                          </TableRow>
                        ) : (
                          discountCouponsData?.coupons?.map((coupon: any) => (
                            <TableRow key={coupon.id}>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {coupon.code}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{coupon.name}</div>
                                  <div className="text-sm text-muted-foreground">{coupon.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={coupon.discountType === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                  {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue}`}
                              </TableCell>
                              <TableCell>
                                {coupon.timesRedeemed || 0} / {coupon.maxRedemptions || '∞'}
                              </TableCell>
                              <TableCell>
                                {coupon.validUntil ? format(new Date(coupon.validUntil), 'MMM dd, yyyy') : 'No expiry'}
                              </TableCell>
                              <TableCell>
                                <Badge className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {coupon.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Edit Coupon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="View Usage">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleButtonClick("action")} variant="ghost" size="sm" title="Deactivate">
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription History</CardTitle>
                    <CardDescription>All trial and discount activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>From Tier</TableHead>
                          <TableHead>To Tier</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingSubscriptionHistory ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                              Loading subscription history...
                            </TableCell>
                          </TableRow>
                        ) : subscriptionHistoryData?.history?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                              No subscription history found
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscriptionHistoryData?.history?.map((entry: any) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                {format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{entry.user?.fullName || 'Unknown User'}</div>
                                  <div className="text-sm text-muted-foreground">{entry.user?.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  entry.action === 'trial_started' ? 'text-blue-600' :
                                  entry.action === 'discount_applied' ? 'text-green-600' :
                                  entry.action === 'upgraded' ? 'text-purple-600' :
                                  entry.action === 'canceled' ? 'text-red-600' :
                                  'text-gray-600'
                                }>
                                  {entry.action?.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {entry.fromTier ? (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.fromTier}
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {entry.toTier ? (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.toTier}
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {entry.newPrice ? `$${entry.newPrice}` : 
                                 entry.discountApplied ? `$${entry.discountApplied}` : 
                                 entry.trialDaysGranted ? `${entry.trialDaysGranted} days` : '-'}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{entry.performedBy?.fullName || 'System'}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">{entry.reason || '-'}</span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <CalendarAdminDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      
      {/* Suspend User Dialog */}
      <Dialog open={!!suspendUserDialog.user} onOpenChange={() => setSuspendUserDialog({ user: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {suspendUserDialog.user?.fullName}? This will prevent them from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspensionReason">Reason for suspension</Label>
              <Textarea
                id="suspensionReason"
                value={suspendUserDialog.reason}
                onChange={(e) => setSuspendUserDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for suspension..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendUserDialog({ user: null, reason: '' })}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => suspendUserDialog.user && suspendUserMutation.mutate({ 
                userId: suspendUserDialog.user.id, 
                reason: suspendUserDialog.reason 
              })}
              disabled={suspendUserMutation.isPending}
            >
              {suspendUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Verify User Dialog */}
      <Dialog open={!!verifyUserDialog.user} onOpenChange={() => setVerifyUserDialog({ user: null, method: '', notes: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {verifyUserDialog.user?.role === 'agent' && <Award className="h-5 w-5 text-emerald-600" />}
              {verifyUserDialog.user?.role === 'agency_admin' && <BadgeCheck className="h-5 w-5 text-blue-600" />}
              {verifyUserDialog.user?.role === 'agency_agent' && <Briefcase className="h-5 w-5 text-indigo-600" />}
              {verifyUserDialog.user?.role === 'admin' && <ShieldCheck className="h-5 w-5 text-red-600" />}
              {verifyUserDialog.user?.role === 'user' && <UserCheck className="h-5 w-5 text-green-600" />}
              <span>
                Verify {verifyUserDialog.user?.role === 'agent' ? 'Agent' : 
                       verifyUserDialog.user?.role === 'agency_admin' ? 'Agency Admin' :
                       verifyUserDialog.user?.role === 'agency_agent' ? 'Agency Agent' :
                       verifyUserDialog.user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </DialogTitle>
            <DialogDescription>
              Verify {verifyUserDialog.user?.fullName} as a legitimate {verifyUserDialog.user?.role === 'agent' ? 'real estate agent' : 
                                                                        verifyUserDialog.user?.role === 'agency_admin' ? 'agency administrator' :
                                                                        verifyUserDialog.user?.role === 'agency_agent' ? 'agency agent' :
                                                                        verifyUserDialog.user?.role === 'admin' ? 'system administrator' : 'platform user'}.
              {verifyUserDialog.user?.isVerified && (
                <div className="mt-2 p-2 bg-green-50 rounded-md">
                  <span className="text-green-700 text-sm font-medium">✓ Already verified</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select value={verifyUserDialog.method} onValueChange={(value) => setVerifyUserDialog(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Review</SelectItem>
                  {(verifyUserDialog.user?.role === 'agent' || verifyUserDialog.user?.role === 'agency_admin' || verifyUserDialog.user?.role === 'agency_agent') && (
                    <>
                      <SelectItem value="license">Real Estate License Check</SelectItem>
                      <SelectItem value="background">Background Check</SelectItem>
                      <SelectItem value="reference">Professional Reference</SelectItem>
                    </>
                  )}
                  <SelectItem value="document">Document Verification</SelectItem>
                  <SelectItem value="phone">Phone Verification</SelectItem>
                  <SelectItem value="email">Email Verification</SelectItem>
                  {verifyUserDialog.user?.role === 'admin' && (
                    <SelectItem value="security">Security Clearance</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="verificationNotes">Verification Notes</Label>
              <Textarea
                id="verificationNotes"
                value={verifyUserDialog.notes}
                onChange={(e) => setVerifyUserDialog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={`Add verification notes for this ${verifyUserDialog.user?.role}...`}
                rows={3}
              />
            </div>
            {verifyUserDialog.user?.role === 'agent' && (
              <div className="p-3 bg-emerald-50 rounded-md">
                <p className="text-sm text-emerald-700">
                  <strong>Agent Verification:</strong> Confirms professional real estate license, credentials, and business legitimacy.
                </p>
              </div>
            )}
            {(verifyUserDialog.user?.role === 'agency_admin' || verifyUserDialog.user?.role === 'agency_agent') && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Agency Verification:</strong> Confirms agency affiliation, professional standing, and authorized representation.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyUserDialog({ user: null, method: '', notes: '' })}>
              Cancel
            </Button>
            <Button 
              onClick={() => verifyUserDialog.user && verifyUserMutation.mutate({ 
                userId: verifyUserDialog.user.id, 
                data: { 
                  verificationMethod: verifyUserDialog.method,
                  notes: verifyUserDialog.notes
                }
              })}
              disabled={verifyUserMutation.isPending || !verifyUserDialog.method}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {verifyUserDialog.user?.isVerified ? 'Update Verification' : 'Verify User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Trial Dialog */}
      <Dialog open={!!trialDialog.user} onOpenChange={() => setTrialDialog({ user: null, trialDays: 14, tier: 'premium', reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Set Trial Period</span>
            </DialogTitle>
            <DialogDescription>
              Grant {trialDialog.user?.fullName} access to a premium trial subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trialTier">Subscription Tier</Label>
                <Select value={trialDialog.tier} onValueChange={(value) => setTrialDialog(prev => ({ ...prev, tier: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trialDuration">Trial Duration (Days)</Label>
                <Input
                  id="trialDuration"
                  type="number"
                  value={trialDialog.trialDays}
                  onChange={(e) => setTrialDialog(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 14 }))}
                  min="1"
                  max="365"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="trialReason">Reason for Trial</Label>
              <Textarea
                id="trialReason"
                value={trialDialog.reason}
                onChange={(e) => setTrialDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for granting trial access..."
                rows={3}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Trial Benefits:</strong> User will have full access to {trialDialog.tier} features for {trialDialog.trialDays} days at no cost.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialDialog({ user: null, trialDays: 14, tier: 'premium', reason: '' })}>
              Cancel
            </Button>
            <Button 
              onClick={() => trialDialog.user && setTrialMutation.mutate({ 
                userId: trialDialog.user.id, 
                data: { 
                  trialDays: trialDialog.trialDays,
                  tier: trialDialog.tier,
                  reason: trialDialog.reason
                }
              })}
              disabled={setTrialMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {setTrialMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Trial Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Discount Dialog */}
      <Dialog open={!!discountDialog.user} onOpenChange={() => setDiscountDialog({ user: null, discountType: 'percentage', discountValue: '', reason: '', duration: 'once' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Apply Discount</span>
            </DialogTitle>
            <DialogDescription>
              Apply a pricing discount to {discountDialog.user?.fullName}'s subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountDialog.discountType} onValueChange={(value) => setDiscountDialog(prev => ({ ...prev, discountType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">
                  Discount Value {discountDialog.discountType === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={discountDialog.discountValue}
                  onChange={(e) => setDiscountDialog(prev => ({ ...prev, discountValue: e.target.value }))}
                  placeholder={discountDialog.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                  min="0"
                  max={discountDialog.discountType === 'percentage' ? "100" : undefined}
                  step={discountDialog.discountType === 'percentage' ? "1" : "0.01"}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="discountDuration">Duration</Label>
              <Select value={discountDialog.duration} onValueChange={(value) => setDiscountDialog(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time discount</SelectItem>
                  <SelectItem value="repeating">Repeating monthly</SelectItem>
                  <SelectItem value="forever">Permanent discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountReason">Reason for Discount</Label>
              <Textarea
                id="discountReason"
                value={discountDialog.reason}
                onChange={(e) => setDiscountDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for applying discount..."
                rows={3}
              />
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">
                <strong>Discount Effect:</strong> {discountDialog.discountValue && (
                  discountDialog.discountType === 'percentage' 
                    ? `${discountDialog.discountValue}% off subscription price`
                    : `$${discountDialog.discountValue} off subscription price`
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialog({ user: null, discountType: 'percentage', discountValue: '', reason: '', duration: 'once' })}>
              Cancel
            </Button>
            <Button 
              onClick={() => discountDialog.user && applyDiscountMutation.mutate({ 
                userId: discountDialog.user.id, 
                data: { 
                  discountType: discountDialog.discountType,
                  discountValue: parseFloat(discountDialog.discountValue),
                  discountDuration: discountDialog.duration,
                  reason: discountDialog.reason
                }
              })}
              disabled={applyDiscountMutation.isPending || !discountDialog.discountValue}
              className="bg-green-600 hover:bg-green-700"
            >
              {applyDiscountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={!!subscriptionDialog.user} onOpenChange={() => setSubscriptionDialog({ user: null, tier: '', features: [], expiresAt: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span>Manage Subscription</span>
            </DialogTitle>
            <DialogDescription>
              Update subscription tier and features for {subscriptionDialog.user?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                <Select value={subscriptionDialog.tier} onValueChange={(value) => setSubscriptionDialog(prev => ({ ...prev, tier: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subscriptionExpiry">Expiry Date (Optional)</Label>
                <Input
                  id="subscriptionExpiry"
                  type="date"
                  value={subscriptionDialog.expiresAt ? subscriptionDialog.expiresAt.split('T')[0] : ''}
                  onChange={(e) => setSubscriptionDialog(prev => ({ ...prev, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customFeatures">Custom Features (Optional)</Label>
              <Textarea
                id="customFeatures"
                value={subscriptionDialog.features.join(', ')}
                onChange={(e) => setSubscriptionDialog(prev => ({ 
                  ...prev, 
                  features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                }))}
                placeholder="Enter custom features separated by commas..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: unlimited_listings, priority_support, advanced_analytics
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-md">
              <p className="text-sm text-purple-700">
                <strong>Current Subscription:</strong> {subscriptionDialog.user?.subscriptionTier || 'free'}
                {subscriptionDialog.user?.subscriptionExpiresAt && (
                  <span> (expires {format(new Date(subscriptionDialog.user.subscriptionExpiresAt), 'MMM dd, yyyy')})</span>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriptionDialog({ user: null, tier: '', features: [], expiresAt: '' })}>
              Cancel
            </Button>
            <Button 
              onClick={() => subscriptionDialog.user && updateSubscriptionMutation.mutate({ 
                userId: subscriptionDialog.user.id, 
                data: { 
                  subscriptionTier: subscriptionDialog.tier,
                  customFeatures: subscriptionDialog.features.length > 0 ? subscriptionDialog.features : null,
                  expiresAt: subscriptionDialog.expiresAt || null
                }
              })}
              disabled={updateSubscriptionMutation.isPending || !subscriptionDialog.tier}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updateSubscriptionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Package Dialog */}
      <Dialog open={!!customPackageDialog.user} onOpenChange={() => setCustomPackageDialog({ user: null, data: {} })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Package</DialogTitle>
            <DialogDescription>
              Create a custom package for {customPackageDialog.user?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  value={customPackageDialog.data.packageName || ''}
                  onChange={(e) => setCustomPackageDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, packageName: e.target.value }
                  }))}
                  placeholder="e.g., Premium Plus"
                />
              </div>
              <div>
                <Label htmlFor="packagePrice">Price ($)</Label>
                <Input
                  id="packagePrice"
                  type="number"
                  value={customPackageDialog.data.price || ''}
                  onChange={(e) => setCustomPackageDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, price: parseFloat(e.target.value) }
                  }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="packageDuration">Duration (days)</Label>
              <Input
                id="packageDuration"
                type="number"
                value={customPackageDialog.data.duration || ''}
                onChange={(e) => setCustomPackageDialog(prev => ({
                  ...prev,
                  data: { ...prev.data, duration: parseInt(e.target.value) }
                }))}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="packageFeatures">Features (one per line)</Label>
              <Textarea
                id="packageFeatures"
                value={customPackageDialog.data.featuresText || ''}
                onChange={(e) => setCustomPackageDialog(prev => ({
                  ...prev,
                  data: { 
                    ...prev.data, 
                    featuresText: e.target.value,
                    features: e.target.value.split('\n').filter(f => f.trim())
                  }
                }))}
                placeholder="Unlimited property listings&#10;Priority customer support&#10;Advanced analytics&#10;Custom branding"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="packageDescription">Description</Label>
              <Textarea
                id="packageDescription"
                value={customPackageDialog.data.description || ''}
                onChange={(e) => setCustomPackageDialog(prev => ({
                  ...prev,
                  data: { ...prev.data, description: e.target.value }
                }))}
                placeholder="Package description..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRenew"
                checked={customPackageDialog.data.autoRenew || false}
                onCheckedChange={(checked) => setCustomPackageDialog(prev => ({
                  ...prev,
                  data: { ...prev.data, autoRenew: checked }
                }))}
              />
              <Label htmlFor="autoRenew">Auto-renew package</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomPackageDialog({ user: null, data: {} })}>
              Cancel
            </Button>
            <Button 
              onClick={() => customPackageDialog.user && createCustomPackageMutation.mutate({
                userId: customPackageDialog.user.id,
                data: customPackageDialog.data
              })}
              disabled={createCustomPackageMutation.isPending || !customPackageDialog.data.packageName}
            >
              {createCustomPackageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tour Trigger Button */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <TourTrigger
          onClick={() => {
            console.log('🎯 Admin Guide button clicked - starting tour...');
            console.log('Current runTour state:', runTour);
            startTour();
          }}
          variant="default"
          size="default"
          icon="help"
          showBadge={true}
          badgeText="Tour"
        >
          Admin Guide
        </TourTrigger>
      </div>
      
      {/* Dashboard Tour */}
      <AdminDashboardTour
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
    </>
  );
}