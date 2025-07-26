/**
 * Cloudinary Service for image uploads
 * Handles direct upload to Cloudinary and returns optimized URLs
 */

/**
 * Validate blob/file before upload
 * @param blob - The blob or file to validate
 * @throws Error if validation fails
 */
function validateBlob(blob: Blob | File) {
  if (!blob) {
    throw new Error('No blob or file provided');
  }

  // Check if it's an image
  if (!blob.type.startsWith('image/')) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Check file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (blob.size > MAX_SIZE) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
}

/**
 * Upload an image blob to Cloudinary
 * @param blob - The image blob to upload
 * @param folder - Optional folder name in Cloudinary (not needed if preset already has a public_id prefix)
 * @returns Promise with the Cloudinary URL
 */
export async function uploadToCloudinary(
  blob: Blob | File,
  folder?: string
): Promise<string> {
  try {
    // Validate blob before proceeding
    validateBlob(blob);

    // Create FormData object
    const formData = new FormData();
    formData.append('file', blob);
    
    // Get Cloudinary cloud name from environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlenyoj86';
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }
    
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'property_images';
    formData.append('upload_preset', uploadPreset);
    
    if (folder) {
      formData.append('folder', folder);
    }
    
    console.log('Starting Cloudinary upload with config:', {
      cloudName,
      uploadPreset,
      folder: folder || 'default from preset',
      fileType: blob.type,
      fileSize: blob.size
    });
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    // Upload to Cloudinary using fetch API
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      if (errorData.error?.message?.includes('Unknown API key') || errorData.error?.message?.includes('unsigned preset')) {
        throw new Error(`Upload preset configuration error. Please ensure "${uploadPreset}" preset is set to Unsigned in Cloudinary dashboard.`);
      }
      
      throw new Error(errorData.error?.message || 'Upload failed');
    }
    
    const data = await response.json();
    
    // Return the secure URL that Cloudinary provides
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 