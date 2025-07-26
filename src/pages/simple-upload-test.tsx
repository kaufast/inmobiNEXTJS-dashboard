import React, { useState } from 'react';
import { Widget } from '@uploadcare/react-widget';

export default function SimpleUploadTest() {
  const [uploadStatus, setUploadStatus] = useState('Ready');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadStatus(`Selected ${files.length} file(s)`);
    }
  };

  const handleUploadCareUpload = async (fileInfo: any) => {
    setIsLoading(true);
    setUploadStatus('Processing upload...');

    try {
      console.log('UploadCare upload result:', fileInfo);
      
      if (fileInfo) {
        // Handle single file
        if (!Array.isArray(fileInfo)) {
          setUploadedFiles([fileInfo]);
          setUploadStatus('Successfully uploaded 1 file');
        } else {
          // Handle multiple files
          setUploadedFiles(fileInfo);
          setUploadStatus(`Successfully uploaded ${fileInfo.length} file(s)`);
        }
      } else {
        setUploadStatus('No files selected');
      }
    } catch (error) {
      console.error('UploadCare upload error:', error);
      setUploadStatus('Upload failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleUpload = async (group: any) => {
    setIsLoading(true);
    setUploadStatus('Processing multiple uploads...');

    try {
      // Wait for group to be ready
      await group.promise();
      
      const files = group.files();
      console.log('UploadCare multiple upload result:', files);

      const processedFiles = [];
      for (const file of files) {
        const fileInfo = await file.promise();
        processedFiles.push(fileInfo);
      }

      setUploadedFiles(processedFiles);
      setUploadStatus(`Successfully uploaded ${processedFiles.length} file(s)`);
    } catch (error) {
      console.error('UploadCare multiple upload error:', error);
      setUploadStatus('Upload failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>UploadCare Simple Test</h1>
      
      <div style={{ 
        border: '2px solid #4CAF50', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>UploadCare React Widget Test</h2>
        <p>Status: <strong>{uploadStatus}</strong></p>
        <div style={{ marginTop: '10px' }}>
          <Widget
            publicKey="0765b66fa520b9cf0789"
            multiple={true}
            multipleMax={10}
            imagesOnly={true}
            previewStep={true}
            imageShrink="2048x2048"
            imageResize="2048x2048"
            tabs="file camera url facebook gdrive gphotos dropbox instagram"
            effects="crop,rotate,mirror,flip"
            locale="auto"
            clearable={true}
            cdnBase="https://ucarecdn.com"
            onChange={handleMultipleUpload}
            onFileSelect={handleUploadCareUpload}
            systemDialog={false}
            disabled={isLoading}
          />
        </div>
      </div>

      <div style={{ 
        border: '2px solid #FF9800', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        backgroundColor: '#fff3e0'
      }}>
        <h2>Basic File Upload Test</h2>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          onChange={handleFileUpload}
          style={{ marginTop: '10px' }}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ 
          border: '2px solid #9C27B0', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: '#f3e5f5'
        }}>
          <h3>Uploaded Files</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>File {index + 1}:</strong> {file.name || 'Unknown'}
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  URL: {file.cdnUrl || 'No URL'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ 
        border: '2px solid #2196F3', 
        padding: '20px', 
        borderRadius: '8px', 
        backgroundColor: '#f0f8ff'
      }}>
        <h3>UploadCare Configuration</h3>
        <p>Public Key: <strong>0765b66fa520b9cf0789</strong></p>
        <p>Environment: <strong>Development</strong></p>
        <p>CDN: <strong>ucarecdn.com</strong></p>
        <p>Widget Version: <strong>React Widget 2.4.7</strong></p>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>If you see this page, the React app is working properly.</p>
        <p>WebSocket errors are normal in development and don't affect functionality.</p>
        <p>Access this page at: <strong>http://localhost:3000/simple-upload-test</strong> or <strong>http://localhost:3000/en-GB/simple-upload-test</strong></p>
      </div>
    </div>
  );
}