# Cloudinary Image Upload Integration

This document explains how to use Cloudinary image upload functionality in the application.

## Overview

The application supports two methods for uploading images to Cloudinary:

1. **Cloudinary Widget** (Recommended): A hosted and maintained widget that handles the upload process
2. **Direct Upload**: A custom implementation using Cloudinary's upload API

Based on testing, particularly with Safari browser support, the Cloudinary Widget approach is recommended for production use.

## Implementation

### Using the Cloudinary Widget Component

```tsx
import { CloudinaryWidget } from '@/components/debug';

// In your component
const MyComponent = () => {
  const handleUploadSuccess = (url, info) => {
    console.log('Uploaded image URL:', url);
    console.log('Image information:', info);
    
    // Use the URL as needed, e.g., save to database
    saveImageToDatabase(url);
  };
  
  return (
    <div>
      <h2>Upload Property Image</h2>
      <CloudinaryWidget 
        onUploadSuccess={handleUploadSuccess} 
        folder="property_images" 
        buttonText="Upload Image" 
      />
    </div>
  );
};
```

### Using Direct Upload (Advanced)

```tsx
import { CloudinaryUpload } from '@/components/debug';
// OR
import { uploadToCloudinary } from '@/services/cloudinary';

// Option 1: Using the component
const MyComponent = () => {
  const handleUploadSuccess = (url) => {
    console.log('Uploaded image URL:', url);
    // Use the URL as needed
  };
  
  return (
    <div>
      <CloudinaryUpload 
        onUploadSuccess={handleUploadSuccess} 
        folder="property_images" 
      />
    </div>
  );
};

// Option 2: Using the service directly
const handleFileUpload = async (file) => {
  try {
    const url = await uploadToCloudinary(file, 'property_images');
    console.log('Uploaded image URL:', url);
    // Use the URL as needed
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Cloudinary Configuration

The application is configured to use:

- Cloud name: `dlenyoj86` (can be overridden with `VITE_CLOUDINARY_CLOUD_NAME` environment variable)
- Upload preset: `property_images` (must be set to **Unsigned** in the Cloudinary dashboard)
- Default folder: `properties` (can be customized when using the components)

## Troubleshooting

1. **"Unknown API key" errors**: Ensure your upload preset is set to **Unsigned** in the Cloudinary dashboard
2. **Safari upload issues**: Safari has stricter security policies; the Cloudinary Widget handles these automatically
3. **Cross-origin issues**: If using direct upload in development, ensure your development server is configured correctly

## Testing

A debug page is available at `/debug` with a "Cloudinary Upload" tab that lets you test both upload methods.

## Recommendations

The Cloudinary Widget is recommended because:

- It works reliably across all browsers
- It provides built-in image editing capabilities (crop, rotate, etc.)
- It handles upload progress and error states gracefully
- It's maintained by Cloudinary and kept up-to-date with browser security changes 