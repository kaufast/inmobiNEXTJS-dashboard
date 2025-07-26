/**
 * Performance Optimization Utilities
 * Collection of utilities for improving Core Web Vitals and overall performance
 */

// Resource loading optimizations
export function preloadResource(href: string, as: string, type?: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

export function prefetchResource(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

export function preconnectToDomain(href: string, crossOrigin = false) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// Image loading optimizations
export function createOptimizedImageLoader() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    unobserve: (img: HTMLImageElement) => imageObserver.unobserve(img),
    disconnect: () => imageObserver.disconnect()
  };
}

// Critical rendering path optimization
export function optimizeCriticalRenderingPath() {
  // Inline critical CSS
  const criticalCSS = document.querySelector('style[data-critical]');
  if (criticalCSS) {
    criticalCSS.remove();
  }

  // Load non-critical CSS asynchronously
  const loadCSS = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  };

  // Load stylesheets
  loadCSS('/css/non-critical.css');
  loadCSS('/css/components.css');
}

// Font loading optimization
export function optimizeFontLoading() {
  // Check if fonts are already loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      console.log('Fonts loaded');
    });
  }

  // Preload critical fonts
  preloadResource('/fonts/inter-var.woff2', 'font', 'font/woff2');
  
  // Use font-display: swap for better performance
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2-variations');
    }
  `;
  document.head.appendChild(style);
}

// JavaScript optimization
export function optimizeJavaScript() {
  // Remove unused event listeners
  const removeUnusedListeners = () => {
    const elements = document.querySelectorAll('[data-cleanup]');
    elements.forEach(element => {
      element.removeEventListener('click', () => {});
      element.removeEventListener('mouseover', () => {});
    });
  };

  // Debounce function for performance
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Throttle function for performance
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  return { removeUnusedListeners, debounce, throttle };
}

// Memory optimization
export function optimizeMemoryUsage() {
  // Clean up unused objects
  const cleanupUnusedObjects = () => {
    // Force garbage collection (development only)
    if (process.env.NODE_ENV === 'development' && (window as any).gc) {
      (window as any).gc();
    }
  };

  // Monitor memory usage
  const monitorMemoryUsage = () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memInfo.usedJSHeapSize / 1048576),
        total: Math.round(memInfo.totalJSHeapSize / 1048576),
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576)
      });
    }
  };

  return { cleanupUnusedObjects, monitorMemoryUsage };
}

// Network optimization
export function optimizeNetworkRequests() {
  // Request deduplication
  const requestCache = new Map();
  
  const dedupeRequest = async (url: string, options?: RequestInit) => {
    const key = `${url}:${JSON.stringify(options)}`;
    
    if (requestCache.has(key)) {
      return requestCache.get(key);
    }
    
    const requestPromise = fetch(url, options);
    requestCache.set(key, requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      // Clean up cache after request completes
      setTimeout(() => requestCache.delete(key), 5000);
    }
  };

  // Request batching
  const batchRequests = (urls: string[]) => {
    return Promise.all(urls.map(url => fetch(url)));
  };

  return { dedupeRequest, batchRequests };
}

// Core Web Vitals optimization
export function optimizeCoreWebVitals() {
  // Optimize Largest Contentful Paint (LCP)
  const optimizeLCP = () => {
    // Preload hero images
    const heroImages = document.querySelectorAll('img[data-hero]');
    heroImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        preloadResource(img.src, 'image');
      }
    });

    // Prioritize above-the-fold content
    const aboveTheFold = document.querySelector('.above-the-fold');
    if (aboveTheFold) {
      aboveTheFold.style.contain = 'layout style paint';
    }
  };

  // Optimize First Input Delay (FID)
  const optimizeFID = () => {
    // Break up long tasks
    const scheduleWork = (work: Function) => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(work);
      } else {
        setTimeout(work, 0);
      }
    };

    // Use requestIdleCallback for non-critical work
    const scheduleIdleWork = (work: Function) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(work);
      } else {
        setTimeout(work, 16);
      }
    };

    return { scheduleWork, scheduleIdleWork };
  };

  // Optimize Cumulative Layout Shift (CLS)
  const optimizeCLS = () => {
    // Reserve space for images
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.style.aspectRatio = '16/9';
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    });

    // Avoid inserting content above existing content
    const insertContentSafely = (element: HTMLElement, content: string) => {
      const placeholder = document.createElement('div');
      placeholder.style.minHeight = '100px';
      element.appendChild(placeholder);
      
      setTimeout(() => {
        placeholder.innerHTML = content;
        placeholder.style.minHeight = 'auto';
      }, 0);
    };

    return { insertContentSafely };
  };

  return { optimizeLCP, optimizeFID, optimizeCLS };
}

// Performance monitoring
export function createPerformanceMonitor() {
  const metrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  };

  const measurePerformance = () => {
    // Measure navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Measure paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Use PerformanceObserver for Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    return metrics;
  };

  const reportMetrics = (callback: (metrics: typeof metrics) => void) => {
    callback(metrics);
  };

  return { measurePerformance, reportMetrics };
}

// Resource hints for better loading
export function setupResourceHints() {
  // DNS prefetch for external domains
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com',
    'https://res.cloudinary.com'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const criticalDomains = [
    'https://fonts.googleapis.com',
    'https://res.cloudinary.com'
  ];

  criticalDomains.forEach(domain => {
    preconnectToDomain(domain, true);
  });
}

// Progressive enhancement
export function enableProgressiveEnhancement() {
  // Feature detection
  const features = {
    webp: checkWebPSupport(),
    avif: checkAVIFSupport(),
    lazyLoading: 'loading' in HTMLImageElement.prototype,
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator
  };

  // Apply enhancements based on feature support
  if (features.webp) {
    document.documentElement.classList.add('webp');
  }

  if (features.avif) {
    document.documentElement.classList.add('avif');
  }

  if (features.lazyLoading) {
    document.documentElement.classList.add('native-lazy-loading');
  }

  return features;
}

// Format support detection
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function checkAVIFSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').startsWith('data:image/avif');
}

// Bundle analyzer (development only)
export function analyzeBundlePerformance() {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    const totalSize = Array.from(scripts).reduce((total, script) => {
      // This would need actual bundle size data
      return total + 1000; // Placeholder
    }, 0);

    console.log('Bundle performance analysis:', {
      totalScripts: scripts.length,
      estimatedSize: totalSize,
      recommendations: [
        'Enable code splitting',
        'Use dynamic imports',
        'Implement tree shaking'
      ]
    });
  }
}

export default {
  preloadResource,
  prefetchResource,
  preconnectToDomain,
  createOptimizedImageLoader,
  optimizeCriticalRenderingPath,
  optimizeFontLoading,
  optimizeJavaScript,
  optimizeMemoryUsage,
  optimizeNetworkRequests,
  optimizeCoreWebVitals,
  createPerformanceMonitor,
  setupResourceHints,
  enableProgressiveEnhancement,
  analyzeBundlePerformance
};