import React, { useEffect, useState } from 'react';

interface CloudinaryWidgetProps {
  onUploadSuccess?: (url: string, info: any) => void;
  folder?: string;
  buttonText?: string;
  className?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const CloudinaryWidget: React.FC<CloudinaryWidgetProps> = ({
  onUploadSuccess,
  folder = 'property_images',
  buttonText = 'Upload Image',
  className = '',
}) => {
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [widget, setWidget] = useState<any>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Cloudinary is available (should be loaded globally)
    const checkCloudinaryReady = () => {
      if (window.cloudinary) {
        setIsWidgetReady(true);
      } else {
        // Wait a bit for the script to load if it's still loading
        setTimeout(() => {
          if (window.cloudinary) {
            setIsWidgetReady(true);
          } else {
            setError('Cloudinary upload service is not available');
          }
        }, 1000);
      }
    };
    
    checkCloudinaryReady();
    
    return () => {
      // Clean up widget if it exists
      if (widget) {
        widget.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isWidgetReady && window.cloudinary) {
      // Initialize the Cloudinary widget
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlenyoj86';
      const uploadPreset = 'property_images'; // Your unsigned upload preset
      
      const widgetInstance = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1,
          cropping: true,
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
          maxFileSize: 10000000, // 10MB
          showSkipCropButton: false,
          showUploadMoreButton: false,
          styles: {
            palette: {
              window: "#FFFFFF",
              sourceBg: "#F4F4F5",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              inactiveTabIcon: "#69778A",
              menuIcons: "#0078FF",
              link: "#0078FF",
              action: "#0078FF",
              inProgress: "#0078FF",
              complete: "#20B832",
              error: "#EA2727",
              textDark: "#000000",
              textLight: "#FFFFFF"
            }
          }
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary widget error:', error);
            setError(`Upload error: ${error.message || 'Unknown error'}`);
            return;
          }
          
          if (result && result.event === 'success') {
            const url = result.info.secure_url;
            setUploadedUrl(url);
            
            if (onUploadSuccess) {
              onUploadSuccess(url, result.info);
            }
          }
        }
      );
      
      setWidget(widgetInstance);
    }
  }, [isWidgetReady, onUploadSuccess, folder]);

  const openWidget = () => {
    if (widget) {
      setError(null);
      widget.open();
    } else {
      setError('Widget is not yet initialized');
    }
  };

  return (
    <div className="cloudinary-widget">
      <button 
        onClick={openWidget} 
        disabled={!isWidgetReady}
        className={className}
      >
        {!isWidgetReady ? 'Loading...' : buttonText}
      </button>
      
      {error && <p className="error-message" style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
      
      {uploadedUrl && (
        <div className="uploaded-image" style={{ marginTop: '16px' }}>
          <img 
            src={uploadedUrl} 
            alt="Uploaded" 
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryWidget; 