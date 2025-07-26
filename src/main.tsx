import React from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/use-auth';
import App from './App';
import i18n from './i18n';
import './index.css';
// Remove custom I18nProvider import
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { LanguageProvider } from "@/hooks/use-language";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import { Router } from "wouter";
import { queryClient } from "./lib/queryClient";

// Import server logger
// import { logInfo } from './utils/server-logger';

// Log i18n initialization status to file and console
// logInfo('MAIN.TSX I18N INITIALIZATION - Starting app with i18n', {
//   initialized: i18n.isInitialized,
//   language: i18n.language,
//   languages: i18n.languages,
//   serviceLoaded: i18n.services.resourceStore.data !== undefined,
//   resourceStoreKeys: i18n.services.resourceStore.data ? Object.keys(i18n.services.resourceStore.data) : 'NO DATA'
// });

// Log application initialization
console.log('Starting application initialization...');

// Get the root element
const rootElement = document.getElementById('root');

// Check if root element exists
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}

// Create root
const root = createRoot(rootElement);

// Render the app
try {
  console.log('Rendering App component...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <LanguageProvider>
                <AuthProvider>
                  <FavoritesProvider>
                    <TooltipProvider>
                      <App />
                    </TooltipProvider>
                  </FavoritesProvider>
                </AuthProvider>
              </LanguageProvider>
            </I18nextProvider>
          </QueryClientProvider>
        </Router>
        <Toaster />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error rendering App component:', error);
  // Display error message to user
  root.render(
    <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1>Error Loading Application</h1>
      <p>There was an error loading the application. Please try refreshing the page.</p>
      <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );
}
