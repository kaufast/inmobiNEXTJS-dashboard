import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Loader2 } from "lucide-react";
import React, { useEffect } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'wouter';

// Define the tiers your app uses
type SubscriptionTier = 'free' | 'premium' | 'business';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  allowedRoles: string[];
  // Add a new optional prop to require a certain subscription level
  requiredTier?: SubscriptionTier;
}

export function ProtectedRoute({
  component: Component,
  allowedRoles,
  requiredTier,
  ...rest
}: ProtectedRouteProps): React.ReactElement {
  const { user, isLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const [shouldRedirect, setShouldRedirect] = React.useState<string | null>(null);

  console.log('[ProtectedRoute] Rendering with state:', {
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
    userTier: user?.subscriptionTier,
    requiredTier,
    allowedRoles
  });

  // Use useEffect to handle navigation instead of calling navigate during render
  useEffect(() => {
    if (isLoading) {
      return; // Still loading, don't redirect
    }

    if (!user) {
      console.log('[ProtectedRoute] No user found, redirecting to /auth');
      setShouldRedirect(`/${currentLanguage}/auth`);
      return;
    }

    // Check for role authorization
    if (!allowedRoles.includes(user.role)) {
      console.log('[ProtectedRoute] User role not allowed:', {
        userRole: user.role,
        allowedRoles
      });
      setShouldRedirect(`/${currentLanguage}/premium-required`);
      return;
    }
    
    // If a specific subscription tier is required, check for it now
    if (requiredTier) {
      console.log('[ProtectedRoute] Checking subscription tier:', {
        requiredTier,
        userTier: user.subscriptionTier
      });

      const isPremiumOrBetter = user.subscriptionTier === 'premium' || user.subscriptionTier === 'business';
      
      if (requiredTier === 'premium' && !isPremiumOrBetter) {
        console.log('[ProtectedRoute] User lacks required subscription tier, redirecting to /premium-required');
        setShouldRedirect(`/${currentLanguage}/premium-required`);
        return;
      }
    }

    // All checks passed, clear any pending redirect
    setShouldRedirect(null);
  }, [user, isLoading, allowedRoles, requiredTier, currentLanguage]);

  // Handle redirect
  useEffect(() => {
    if (shouldRedirect) {
      navigate(shouldRedirect);
    }
  }, [shouldRedirect, navigate]);

  // 1. First, handle the loading state
  if (isLoading) {
    console.log('[ProtectedRoute] Still loading auth state, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 2. If we're redirecting, show loading
  if (shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 3. If all checks pass, render the component
  console.log('[ProtectedRoute] All checks passed, rendering component');
  return <Route {...rest} component={Component} />;
}

export function ProtectedRouteOld({
  path,
  component: Component,
  allowedRoles = ["user", "agent", "admin"],
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <Route path={path}>
      {(params) => {
        // Always render a component, never return null conditionally
        // This prevents the "rendered fewer hooks than expected" error
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
            </div>
          );
        }

        if (!user) {
          // If using redirect component, still render it (not just return it)
          return (
            <div>
              <Redirect to={`/${currentLanguage}/auth`} />
            </div>
          );
        }

        // Check if user has the required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 text-center mb-6">
                You don't have permission to access this page.
              </p>
              <Redirect to={`/${currentLanguage}/premium-required`} />
            </div>
          );
        }

        // User is authenticated and has permission
        return <Component {...params} />;
      }}
    </Route>
  );
}