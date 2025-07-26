import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../services/cloudinary';

interface CloudinaryUploadProps {
  onUploadSuccess?: (url: string) => void;
  folder?: string;
  className?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadSuccess,
  folder,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);

    try {
      // Pass the folder only if it's explicitly provided
      const url = folder ? await uploadToCloudinary(file, folder) : await uploadToCloudinary(file);
      setUploadedUrl(url);
      
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="cloudinary-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <button
        onClick={triggerFileSelect}
        disabled={isUploading}
        className={className}
      >
        {isUploading ? 'Uploading...' : 'Upload Image (Direct)'}
      </button>
      
      {error && <p className="error-message" style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
      
      {uploadedUrl && (
        <div className="uploaded-image" style={{ marginTop: '16px' }}>
          <img 
            src={uploadedUrl} 
            alt="Uploaded" 
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
          />
          <p style={{ fontSize: '0.8rem', overflowWrap: 'break-word' }}>{uploadedUrl}</p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload; 