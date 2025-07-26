import * as React from 'react';
import { useLocation } from 'wouter';

// Get analytics IDs from environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-4XKJX447CR';
const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID || 'GT-KT45C6PG';
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION_TAG;

export function AnalyticsScripts() {
  const [location] = useLocation();

  // Exclude dashboard/admin routes
  const isAdminRoute =
    location.includes('/dashboard') || location.includes('/admin');

  React.useEffect(() => {
    if (isAdminRoute) return;

    try {
      // Only load scripts in production or when explicitly enabled
      const isProduction = process.env.NODE_ENV === 'production';
      const enableAnalytics = process.env.VITE_ENABLE_ANALYTICS === 'true';
      
      if (!isProduction && !enableAnalytics) {
        console.log('Analytics scripts disabled in development mode');
        return;
      }

      // Consent Management Script (GDPR compliance) - with error handling
      if (!document.getElementById('consent-manager-script')) {
        const consentScript = document.createElement('script');
        consentScript.id = 'consent-manager-script';
        consentScript.type = 'text/javascript';
        consentScript.setAttribute('data-cmp-ab', '1');
        consentScript.src = 'https://cdn.consentmanager.net/delivery/autoblocking/bb85d91632c5e.js';
        consentScript.setAttribute('data-cmp-host', 'c.delivery.consentmanager.net');
        consentScript.setAttribute('data-cmp-cdn', 'cdn.consentmanager.net');
        consentScript.setAttribute('data-cmp-codesrc', '16');
        
        consentScript.onerror = () => {
          console.warn('Failed to load consent management script');
        };
        
        document.head.appendChild(consentScript);
      }

      // Google Tag Manager (GTM) - with error handling
      if (!document.getElementById('gtm-script') && GTM_CONTAINER_ID) {
        const gtmScript = document.createElement('script');
        gtmScript.id = 'gtm-script';
        gtmScript.innerHTML = `
          try {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          } catch (error) {
            console.warn('Failed to initialize Google Tag Manager:', error);
          }
        `;
        document.head.appendChild(gtmScript);
      }
    } catch (error) {
      console.error('Error loading analytics scripts:', error);
    }
  }, [isAdminRoute]);

  // Google Search Console verification meta tag
  React.useEffect(() => {
    if (isAdminRoute) return;
    
    // Add GSC verification meta tag if provided
    if (GSC_VERIFICATION && !document.querySelector('meta[name="google-site-verification"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = GSC_VERIFICATION.replace('google-site-verification=', '');
      document.head.appendChild(meta);
      console.log('Google Search Console verification tag added');
    }
  }, [isAdminRoute]);

  return null;
}

export default AnalyticsScripts; 