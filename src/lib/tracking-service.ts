/**
 * Comprehensive Real Estate Tracking Service
 * Integrates GA4, GTM, and custom analytics for property platform
 */

import { analyticsConfig, trackingEvents, trackEvent, setUserProperties, ecommerceConfig } from './analytics-config';

export class RealEstateTrackingService {
  private static instance: RealEstateTrackingService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): RealEstateTrackingService {
    if (!RealEstateTrackingService.instance) {
      RealEstateTrackingService.instance = new RealEstateTrackingService();
    }
    return RealEstateTrackingService.instance;
  }

  // Initialize tracking (called once in App)
  public initialize() {
    if (this.isInitialized || !analyticsConfig.ga4.enabled) return;
    
    // Set up global error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.error, 'global_error');
    });

    // Set up unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'unhandled_promise');
    });

    this.isInitialized = true;
    console.log('Real Estate Tracking Service initialized');
  }

  // Property Tracking Methods
  public trackPropertyView(property: any, additionalData: any = {}) {
    const item = ecommerceConfig.items.property(property);
    
    trackEvent(trackingEvents.property.view, {
      ...item,
      content_type: 'property',
      content_id: property.id.toString(),
      value: property.price || 0,
      currency: property.currency || ecommerceConfig.currency,
      property_location: `${property.city}, ${property.country}`,
      property_bedrooms: property.bedrooms,
      property_bathrooms: property.bathrooms,
      property_square_feet: property.squareFeet,
      property_type: property.propertyType,
      listing_type: property.listingType,
      is_featured: property.isFeatured || false,
      is_verified: property.isVerified || false,
      ...additionalData
    });

    // Enhanced e-commerce tracking
    if (analyticsConfig.ga4.enhancedEcommerce) {
      window.gtag?.('event', 'view_item', {
        currency: item.currency,
        value: item.price,
        items: [item]
      });
    }
  }

  public trackPropertyContact(propertyId: string, contactMethod: 'email' | 'phone' | 'message', agentId?: string) {
    trackEvent(trackingEvents.agent.contact, {
      content_type: 'property',
      content_id: propertyId,
      contact_method: contactMethod,
      agent_id: agentId,
      method: contactMethod
    });
  }

  public trackPropertyFavorite(property: any, action: 'add' | 'remove') {
    const eventName = action === 'add' ? trackingEvents.property.favorite : trackingEvents.property.unfavorite;
    const item = ecommerceConfig.items.property(property);
    
    trackEvent(eventName, {
      content_type: 'property',
      content_id: property.id.toString(),
      value: property.price || 0,
      currency: property.currency || ecommerceConfig.currency,
      items: [item]
    });
  }

  public trackPropertyShare(property: any, platform: string = 'unknown') {
    trackEvent(trackingEvents.property.share, {
      content_type: 'property',
      content_id: property.id.toString(),
      method: platform,
      property_title: property.title,
      property_price: property.price
    });
  }

  public trackVirtualTour(property: any, tourType: '360' | 'video' | 'gallery' = 'gallery') {
    trackEvent(trackingEvents.property.virtual_tour, {
      content_type: 'virtual_tour',
      content_id: property.id.toString(),
      tour_type: tourType,
      property_type: property.propertyType,
      property_location: `${property.city}, ${property.country}`
    });
  }

  public trackTourRequest(property: any, tourType: 'physical' | 'virtual' = 'physical', requestedDate?: string) {
    trackEvent(trackingEvents.property.tour_request, {
      content_type: 'tour_request',
      content_id: property.id.toString(),
      tour_type: tourType,
      requested_date: requestedDate,
      property_price: property.price,
      property_location: `${property.city}, ${property.country}`
    });
  }

  // Search Tracking Methods
  public trackSearch(query: string, filters: any = {}, resultCount: number = 0) {
    trackEvent(trackingEvents.search.perform, {
      search_term: query,
      search_results_count: resultCount,
      filters_applied: Object.keys(filters).length,
      filter_location: filters.location,
      filter_property_type: filters.propertyType,
      filter_price_min: filters.priceMin,
      filter_price_max: filters.priceMax,
      filter_bedrooms: filters.bedrooms,
      filter_bathrooms: filters.bathrooms
    });
  }

  public trackSearchResultClick(property: any, position: number, query?: string) {
    trackEvent('select_content', {
      content_type: 'property',
      content_id: property.id.toString(),
      search_term: query,
      position: position,
      property_type: property.propertyType,
      property_price: property.price
    });
  }

  // User Journey Tracking
  public trackUserRegistration(method: 'email' | 'google' | 'facebook' | 'apple' = 'email', userType: 'buyer' | 'seller' | 'agent' = 'buyer') {
    trackEvent(trackingEvents.user.register, {
      method,
      user_type: userType
    });
  }

  public trackUserLogin(method: 'email' | 'google' | 'facebook' | 'apple' = 'email') {
    trackEvent(trackingEvents.user.login, {
      method
    });
  }

  public trackLeadGeneration(source: string, propertyId?: string, value: number = 0) {
    trackEvent(trackingEvents.business.lead, {
      lead_source: source,
      content_id: propertyId,
      value,
      currency: ecommerceConfig.currency
    });
  }

  // Performance Tracking
  public trackPageLoad(page: string, loadTime: number) {
    trackEvent('page_performance', {
      page_name: page,
      load_time: loadTime,
      performance_category: loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'moderate' : 'slow'
    });
  }

  public trackCoreWebVital(metric: 'LCP' | 'FID' | 'CLS', value: number) {
    trackEvent('web_vital', {
      metric_name: metric,
      metric_value: value,
      performance_threshold: this.getPerformanceThreshold(metric, value)
    });
  }

  private getPerformanceThreshold(metric: string, value: number): 'good' | 'needs_improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs_improvement';
    return 'poor';
  }

  // Error Tracking
  public trackError(error: Error, context: string = 'unknown', severity: 'low' | 'medium' | 'high' = 'medium') {
    trackEvent('exception', {
      description: error.message,
      fatal: severity === 'high',
      error_context: context,
      error_severity: severity,
      error_stack: error.stack?.substring(0, 500)
    });
  }

  // User Properties
  public setUserType(userType: 'buyer' | 'seller' | 'agent' | 'admin') {
    setUserProperties({
      user_type: userType
    });
  }

  public setUserLocation(city: string, country: string) {
    setUserProperties({
      user_city: city,
      user_country: country
    });
  }

  // GTM Data Layer Methods
  public pushToDataLayer(data: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push(data);
    }
  }

  public trackConversion(conversionType: string, value: number = 0, propertyId?: string) {
    trackEvent(trackingEvents.business.conversion, {
      conversion_type: conversionType,
      value,
      currency: ecommerceConfig.currency,
      content_id: propertyId
    });

    // Push to GTM Data Layer for additional tracking
    this.pushToDataLayer({
      event: 'conversion',
      conversion_type: conversionType,
      conversion_value: value,
      property_id: propertyId
    });
  }

  // Debug Methods
  public enableDebugMode() {
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('config', analyticsConfig.ga4.measurementId, {
        debug_mode: true
      });
      console.log('GA4 Debug Mode Enabled');
    }
  }

  public trackDebugEvent(eventName: string, data: any) {
    if (analyticsConfig.ga4.debugMode) {
      console.log('Debug Event:', eventName, data);
      trackEvent(`debug_${eventName}`, data);
    }
  }
}

// Create singleton instance
export const trackingService = RealEstateTrackingService.getInstance();

// Export convenience methods
export const {
  trackPropertyView,
  trackPropertyContact,
  trackPropertyFavorite,
  trackPropertyShare,
  trackVirtualTour,
  trackTourRequest,
  trackSearch,
  trackSearchResultClick,
  trackUserRegistration,
  trackUserLogin,
  trackLeadGeneration,
  trackPageLoad,
  trackCoreWebVital,
  trackError,
  setUserType,
  setUserLocation,
  pushToDataLayer,
  trackConversion,
  enableDebugMode,
  trackDebugEvent
} = trackingService;

export default trackingService;