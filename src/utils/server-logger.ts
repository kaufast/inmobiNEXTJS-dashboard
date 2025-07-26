// Server-side logging utility that sends logs to backend
export async function logToServer(level: string, message: string, data?: any) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Use backend port 8090 in development
    const API_BASE = process.env.NODE_ENV === 'production'
      ? '' 
      : `${window.location.protocol}//${window.location.hostname}:8090`;
    
    await fetch(`${API_BASE}/api/debug/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    // Silently fail - don't break the app for logging
    console.warn('Failed to send log to server:', error);
  }
}

// Enhanced logging functions that also send to server
export const logInfo = (message: string, data?: any) => {
  console.log(`📝 ${message}`, data || '');
  logToServer('INFO', message, data);
};

export const logWarn = (message: string, data?: any) => {
  console.warn(`⚠️ ${message}`, data || '');
  logToServer('WARN', message, data);
};

export const logError = (message: string, data?: any) => {
  console.error(`❌ ${message}`, data || '');
  logToServer('ERROR', message, data);
};