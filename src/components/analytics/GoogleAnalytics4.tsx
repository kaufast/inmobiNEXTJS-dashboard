/**
 * Google Analytics 4 Integration
 * Enhanced GA4 setup with comprehensive real estate tracking using our centralized service
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { trackingService } from '@/lib/tracking-service';
import { analyticsConfig } from '@/lib/analytics-config';

// GA4 Context for tracking methods
interface GA4ContextType {
  trackPropertyView: (property: any, additionalData?: any) => void;
  trackPropertyContact: (propertyId: string, method: string, agentId?: string) => void;
  trackPropertyFavorite: (property: any, action?: 'add' | 'remove') => void;
  trackPropertyShare: (property: any, platform?: string) => void;
  trackVirtualTour: (property: any, tourType?: '360' | 'video' | 'gallery') => void;
  trackTourRequest: (property: any, tourType?: 'physical' | 'virtual', requestedDate?: string) => void;
  trackSearch: (query: string, filters?: any, resultCount?: number) => void;
  trackSearchResultClick: (property: any, position: number, query?: string) => void;
  trackUserRegistration: (method?: string, userType?: string) => void;
  trackUserLogin: (method?: string) => void;
  trackLeadGeneration: (source: string, propertyId?: string, value?: number) => void;
  trackConversion: (conversionType: string, value?: number, propertyId?: string) => void;
  trackUserAction: (action: string, data?: any) => void;
  setUserType: (userType: 'buyer' | 'seller' | 'agent' | 'admin') => void;
  setUserLocation: (city: string, country: string) => void;
  isInitialized: boolean;
}

const GA4Context = createContext<GA4ContextType | null>(null);

// GA4 Provider Component
interface GoogleAnalytics4Props {
  children?: React.ReactNode;
  enableDemoMode?: boolean;
}

export function GoogleAnalytics4({ children, enableDemoMode = false }: GoogleAnalytics4Props) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize GA4 and tracking service
  useEffect(() => {
    if (!analyticsConfig.ga4.enabled) {
      console.log('GA4 disabled - analytics will not be tracked');
      return;
    }

    // Initialize tracking service
    trackingService.initialize();
    
    // Initialize GA4 if not already done
    if (!window.gtag && analyticsConfig.ga4.measurementId) {
      // Create dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      // Set default timestamp
      gtag('js', new Date());
      
      // Configure GA4 with enhanced settings
      gtag('config', analyticsConfig.ga4.measurementId, {
        debug_mode: analyticsConfig.ga4.debugMode,
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: true,
        allow_google_signals: true,
        allow_ad_personalization_signals: false,
        cookie_flags: 'secure;samesite=lax',
        custom_map: {
          custom_parameter_1: 'property_type',
          custom_parameter_2: 'listing_type',
          custom_parameter_3: 'agent_id',
          custom_parameter_4: 'user_type',
          custom_parameter_5: 'price_range'
        }
      });

      // Set user properties if user is logged in
      if (user) {
        trackingService.setUserType(user.role as any);
        gtag('set', {
          user_id: user.id,
          user_properties: {
            user_type: user.role,
            language: currentLanguage,
            registration_date: user.createdAt,
            premium_user: user.tier === 'premium',
            verified_user: user.isVerified
          }
        });
      }

      setIsInitialized(true);
      console.log('GA4 initialized successfully');
    }
  }, [user, currentLanguage]);

  // Track page views on route change
  useEffect(() => {
    if (!isInitialized || !analyticsConfig.ga4.enabled) return;

    const pageTitle = document.title;
    const pagePath = location;
    const pageType = getPageType(pagePath);
    const pageCategory = getPageCategory(pagePath);
    
    // Enhanced page view tracking
    window.gtag?.('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
      language: currentLanguage,
      user_type: user?.role || 'anonymous',
      page_type: pageType,
      page_category: pageCategory,
      custom_parameter_1: pageType,
      custom_parameter_2: pageCategory,
      custom_parameter_4: user?.role || 'anonymous'
    });

    // Track page engagement time
    const startTime = Date.now();
    const handleUnload = () => {
      const engagementTime = Date.now() - startTime;
      if (engagementTime > 1000) { // Only track if user spent more than 1 second
        window.gtag?.('event', 'page_engagement', {
          page_path: pagePath,
          engagement_time_msec: engagementTime,
          page_type: pageType
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [location, currentLanguage, user, isInitialized]);

  // Context value with all tracking methods
  const contextValue: GA4ContextType = {
    trackPropertyView: trackingService.trackPropertyView.bind(trackingService),
    trackPropertyContact: trackingService.trackPropertyContact.bind(trackingService),
    trackPropertyFavorite: trackingService.trackPropertyFavorite.bind(trackingService),
    trackPropertyShare: trackingService.trackPropertyShare.bind(trackingService),
    trackVirtualTour: trackingService.trackVirtualTour.bind(trackingService),
    trackTourRequest: trackingService.trackTourRequest.bind(trackingService),
    trackSearch: trackingService.trackSearch.bind(trackingService),
    trackSearchResultClick: trackingService.trackSearchResultClick.bind(trackingService),
    trackUserRegistration: trackingService.trackUserRegistration.bind(trackingService),
    trackUserLogin: trackingService.trackUserLogin.bind(trackingService),
    trackLeadGeneration: trackingService.trackLeadGeneration.bind(trackingService),
    trackConversion: trackingService.trackConversion.bind(trackingService),
    trackUserAction: (action: string, data?: any) => {
      window.gtag?.('event', action, data);
    },
    setUserType: trackingService.setUserType.bind(trackingService),
    setUserLocation: trackingService.setUserLocation.bind(trackingService),
    isInitialized
  };

  return (
    <GA4Context.Provider value={contextValue}>
      {analyticsConfig.ga4.enabled && (
        <Helmet>
          <script 
            async 
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4.measurementId}`} 
          />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsConfig.ga4.measurementId}', {
                debug_mode: ${analyticsConfig.ga4.debugMode},
                send_page_view: false,
                anonymize_ip: true,
                allow_google_signals: true,
                allow_ad_personalization_signals: false,
                cookie_flags: 'secure;samesite=lax'
              });
            `}
          </script>
        </Helmet>
      )}
      {children}
    </GA4Context.Provider>
  );
}

// Hook to use GA4 tracking
export function useGA4Tracking() {
  const context = useContext(GA4Context);
  if (!context) {
    // Return mock functions if context is not available
    return {
      trackPropertyView: () => {},
      trackPropertyContact: () => {},
      trackPropertyFavorite: () => {},
      trackPropertyShare: () => {},
      trackVirtualTour: () => {},
      trackTourRequest: () => {},
      trackSearch: () => {},
      trackSearchResultClick: () => {},
      trackUserRegistration: () => {},
      trackUserLogin: () => {},
      trackLeadGeneration: () => {},
      trackConversion: () => {},
      trackUserAction: () => {},
      setUserType: () => {},
      setUserLocation: () => {},
      isInitialized: false
    };
  }
  return context;
}

// Helper functions
function getPageType(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/property/')) return 'property_detail';
  if (path.startsWith('/search')) return 'search_results';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/auth')) return 'auth';
  if (path.startsWith('/favorites')) return 'favorites';
  if (path.startsWith('/messages')) return 'messages';
  if (path.startsWith('/profile')) return 'profile';
  return 'other';
}

function getPageCategory(path: string): string {
  if (path.includes('/dashboard/')) return 'dashboard';
  if (path.includes('/property/')) return 'property';
  if (path.includes('/search')) return 'search';
  if (path.includes('/auth')) return 'authentication';
  if (path.includes('/favorites')) return 'user_content';
  if (path.includes('/messages')) return 'communication';
  return 'general';
}

// Enhanced E-commerce tracking utilities
export const ga4Utils = {
  // Track custom conversion events
  trackConversion: (conversionType: string, value?: number, currency?: string) => {
    if (analyticsConfig.ga4.enabled && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${analyticsConfig.ga4.measurementId}/${conversionType}`,
        value: value || 0,
        currency: currency || 'EUR'
      });
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (analyticsConfig.ga4.enabled && window.gtag) {
      window.gtag('set', {
        user_properties: properties
      });
    }
  },

  // Track custom events
  trackCustomEvent: (eventName: string, parameters: Record<string, any>) => {
    if (analyticsConfig.ga4.enabled && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: Date.now(),
        page_location: window.location.href
      });
    }
  },

  // Enable debug mode
  enableDebugMode: () => {
    if (analyticsConfig.ga4.enabled && window.gtag) {
      window.gtag('config', analyticsConfig.ga4.measurementId, {
        debug_mode: true
      });
      console.log('GA4 Debug Mode Enabled');
    }
  }
};

// Declare global gtag interface
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'get' | 'consent',
      targetId: string,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}

export default GoogleAnalytics4;