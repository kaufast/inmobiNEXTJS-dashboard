/**
 * Core Web Vitals Monitor
 * Measures and reports LCP, FID, CLS, and other performance metrics
 */

import { useEffect, useRef } from 'react';

interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

interface CoreWebVitalsMonitorProps {
  onMetricsUpdate?: (metrics: WebVitalsMetrics) => void;
  reportToAnalytics?: boolean;
  enableConsoleLogging?: boolean;
}

export function CoreWebVitalsMonitor({
  onMetricsUpdate,
  reportToAnalytics = false,
  enableConsoleLogging = false
}: CoreWebVitalsMonitorProps) {
  const metricsRef = useRef<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null
  });

  useEffect(() => {
    // Function to update metrics
    const updateMetrics = (metricName: keyof WebVitalsMetrics, value: number) => {
      metricsRef.current[metricName] = value;
      
      if (enableConsoleLogging) {
        console.log(`[Core Web Vitals] ${metricName.toUpperCase()}: ${value}ms`);
      }
      
      if (onMetricsUpdate) {
        onMetricsUpdate({ ...metricsRef.current });
      }
      
      if (reportToAnalytics) {
        // Send to analytics service (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
          gtag('event', metricName, {
            event_category: 'Web Vitals',
            value: Math.round(value),
            non_interaction: true
          });
        }
      }
    };

    // Monitor Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          updateMetrics('lcp', lastEntry.startTime);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        return observer;
      }
      return null;
    };

    // Monitor First Input Delay (FID)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'first-input') {
              const fidEntry = entry as PerformanceEventTiming;
              updateMetrics('fid', fidEntry.processingStart - fidEntry.startTime);
            }
          });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
        return observer;
      }
      return null;
    };

    // Monitor Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          updateMetrics('cls', clsValue);
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        return observer;
      }
      return null;
    };

    // Monitor First Contentful Paint (FCP)
    const observeFCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              updateMetrics('fcp', entry.startTime);
            }
          });
        });
        
        observer.observe({ entryTypes: ['paint'] });
        return observer;
      }
      return null;
    };

    // Monitor Time to First Byte (TTFB)
    const observeTTFB = () => {
      if ('performance' in window && 'navigation' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          updateMetrics('ttfb', ttfb);
        }
      }
    };

    // Monitor Interaction to Next Paint (INP)
    const observeINP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'event') {
              const eventEntry = entry as PerformanceEventTiming;
              const inp = eventEntry.processingStart - eventEntry.startTime;
              updateMetrics('inp', inp);
            }
          });
        });
        
        observer.observe({ entryTypes: ['event'] });
        return observer;
      }
      return null;
    };

    // Initialize observers
    const lcpObserver = observeLCP();
    const fidObserver = observeFID();
    const clsObserver = observeCLS();
    const fcpObserver = observeFCP();
    const inpObserver = observeINP();
    
    // Measure TTFB immediately
    observeTTFB();

    // Cleanup function
    return () => {
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
      fcpObserver?.disconnect();
      inpObserver?.disconnect();
    };
  }, [onMetricsUpdate, reportToAnalytics, enableConsoleLogging]);

  return null; // This component doesn't render anything
}

// Hook for accessing Web Vitals metrics
export function useWebVitalsMetrics() {
  const metricsRef = useRef<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null
  });

  const updateMetrics = (metrics: WebVitalsMetrics) => {
    metricsRef.current = metrics;
  };

  return {
    metrics: metricsRef.current,
    updateMetrics
  };
}

// Performance scoring utility
export function getWebVitalsScore(metrics: WebVitalsMetrics): {
  lcp: 'good' | 'needs-improvement' | 'poor' | null;
  fid: 'good' | 'needs-improvement' | 'poor' | null;
  cls: 'good' | 'needs-improvement' | 'poor' | null;
  overall: 'good' | 'needs-improvement' | 'poor';
} {
  const lcpScore = metrics.lcp 
    ? metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor'
    : null;
    
  const fidScore = metrics.fid 
    ? metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor'
    : null;
    
  const clsScore = metrics.cls 
    ? metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor'
    : null;

  const scores = [lcpScore, fidScore, clsScore].filter(Boolean);
  const poorCount = scores.filter(score => score === 'poor').length;
  const needsImprovementCount = scores.filter(score => score === 'needs-improvement').length;
  
  let overall: 'good' | 'needs-improvement' | 'poor';
  if (poorCount > 0) {
    overall = 'poor';
  } else if (needsImprovementCount > 0) {
    overall = 'needs-improvement';
  } else {
    overall = 'good';
  }

  return {
    lcp: lcpScore,
    fid: fidScore,
    cls: clsScore,
    overall
  };
}

// Performance optimization suggestions
export function getOptimizationSuggestions(metrics: WebVitalsMetrics): string[] {
  const suggestions: string[] = [];
  
  if (metrics.lcp && metrics.lcp > 2500) {
    suggestions.push('Optimize Largest Contentful Paint by compressing images, using WebP format, and preloading critical resources');
  }
  
  if (metrics.fid && metrics.fid > 100) {
    suggestions.push('Improve First Input Delay by reducing JavaScript execution time and using code splitting');
  }
  
  if (metrics.cls && metrics.cls > 0.1) {
    suggestions.push('Reduce Cumulative Layout Shift by setting dimensions for images and reserving space for dynamic content');
  }
  
  if (metrics.fcp && metrics.fcp > 1800) {
    suggestions.push('Optimize First Contentful Paint by inlining critical CSS and deferring non-critical resources');
  }
  
  if (metrics.ttfb && metrics.ttfb > 600) {
    suggestions.push('Improve Time to First Byte by optimizing server response times and using CDN');
  }
  
  return suggestions;
}

export default CoreWebVitalsMonitor;