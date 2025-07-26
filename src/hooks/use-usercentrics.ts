import { useState, useEffect, useCallback } from 'react';
import { CONSENT_MANAGER_CONFIG } from '@/utils/consent-manager-config';

// Usercentrics types
interface UsercentricsService {
  templateId: string;
  version: string;
  type: string;
  dataProcessor: string;
  dataPurposes: string[];
  processingCompany: string;
  nameOfProcessingCompany: string;
  addressOfProcessingCompany: string;
  descriptionOfService: string;
  languagesAvailable: string[];
  linkToDpa: string;
  legalBasisList: string[];
  optOutUrl: string;
  policyOfProcessorUrl: string;
  retentionPeriodList: string[];
  subConsents: any[];
  cookieMaxAgeSeconds: number;
  usesNonCookieAccess: boolean;
  deviceStorageDisclosureUrl: string;
  isEssential: boolean;
  isService: boolean;
  showDataTransferDisclosure: boolean;
  consent: {
    status: boolean;
    history: any[];
  };
}

interface UsercentricsConsentStatus {
  shouldCollectConsent: boolean;
  consents: UsercentricsService[];
  geolocation: {
    countryCode: string;
    regionCode: string;
    isInEU: boolean;
    isInUS: boolean;
  };
}

interface ConsentManagerWindow extends Window {
  __cmp?: any;
  cmp?: any;
  UC_UI?: {
    showFirstLayer(): Promise<any>;
    showSecondLayer(): Promise<any>;
    getServicesBaseInfo(): UsercentricsService[];
    getConsents(): UsercentricsService[];
    acceptAllConsents(): Promise<UsercentricsService[]>;
    denyAllConsents(): Promise<UsercentricsService[]>;
    updateConsents(consents: any[]): Promise<UsercentricsService[]>;
  };
  // ConsentManager specific API
  cmpReady?: boolean;
  __tcfapi?: any;
}

declare const window: ConsentManagerWindow;

export interface ConsentStatus {
  hasConsent: boolean;
  shouldCollectConsent: boolean;
  categories: {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  services: {
    [key: string]: boolean;
  };
  consentId: string;
  timestamp: Date;
  isEU: boolean;
}

export const useUsercentrics = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Usercentrics
  useEffect(() => {
    const settingsId = import.meta.env.VITE_USERCENTRICS_SETTINGS_ID;
    
    if (!settingsId) {
      setError('Usercentrics Settings ID not found');
      setIsLoading(false);
      return;
    }

    // Load ConsentManager script with production settings
    const script = document.createElement('script');
    script.id = 'consentmanager-cmp';
    script.src = CONSENT_MANAGER_CONFIG.scriptUrl;
    script.setAttribute('data-cmp-id', CONSENT_MANAGER_CONFIG.id);
    script.setAttribute('data-cmp-host', CONSENT_MANAGER_CONFIG.host);
    script.setAttribute('data-cmp-cdn', CONSENT_MANAGER_CONFIG.cdn);
    script.setAttribute('data-cmp-codesrc', CONSENT_MANAGER_CONFIG.codeId);
    script.async = true;
    
    script.onload = () => {
      // Wait for ConsentManager API to be available
      const checkCMP = () => {
        // ConsentManager uses window.__cmp or window.cmp
        if (window.__cmp || window.cmp || window.UC_UI) {
          setIsInitialized(true);
          loadConsentStatus();
          
          // Initialize tracking services after consent is loaded
          import('@/utils/consent-analytics').then(({ initializeAllTrackingServices }) => {
            initializeAllTrackingServices();
          });
        } else {
          setTimeout(checkCMP, 100);
        }
      };
      checkCMP();
    };

    script.onerror = () => {
      setError('Failed to load ConsentManager script');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.getElementById('consentmanager-cmp');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Load consent status
  const loadConsentStatus = useCallback(async () => {
    if (!window.UC_UI) return;

    try {
      const consents = window.UC_UI.getConsents();
      const serviceInfo = window.UC_UI.getServicesBaseInfo();
      
      // Map consents to categories
      const categories = {
        necessary: true, // Always true
        functional: consents.some(c => 
          c.dataProcessor.includes('maps') || 
          c.dataProcessor.includes('sendgrid') ||
          c.dataProcessor.includes('zendesk')
        ) && consents.find(c => 
          c.dataProcessor.includes('maps') || 
          c.dataProcessor.includes('sendgrid') ||
          c.dataProcessor.includes('zendesk')
        )?.consent.status || false,
        analytics: consents.some(c => 
          c.dataProcessor.includes('analytics') || 
          c.dataProcessor.includes('hotjar')
        ) && consents.find(c => 
          c.dataProcessor.includes('analytics') || 
          c.dataProcessor.includes('hotjar')
        )?.consent.status || false,
        marketing: consents.some(c => 
          c.dataProcessor.includes('facebook') || 
          c.dataProcessor.includes('google_ads')
        ) && consents.find(c => 
          c.dataProcessor.includes('facebook') || 
          c.dataProcessor.includes('google_ads')
        )?.consent.status || false,
      };

      // Map services
      const services: { [key: string]: boolean } = {};
      consents.forEach(consent => {
        services[consent.dataProcessor] = consent.consent.status;
      });

      const status: ConsentStatus = {
        hasConsent: consents.some(c => c.consent.status),
        shouldCollectConsent: consents.length > 0,
        categories,
        services,
        consentId: 'usercentrics-' + Date.now(),
        timestamp: new Date(),
        isEU: true // You can get this from geolocation
      };

      setConsentStatus(status);
      setIsLoading(false);

      // Send consent to backend
      await sendConsentToBackend(status);
    } catch (error) {
      console.error('Error loading consent status:', error);
      setError('Failed to load consent status');
      setIsLoading(false);
    }
  }, []);

  // Show consent banner
  const showConsentBanner = useCallback(async () => {
    if (!window.UC_UI) return null;

    try {
      const response = await window.UC_UI.showFirstLayer();
      await loadConsentStatus();
      return response;
    } catch (error) {
      console.error('Error showing consent banner:', error);
      return null;
    }
  }, [loadConsentStatus]);

  // Show privacy settings
  const showPrivacySettings = useCallback(async () => {
    if (!window.UC_UI) return null;

    try {
      const response = await window.UC_UI.showSecondLayer();
      await loadConsentStatus();
      return response;
    } catch (error) {
      console.error('Error showing privacy settings:', error);
      return null;
    }
  }, [loadConsentStatus]);

  // Accept all consents
  const acceptAllConsents = useCallback(async () => {
    if (!window.UC_UI) return;

    try {
      await window.UC_UI.acceptAllConsents();
      await loadConsentStatus();
    } catch (error) {
      console.error('Error accepting all consents:', error);
    }
  }, [loadConsentStatus]);

  // Deny all consents
  const denyAllConsents = useCallback(async () => {
    if (!window.UC_UI) return;

    try {
      await window.UC_UI.denyAllConsents();
      await loadConsentStatus();
    } catch (error) {
      console.error('Error denying all consents:', error);
    }
  }, [loadConsentStatus]);

  // Check specific service consent
  const hasServiceConsent = useCallback((serviceId: string): boolean => {
    return consentStatus?.services[serviceId] || false;
  }, [consentStatus]);

  // Check category consent
  const hasCategoryConsent = useCallback((category: keyof ConsentStatus['categories']): boolean => {
    return consentStatus?.categories[category] || false;
  }, [consentStatus]);

  // Send consent to backend
  const sendConsentToBackend = async (consent: ConsentStatus) => {
    try {
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          consent,
          timestamp: new Date(),
          source: 'web'
        }),
      });
    } catch (error) {
      console.error('Error sending consent to backend:', error);
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    consentStatus,
    showConsentBanner,
    showPrivacySettings,
    acceptAllConsents,
    denyAllConsents,
    hasServiceConsent,
    hasCategoryConsent,
    refreshConsent: loadConsentStatus,
  };
};