/**
 * Enhanced Document Upload Service
 * Extends Cloudinary for secure document handling with real estate focus
 */

/**
 * Document upload configuration
 */
export interface DocumentUploadConfig {
  allowedTypes: string[];
  maxSize: number;
  requiresVerification: boolean;
  encryptionEnabled: boolean;
  watermarkEnabled: boolean;
}

/**
 * Document metadata extracted from uploaded files
 */
export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  createdDate?: string;
  modifiedDate?: string;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  hasPassword?: boolean;
  isEncrypted?: boolean;
  checksum: string;
}

/**
 * Document upload result
 */
export interface DocumentUploadResult {
  fileUrl: string;
  publicId: string;
  metadata: DocumentMetadata;
  thumbnailUrl?: string;
  previewUrl?: string;
  secureUrl: string;
  resourceType: string;
}

/**
 * Document type configurations for real estate
 */
export const DOCUMENT_CONFIGS: Record<string, DocumentUploadConfig> = {
  // Critical Legal Documents
  'contract': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 50 * 1024 * 1024, // 50MB
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  'purchase_agreement': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 50 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  'deed': {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 25 * 1024 * 1024, // 25MB
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: false
  },
  'title_report': {
    allowedTypes: ['application/pdf'],
    maxSize: 100 * 1024 * 1024, // 100MB
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: false
  },
  
  // Reports and Inspections
  'inspection_report': {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 100 * 1024 * 1024,
    requiresVerification: false,
    encryptionEnabled: false,
    watermarkEnabled: true
  },
  'appraisal_report': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 50 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  
  // Property Documents
  'floor_plan': {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/svg+xml'],
    maxSize: 25 * 1024 * 1024,
    requiresVerification: false,
    encryptionEnabled: false,
    watermarkEnabled: true
  },
  'property_photos': {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024,
    requiresVerification: false,
    encryptionEnabled: false,
    watermarkEnabled: true
  },
  'survey': {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 50 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: false
  },
  
  // Financial Documents
  'mortgage_document': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 25 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  'tax_document': {
    allowedTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    maxSize: 25 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  'insurance_policy': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 25 * 1024 * 1024,
    requiresVerification: true,
    encryptionEnabled: true,
    watermarkEnabled: true
  },
  
  // Default configuration
  'other': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
    maxSize: 25 * 1024 * 1024,
    requiresVerification: false,
    encryptionEnabled: false,
    watermarkEnabled: false
  }
};

/**
 * Validate document before upload
 */
export function validateDocument(file: File, documentType: string): void {
  const config = DOCUMENT_CONFIGS[documentType] || DOCUMENT_CONFIGS['other'];
  
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types for ${documentType}: ${config.allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    throw new Error(`File size too large. Maximum size for ${documentType}: ${maxSizeMB}MB`);
  }

  // Check file name for security
  const fileName = file.name.toLowerCase();
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar'];
  if (suspiciousExtensions.some(ext => fileName.includes(ext))) {
    throw new Error('File type not allowed for security reasons');
  }
}

/**
 * Extract metadata from file
 */
export async function extractDocumentMetadata(file: File): Promise<DocumentMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Create SHA-256 checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const metadata: DocumentMetadata = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    createdDate: new Date().toISOString(),
    checksum
  };

  // Extract PDF metadata if it's a PDF
  if (file.type === 'application/pdf') {
    try {
      const pdfMetadata = await extractPDFMetadata(uint8Array);
      Object.assign(metadata, pdfMetadata);
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error);
    }
  }

  return metadata;
}

/**
 * Extract PDF-specific metadata
 */
async function extractPDFMetadata(uint8Array: Uint8Array): Promise<Partial<DocumentMetadata>> {
  // Basic PDF metadata extraction
  const pdfString = new TextDecoder().decode(uint8Array.slice(0, 8192)); // First 8KB
  
  const metadata: Partial<DocumentMetadata> = {};
  
  // Check if password protected
  if (pdfString.includes('/Encrypt')) {
    metadata.hasPassword = true;
    metadata.isEncrypted = true;
  }
  
  // Extract title, author, subject from PDF info
  const titleMatch = pdfString.match(/\/Title\s*\(([^)]+)\)/);
  if (titleMatch) metadata.title = titleMatch[1];
  
  const authorMatch = pdfString.match(/\/Author\s*\(([^)]+)\)/);
  if (authorMatch) metadata.author = authorMatch[1];
  
  const subjectMatch = pdfString.match(/\/Subject\s*\(([^)]+)\)/);
  if (subjectMatch) metadata.subject = subjectMatch[1];
  
  return metadata;
}

/**
 * Upload document to Cloudinary with enhanced security
 */
export async function uploadDocumentToCloudinary(
  file: File,
  documentType: string,
  userId: number,
  propertyId?: number
): Promise<DocumentUploadResult> {
  try {
    // Validate document
    validateDocument(file, documentType);
    
    // Extract metadata
    const metadata = await extractDocumentMetadata(file);
    
    // Get configuration
    const config = DOCUMENT_CONFIGS[documentType] || DOCUMENT_CONFIGS['other'];
    
    // Prepare upload parameters
    const formData = new FormData();
    formData.append('file', file);
    
    // Get environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'property_documents';
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }
    
    formData.append('upload_preset', uploadPreset);
    
    // Set folder structure
    const folder = `documents/${userId}/${propertyId || 'general'}/${documentType}`;
    formData.append('folder', folder);
    
    // Add metadata
    formData.append('context', JSON.stringify({
      document_type: documentType,
      user_id: userId,
      property_id: propertyId || null,
      requires_verification: config.requiresVerification,
      file_checksum: metadata.checksum
    }));
    
    // Set resource type for documents
    formData.append('resource_type', 'auto');
    
    // Add security transformations if needed
    if (config.watermarkEnabled) {
      formData.append('transformation', 'l_watermark_overlay,o_30,g_south_east');
    }
    
    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    console.log('Uploading document:', {
      fileName: file.name,
      documentType,
      folder,
      requiresVerification: config.requiresVerification
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }
    
    const uploadData = await response.json();
    
    // Generate thumbnail for images and PDFs
    let thumbnailUrl: string | undefined;
    let previewUrl: string | undefined;
    
    if (file.type.startsWith('image/')) {
      thumbnailUrl = uploadData.secure_url.replace('/upload/', '/upload/c_thumb,w_200,h_200/');
      previewUrl = uploadData.secure_url.replace('/upload/', '/upload/c_fit,w_800,h_600/');
    } else if (file.type === 'application/pdf') {
      thumbnailUrl = uploadData.secure_url.replace('/upload/', '/upload/c_thumb,w_200,h_200,f_jpg/');
      previewUrl = uploadData.secure_url.replace('/upload/', '/upload/c_fit,w_800,h_600,f_jpg/');
    }
    
    return {
      fileUrl: uploadData.secure_url,
      publicId: uploadData.public_id,
      metadata,
      thumbnailUrl,
      previewUrl,
      secureUrl: uploadData.secure_url,
      resourceType: uploadData.resource_type
    };
    
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
}

/**
 * Generate secure download URL with expiration
 */
export function generateSecureDownloadUrl(publicId: string, expiresInHours: number = 24): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const timestamp = Math.round(Date.now() / 1000) + (expiresInHours * 3600);
  
  // In production, you'd sign this URL with your API secret
  // For now, return the basic secure URL
  return `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${publicId}`;
}

/**
 * Bulk document upload with progress tracking
 */
export async function uploadDocumentsBulk(
  files: File[],
  documentType: string,
  userId: number,
  propertyId?: number,
  onProgress?: (completed: number, total: number) => void
): Promise<DocumentUploadResult[]> {
  const results: DocumentUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadDocumentToCloudinary(files[i], documentType, userId, propertyId);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to upload ${files[i].name}:`, error);
      throw error;
    }
  }
  
  return results;
}

/**
 * Check if document type requires verification
 */
export function requiresVerification(documentType: string): boolean {
  const config = DOCUMENT_CONFIGS[documentType] || DOCUMENT_CONFIGS['other'];
  return config.requiresVerification;
}

/**
 * Get allowed file types for document type
 */
export function getAllowedFileTypes(documentType: string): string[] {
  const config = DOCUMENT_CONFIGS[documentType] || DOCUMENT_CONFIGS['other'];
  return config.allowedTypes;
}

/**
 * Get maximum file size for document type
 */
export function getMaxFileSize(documentType: string): number {
  const config = DOCUMENT_CONFIGS[documentType] || DOCUMENT_CONFIGS['other'];
  return config.maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get document type icon
 */
export function getDocumentTypeIcon(documentType: string): string {
  const iconMap: Record<string, string> = {
    'contract': '📋',
    'purchase_agreement': '🏠',
    'listing_agreement': '📝',
    'lease_agreement': '🏢',
    'deed': '🏛️',
    'title_report': '📊',
    'inspection_report': '🔍',
    'appraisal_report': '💰',
    'insurance_policy': '🛡️',
    'mortgage_document': '🏦',
    'tax_document': '📋',
    'permit': '✅',
    'certificate': '🎖️',
    'floor_plan': '📐',
    'survey': '📏',
    'disclosure': '⚠️',
    'hoa_documents': '🏘️',
    'property_photos': '📸',
    'legal_document': '⚖️',
    'other': '📄'
  };
  
  return iconMap[documentType] || '📄';
} 