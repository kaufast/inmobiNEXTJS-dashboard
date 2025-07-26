/**
 * Lazy Loading Routes with Code Splitting
 * Implements dynamic imports for optimal bundle splitting
 */

import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'wouter';

// Loading component for suspense fallback
const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-neutral-600 text-lg">Loading...</p>
    </div>
  </div>
);

// Lazy loaded components with proper chunk names
const HomePage = lazy(() => 
  import('../pages/home-page').then(module => ({ default: module.default }))
);

const SearchResultsPage = lazy(() => 
  import('../pages/search-results-page').then(module => ({ default: module.default }))
);

const PropertyDetailsPage = lazy(() => 
  import('../pages/property-details-page').then(module => ({ default: module.default }))
);

const DashboardPage = lazy(() => 
  import('../pages/dashboard/dashboard-page').then(module => ({ default: module.default }))
);

const AgentAnalyticsPage = lazy(() => 
  import('../pages/agent-analytics-page').then(module => ({ default: module.default }))
);

const SettingsPage = lazy(() => 
  import('../pages/dashboard/settings-page').then(module => ({ default: module.default }))
);

const ToursPage = lazy(() => 
  import('../pages/dashboard/tours-page').then(module => ({ default: module.default }))
);

const UsersPage = lazy(() => 
  import('../pages/dashboard/users-page').then(module => ({ default: module.default }))
);

const DocumentsPage = lazy(() => 
  import('../pages/documents-page').then(module => ({ default: module.default }))
);

const DebugPage = lazy(() => 
  import('../pages/debug-page').then(module => ({ default: module.default }))
);

// Route configuration with prefetch options
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  prefetch?: boolean;
  preload?: boolean;
  chunkName?: string;
}

const routeConfigs: RouteConfig[] = [
  { path: '/', component: HomePage, prefetch: true, preload: true, chunkName: 'home' },
  { path: '/search', component: SearchResultsPage, prefetch: true, chunkName: 'search' },
  { path: '/property/:id', component: PropertyDetailsPage, prefetch: true, chunkName: 'property' },
  { path: '/dashboard', component: DashboardPage, prefetch: false, chunkName: 'dashboard' },
  { path: '/analytics', component: AgentAnalyticsPage, prefetch: false, chunkName: 'analytics' },
  { path: '/settings', component: SettingsPage, prefetch: false, chunkName: 'settings' },
  { path: '/tours', component: ToursPage, prefetch: false, chunkName: 'tours' },
  { path: '/users', component: UsersPage, prefetch: false, chunkName: 'users' },
  { path: '/documents', component: DocumentsPage, prefetch: false, chunkName: 'documents' },
  { path: '/debug', component: DebugPage, prefetch: false, chunkName: 'debug' }
];

// Route prefetching utility
export function prefetchRoute(routePath: string): Promise<any> {
  const route = routeConfigs.find(r => r.path === routePath);
  if (!route) return Promise.resolve();

  // Trigger dynamic import to prefetch the chunk
  switch (route.chunkName) {
    case 'home':
      return import('../pages/home-page');
    case 'search':
      return import('../pages/search-results-page');
    case 'property':
      return import('../pages/property-details-page');
    case 'dashboard':
      return import('../pages/dashboard/dashboard-page');
    case 'analytics':
      return import('../pages/agent-analytics-page');
    case 'settings':
      return import('../pages/dashboard/settings-page');
    case 'tours':
      return import('../pages/dashboard/tours-page');
    case 'users':
      return import('../pages/dashboard/users-page');
    case 'documents':
      return import('../pages/documents-page');
    case 'debug':
      return import('../pages/debug-page');
    default:
      return Promise.resolve();
  }
}

// Preload routes on hover/focus
export function useRoutePrefetch() {
  const prefetchOnHover = (routePath: string) => {
    return {
      onMouseEnter: () => prefetchRoute(routePath),
      onFocus: () => prefetchRoute(routePath)
    };
  };

  const prefetchOnVisible = (routePath: string) => {
    return {
      onMouseEnter: () => {
        // Use requestIdleCallback for better performance
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => prefetchRoute(routePath));
        } else {
          setTimeout(() => prefetchRoute(routePath), 100);
        }
      }
    };
  };

  return { prefetchOnHover, prefetchOnVisible };
}

// Error boundary for route loading errors
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-neutral-600 mb-4">There was an error loading this page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main lazy routes component
export function LazyRoutes() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteLoadingSpinner />}>
        <Switch>
          {routeConfigs.map(({ path, component: Component }) => (
            <Route key={path} path={path} component={Component} />
          ))}
        </Switch>
      </Suspense>
    </RouteErrorBoundary>
  );
}

// Advanced code splitting with component-level splitting
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback ? <fallback /> : <RouteLoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    // This would integrate with webpack-bundle-analyzer
    console.log('Bundle analysis available in development mode');
  }
}

// Progressive enhancement for route loading
export function useProgressiveRouteLoading() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadRoute = async (routePath: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await prefetchRoute(routePath);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  return { isLoading, error, loadRoute };
}

export default LazyRoutes;