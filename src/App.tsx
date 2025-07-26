import { ErrorBoundary } from "@/components/ErrorBoundary";
import ContactButton from "@/components/ui/contact-button";
import { Toaster } from "@/components/ui/toaster";
import OnboardingPopup from "@/components/ui/onboarding-popup";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";
import AddPropertyPage from "@/pages/add-property-page";
import AddPropertyWizardPage from "@/pages/add-property-wizard-page";
import AddPropertyWizardUploadCareTestPage from "@/pages/add-property-wizard-uploadcare-test-page";
import UploadCareTestDebug from "@/pages/uploadcare-test-debug";
import SimpleUploadTest from "@/pages/simple-upload-test";
import BasicTest from "@/pages/basic-test";
import BulkUploadPage from "@/pages/bulk-upload-page";
import EditPropertyPage from "@/pages/edit-property-page";
import AgentAnalyticsPage from "@/pages/agent-analytics-page";
import AgentAnalyticsPageSimple from "@/pages/agent-analytics-page-simple";
import AnalyticsTestPage from "@/pages/analytics-test-page";
import AgentPremiumPage from "@/pages/agent-premium-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AgentToursPage from "@/pages/dashboard/agent-tours-page";
import ApprovalsPage from "@/pages/dashboard/approvals-page";
import SecurityPage from "@/pages/dashboard/security-page";
import SettingsPage from "@/pages/dashboard/settings-page";
import ToursPage from "@/pages/dashboard/tours-page";
import EnhancedToursPage from "@/pages/dashboard/enhanced-tours-page";
import UsersPage from "@/pages/dashboard/users-page";
import VerificationManagementPage from "@/pages/dashboard/verification-management-page";
import DebugPage from "@/pages/debug-page";
import DocumentsPage from "@/pages/documents-page";
import DocumentsDashboardPage from "@/pages/dashboard/documents-dashboard-page";
import FavoritesPage from "@/pages/favorites-page";
import ForgotPasswordPage from "@/pages/forgot-password";
import HomePage from "@/pages/home-page";
import I18nTestPage from "@/pages/i18n-test-page";
import ImageEditorDemoPage from "@/pages/image-editor-demo-page";
import CalendarDemoPage from "@/pages/calendar-demo-page";
import MessagesPage from "@/pages/messages-page";
import NotFound from "@/pages/not-found";
import OnboardingPage from "@/pages/onboarding-page";

import PremiumRequiredPage from "@/pages/premium-required-page";
import ProfilePage from "@/pages/profile-page";
import PropertyDetailsPage from "@/pages/property-details-page";
import PropertyMatchingChatPage from "@/pages/property-matching-chat-page";
import PropertyMatchingPage from "@/pages/property-matching-page";
import ResetPasswordPage from "@/pages/reset-password";
import SearchResultsPage from "@/pages/search-results-page";
import SearchWizardPage from "@/pages/search-wizard-page";
import SimplePropertiesPage from "@/pages/SimplePropertiesPage";
import SpatialSearchPage from "@/pages/spatial-search-page";
import SubscriptionPage from "@/pages/subscription-page";
import SubscriptionSuccessPage from "@/pages/subscription-success-page";
import SupportPage from "@/pages/support-page";

import VerificationCallback from "@/pages/verification-callback";
import VerificationGuidePage from "@/pages/verification-guide-page";
import VerificationPage from "@/pages/verification-page";
import VoiceSearchPage from "@/pages/voice-search-page";
import WishlistDetailPage from "@/pages/wishlist-detail-page";
import WishlistsPage from "@/pages/wishlists-page";
import { AgencyOnboardingPage } from '@/pages/agency-onboarding-page';
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import * as React from "react";
import { Route, Switch } from "wouter";
import { HelmetProvider } from 'react-helmet-async';
import { changeLanguage } from "./i18n";
// import AnalyticsScripts from '@/components/seo/AnalyticsScripts';

// Component that extracts locale from URL and updates language context
function LocaleAwareComponent({ 
  params, 
  Component 
}: { 
  params: any;
  Component: React.ComponentType<any>;
}) {
  const { changeLanguage, currentLanguage } = useLanguage();
  
  React.useEffect(() => {
    console.log('LocaleAwareComponent mounted with params:', params);
    if (params.lang) {
      // Validate that lang matches expected locale pattern (xx-XX)
      const localePattern = /^[a-z]{2}-[A-Z]{2}$/;
      if (localePattern.test(params.lang)) {
        // Only change language if it's different from current
        if (params.lang !== currentLanguage) {
          console.log('Setting language from URL:', params.lang, 'Current:', currentLanguage);
          changeLanguage(params.lang);
        } else {
          console.log('Language already set to:', params.lang);
        }
      } else {
        console.warn('Invalid locale format:', params.lang, 'Expected format: xx-XX');
      }
    }
  }, [params.lang, currentLanguage, changeLanguage]);

  return <Component {...params} />;
}

// Route wrapper that handles locale parameter extraction
function LocaleAwareRoute({ 
  path, 
  component: Component, 
  allowedRoles,
  requiredTier
}: { 
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: string[];
  requiredTier?: 'premium' | 'business';
}) {
  console.log('LocaleAwareRoute rendering for path:', path, { allowedRoles, requiredTier });
  // Handle root path specially to avoid double slashes
  const localePattern = React.useMemo(() => 
    path === '/' 
      ? '/:lang' 
      : `/:lang${path}`,
    [path]
  );
  
  React.useEffect(() => {
    console.log(`Creating routes for path: ${path}, localePattern: ${localePattern}`);
    console.log(`  - Locale route: ${localePattern}`);
    console.log(`  - Base route: ${path}`);
  }, [path, localePattern]);
  
  console.log('LocaleAwareRoute about to return routes for:', path);
  console.log('Generated patterns:', { localePattern, basePath: path });

  if (allowedRoles) {
    console.log('Returning protected routes for:', path);
    return (
      <>
        <ProtectedRoute 
          path={localePattern} 
          component={(props) => <LocaleAwareComponent params={props} Component={Component} />} 
          allowedRoles={allowedRoles} 
          requiredTier={requiredTier}
        />
        <ProtectedRoute 
          path={path} 
          component={Component} 
          allowedRoles={allowedRoles} 
          requiredTier={requiredTier}
        />
      </>
    );
  }
  
  console.log('Returning public routes for:', path);
  return (
    <>
      <Route path={localePattern}>
        {(params) => {
          console.log(`Locale route matched! Pattern: ${localePattern}, Params:`, params);
          return <LocaleAwareComponent params={params} Component={Component} />;
        }}
      </Route>
      <Route path={path}>
        {(params) => {
          console.log(`Base route matched! Pattern: ${path}, Params:`, params);
          return <Component {...params} />;
        }}
      </Route>
    </>
  );
}

function AppContent() {
  const { currentLanguage } = useLanguage();
  
  // Simple language synchronization
  React.useEffect(() => {
    try {
      console.log("Initializing language:", currentLanguage);
      changeLanguage(currentLanguage);
      console.log("Language initialization complete");
    } catch (error) {
      console.error("Error initializing language:", error);
    }
  }, [currentLanguage]);
  
  return (
    <ErrorBoundary>
      <Switch>
        {console.log('Switch component is rendering with current URL:', window.location.pathname)}
        
        {/* Public Routes - Auth */}
        <Route path="/:lang/auth">
          {(params) => {
            console.log('Locale auth route matched! Params:', params);
            return <LocaleAwareComponent params={params} Component={AuthPage} />;
          }}
        </Route>
        <Route path="/auth" component={AuthPage} />
        
        {/* Forgot Password */}
        <Route path="/:lang/forgot-password">
          {(params) => <LocaleAwareComponent params={params} Component={ForgotPasswordPage} />}
        </Route>
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        
        {/* Reset Password */}
        <Route path="/:lang/reset-password">
          {(params) => <LocaleAwareComponent params={params} Component={ResetPasswordPage} />}
        </Route>
        <Route path="/reset-password" component={ResetPasswordPage} />
        
        {/* Legal Pages */}
        <Route path="/:lang/privacy">
          {(params) => <LocaleAwareComponent params={params} Component={PrivacyPolicyPage} />}
        </Route>
        <Route path="/privacy" component={PrivacyPolicyPage} />
        
        <Route path="/:lang/terms">
          {(params) => <LocaleAwareComponent params={params} Component={TermsOfServicePage} />}
        </Route>
        <Route path="/terms" component={TermsOfServicePage} />
        
        <Route path="/:lang/cookies">
          {(params) => <LocaleAwareComponent params={params} Component={CookiePolicyPage} />}
        </Route>
        <Route path="/cookies" component={CookiePolicyPage} />
        
        {/* Property Details */}
        <Route path="/:lang/property/:id">
          {(params) => <LocaleAwareComponent params={params} Component={PropertyDetailsPage} />}
        </Route>
        <Route path="/property/:id" component={PropertyDetailsPage} />
        
        {/* Search */}
        <Route path="/:lang/search">
          {(params) => <LocaleAwareComponent params={params} Component={SearchResultsPage} />}
        </Route>
        <Route path="/search" component={SearchResultsPage} />
        
        {/* Voice Search */}
        <Route path="/:lang/voice-search">
          {(params) => <LocaleAwareComponent params={params} Component={VoiceSearchPage} />}
        </Route>
        <Route path="/voice-search" component={VoiceSearchPage} />
        
        {/* Spatial Search */}
        <Route path="/:lang/spatial-search">
          {(params) => <LocaleAwareComponent params={params} Component={SpatialSearchPage} />}
        </Route>
        <Route path="/spatial-search" component={SpatialSearchPage} />
        
        {/* Property Matching */}
        <Route path="/:lang/property-matching">
          {(params) => <LocaleAwareComponent params={params} Component={PropertyMatchingPage} />}
        </Route>
        <Route path="/property-matching" component={PropertyMatchingPage} />
        
        {/* Property Matching Chat */}
        <Route path="/:lang/property-matching-chat">
          {(params) => <LocaleAwareComponent params={params} Component={PropertyMatchingChatPage} />}
        </Route>
        <Route path="/property-matching-chat" component={PropertyMatchingChatPage} />
        
        {/* Onboarding */}
        <Route path="/:lang/onboarding">
          {(params) => <LocaleAwareComponent params={params} Component={OnboardingPage} />}
        </Route>
        <Route path="/onboarding" component={OnboardingPage} />
        
        {/* Agency Onboarding */}
        <Route path="/:lang/agency-onboarding">
          {(params) => <LocaleAwareComponent params={params} Component={AgencyOnboardingPage} />}
        </Route>
        <Route path="/agency-onboarding" component={AgencyOnboardingPage} />
        
        {/* Image Editor Demo */}
        <Route path="/:lang/image-editor-demo">
          {(params) => <LocaleAwareComponent params={params} Component={ImageEditorDemoPage} />}
        </Route>
        <Route path="/image-editor-demo" component={ImageEditorDemoPage} />
        
        {/* Calendar Demo */}
        <Route path="/:lang/calendar-demo">
          {(params) => <LocaleAwareComponent params={params} Component={CalendarDemoPage} />}
        </Route>
        <Route path="/calendar-demo" component={CalendarDemoPage} />
        
        {/* Premium Required */}
        <Route path="/:lang/premium-required">
          {(params) => <LocaleAwareComponent params={params} Component={PremiumRequiredPage} />}
        </Route>
        <Route path="/premium-required" component={PremiumRequiredPage} />
        
        {/* Debug */}
        <Route path="/:lang/debug">
          {(params) => <LocaleAwareComponent params={params} Component={DebugPage} />}
        </Route>
        <Route path="/debug" component={DebugPage} />
        
        {/* I18n Test */}
        <Route path="/:lang/i18n-test">
          {(params) => <LocaleAwareComponent params={params} Component={I18nTestPage} />}
        </Route>
        <Route path="/i18n-test" component={I18nTestPage} />
        
        {/* Verification Guide */}
        <LocaleAwareRoute path="/verification-guide" component={VerificationGuidePage} />
        
        {/* Search Wizard */}
        <Route path="/:lang/search-wizard">
          {(params) => <LocaleAwareComponent params={params} Component={SearchWizardPage} />}
        </Route>
        <Route path="/search-wizard" component={SearchWizardPage} />

        {/* Verification */}
        <LocaleAwareRoute path="/verification" component={VerificationPage} />
        
        {/* Verification Callback */}
        <LocaleAwareRoute path="/verification/callback" component={VerificationCallback} />
        
        {/* Subscription Success */}
        <Route path="/:lang/subscription-success">
          {(params) => <LocaleAwareComponent params={params} Component={SubscriptionSuccessPage} />}
        </Route>
        <Route path="/subscription-success" component={SubscriptionSuccessPage} />

        {/* Protected Routes - All Users */}
        
        {/* Admin Only Routes - Must come before general dashboard routes */}

        <ProtectedRoute path="/:lang/dashboard/security" component={(props) => <LocaleAwareComponent params={props} Component={SecurityPage} />} allowedRoles={["admin"]} />
        <ProtectedRoute path="/dashboard/security" component={SecurityPage} allowedRoles={["admin"]} />
        <ProtectedRoute path="/:lang/dashboard/users" component={(props) => <LocaleAwareComponent params={props} Component={UsersPage} />} allowedRoles={["admin"]} />
        <ProtectedRoute path="/dashboard/users" component={UsersPage} allowedRoles={["admin"]} />
        <ProtectedRoute path="/:lang/dashboard/settings" component={(props) => <LocaleAwareComponent params={props} Component={SettingsPage} />} allowedRoles={["admin"]} />
        <ProtectedRoute path="/dashboard/settings" component={SettingsPage} allowedRoles={["admin"]} />
        <ProtectedRoute path="/:lang/dashboard/verification-management" component={(props) => <LocaleAwareComponent params={props} Component={VerificationManagementPage} />} allowedRoles={["admin"]} />
        <ProtectedRoute path="/dashboard/verification-management" component={VerificationManagementPage} allowedRoles={["admin"]} />
        <ProtectedRoute path="/:lang/dashboard/approvals" component={(props) => <LocaleAwareComponent params={props} Component={ApprovalsPage} />} allowedRoles={["admin"]} />
        <ProtectedRoute path="/dashboard/approvals" component={ApprovalsPage} allowedRoles={["admin"]} />

        {/* Dashboard */}
        <ProtectedRoute path="/:lang/dashboard" component={(props) => <LocaleAwareComponent params={props} Component={DashboardPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Favorites */}
        <ProtectedRoute path="/:lang/dashboard/favorites" component={(props) => <LocaleAwareComponent params={props} Component={FavoritesPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/favorites" component={(props) => <LocaleAwareComponent params={{}} Component={FavoritesPage} />} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Favorites */}
        <ProtectedRoute path="/:lang/favorites" component={(props) => <LocaleAwareComponent params={props} Component={FavoritesPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/favorites" component={FavoritesPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Messages */}
        <ProtectedRoute path="/:lang/dashboard/messages" component={(props) => <LocaleAwareComponent params={props} Component={MessagesPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/messages" component={MessagesPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Messages */}
        <ProtectedRoute path="/:lang/messages" component={(props) => <LocaleAwareComponent params={props} Component={MessagesPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/messages" component={MessagesPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Profile */}
        <ProtectedRoute path="/:lang/dashboard/profile" component={(props) => <LocaleAwareComponent params={props} Component={ProfilePage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/profile" component={ProfilePage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Verification */}
        <ProtectedRoute path="/:lang/dashboard/verification" component={(props) => <LocaleAwareComponent params={props} Component={VerificationPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/verification" component={VerificationPage} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/:lang/dashboard/verification-guide" component={(props) => <LocaleAwareComponent params={props} Component={VerificationGuidePage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/verification-guide" component={VerificationGuidePage} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/:lang/dashboard/verification/callback" component={(props) => <LocaleAwareComponent params={props} Component={VerificationCallback} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/verification/callback" component={VerificationCallback} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Documents */}
        <ProtectedRoute path="/:lang/dashboard/documents" component={(props) => <LocaleAwareComponent params={props} Component={DocumentsPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/documents" component={DocumentsPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Enhanced Dashboard Documents */}
        <ProtectedRoute path="/:lang/dashboard/documents/enhanced" component={(props) => <LocaleAwareComponent params={props} Component={DocumentsDashboardPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/documents/enhanced" component={DocumentsDashboardPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Documents */}
        <ProtectedRoute path="/:lang/documents" component={(props) => <LocaleAwareComponent params={props} Component={DocumentsPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/documents" component={DocumentsPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Dashboard Tours */}
        <ProtectedRoute path="/:lang/dashboard/tours" component={(props) => <LocaleAwareComponent params={props} Component={ToursPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/tours" component={ToursPage} allowedRoles={["user", "agent", "admin"]} />
        
        {/* Enhanced Dashboard Tours with Calendar */}
        <ProtectedRoute path="/:lang/dashboard/tours/calendar" component={(props) => <LocaleAwareComponent params={props} Component={EnhancedToursPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/tours/calendar" component={EnhancedToursPage} allowedRoles={["user", "agent", "admin"]} />
        <LocaleAwareRoute path="/support" component={SupportPage} allowedRoles={["user", "agent", "admin"]} />
        <LocaleAwareRoute path="/wishlists" component={WishlistsPage} allowedRoles={["user", "agent", "admin"]} />
        <LocaleAwareRoute path="/wishlists/:id" component={WishlistDetailPage} allowedRoles={["user", "agent", "admin"]} />
        {/* Subscription - Protected */}
        <ProtectedRoute path="/:lang/subscription" component={(props) => <LocaleAwareComponent params={props} Component={SubscriptionPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/subscription" component={SubscriptionPage} allowedRoles={["user", "agent", "admin"]} />

        {/* Agent & Admin Routes */}
        <ProtectedRoute path="/:lang/dashboard/properties" component={(props) => <LocaleAwareComponent params={props} Component={SimplePropertiesPage} />} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/dashboard/properties" component={SimplePropertiesPage} allowedRoles={["agent", "admin"]} />
        
        <ProtectedRoute path="/:lang/dashboard/properties/new" component={(props) => <LocaleAwareComponent params={props} Component={AddPropertyPage} />} allowedRoles={["user", "agent", "admin"]} />
        <ProtectedRoute path="/dashboard/properties/new" component={AddPropertyPage} allowedRoles={["user", "agent", "admin"]} />
        
        <ProtectedRoute path="/:lang/dashboard/properties/edit/:id" component={(props) => <LocaleAwareComponent params={props} Component={EditPropertyPage} />} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/dashboard/properties/edit/:id" component={EditPropertyPage} allowedRoles={["agent", "admin"]} />
        
        {/* Bulk Upload - Only for admins, agency admins, and verified agents */}
        <ProtectedRoute 
          path="/:lang/bulk-upload" 
          component={(props) => <LocaleAwareComponent params={props} Component={BulkUploadPage} />}
          allowedRoles={["admin", "agency_admin", "agent", "agency_agent"]}
        />
        <ProtectedRoute 
          path="/bulk-upload" 
          component={BulkUploadPage} 
          allowedRoles={["admin", "agency_admin", "agent", "agency_agent"]}
        />
        
        <ProtectedRoute 
          path="/:lang/dashboard/properties/wizard" 
          component={(props) => <LocaleAwareComponent params={props} Component={AddPropertyWizardPage} />}
          allowedRoles={["user", "agent", "admin"]}
        />
        <ProtectedRoute 
          path="/dashboard/properties/wizard" 
          component={AddPropertyWizardPage} 
          allowedRoles={["user", "agent", "admin"]}
        />
        {/* Add Property Wizard - Protected */}
        <ProtectedRoute 
          path="/:lang/add-property-wizard" 
          component={(props) => <LocaleAwareComponent params={props} Component={AddPropertyWizardPage} />} 
          allowedRoles={["user", "agent", "admin"]}
        />
        <ProtectedRoute 
          path="/add-property-wizard" 
          component={AddPropertyWizardPage} 
          allowedRoles={["user", "agent", "admin"]}
        />
        
        {/* Add Property Wizard UploadCare Test - Protected (TEST ONLY) */}
        <ProtectedRoute 
          path="/:lang/add-property-wizard-uploadcare-test" 
          component={(props) => <LocaleAwareComponent params={props} Component={AddPropertyWizardUploadCareTestPage} />} 
          allowedRoles={["agent", "admin"]}
        />
        <ProtectedRoute 
          path="/add-property-wizard-uploadcare-test" 
          component={AddPropertyWizardUploadCareTestPage} 
          allowedRoles={["agent", "admin"]}
        />
        
        {/* Testing routes - placed early to avoid conflicts */}
        <Route path="/basic-test" component={BasicTest} />
        <Route path="/:lang/basic-test" component={(props) => <LocaleAwareComponent params={props} Component={BasicTest} />} />
        <Route path="/simple-upload-test" component={SimpleUploadTest} />
        <Route path="/:lang/simple-upload-test" component={(props) => <LocaleAwareComponent params={props} Component={SimpleUploadTest} />} />
        <Route path="/uploadcare-debug" component={UploadCareTestDebug} />
        <Route path="/:lang/uploadcare-debug" component={(props) => <LocaleAwareComponent params={props} Component={UploadCareTestDebug} />} />
        <Route path="/uploadcare-test-unprotected" component={AddPropertyWizardUploadCareTestPage} />
        <Route path="/:lang/uploadcare-test-unprotected" component={(props) => <LocaleAwareComponent params={props} Component={AddPropertyWizardUploadCareTestPage} />} />
        <ProtectedRoute path="/:lang/dashboard/analytics" component={(props) => <LocaleAwareComponent params={props} Component={AgentAnalyticsPage} />} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/dashboard/analytics" component={AgentAnalyticsPage} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/:lang/dashboard/analytics-simple" component={(props) => <LocaleAwareComponent params={props} Component={AgentAnalyticsPageSimple} />} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/dashboard/analytics-simple" component={AgentAnalyticsPageSimple} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/:lang/dashboard/analytics-test" component={(props) => <LocaleAwareComponent params={props} Component={AnalyticsTestPage} />} allowedRoles={["agent", "admin"]} />
        <ProtectedRoute path="/dashboard/analytics-test" component={AnalyticsTestPage} allowedRoles={["agent", "admin"]} />
        <LocaleAwareRoute path="/dashboard/agent-tours" component={AgentToursPage} allowedRoles={["agent", "admin"]} />
        <LocaleAwareRoute path="/agent/tours" component={AgentToursPage} allowedRoles={["agent", "admin"]} />
        <LocaleAwareRoute path="/agent/properties" component={SimplePropertiesPage} allowedRoles={["agent", "admin"]} />
        <LocaleAwareRoute path="/agent/premium" component={AgentPremiumPage} allowedRoles={["agent", "admin"]} />

        
        {/* Bare locale URL (e.g., /en-GB) -> home page */}
        <Route path="/:lang" exact>
          {(params) => <LocaleAwareComponent params={params} Component={HomePage} />}
        </Route>
        
        {/* Root redirect to dashboard for authenticated users */}
        <Route path="/" exact>
          {() => {
            console.log('Root route accessed, redirecting based on auth status');
            const { user, isLoading } = useAuth();
            
            if (isLoading) {
              return (
                <div className="flex items-center justify-center min-h-screen">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              );
            }
            
            if (user) {
              // Authenticated user - redirect to dashboard
              window.location.href = '/dashboard';
              return null;
            } else {
              // Unauthenticated user - redirect to auth
              window.location.href = '/auth';
              return null;
            }
          }}
        </Route>
        
        {/* Home route - must be last specific route */}
        <LocaleAwareRoute path="/home" component={HomePage} />
        
        {/* Agency Onboarding */}
        <Route path="/agency-onboarding" component={AgencyOnboardingPage} />
        
        {/* Onboarding Popup - Temporarily disabled for testing */}
        {/* <OnboardingPopup /> */}
        
        {/* 404 Not Found */}
        <Route component={NotFound} />
      </Switch>
      
      <ContactButton />
      <ConsentBanner />
      <Toaster />
    </ErrorBoundary>
  );
}

function App() {
  // Inject analytics scripts conditionally (not on dashboard/admin)
  return (
    <HelmetProvider>
      {/* <AnalyticsScripts /> */}
      <AppContent />
    </HelmetProvider>
  );
}

export default App;