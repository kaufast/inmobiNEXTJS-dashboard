// i18n IMPLEMENTATION 

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import server logger
// import { logInfo, logWarn } from './utils/server-logger';

// Clear i18next cache
const clearI18nCache = () => {
  localStorage.removeItem('i18nextLng');
  localStorage.removeItem('i18next');
  console.log('i18next cache cleared');
};

// Clear cache before initialization
clearI18nCache();

// Get language from URL path
const getLanguageFromPath = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const urlLang = pathSegments[0];
  const supportedLangs = ['en-GB', 'en-US', 'es-ES', 'es-MX', 'de-AT', 'de-DE', 'ca-ES', 'fr-FR'];
  
  console.log('getLanguageFromPath - Full path:', window.location.pathname);
  console.log('getLanguageFromPath - Path segments:', pathSegments);
  console.log('getLanguageFromPath - URL lang:', urlLang);
  
  if (urlLang && supportedLangs.includes(urlLang)) {
    console.log('Language from URL:', urlLang);
    return urlLang;
  }
  
  console.log('No language detected from URL, using default');
  return 'en-GB';
};

// Import all language resources with detailed logging
import authEnUs from './locales/en-US/auth.json';
import commonEnUs from './locales/en-US/common.json';
import dashboardEnUs from './locales/en-US/dashboard.json';
import propertiesEnUs from './locales/en-US/properties.json';
import searchEnUs from './locales/en-US/search.json';
import homeEnUs from './locales/en-US/home.json';
import verificationEnUs from './locales/en-US/verification.json';
import tourEnUs from './locales/en-US/tour.json';
import actionsEnUs from './locales/en-US/actions.json';
import newsletterEnUs from './locales/en-US/newsletter.json';
import investmentEnUs from './locales/en-US/investment.json';
import securityEnUs from './locales/en-US/security.json';

import authEnGb from './locales/en-GB/auth.json';
import commonEnGb from './locales/en-GB/common.json';
import dashboardEnGb from './locales/en-GB/dashboard.json';
import propertiesEnGb from './locales/en-GB/properties.json';
import searchEnGb from './locales/en-GB/search.json';
import homeEnGb from './locales/en-GB/home.json';
import verificationEnGb from './locales/en-GB/verification.json';
import tourEnGb from './locales/en-GB/tour.json';
import actionsEnGb from './locales/en-GB/actions.json';
import newsletterEnGb from './locales/en-GB/newsletter.json';
import investmentEnGb from './locales/en-GB/investment.json';
import securityEnGb from './locales/en-GB/security.json';

import authEsEs from './locales/es-ES/auth.json';
import commonEsEs from './locales/es-ES/common.json';
import dashboardEsEs from './locales/es-ES/dashboard.json';
import propertiesEsEs from './locales/es-ES/properties.json';
import searchEsEs from './locales/es-ES/search.json';
import homeEsEs from './locales/es-ES/home.json';
import verificationEsEs from './locales/es-ES/verification.json';
import tourEsEs from './locales/es-ES/tour.json';
import actionsEsEs from './locales/es-ES/actions.json';
import newsletterEsEs from './locales/es-ES/newsletter.json';
import investmentEsEs from './locales/es-ES/investment.json';
import securityEsEs from './locales/es-ES/security.json';

import authEsMx from './locales/es-MX/auth.json';
import commonEsMx from './locales/es-MX/common.json';
import dashboardEsMx from './locales/es-MX/dashboard.json';
import propertiesEsMx from './locales/es-MX/properties.json';
import searchEsMx from './locales/es-MX/search.json';
import homeEsMx from './locales/es-MX/home.json';
import verificationEsMx from './locales/es-MX/verification.json';
import tourEsMx from './locales/es-MX/tour.json';
import actionsEsMx from './locales/es-MX/actions.json';
import newsletterEsMx from './locales/es-MX/newsletter.json';
import investmentEsMx from './locales/es-MX/investment.json';
import securityEsMx from './locales/es-MX/security.json';

import authDeAt from './locales/de-AT/auth.json';
import commonDeAt from './locales/de-AT/common.json';
import dashboardDeAt from './locales/de-AT/dashboard.json';
import propertiesDeAt from './locales/de-AT/properties.json';
import searchDeAt from './locales/de-AT/search.json';
import homeDeAt from './locales/de-AT/home.json';
import verificationDeAt from './locales/de-AT/verification.json';
import tourDeAt from './locales/de-AT/tour.json';
import actionsDeAt from './locales/de-AT/actions.json';
import newsletterDeAt from './locales/de-AT/newsletter.json';
import investmentDeAt from './locales/de-AT/investment.json';
import securityDeAt from './locales/de-AT/security.json';

import authDeDe from './locales/de-DE/auth.json';
import commonDeDe from './locales/de-DE/common.json';
import dashboardDeDe from './locales/de-DE/dashboard.json';
import propertiesDeDe from './locales/de-DE/properties.json';
import searchDeDe from './locales/de-DE/search.json';
import homeDeDe from './locales/de-DE/home.json';
import verificationDeDe from './locales/de-DE/verification.json';
import tourDeDe from './locales/de-DE/tour.json';
import actionsDeDe from './locales/de-DE/actions.json';
import newsletterDeDe from './locales/de-DE/newsletter.json';
import investmentDeDe from './locales/de-DE/investment.json';
import securityDeDe from './locales/de-DE/security.json';

import authCaEs from './locales/ca-ES/auth.json';
import commonCaEs from './locales/ca-ES/common.json';
import dashboardCaEs from './locales/ca-ES/dashboard.json';
import propertiesCaEs from './locales/ca-ES/properties.json';
import searchCaEs from './locales/ca-ES/search.json';
import homeCaEs from './locales/ca-ES/home.json';
import verificationCaEs from './locales/ca-ES/verification.json';
import tourCaEs from './locales/ca-ES/tour.json';
import actionsCaEs from './locales/ca-ES/actions.json';
import newsletterCaEs from './locales/ca-ES/newsletter.json';
import investmentCaEs from './locales/ca-ES/investment.json';
import securityCaEs from './locales/ca-ES/security.json';

import authFrFr from './locales/fr-FR/auth.json';
import commonFrFr from './locales/fr-FR/common.json';
import dashboardFrFr from './locales/fr-FR/dashboard.json';
import propertiesFrFr from './locales/fr-FR/properties.json';
import searchFrFr from './locales/fr-FR/search.json';
import homeFrFr from './locales/fr-FR/home.json';
import verificationFrFr from './locales/fr-FR/verification.json';
import tourFrFr from './locales/fr-FR/tour.json';
import actionsFrFr from './locales/fr-FR/actions.json';
import newsletterFrFr from './locales/fr-FR/newsletter.json';
import investmentFrFr from './locales/fr-FR/investment.json';
import securityFrFr from './locales/fr-FR/security.json';

// Define resources object with all language resources
const resources = {
  'en-US': {
    auth: authEnUs,
    common: commonEnUs,
    dashboard: dashboardEnUs,
    search: searchEnUs,
    properties: propertiesEnUs,
    home: homeEnUs,
    verification: verificationEnUs,
    tour: tourEnUs,
    actions: actionsEnUs,
    newsletter: newsletterEnUs,
    investment: investmentEnUs,
    security: securityEnUs,
  },
  'en-GB': {
    auth: authEnGb,
    common: commonEnGb,
    dashboard: dashboardEnGb,
    search: searchEnGb,
    properties: propertiesEnGb,
    home: homeEnGb,
    verification: verificationEnGb,
    tour: tourEnGb,
    actions: actionsEnGb,
    newsletter: newsletterEnGb,
    investment: investmentEnGb,
    security: securityEnGb,
  },
  'es-ES': {
    auth: authEsEs,
    common: commonEsEs,
    dashboard: dashboardEsEs,
    search: searchEsEs,
    properties: propertiesEsEs,
    home: homeEsEs,
    verification: verificationEsEs,
    tour: tourEsEs,
    actions: actionsEsEs,
    newsletter: newsletterEsEs,
    investment: investmentEsEs,
    security: securityEsEs,
  },
  'es-MX': {
    auth: authEsMx,
    common: commonEsMx,
    dashboard: dashboardEsMx,
    search: searchEsMx,
    properties: propertiesEsMx,
    home: homeEsMx,
    verification: verificationEsMx,
    tour: tourEsMx,
    actions: actionsEsMx,
    newsletter: newsletterEsMx,
    investment: investmentEsMx,
    security: securityEsMx,
  },
  'de-AT': {
    auth: authDeAt,
    common: commonDeAt,
    dashboard: dashboardDeAt,
    search: searchDeAt,
    properties: propertiesDeAt,
    home: homeDeAt,
    verification: verificationDeAt,
    tour: tourDeAt,
    actions: actionsDeAt,
    newsletter: newsletterDeAt,
    investment: investmentDeAt,
    security: securityDeAt,
  },
  'de-DE': {
    auth: authDeDe,
    common: commonDeDe,
    dashboard: dashboardDeDe,
    search: searchDeDe,
    properties: propertiesDeDe,
    home: homeDeDe,
    verification: verificationDeDe,
    tour: tourDeDe,
    actions: actionsDeDe,
    newsletter: newsletterDeDe,
    investment: investmentDeDe,
    security: securityDeDe,
  },
  'ca-ES': {
    auth: authCaEs,
    common: commonCaEs,
    dashboard: dashboardCaEs,
    search: searchCaEs,
    properties: propertiesCaEs,
    home: homeCaEs,
    verification: verificationCaEs,
    tour: tourCaEs,
    actions: actionsCaEs,
    newsletter: newsletterCaEs,
    investment: investmentCaEs,
    security: securityCaEs,
  },
  'fr-FR': {
    auth: authFrFr,
    common: commonFrFr,
    dashboard: dashboardFrFr,
    search: searchFrFr,
    properties: propertiesFrFr,
    home: homeFrFr,
    verification: verificationFrFr,
    tour: tourFrFr,
    actions: actionsFrFr,
    newsletter: newsletterFrFr,
    investment: investmentFrFr,
    security: securityFrFr,
  },
  'en': {
    auth: authEnGb,
    common: commonEnGb,
    dashboard: dashboardEnGb,
    search: searchEnGb,
    properties: propertiesEnGb,
    home: homeEnGb,
    verification: verificationEnGb,
    tour: tourEnGb,
    actions: actionsEnGb,
  },
};


// Initialize i18n
const initialLanguage = getLanguageFromPath();
console.log('Initial language detected:', initialLanguage);

// Use the detected language
const testLanguage = initialLanguage;
console.log('Using detected language:', testLanguage);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en-GB', 'en-US', 'es-ES', 'es-MX', 'de-AT', 'de-DE', 'ca-ES', 'fr-FR', 'en'],
    fallbackLng: 'en-GB',
    lng: testLanguage, // Use language from URL
    ns: ['common', 'dashboard', 'search', 'properties', 'auth', 'home', 'verification', 'tour', 'actions', 'newsletter', 'investment', 'security'],
    defaultNS: 'common',
    detection: {
      order: ['path', 'querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      caches: []  // Disable caching to prevent conflicts
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false,
    },
    debug: process.env.NODE_ENV === 'development',
    saveMissing: true,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation key: ns=${ns}, key=${key}, lng=${lng}`);
    },
    // Ensure all namespaces are loaded for the initial language
    preload: [initialLanguage],
    load: 'currentOnly',
    cleanCode: true,
    keySeparator: '.',
    nsSeparator: ':',
  });

// Safe language change function to avoid errors
export const changeLanguage = (lng: string) => {
  try {
    if (i18next.language !== lng) {
      i18next.changeLanguage(lng);
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Export for testing
export const getI18nInstance = () => i18next;

// Add a server endpoint to serve language files
export const fetchLanguageResource = async (lng: string, ns: string) => {
  try {
    const response = await fetch(`/api/i18n/${lng}/${ns}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch language resource: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching language resource:', error);
    return null;
  }
};

export default i18next;