/**
 * Google Analytics 4 Configuration
 * Centralized GA4 and GTM configuration for real estate tracking
 */

// Analytics Configuration
export const analyticsConfig = {
  // Google Analytics 4
  ga4: {
    measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-4XKJX447CR',
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || import.meta.env.NODE_ENV === 'production',
    debugMode: import.meta.env.GA4_DEBUG_MODE === 'true',
    enhancedEcommerce: import.meta.env.GA4_ENHANCED_ECOMMERCE !== 'false',
  },
  
  // Google Tag Manager
  gtm: {
    containerId: import.meta.env.VITE_GTM_CONTAINER_ID || 'GT-KT45C6PG',
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || import.meta.env.NODE_ENV === 'production',
  },
  
  // Google Search Console
  searchConsole: {
    verificationTag: import.meta.env.VITE_GSC_VERIFICATION_TAG,
    propertyUrl: import.meta.env.VITE_GSC_PROPERTY_URL || 'https://inmobi.mobi',
    autoSubmit: import.meta.env.SEARCH_CONSOLE_AUTO_SUBMIT === 'true',
  },
  
  // Performance Monitoring
  performance: {
    coreWebVitals: import.meta.env.ENABLE_CORE_WEB_VITALS_MONITORING !== 'false',
    budgets: {
      lcp: parseInt(import.meta.env.PERFORMANCE_BUDGET_LCP || '2500'),
      fid: parseInt(import.meta.env.PERFORMANCE_BUDGET_FID || '100'),
      cls: parseFloat(import.meta.env.PERFORMANCE_BUDGET_CLS || '0.1'),
      fcp: parseInt(import.meta.env.PERFORMANCE_BUDGET_FCP || '1800'),
      ttfb: parseInt(import.meta.env.PERFORMANCE_BUDGET_TTFB || '600'),
    }
  }
};

// Real Estate Specific Event Tracking
export const trackingEvents = {
  // Property Events
  property: {
    view: 'view_item',
    favorite: 'add_to_wishlist',
    unfavorite: 'remove_from_wishlist',
    contact: 'contact_agent',
    share: 'share',
    gallery: 'view_item_gallery',
    tour_request: 'request_tour',
    virtual_tour: 'view_virtual_tour',
  },
  
  // Search Events
  search: {
    perform: 'search',
    filter: 'filter_properties',
    results: 'view_search_results',
    suggestion: 'select_suggestion',
  },
  
  // User Events
  user: {
    login: 'login',
    register: 'sign_up',
    profile_update: 'profile_update',
    verification: 'verify_identity',
  },
  
  // Agent Events
  agent: {
    contact: 'contact_agent',
    call: 'agent_phone_call',
    email: 'agent_email',
    message: 'agent_message',
    review: 'submit_review',
  },
  
  // Business Events
  business: {
    lead: 'generate_lead',
    conversion: 'conversion',
    subscription: 'purchase',
    premium_view: 'view_premium_content',
  }
};

// Custom Dimensions and Metrics
export const customDimensions = {
  user_type: 'custom_dimension_1',        // buyer, seller, agent, admin
  property_type: 'custom_dimension_2',    // apartment, house, villa, etc.
  price_range: 'custom_dimension_3',      // <100k, 100k-500k, 500k+, etc.
  location_tier: 'custom_dimension_4',    // city_center, suburb, rural
  listing_type: 'custom_dimension_5',     // sale, rent, vacation_rental
  user_journey: 'custom_dimension_6',     // new_visitor, returning, converting
  device_category: 'custom_dimension_7',  // mobile, tablet, desktop
  traffic_source: 'custom_dimension_8',   // organic, paid, social, direct
};

// Enhanced E-commerce Configuration
export const ecommerceConfig = {
  currency: 'EUR',
  items: {
    // Property item structure for GA4
    property: (property: any) => ({
      item_id: property.id.toString(),
      item_name: property.title,
      item_category: 'Real Estate',
      item_category2: property.propertyType,
      item_category3: property.listingType,
      item_variant: `${property.bedrooms}bed_${property.bathrooms}bath`,
      location_id: `${property.city}_${property.country}`,
      price: property.price || 0,
      currency: property.currency || 'EUR',
      quantity: 1,
    })
  }
};

// Helper Functions
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (analyticsConfig.ga4.enabled) {
    gtag('event', eventName, {
      ...parameters,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      page_location: window.location.href,
      page_title: document.title,
    });
    
    if (analyticsConfig.ga4.debugMode) {
      console.log('GA4 Event Tracked:', eventName, parameters);
    }
  }
};

export const setUserProperties = (properties: Record<string, any>) => {
  if (analyticsConfig.ga4.enabled) {
    gtag('config', analyticsConfig.ga4.measurementId, {
      user_properties: properties
    });
  }
};

export const trackPageView = (page_title: string, page_location: string) => {
  if (analyticsConfig.ga4.enabled) {
    gtag('config', analyticsConfig.ga4.measurementId, {
      page_title,
      page_location,
    });
  }
};

// Performance Tracking
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  if (analyticsConfig.performance.coreWebVitals) {
    gtag('event', 'performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      page_location: window.location.href,
    });
  }
};

// Error Tracking
export const trackError = (error: Error, context: string = 'unknown') => {
  gtag('event', 'exception', {
    description: error.message,
    fatal: false,
    error_context: context,
    error_stack: error.stack?.substring(0, 500), // Limit stack trace
  });
};

export default analyticsConfig;