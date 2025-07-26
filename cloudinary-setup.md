# Cloudinary Integration for Property Image Uploads

This guide explains how to set up and configure Cloudinary for optimized image uploads in the property listing application.

## Setup Steps

1. **Create a Cloudinary Account**
   - Sign up at [https://cloudinary.com/](https://cloudinary.com/)
   - The free tier offers generous limits for small to medium applications

2. **Configure Environment Variables**
   - Create or update your `.env` file in the client directory with these variables:
   ```
   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=property_images
   ```

3. **Create an Upload Preset**
   - Log in to your Cloudinary dashboard
   - Go to Settings > Upload
   - Create a new upload preset named `property_images`
   - Set it to "Unsigned" for client-side uploads
   - Configure the following settings:
     - Folder: `property_images`
     - Delivery Type: Upload
     - Format: Auto (WebP when possible)
     - Quality: Auto
     - Enable eager transformations for responsive images

## Usage Notes

- The integration automatically uploads cropped images to Cloudinary
- Images are automatically converted to WebP format for optimal performance
- Cloudinary CDN distributes images globally for faster loading
- You can configure additional transformations in the Cloudinary dashboard

## Sample .env Configuration

```
# API URL
VITE_API_URL=http://localhost:3000/api

# Environment
VITE_NODE_ENV=development

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Public Key (for payments)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=property_images
```

## Benefits of Cloudinary

- Automatic format optimization (WebP, AVIF)
- Responsive images with different sizes
- Advanced image compression
- Global CDN distribution
- Automatic backup of original images
- Image transformations and filtering
- Video support for property tours 