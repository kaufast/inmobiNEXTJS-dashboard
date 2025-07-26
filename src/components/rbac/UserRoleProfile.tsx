import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  User, Shield, Crown, Star, CreditCard, Package, 
  Upgrade, CheckCircle, Calendar, Zap, Award
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";

interface UserRole {
  id: number;
  userId: number;
  role: string;
  agencyId?: number;
  isAgencySuperuser: boolean;
  permissions: string[];
  assignedAt: string;
  isActive: boolean;
}

interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan?: {
    name: string;
    tier: string;
    price: string;
    currency: string;
    billingPeriod: string;
    listingsLimit: number;
    features: string[];
  };
}

interface UserAddon {
  id: number;
  userId: number;
  addonId: number;
  status: string;
  purchasedAt: string;
  expiresAt?: string;
  addon?: {
    name: string;
    type: string;
    description: string;
    price: string;
    currency: string;
    billingType: string;
  };
}

interface UserBadge {
  id: number;
  userId: number;
  badgeType: string;
  isActive: boolean;
  grantedAt: string;
  expiresAt?: string;
}

interface ListingUsage {
  id: number;
  userId: number;
  totalLimit: number;
  currentUsage: number;
  extraListingsPurchased: number;
}

interface AvailableAddon {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: string;
  currency: string;
  billingType: string;
  features: string[];
}

export function UserRoleProfile({ userId }: { userId?: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common']);
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAddonsDialog, setShowAddonsDialog] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AvailableAddon | null>(null);

  // Fetch user role
  const { data: userRole } = useQuery({
    queryKey: ['user-role', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/roles/${targetUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch role');
      return response.json();
    },
    enabled: !!targetUserId,
  });

  // Fetch user subscription
  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/subscriptions/${targetUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!targetUserId,
  });

  // Fetch user add-ons
  const { data: userAddons = [] } = useQuery({
    queryKey: ['user-addons', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/addons/user/${targetUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch addons');
      return response.json();
    },
    enabled: !!targetUserId,
  });

  // Fetch user badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/badges/${targetUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json();
    },
    enabled: !!targetUserId,
  });

  // Fetch listing usage
  const { data: listingUsage } = useQuery({
    queryKey: ['listing-usage', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/listing-usage/${targetUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!targetUserId,
  });

  // Fetch available add-ons
  const { data: availableAddons = [] } = useQuery({
    queryKey: ['available-addons'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/addons/available', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch available addons');
      return response.json();
    },
  });

  // Purchase addon mutation
  const purchaseAddonMutation = useMutation({
    mutationFn: async (addonId: number) => {
      const response = await fetch(`/api/rbac/addons/${addonId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to purchase addon');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addons'] });
      toast({
        title: "Add-on Purchased",
        description: "Your add-on has been successfully activated",
      });
      setShowAddonsDialog(false);
      setSelectedAddon(null);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase add-on",
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

  const badgeIcons = {
    verified: <CheckCircle className="h-4 w-4 text-green-600" />,
    recommended: <Star className="h-4 w-4 text-yellow-600" />,
    top_agent: <Crown className="h-4 w-4 text-purple-600" />,
    premium_member: <Zap className="h-4 w-4 text-blue-600" />,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-300';
      case 'agency_premium': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'agency_basic': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'agent_premium': return 'bg-green-100 text-green-800 border-green-300';
      case 'agent': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'agent_superuser': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'approved_user': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'user_seller': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!targetUserId) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Role and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role & Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRole ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getRoleBadgeColor(userRole.role)}>
                    {roleLabels[userRole.role as keyof typeof roleLabels] || userRole.role}
                  </Badge>
                  {userRole.isAgencySuperuser && (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Superuser
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Since {format(new Date(userRole.assignedAt), 'MMM yyyy')}
                </div>
              </div>

              {userRole.permissions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Custom Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {userRole.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">No role assigned</div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Subscription</span>
            </div>
            {!userSubscription && (
              <Button size="sm" onClick={() => setShowUpgradeDialog(true)}>
                <Upgrade className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{userSubscription.plan?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {userSubscription.plan?.currency} {userSubscription.plan?.price}/
                    {userSubscription.plan?.billingPeriod}
                  </p>
                </div>
                <Badge className={getSubscriptionStatusColor(userSubscription.status)}>
                  {userSubscription.status}
                </Badge>
              </div>

              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Current Period:</span>
                  <span>
                    {format(new Date(userSubscription.currentPeriodStart), 'MMM d')} - 
                    {format(new Date(userSubscription.currentPeriodEnd), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Renews:</span>
                  <span>
                    {userSubscription.cancelAtPeriodEnd 
                      ? "Cancelled at period end" 
                      : formatDistanceToNow(new Date(userSubscription.currentPeriodEnd), { addSuffix: true })
                    }
                  </span>
                </div>
              </div>

              {userSubscription.plan?.features.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Plan Features</h5>
                  <div className="space-y-1">
                    {userSubscription.plan.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No active subscription</p>
              <Button onClick={() => setShowUpgradeDialog(true)}>
                <Upgrade className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listing Usage */}
      {listingUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Listing Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Usage</span>
                <span className="font-medium">
                  {listingUsage.currentUsage} / {listingUsage.totalLimit + listingUsage.extraListingsPurchased}
                </span>
              </div>
              
              <Progress 
                value={(listingUsage.currentUsage / (listingUsage.totalLimit + listingUsage.extraListingsPurchased)) * 100} 
                className="w-full" 
              />

              {listingUsage.extraListingsPurchased > 0 && (
                <div className="text-sm text-muted-foreground">
                  Includes {listingUsage.extraListingsPurchased} extra listings purchased
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Active Add-ons</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddonsDialog(true)}>
              <Package className="h-4 w-4 mr-2" />
              Browse Add-ons
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userAddons.length > 0 ? (
            <div className="space-y-3">
              {userAddons.map((userAddon: UserAddon) => (
                <div key={userAddon.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{userAddon.addon?.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {userAddon.addon?.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getSubscriptionStatusColor(userAddon.status)}>
                      {userAddon.status}
                    </Badge>
                    {userAddon.expiresAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires {formatDistanceToNow(new Date(userAddon.expiresAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No active add-ons</p>
              <Button variant="outline" onClick={() => setShowAddonsDialog(true)}>
                <Package className="h-4 w-4 mr-2" />
                Browse Add-ons
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Badges */}
      {userBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Badges & Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userBadges.map((badge: UserBadge) => (
                <div key={badge.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  {badgeIcons[badge.badgeType as keyof typeof badgeIcons] || <Award className="h-4 w-4" />}
                  <span className="text-sm font-medium capitalize">
                    {badge.badgeType.replace('_', ' ')}
                  </span>
                  {badge.expiresAt && (
                    <span className="text-xs text-muted-foreground">
                      (Expires {formatDistanceToNow(new Date(badge.expiresAt), { addSuffix: true })})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Add-ons Dialog */}
      <Dialog open={showAddonsDialog} onOpenChange={setShowAddonsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Available Add-ons</DialogTitle>
            <DialogDescription>
              Enhance your account with premium features and capabilities
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableAddons.map((addon: AvailableAddon) => {
              const isOwned = userAddons.some((ua: UserAddon) => ua.addonId === addon.id && ua.status === 'active');
              
              return (
                <div key={addon.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{addon.name}</h4>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {addon.currency} {addon.price}
                        {addon.billingType === 'monthly' && '/month'}
                        {addon.billingType === 'per_listing' && '/listing'}
                      </div>
                      {isOwned ? (
                        <Badge className="mt-1">Owned</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="mt-1"
                          onClick={() => setSelectedAddon(addon)}
                        >
                          Purchase
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {addon.features.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {addon.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {addon.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{addon.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddonsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedAddon} onOpenChange={(open) => !open && setSelectedAddon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Add-on</DialogTitle>
            <DialogDescription>
              Confirm your purchase of {selectedAddon?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAddon && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">{selectedAddon.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedAddon.description}</p>
                <div className="font-medium">
                  {selectedAddon.currency} {selectedAddon.price}
                  {selectedAddon.billingType === 'monthly' && '/month'}
                  {selectedAddon.billingType === 'per_listing' && '/listing'}
                </div>
              </div>
              
              {selectedAddon.features.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Features Included:</h5>
                  <ul className="text-sm space-y-1">
                    {selectedAddon.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAddon(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAddon && purchaseAddonMutation.mutate(selectedAddon.id)}
              disabled={purchaseAddonMutation.isPending}
            >
              {purchaseAddonMutation.isPending ? "Processing..." : "Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}