import { useUsercentrics } from '@/hooks/use-usercentrics';

// Google Analytics integration with consent
export const initializeGoogleAnalytics = (trackingId: string) => {
  const { hasServiceConsent, hasCategoryConsent } = useUsercentrics();

  if (!hasCategoryConsent('analytics') || !hasServiceConsent('google_analytics')) {
    return;
  }

  // Initialize Google Analytics
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', trackingId, {
    anonymize_ip: true,
    storage: hasCategoryConsent('analytics') ? 'granted' : 'denied',
  });

  // Store gtag globally for tracking
  (window as any).gtag = gtag;
};

// Facebook Pixel integration with consent
export const initializeFacebookPixel = (pixelId: string) => {
  const { hasServiceConsent, hasCategoryConsent } = useUsercentrics();

  if (!hasCategoryConsent('marketing') || !hasServiceConsent('facebook_pixel')) {
    return;
  }

  // Facebook Pixel initialization
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  (window as any).fbq('init', pixelId);
  (window as any).fbq('track', 'PageView');
};

// Hotjar integration with consent
export const initializeHotjar = (hjid: string) => {
  const { hasServiceConsent, hasCategoryConsent } = useUsercentrics();

  if (!hasCategoryConsent('analytics') || !hasServiceConsent('hotjar')) {
    return;
  }

  // Hotjar initialization
  (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
    h.hj = h.hj || function() {
      (h.hj.q = h.hj.q || []).push(arguments);
    };
    h._hjSettings = { hjid: hjid, hjsv: 6 };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
};

// Google Ads integration with consent
export const initializeGoogleAds = (conversionId: string) => {
  const { hasServiceConsent, hasCategoryConsent } = useUsercentrics();

  if (!hasCategoryConsent('marketing') || !hasServiceConsent('google_ads')) {
    return;
  }

  // Google Ads initialization
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', conversionId);
};

// Consent-aware tracking function
export const trackEvent = (eventName: string, parameters: any = {}) => {
  const { hasCategoryConsent, hasServiceConsent } = useUsercentrics();

  // Google Analytics tracking
  if (hasCategoryConsent('analytics') && hasServiceConsent('google_analytics')) {
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  }

  // Facebook Pixel tracking
  if (hasCategoryConsent('marketing') && hasServiceConsent('facebook_pixel')) {
    if ((window as any).fbq) {
      (window as any).fbq('track', eventName, parameters);
    }
  }

  // Hotjar tracking
  if (hasCategoryConsent('analytics') && hasServiceConsent('hotjar')) {
    if ((window as any).hj) {
      (window as any).hj('event', eventName);
    }
  }
};

// Initialize all tracking services based on consent
export const initializeAllTrackingServices = () => {
  const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;
  const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
  const hotjarId = import.meta.env.VITE_HOTJAR_ID;
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;

  if (gaTrackingId) {
    initializeGoogleAnalytics(gaTrackingId);
  }

  if (fbPixelId) {
    initializeFacebookPixel(fbPixelId);
  }

  if (hotjarId) {
    initializeHotjar(hotjarId);
  }

  if (googleAdsId) {
    initializeGoogleAds(googleAdsId);
  }
};

// Global window type extensions
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    hj: (...args: any[]) => void;
  }
}