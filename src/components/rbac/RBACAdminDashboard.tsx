import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Shield, Crown, Star, CreditCard, Package, 
  Settings, Plus, Edit, Trash, Eye, Award, 
  TrendingUp, BarChart3, Users2, DollarSign
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface UserRole {
  id: number;
  userId: number;
  role: string;
  agencyId?: number;
  isAgencySuperuser: boolean;
  permissions: string[];
  assignedBy?: number;
  assignedAt: string;
  isActive: boolean;
  userName?: string;
  userEmail?: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  tier: string;
  role: string;
  price: string;
  currency: string;
  billingPeriod: string;
  listingsLimit: number;
  features: string[];
  description?: string;
  isActive: boolean;
}

interface Addon {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: string;
  currency: string;
  billingType: string;
  availableForRoles: string[];
  features: string[];
  limits: Record<string, number>;
  isActive: boolean;
}

interface UserBadge {
  id: number;
  userId: number;
  badgeType: string;
  isActive: boolean;
  grantedBy: number;
  grantedAt: string;
  expiresAt?: string;
  userName?: string;
}

export function RBACAdminDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false);
  const [showCreateAddonDialog, setShowCreateAddonDialog] = useState(false);
  const [showGrantBadgeDialog, setShowGrantBadgeDialog] = useState(false);

  // Form states
  const [newPlan, setNewPlan] = useState({
    name: "",
    tier: "",
    role: "",
    price: "",
    billingPeriod: "monthly",
    listingsLimit: 0,
    features: "",
    description: "",
  });

  const [newAddon, setNewAddon] = useState({
    name: "",
    type: "",
    description: "",
    price: "",
    billingType: "monthly",
    availableForRoles: "",
    features: "",
    limits: "",
  });

  const [badgeForm, setBadgeForm] = useState({
    userId: "",
    badgeType: "",
    expiresAt: "",
  });

  // Fetch analytics
  const { data: subscriptionAnalytics } = useQuery({
    queryKey: ['rbac-subscription-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/analytics/subscriptions', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: user?.role === 'admin',
  });

  // Fetch subscription plans
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['rbac-subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/subscription-plans', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  // Fetch addons
  const { data: addons = [] } = useQuery({
    queryKey: ['rbac-addons'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/addons/available', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch addons');
      return response.json();
    },
  });

  // Create subscription plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: typeof newPlan) => {
      const response = await fetch('/api/rbac/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...planData,
          features: planData.features.split(',').map(f => f.trim()).filter(Boolean),
          listingsLimit: Number(planData.listingsLimit),
        }),
      });
      if (!response.ok) throw new Error('Failed to create plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-subscription-plans'] });
      toast({
        title: "Plan Created",
        description: "Subscription plan created successfully",
      });
      setShowCreatePlanDialog(false);
      setNewPlan({
        name: "",
        tier: "",
        role: "",
        price: "",
        billingPeriod: "monthly",
        listingsLimit: 0,
        features: "",
        description: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive",
      });
    },
  });

  // Create addon mutation
  const createAddonMutation = useMutation({
    mutationFn: async (addonData: typeof newAddon) => {
      const response = await fetch('/api/rbac/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...addonData,
          availableForRoles: addonData.availableForRoles.split(',').map(r => r.trim()).filter(Boolean),
          features: addonData.features.split(',').map(f => f.trim()).filter(Boolean),
          limits: addonData.limits ? JSON.parse(addonData.limits) : {},
        }),
      });
      if (!response.ok) throw new Error('Failed to create addon');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-addons'] });
      toast({
        title: "Add-on Created",
        description: "Add-on created successfully",
      });
      setShowCreateAddonDialog(false);
      setNewAddon({
        name: "",
        type: "",
        description: "",
        price: "",
        billingType: "monthly",
        availableForRoles: "",
        features: "",
        limits: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create add-on",
        variant: "destructive",
      });
    },
  });

  // Grant badge mutation
  const grantBadgeMutation = useMutation({
    mutationFn: async (badgeData: typeof badgeForm) => {
      const response = await fetch('/api/rbac/badges/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: Number(badgeData.userId),
          badgeType: badgeData.badgeType,
          expiresAt: badgeData.expiresAt || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to grant badge');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Badge Granted",
        description: "Badge granted successfully",
      });
      setShowGrantBadgeDialog(false);
      setBadgeForm({
        userId: "",
        badgeType: "",
        expiresAt: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to grant badge",
        variant: "destructive",
      });
    },
  });

  const roleLabels = {
    admin: "Administrator",
    agency_basic: "Agency Basic",
    agency_premium: "Agency Premium", 
    agent: "Agent",
    agent_premium: "Agent Premium",
    user: "User",
    user_seller: "User Seller",
    approved_user: "Approved User",
    agent_superuser: "Agent Superuser",
  };

  const tierLabels = {
    free: "Free",
    basic: "Basic",
    premium: "Premium",
    silver: "Silver",
    gold: "Gold",
    enterprise: "Enterprise",
  };

  const addonTypeLabels = {
    verified_badge: t('addons.verifiedBadge'),
    recommended_badge: t('addons.recommendedBadge'),
    featured_listing: t('addons.featuredListing'),
    boosted_ads: t('addons.boostedAds'),
    appointment_scheduler: t('addons.appointmentScheduler'),
    advanced_analytics: t('addons.advancedAnalytics'),
    premium_support: t('addons.premiumSupport'),
    extra_listings: t('addons.extraListings'),
    custom_branding: t('addons.customBranding'),
  };

  if (user?.role !== 'admin') {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-700">
            Only administrators can access the RBAC management dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">RBAC Administration</h2>
          <p className="text-muted-foreground">
            Manage roles, permissions, subscriptions, and add-ons
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionAnalytics?.totalSubscriptions || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionPlans.filter((p: SubscriptionPlan) => p.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Add-ons</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {addons.filter((a: Addon) => a.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Types</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks for RBAC management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowCreatePlanDialog(true)}
                  className="justify-start"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Subscription Plan
                </Button>
                <Button 
                  onClick={() => setShowCreateAddonDialog(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Add-on
                </Button>
                <Button 
                  onClick={() => setShowGrantBadgeDialog(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Grant Badge
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Subscription Plans</h3>
              <p className="text-sm text-muted-foreground">
                Manage subscription tiers and pricing
              </p>
            </div>
            <Button onClick={() => setShowCreatePlanDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan: SubscriptionPlan) => (
              <Card key={plan.id} className={plan.isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>
                        {tierLabels[plan.tier as keyof typeof tierLabels]} • {roleLabels[plan.role as keyof typeof roleLabels]}
                      </CardDescription>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Price:</span>
                      <span className="font-medium">
                        {plan.currency} {plan.price}/{plan.billingPeriod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Listings:</span>
                      <span className="font-medium">
                        {plan.listingsLimit === 0 ? "Unlimited" : plan.listingsLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Features:</span>
                      <span className="font-medium">{plan.features.length}</span>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Add-ons</h3>
              <p className="text-sm text-muted-foreground">
                Manage marketplace add-ons and features
              </p>
            </div>
            <Button onClick={() => setShowCreateAddonDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Add-on
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon: Addon) => (
              <Card key={addon.id} className={addon.isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{addon.name}</CardTitle>
                      <CardDescription>
                        {addonTypeLabels[addon.type as keyof typeof addonTypeLabels]}
                      </CardDescription>
                    </div>
                    <Badge variant={addon.isActive ? "default" : "secondary"}>
                      {addon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Price:</span>
                      <span className="font-medium">
                        {addon.currency} {addon.price}
                        {addon.billingType === 'monthly' && '/month'}
                        {addon.billingType === 'per_listing' && '/listing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available for:</span>
                      <span className="font-medium">
                        {addon.availableForRoles.length === 0 ? "All roles" : `${addon.availableForRoles.length} roles`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Features:</span>
                      <span className="font-medium">{addon.features.length}</span>
                    </div>
                    {addon.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {addon.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Badge Management</h3>
              <p className="text-sm text-muted-foreground">
                Grant and manage user badges and achievements
              </p>
            </div>
            <Button onClick={() => setShowGrantBadgeDialog(true)}>
              <Award className="mr-2 h-4 w-4" />
              Grant Badge
            </Button>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Badge Management</h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Badge management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Analytics & Reporting</h3>
            <p className="text-sm text-muted-foreground">
              View subscription and usage analytics
            </p>
          </div>

          {subscriptionAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subscriptionAnalytics.subscriptionsByTier?.map((item: any) => (
                      <div key={item.tier} className="flex justify-between">
                        <span className="capitalize">{item.tier}:</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add-on Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subscriptionAnalytics.addonPurchases?.map((item: any) => (
                      <div key={item.addonType} className="flex justify-between">
                        <span className="capitalize">{item.addonType.replace('_', ' ')}:</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">RBAC Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure system-wide RBAC settings and permissions
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Settings Panel</h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                RBAC configuration settings will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={showCreatePlanDialog} onOpenChange={setShowCreatePlanDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan with pricing and features
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                placeholder="Enter plan name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-tier">Tier</Label>
              <Select value={newPlan.tier} onValueChange={(value) => setNewPlan({...newPlan, tier: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-role">Target Role</Label>
              <Select value={newPlan.role} onValueChange={(value) => setNewPlan({...newPlan, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-price">Price</Label>
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-billing">Billing Period</Label>
              <Select value={newPlan.billingPeriod} onValueChange={(value) => setNewPlan({...newPlan, billingPeriod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-listings">Listings Limit</Label>
              <Input
                id="plan-listings"
                type="number"
                value={newPlan.listingsLimit}
                onChange={(e) => setNewPlan({...newPlan, listingsLimit: Number(e.target.value)})}
                placeholder="0 for unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (comma-separated)</Label>
            <Textarea
              id="plan-features"
              value={newPlan.features}
              onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-description">Description</Label>
            <Textarea
              id="plan-description"
              value={newPlan.description}
              onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
              placeholder="Plan description"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlanDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createPlanMutation.mutate(newPlan)}
              disabled={createPlanMutation.isPending}
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Add-on Dialog */}
      <Dialog open={showCreateAddonDialog} onOpenChange={setShowCreateAddonDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Add-on</DialogTitle>
            <DialogDescription>
              Create a new marketplace add-on
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addon-name">Add-on Name</Label>
              <Input
                id="addon-name"
                value={newAddon.name}
                onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                placeholder="Enter add-on name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addon-type">Type</Label>
              <Select value={newAddon.type} onValueChange={(value) => setNewAddon({...newAddon, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(addonTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addon-price">Price</Label>
              <Input
                id="addon-price"
                type="number"
                step="0.01"
                value={newAddon.price}
                onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addon-billing">Billing Type</Label>
              <Select value={newAddon.billingType} onValueChange={(value) => setNewAddon({...newAddon, billingType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="per_listing">Per Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addon-roles">Available for Roles (comma-separated)</Label>
            <Input
              id="addon-roles"
              value={newAddon.availableForRoles}
              onChange={(e) => setNewAddon({...newAddon, availableForRoles: e.target.value})}
              placeholder="agent, agent_premium (leave empty for all roles)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addon-features">Features (comma-separated)</Label>
            <Textarea
              id="addon-features"
              value={newAddon.features}
              onChange={(e) => setNewAddon({...newAddon, features: e.target.value})}
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addon-description">Description</Label>
            <Textarea
              id="addon-description"
              value={newAddon.description}
              onChange={(e) => setNewAddon({...newAddon, description: e.target.value})}
              placeholder="Add-on description"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAddonDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createAddonMutation.mutate(newAddon)}
              disabled={createAddonMutation.isPending}
            >
              Create Add-on
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Badge Dialog */}
      <Dialog open={showGrantBadgeDialog} onOpenChange={setShowGrantBadgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Badge</DialogTitle>
            <DialogDescription>
              Grant a badge to a user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="badge-user-id">User ID</Label>
              <Input
                id="badge-user-id"
                type="number"
                value={badgeForm.userId}
                onChange={(e) => setBadgeForm({...badgeForm, userId: e.target.value})}
                placeholder="Enter user ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-type">Badge Type</Label>
              <Select value={badgeForm.badgeType} onValueChange={(value) => setBadgeForm({...badgeForm, badgeType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select badge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="top_agent">Top Agent</SelectItem>
                  <SelectItem value="premium_member">Premium Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-expires">Expires At (optional)</Label>
              <Input
                id="badge-expires"
                type="datetime-local"
                value={badgeForm.expiresAt}
                onChange={(e) => setBadgeForm({...badgeForm, expiresAt: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantBadgeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => grantBadgeMutation.mutate(badgeForm)}
              disabled={grantBadgeMutation.isPending}
            >
              Grant Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}