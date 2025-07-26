/**
 * Property View Event Tracking System
 * Comprehensive tracking for property views, interactions, and user behavior
 */

import React, { useEffect, useRef, useState } from 'react';
import { Property } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useGA4Tracking } from './GoogleAnalytics4';
import { trackingService } from '@/lib/tracking-service';

interface PropertyViewEvent {
  propertyId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  viewDuration: number;
  scrollDepth: number;
  imageViews: number;
  contactClicks: number;
  favoriteClicks: number;
  shareClicks: number;
  tourRequests: number;
  source: string;
  medium: string;
  campaign?: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  language: string;
  country?: string;
  city?: string;
  ipAddress?: string;
  metadata?: {
    propertyType: string;
    listingType: string;
    price: number;
    location: string;
    agentId?: string;
    [key: string]: any;
  };
}

interface PropertyInteractionEvent {
  type: 'image_view' | 'contact_click' | 'favorite_click' | 'share_click' | 'tour_request' | 'scroll' | 'time_spent';
  propertyId: string;
  data?: any;
  timestamp: string;
}

interface PropertyViewTrackingProps {
  property: Property;
  children: React.ReactNode;
}

export function PropertyViewTracking({ property, children }: PropertyViewTrackingProps) {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { trackPropertyView } = useGA4Tracking();
  const [sessionId] = useState(() => generateSessionId());
  const [viewStartTime] = useState(() => Date.now());
  const [interactions, setInteractions] = useState<PropertyInteractionEvent[]>([]);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const viewTracked = useRef(false);
  const timeSpentInterval = useRef<NodeJS.Timeout>();

  // Track initial property view
  useEffect(() => {
    if (!viewTracked.current) {
      sendPropertyViewEvent();
      viewTracked.current = true;
    }

    // Track time spent on page
    timeSpentInterval.current = setInterval(trackTimeSpent, 10000); // Every 10 seconds

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentScrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      setScrollDepth(currentScrollDepth);
      if (currentScrollDepth > maxScrollDepth) {
        setMaxScrollDepth(currentScrollDepth);
        trackInteraction('scroll', { depth: currentScrollDepth });
      }
    };

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackPageExit();
      }
    };

    // Track page unload
    const handleBeforeUnload = () => {
      trackPageExit();
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timeSpentInterval.current) {
        clearInterval(timeSpentInterval.current);
      }
      trackPageExit();
    };
  }, [property.id]);

  const sendPropertyViewEvent = () => {
    const viewEvent: PropertyViewEvent = {
      propertyId: property.id.toString(),
      userId: user?.id,
      sessionId,
      timestamp: new Date().toISOString(),
      viewDuration: 0,
      scrollDepth: 0,
      imageViews: 0,
      contactClicks: 0,
      favoriteClicks: 0,
      shareClicks: 0,
      tourRequests: 0,
      source: getTrafficSource(),
      medium: getTrafficMedium(),
      campaign: getTrafficCampaign(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      deviceType: getDeviceType(),
      language: currentLanguage,
      metadata: {
        propertyType: property.propertyType,
        listingType: property.listingType,
        price: property.price || 0,
        location: `${property.city}, ${property.country}`,
        agentId: property.ownerId?.toString(),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet
      }
    };

    // Send to our analytics endpoint
    sendToAnalytics('property_view', viewEvent);

    // Send to GA4
    trackPropertyView(property, {
      session_id: sessionId,
      user_id: user?.id,
      traffic_source: viewEvent.source,
      traffic_medium: viewEvent.medium,
      device_type: viewEvent.deviceType
    });

    // Send to backend for storage
    storePropertyView(viewEvent);
  };

  const trackInteraction = (type: PropertyInteractionEvent['type'], data?: any) => {
    const interaction: PropertyInteractionEvent = {
      type,
      propertyId: property.id.toString(),
      data,
      timestamp: new Date().toISOString()
    };

    setInteractions(prev => [...prev, interaction]);
    sendToAnalytics('property_interaction', interaction);
  };

  const trackTimeSpent = () => {
    const timeSpent = Date.now() - viewStartTime;
    trackInteraction('time_spent', { duration: timeSpent });
  };

  const trackPageExit = () => {
    const exitEvent = {
      propertyId: property.id.toString(),
      userId: user?.id,
      sessionId,
      timestamp: new Date().toISOString(),
      viewDuration: Date.now() - viewStartTime,
      scrollDepth: maxScrollDepth,
      totalInteractions: interactions.length,
      interactions
    };

    sendToAnalytics('property_exit', exitEvent);
    
    // Send beacon to ensure data is sent even if page is closing
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/property-exit', JSON.stringify(exitEvent));
    }
  };

  const sendToAnalytics = (eventType: string, data: any) => {
    // Send to backend analytics
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        data,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to send analytics event:', error);
    });
  };

  const storePropertyView = (viewEvent: PropertyViewEvent) => {
    fetch('/api/analytics/property-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewEvent)
    }).catch(error => {
      console.error('Failed to store property view:', error);
    });
  };

  // Provide tracking functions to child components
  const trackingContext = {
    trackImageView: (imageIndex: number) => {
      trackInteraction('image_view', { imageIndex });
    },
    trackContactClick: (contactMethod: string) => {
      trackInteraction('contact_click', { method: contactMethod });
    },
    trackFavoriteClick: (action: 'add' | 'remove') => {
      trackInteraction('favorite_click', { action });
    },
    trackShareClick: (platform: string) => {
      trackInteraction('share_click', { platform });
    },
    trackTourRequest: (tourType: string) => {
      trackInteraction('tour_request', { type: tourType });
    }
  };

  return (
    <PropertyTrackingContext.Provider value={trackingContext}>
      {children}
    </PropertyTrackingContext.Provider>
  );
}

// Context for tracking functions
const PropertyTrackingContext = React.createContext<{
  trackImageView: (imageIndex: number) => void;
  trackContactClick: (contactMethod: string) => void;
  trackFavoriteClick: (action: 'add' | 'remove') => void;
  trackShareClick: (platform: string) => void;
  trackTourRequest: (tourType: string) => void;
} | null>(null);

// Hook to use property tracking
export function usePropertyTracking() {
  const context = React.useContext(PropertyTrackingContext);
  if (!context) {
    throw new Error('usePropertyTracking must be used within PropertyViewTracking');
  }
  return context;
}

// Enhanced tracking components for specific interactions
export function TrackableImage({ 
  src, 
  alt, 
  index, 
  className,
  ...props 
}: { 
  src: string; 
  alt: string; 
  index: number; 
  className?: string;
  [key: string]: any;
}) {
  const { trackImageView } = usePropertyTracking();
  
  const handleImageView = () => {
    trackImageView(index);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={handleImageView}
      onLoad={handleImageView}
      {...props}
    />
  );
}

export function TrackableContactButton({ 
  method, 
  children, 
  className,
  onClick,
  ...props 
}: { 
  method: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  const { trackContactClick } = usePropertyTracking();
  
  const handleClick = () => {
    trackContactClick(method);
    if (onClick) onClick();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TrackableFavoriteButton({ 
  action, 
  children, 
  className,
  onClick,
  ...props 
}: { 
  action: 'add' | 'remove'; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  const { trackFavoriteClick } = usePropertyTracking();
  
  const handleClick = () => {
    trackFavoriteClick(action);
    if (onClick) onClick();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TrackableShareButton({ 
  platform, 
  children, 
  className,
  onClick,
  ...props 
}: { 
  platform: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  const { trackShareClick } = usePropertyTracking();
  
  const handleClick = () => {
    trackShareClick(platform);
    if (onClick) onClick();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TrackableTourButton({ 
  tourType, 
  children, 
  className,
  onClick,
  ...props 
}: { 
  tourType: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  const { trackTourRequest } = usePropertyTracking();
  
  const handleClick = () => {
    trackTourRequest(tourType);
    if (onClick) onClick();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Utility functions
function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getTrafficSource(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  
  if (utmSource) return utmSource;
  if (document.referrer) {
    const referrerDomain = new URL(document.referrer).hostname;
    if (referrerDomain.includes('google')) return 'google';
    if (referrerDomain.includes('facebook')) return 'facebook';
    if (referrerDomain.includes('twitter')) return 'twitter';
    if (referrerDomain.includes('linkedin')) return 'linkedin';
    return referrerDomain;
  }
  return 'direct';
}

function getTrafficMedium(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const utmMedium = urlParams.get('utm_medium');
  
  if (utmMedium) return utmMedium;
  if (document.referrer) {
    const referrerDomain = new URL(document.referrer).hostname;
    if (referrerDomain.includes('google')) return 'organic';
    if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter') || referrerDomain.includes('linkedin')) return 'social';
    return 'referral';
  }
  return 'none';
}

function getTrafficCampaign(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('utm_campaign') || undefined;
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}

// Analytics aggregation hook
export function usePropertyAnalytics(propertyId: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/property/${propertyId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching property analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [propertyId]);

  return { analytics, loading };
}

// Real-time analytics hook
export function useRealTimeAnalytics(propertyId: string) {
  const [currentViewers, setCurrentViewers] = useState(0);
  const [recentViews, setRecentViews] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/analytics/property/${propertyId}/realtime`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentViewers(data.currentViewers);
      setRecentViews(data.recentViews);
    };

    return () => {
      eventSource.close();
    };
  }, [propertyId]);

  return { currentViewers, recentViews };
}

export default PropertyViewTracking;