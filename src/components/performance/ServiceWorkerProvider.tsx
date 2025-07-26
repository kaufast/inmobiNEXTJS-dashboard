/**
 * Service Worker Provider and Registration
 * Handles service worker registration, updates, and communication
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ServiceWorkerContextType {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  updateServiceWorker: () => void;
  clearCache: () => Promise<void>;
  preloadRoutes: (urls: string[]) => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | null>(null);

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
  enableUpdateNotification?: boolean;
  enableOfflineNotification?: boolean;
}

export function ServiceWorkerProvider({ 
  children, 
  enableUpdateNotification = true,
  enableOfflineNotification = true 
}: ServiceWorkerProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const swRegistration = await navigator.serviceWorker.register('/sw.js');
      setRegistration(swRegistration);
      setIsRegistered(true);

      console.log('[SW] Service worker registered successfully');

      // Check for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              if (enableUpdateNotification) {
                showUpdateNotification();
              }
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[SW] Cache updated:', event.data.url);
        }
      });

      // Check for waiting service worker
      if (swRegistration.waiting) {
        setUpdateAvailable(true);
        if (enableUpdateNotification) {
          showUpdateNotification();
        }
      }

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('[SW] All caches cleared');
    } catch (error) {
      console.error('[SW] Error clearing cache:', error);
    }
  };

  const preloadRoutes = (urls: string[]) => {
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is available. Click to update.',
        icon: '/images/logo.svg',
        badge: '/images/badge.png'
      });
    }
  };

  // Show offline notification
  useEffect(() => {
    if (!isOnline && enableOfflineNotification) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('You are offline', {
          body: 'You are currently offline. Some features may not be available.',
          icon: '/images/logo.svg',
          badge: '/images/badge.png'
        });
      }
    }
  }, [isOnline, enableOfflineNotification]);

  const value: ServiceWorkerContextType = {
    isSupported,
    isRegistered,
    isOnline,
    updateAvailable,
    registration,
    updateServiceWorker,
    clearCache,
    preloadRoutes
  };

  return (
    <ServiceWorkerContext.Provider value={value}>
      {children}
    </ServiceWorkerContext.Provider>
  );
}

// Hook to use service worker context
export function useServiceWorker() {
  const context = useContext(ServiceWorkerContext);
  if (!context) {
    throw new Error('useServiceWorker must be used within a ServiceWorkerProvider');
  }
  return context;
}

// Update notification component
export function UpdateNotification() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div>
          <h4 className="font-semibold">Update Available</h4>
          <p className="text-sm opacity-90">A new version of the app is ready.</p>
        </div>
        <button
          onClick={updateServiceWorker}
          className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100"
        >
          Update
        </button>
      </div>
    </div>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = useServiceWorker();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
        <span className="text-sm font-medium">You are offline</span>
      </div>
    </div>
  );
}

// Install prompt component
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div>
          <h4 className="font-semibold">Install App</h4>
          <p className="text-sm opacity-90">Install for quick access and offline use.</p>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-white text-green-600 px-3 py-1 rounded font-medium hover:bg-gray-100"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="text-white opacity-75 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Cache management hook
export function useCacheManagement() {
  const { clearCache, preloadRoutes } = useServiceWorker();

  const getCacheSize = async (): Promise<number> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  };

  const getCacheInfo = async () => {
    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          size: keys.length
        };
      })
    );
    return cacheInfo;
  };

  return {
    clearCache,
    preloadRoutes,
    getCacheSize,
    getCacheInfo
  };
}

export default ServiceWorkerProvider;