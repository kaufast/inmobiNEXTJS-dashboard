import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Users, Shield, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionRestrictions {
  userId: number;
  role: string;
  agencyId?: number;
  isInAgency: boolean;
  isAgent: boolean;
  canChooseSubscription: boolean;
  canManageOthers: boolean;
  rules: Array<{
    rule: string;
    description: string;
    active: boolean;
  }>;
}

interface SubscriptionRestrictionNoticeProps {
  onContactAdmin?: () => void;
  showFullDetails?: boolean;
}

export function SubscriptionRestrictionNotice({ 
  onContactAdmin, 
  showFullDetails = false 
}: SubscriptionRestrictionNoticeProps) {
  const { user } = useAuth();

  // Fetch subscription restrictions
  const { data: restrictions, isLoading } = useQuery<SubscriptionRestrictions>({
    queryKey: ['subscription-restrictions', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/rbac/subscription-restrictions', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch restrictions');
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading || !restrictions) {
    return null;
  }

  // If user can choose subscription, don't show restriction notice
  if (restrictions.canChooseSubscription && !showFullDetails) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      agency_basic: "Agency Basic",
      agency_premium: "Agency Premium",
      agent: "Agent",
      agent_premium: "Premium Agent",
      agent_superuser: "Agent Superuser",
      user: "User",
      user_seller: "User Seller",
      approved_user: "Approved User",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      agency_basic: "bg-blue-100 text-blue-800",
      agency_premium: "bg-purple-100 text-purple-800",
      agent: "bg-green-100 text-green-800",
      agent_premium: "bg-emerald-100 text-emerald-800",
      agent_superuser: "bg-indigo-100 text-indigo-800",
      user: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (!restrictions.canChooseSubscription) {
    return (
      <Alert className="border-yellow-300 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-yellow-800">Subscription Management Restricted</AlertTitle>
        <AlertDescription className="text-yellow-700 mt-2">
          <div className="space-y-2">
            <p>
              As an agent in an agency, your subscription is managed by your agency administrator.
            </p>
            <div className="flex items-center space-x-2">
              <Badge className={getRoleColor(restrictions.role)}>
                {getRoleLabel(restrictions.role)}
              </Badge>
              {restrictions.isInAgency && (
                <Badge variant="outline" className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Agency Member
                </Badge>
              )}
            </div>
            {onContactAdmin && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onContactAdmin}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Contact Agency Administrator
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (showFullDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Subscription Access Control</span>
          </CardTitle>
          <CardDescription>
            Your current role and permissions for subscription management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Role Information */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Role:</span>
              <Badge className={getRoleColor(restrictions.role)}>
                {getRoleLabel(restrictions.role)}
              </Badge>
            </div>

            {/* Agency Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agency Status:</span>
              <div className="flex items-center space-x-2">
                {restrictions.isInAgency ? (
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Agency Member
                  </Badge>
                ) : (
                  <Badge variant="outline">Independent</Badge>
                )}
              </div>
            </div>

            {/* Subscription Permissions */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Can Manage Own Subscription:</span>
              <Badge 
                className={restrictions.canChooseSubscription 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
                }
              >
                {restrictions.canChooseSubscription ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Can Manage Others' Subscriptions:</span>
              <Badge 
                className={restrictions.canManageOthers 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
                }
              >
                {restrictions.canManageOthers ? "Yes" : "No"}
              </Badge>
            </div>

            {/* Active Rules */}
            {restrictions.rules.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Active Rules:</span>
                <div className="space-y-2">
                  {restrictions.rules.map((rule, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium">{rule.rule.replace(/_/g, ' ')}</div>
                      <div className="text-gray-600">{rule.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div className="flex items-center space-x-1">
                <CreditCard className="h-3 w-3" />
                <span>
                  {restrictions.canChooseSubscription 
                    ? "You can view and modify your subscription plan."
                    : "Contact your agency administrator to modify your subscription."
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default SubscriptionRestrictionNotice;