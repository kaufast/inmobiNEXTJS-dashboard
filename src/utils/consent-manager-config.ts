// ConsentManager Configuration
export const CONSENT_MANAGER_CONFIG = {
  // Delivery Details from ConsentManager
  id: '150430',
  codeId: 'bb85d91632c5e',
  host: 'c.delivery.consentmanager.net',
  cdn: 'cdn.consentmanager.net',
  
  // Script URLs
  scriptUrl: 'https://cdn.consentmanager.net/delivery/autoblocking/bb85d91632c5e.js',
  deliveryUrl: 'https://c.delivery.consentmanager.net',
  
  // Configuration options
  settings: {
    tcfEnabled: false,
    language: 'auto', // Auto-detect or set specific language
    version: 'production',
    
    // Additional ConsentManager specific options
    autoBlocking: true,
    respectDoNotTrack: true,
    
    // UI Configuration
    design: {
      theme: 'light',
      position: 'bottom-center',
      layout: 'box',
    },
    
    // Legal basis configuration
    legalBasis: {
      legitimate_interest: true,
      consent: true,
      vital_interest: false,
      contract: true,
      legal_obligation: true,
      public_task: false,
    },
    
    // Categories configuration matching our schema
    categories: {
      necessary: {
        required: true,
        enabled: true,
      },
      functional: {
        required: false,
        enabled: false,
      },
      analytics: {
        required: false,
        enabled: false,
      },
      marketing: {
        required: false,
        enabled: false,
      },
    },
  },
  
  // Service mappings for our application
  services: {
    // Analytics services
    google_analytics: {
      category: 'analytics',
      name: 'Google Analytics',
      description: 'Web analytics service',
    },
    hotjar: {
      category: 'analytics', 
      name: 'Hotjar',
      description: 'User behavior analytics',
    },
    
    // Marketing services
    facebook_pixel: {
      category: 'marketing',
      name: 'Facebook Pixel',
      description: 'Social media advertising',
    },
    google_ads: {
      category: 'marketing',
      name: 'Google Ads',
      description: 'Online advertising',
    },
    
    // Functional services
    google_maps: {
      category: 'functional',
      name: 'Google Maps',
      description: 'Interactive maps',
    },
    sendgrid: {
      category: 'functional',
      name: 'SendGrid',
      description: 'Email delivery',
    },
    zendesk: {
      category: 'functional',
      name: 'Zendesk',
      description: 'Customer support',
    },
    
    // Necessary services
    stripe: {
      category: 'necessary',
      name: 'Stripe',
      description: 'Payment processing',
    },
  },
};

// Helper functions
export const getConsentManagerScript = () => CONSENT_MANAGER_CONFIG.scriptUrl;
export const getConsentManagerId = () => CONSENT_MANAGER_CONFIG.codeId;
export const getConsentManagerHost = () => CONSENT_MANAGER_CONFIG.host;