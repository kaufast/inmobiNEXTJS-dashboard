import React, { useState } from 'react';
import ImageEditor from '../property/ImageEditor';

const ImageEditorTest: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageProcessed = (file: File, url: string) => {
    setUploadedFile(file);
    setUploadedUrl(url);
    setError(null);
    console.log("Image processed successfully:", { file, url });
  };
  
  return (
    <div className="image-editor-test">
      <h2 className="text-2xl font-bold mb-4">Image Editor Test</h2>
      
      <div className="space-y-8">
        <ImageEditor onImageProcessed={handleImageProcessed} />
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {uploadedUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Upload Successful</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Uploaded Image</h4>
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded" 
                  className="max-w-full h-auto rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">File Details</h4>
                <pre className="bg-white p-3 rounded-md text-xs overflow-auto border">
                  {uploadedFile && JSON.stringify({
                    name: uploadedFile.name,
                    type: uploadedFile.type,
                    size: Math.round(uploadedFile.size / 1024) + ' KB',
                    lastModified: new Date(uploadedFile.lastModified).toISOString()
                  }, null, 2)}
                </pre>
                
                <h4 className="text-sm font-medium mt-4 mb-2">Cloudinary URL</h4>
                <div className="bg-white p-3 rounded-md text-xs overflow-auto border break-all">
                  <a 
                    href={uploadedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {uploadedUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Debugging Information</h3>
          <p className="text-sm text-gray-600">
            Check your browser's console for detailed logs from the Cloudinary upload process.
            If you're encountering errors, they will be logged there.
          </p>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Common Issues:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Make sure the "property_images" upload preset is set to <strong>Unsigned</strong> in your Cloudinary dashboard</li>
              <li>Check that CORS settings in Cloudinary allow uploads from your domain</li>
              <li>If using Safari, try Chrome or Firefox as an alternative test</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorTest; 