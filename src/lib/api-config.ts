/**
 * Smart API URL detection to prevent port mismatch issues
 */

export function getApiBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return ''; // Same domain in production
  }

  // Check if we have an explicit API URL set
  if (process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  // Try to detect the API port by testing common ports
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  
  // Common backend ports to try
  const commonPorts = [8090, 8080, 3001, 4000, 5000, 8000];
  
  // If frontend is on a port, try backend on the most common ports
  return `${currentProtocol}//${currentHost}:8090`; // Default to 8090
}

/**
 * Test if a given API URL is reachable
 */
export async function testApiConnection(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Auto-detect the correct API URL by testing common ports
 */
export async function autoDetectApiUrl(): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }

  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  const commonPorts = [8090, 8080, 3001, 4000, 5000, 8000];

  // Test each port to find a working backend
  for (const port of commonPorts) {
    const testUrl = `${currentProtocol}//${currentHost}:${port}`;
    console.log(`Testing API connection to ${testUrl}...`);
    
    if (await testApiConnection(testUrl)) {
      console.log(`✅ Found working API at ${testUrl}`);
      return testUrl;
    }
  }

  // Fallback to default
  console.warn('⚠️ No API server found, using default port 8090');
  return `${currentProtocol}//${currentHost}:8090`;
}