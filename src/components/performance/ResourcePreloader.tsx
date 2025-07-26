/**
 * Critical Resource Preloader Component
 * Optimizes Core Web Vitals by preloading critical resources
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'fetch' | 'document';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
  integrity?: string;
  importance?: 'high' | 'low' | 'auto';
}

interface CriticalResourcePreloaderProps {
  resources: PreloadResource[];
  prefetchResources?: string[];
  dnsPrefetch?: string[];
  preconnect?: string[];
  enableResourceHints?: boolean;
}

export function CriticalResourcePreloader({
  resources,
  prefetchResources = [],
  dnsPrefetch = [],
  preconnect = [],
  enableResourceHints = true
}: CriticalResourcePreloaderProps) {
  useEffect(() => {
    // Preload critical resources programmatically for better control
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      if (resource.media) link.media = resource.media;
      if (resource.integrity) link.integrity = resource.integrity;
      
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      resources.forEach(resource => {
        const existingLink = document.querySelector(`link[href="${resource.href}"][rel="preload"]`);
        if (existingLink) {
          existingLink.remove();
        }
      });
    };
  }, [resources]);

  return (
    <Helmet>
      {/* Critical Resource Preloading */}
      {resources.map((resource, index) => (
        <link
          key={`preload-${index}`}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          crossOrigin={resource.crossOrigin}
          media={resource.media}
          integrity={resource.integrity}
        />
      ))}

      {/* Resource Prefetching */}
      {prefetchResources.map((href, index) => (
        <link
          key={`prefetch-${index}`}
          rel="prefetch"
          href={href}
        />
      ))}

      {/* DNS Prefetch */}
      {enableResourceHints && dnsPrefetch.map((domain, index) => (
        <link
          key={`dns-prefetch-${index}`}
          rel="dns-prefetch"
          href={domain}
        />
      ))}

      {/* Preconnect */}
      {enableResourceHints && preconnect.map((domain, index) => (
        <link
          key={`preconnect-${index}`}
          rel="preconnect"
          href={domain}
          crossOrigin="anonymous"
        />
      ))}
    </Helmet>
  );
}

// Predefined resource configurations for different page types
export const CRITICAL_RESOURCES = {
  // Home page critical resources
  homepage: [
    {
      href: '/fonts/inter-var.woff2',
      as: 'font' as const,
      type: 'font/woff2',
      crossOrigin: 'anonymous' as const,
      importance: 'high' as const
    },
    {
      href: '/css/critical.css',
      as: 'style' as const,
      importance: 'high' as const
    }
  ],
  
  // Property details page critical resources
  propertyDetails: [
    {
      href: '/fonts/inter-var.woff2',
      as: 'font' as const,
      type: 'font/woff2',
      crossOrigin: 'anonymous' as const,
      importance: 'high' as const
    },
    {
      href: '/css/critical.css',
      as: 'style' as const,
      importance: 'high' as const
    },
    {
      href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      as: 'style' as const,
      importance: 'high' as const
    }
  ],
  
  // Search results page critical resources
  searchResults: [
    {
      href: '/fonts/inter-var.woff2',
      as: 'font' as const,
      type: 'font/woff2',
      crossOrigin: 'anonymous' as const,
      importance: 'high' as const
    },
    {
      href: '/css/critical.css',
      as: 'style' as const,
      importance: 'high' as const
    }
  ]
};

// DNS prefetch domains
export const DNS_PREFETCH_DOMAINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://images.unsplash.com',
  'https://res.cloudinary.com',
  'https://unpkg.com',
  'https://cdn.jsdelivr.net'
];

// Preconnect domains
export const PRECONNECT_DOMAINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://res.cloudinary.com'
];

// Hook for managing critical resources
export function useCriticalResources(pageType: keyof typeof CRITICAL_RESOURCES) {
  const resources = CRITICAL_RESOURCES[pageType] || [];
  
  return {
    resources,
    prefetchResources: [],
    dnsPrefetch: DNS_PREFETCH_DOMAINS,
    preconnect: PRECONNECT_DOMAINS
  };
}

// Performance observer for monitoring resource loading
export function useResourcePerformance() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            console.log(`Resource: ${resourceEntry.name}, Duration: ${resourceEntry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      return () => observer.disconnect();
    }
  }, []);
}

export default CriticalResourcePreloader;