/**
 * Uploadcare utilities and validation functions
 */

/**
 * Validates if Uploadcare is properly configured
 */
export function isUploadcareConfigured(): boolean {
  const publicKey = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
  return Boolean(publicKey && publicKey.length > 0);
}

/**
 * Gets the Uploadcare public key from environment variables
 */
export function getUploadcarePublicKey(): string | null {
  const publicKey = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
  return publicKey || null;
}

/**
 * Validates if an Uploadcare URL is valid
 */
export function isValidUploadcareUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if URL is from Uploadcare CDN
  const uploadcareRegex = /^https:\/\/ucarecdn\.com\/[a-f0-9-]+/;
  return uploadcareRegex.test(url);
}

/**
 * Extracts the file UUID from an Uploadcare URL
 */
export function extractUploadcareUuid(url: string): string | null {
  if (!isValidUploadcareUrl(url)) return null;
  
  const match = url.match(/\/([a-f0-9-]+)\//);
  return match ? match[1] : null;
}

/**
 * Creates an Uploadcare URL with transformations
 */
export function createUploadcareUrl(
  uuid: string, 
  transformations: string = ''
): string {
  const baseUrl = `https://ucarecdn.com/${uuid}/`;
  return transformations ? `${baseUrl}${transformations}` : baseUrl;
}

/**
 * Common Uploadcare transformations
 */
export const UploadcareTransformations = {
  /**
   * Creates a preview transformation URL
   */
  preview: (width: number = 300, height: number = 300) => 
    `-/preview/${width}x${height}/`,
  
  /**
   * Creates a resize transformation URL
   */
  resize: (width: number, height?: number) => 
    height ? `-/resize/${width}x${height}/` : `-/resize/${width}x/`,
  
  /**
   * Creates a crop transformation URL
   */
  crop: (width: number, height: number) => 
    `-/crop/${width}x${height}/center/`,
  
  /**
   * Creates a quality transformation URL
   */
  quality: (quality: number) => 
    `-/quality/${quality}/`,
  
  /**
   * Creates a format transformation URL
   */
  format: (format: 'jpeg' | 'png' | 'webp' | 'auto') => 
    `-/format/${format}/`,
};

/**
 * Error messages for Uploadcare issues
 */
export const UploadcareErrors = {
  MISSING_CONFIG: 'Uploadcare is not configured. Please add VITE_UPLOADCARE_PUBLIC_KEY to your environment variables.',
  INVALID_URL: 'Invalid Uploadcare URL provided.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  NETWORK_ERROR: 'Network error occurred during upload. Please check your connection.',
};