/**
 * i18n Fix Script
 * 
 * This script patches the i18next initialization to prevent the common 
 * "TypeError: undefined is not an object (evaluating 'i.match')" error.
 * 
 * To use this, include it in your main HTML file after i18next is loaded
 * but before it's initialized.
 */

(function() {
  console.log('[i18n-fix] Installing i18next patches...');
  
  if (typeof window === 'undefined') {
    console.log('[i18n-fix] Not running in browser environment, skipping fixes');
    return;
  }
  
  // Save original console.error to use for logging real errors
  const originalConsoleError = console.error;
  
  // Override console.error to catch and fix i18n errors
  console.error = function(...args) {
    const errorMsg = args.join(' ');
    
    // Check if this is the specific i.match error
    if (errorMsg.includes("undefined is not an object (evaluating 'i.match')")) {
      console.log('[i18n-fix] Caught i.match error, this is likely from i18next');
      
      // Try to fix common issues with i18next
      if (window.i18next) {
        try {
          // Remove the check for 'en' in supportedLngs since we're not using fallbacks
          
          // Monkey patch the t() function to handle undefined inputs
          const originalT = window.i18next.t;
          if (originalT) {
            window.i18next.t = function(key, options) {
              if (key === undefined || key === null) {
                console.log('[i18n-fix] Prevented null key access to t()');
                return '[MISSING_KEY]';
              }
              try {
                return originalT.call(window.i18next, key, options);
              } catch (e) {
                console.log('[i18n-fix] Caught error in t() function:', e.message);
                return key || '[TRANSLATION_ERROR]';
              }
            };
            console.log('[i18n-fix] Patched i18next.t() function');
          }
          
          // Patch language detection but don't add fallbacks
          if (window.i18next.services && window.i18next.services.languageDetector) {
            const originalDetect = window.i18next.services.languageDetector.detect;
            window.i18next.services.languageDetector.detect = function() {
              try {
                const detected = originalDetect.call(this);
                console.log('[i18n-fix] Detected language:', detected);
                return detected || '';  // Return empty string instead of fallback
              } catch (e) {
                console.log('[i18n-fix] Error in language detection:', e.message);
                return '';  // Return empty string instead of fallback
              }
            };
            console.log('[i18n-fix] Patched language detection');
          }
        } catch (e) {
          console.log('[i18n-fix] Error applying fixes:', e.message);
        }
      }
      
      // Still log the original error for debugging
      return originalConsoleError.apply(console, args);
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, args);
  };
  
  // Add global error handler to catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    
    // Check if this is the i.match error
    if (error && error.message && error.message.includes("undefined is not an object (evaluating 'i.match')")) {
      console.log('[i18n-fix] Caught unhandled rejection with i.match error');
      event.preventDefault(); // Prevent the default handler
      
      // Log to help with debugging
      console.log('[i18n-fix] Error stack:', error.stack);
    }
  });
  
  console.log('[i18n-fix] Patches installed successfully');
})(); 