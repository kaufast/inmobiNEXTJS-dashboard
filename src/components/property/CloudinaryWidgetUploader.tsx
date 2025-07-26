import React, { useEffect, useState, useRef } from 'react';

interface CloudinaryWidgetUploaderProps {
  onUploadSuccess: (url: string, info: any) => void;
  onUploadError?: (error: any) => void;
  cloudName?: string;
  uploadPreset?: string;
  buttonText?: string;
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const CloudinaryWidgetUploader: React.FC<CloudinaryWidgetUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  cloudName = 'dlenyoj86', // Use correct cloud name
  uploadPreset = 'property_images',
  buttonText = 'Upload Image',
  className = '',
  multiple = false,
  maxFiles = 5,
}) => {
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [widget, setWidget] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing CloudinaryWidgetUploader with:', { cloudName, uploadPreset, multiple, maxFiles });
    
    // Check if Cloudinary is available (should be loaded globally)
    const checkCloudinaryReady = () => {
      if (window.cloudinary) {
        console.log('Cloudinary widget script is available');
        setIsWidgetReady(true);
      } else {
        // Wait a bit for the script to load if it's still loading
        setTimeout(() => {
          if (window.cloudinary) {
            setIsWidgetReady(true);
          } else {
            console.error('Cloudinary widget script not available');
            setError('Cloudinary upload service is not available');
          }
        }, 1000);
      }
    };
    
    checkCloudinaryReady();
    
    return () => {
      // Clean up widget if it exists
      if (widget) {
        try {
          widget.close();
        } catch (e) {
          console.error('Error closing widget', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isWidgetReady && window.cloudinary) {
      console.log('Initializing Cloudinary widget with:', { cloudName, uploadPreset, multiple, maxFiles });
      
      try {
        // Initialize the Cloudinary widget
        const widgetInstance = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple,
            maxFiles: multiple ? maxFiles : 1,
            cropping: !multiple, // Only enable cropping for single image upload
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
              if (onUploadError) {
                onUploadError(error);
              }
              return;
            }
            
            if (result && result.event === 'success') {
              console.log('Cloudinary upload success:', result.info);
              const url = result.info.secure_url;
              
              if (onUploadSuccess) {
                onUploadSuccess(url, result.info);
              }
            }
          }
        );
        
        setWidget(widgetInstance);
        console.log('Cloudinary widget initialized successfully');
      } catch (err) {
        console.error('Error creating Cloudinary widget:', err);
        setError('Error initializing Cloudinary widget');
        if (onUploadError) {
          onUploadError(err);
        }
      }
    }
  }, [isWidgetReady, onUploadSuccess, onUploadError, cloudName, uploadPreset, multiple, maxFiles]);

  const openWidget = () => {
    console.log('Opening Cloudinary widget');
    if (widget) {
      setError(null);
      widget.open();
    } else {
      const errorMsg = 'Widget is not yet initialized';
      console.error(errorMsg);
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
    }
  };

  return (
    <div className="cloudinary-widget">
      <button 
        onClick={openWidget} 
        disabled={!isWidgetReady}
        className={className}
        type="button"
      >
        {!isWidgetReady ? 'Loading...' : buttonText}
      </button>
      
      {error && (
        <p className="error-message" style={{ color: 'red', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CloudinaryWidgetUploader; 