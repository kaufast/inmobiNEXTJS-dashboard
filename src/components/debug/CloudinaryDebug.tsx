import React, { useState } from 'react';
import CloudinaryWidget from './CloudinaryWidget';
import CloudinaryUpload from './CloudinaryUpload';

const CloudinaryDebug: React.FC = () => {
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetInfo, setWidgetInfo] = useState<any>(null);
  const [directUrl, setDirectUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'widget' | 'direct'>('widget');

  const handleWidgetUploadSuccess = (url: string, info: any) => {
    setWidgetUrl(url);
    setWidgetInfo(info);
  };

  const handleDirectUploadSuccess = (url: string) => {
    setDirectUrl(url);
  };

  return (
    <div className="cloudinary-debug" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Cloudinary Upload Testing</h2>
      
      <div className="tabs" style={{ display: 'flex', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('widget')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'widget' ? '#3448C5' : '#f0f0f0',
            color: activeTab === 'widget' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 0 0 4px',
            cursor: 'pointer'
          }}
        >
          Widget Upload (Recommended)
        </button>
        <button 
          onClick={() => setActiveTab('direct')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'direct' ? '#3448C5' : '#f0f0f0',
            color: activeTab === 'direct' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer'
          }}
        >
          Direct Upload (Testing)
        </button>
      </div>
      
      <div className="tab-content" style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
        {activeTab === 'widget' ? (
          <div className="widget-upload">
            <h3>Cloudinary Widget Upload</h3>
            <p>This method uses Cloudinary's pre-built widget and works reliably across browsers.</p>
            
            <CloudinaryWidget 
              onUploadSuccess={handleWidgetUploadSuccess}
              buttonText="Open Upload Widget"
              className="upload-button"
            />
            
            {widgetUrl && (
              <div className="result-section" style={{ marginTop: '20px' }}>
                <h4>Upload Result</h4>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <img 
                      src={widgetUrl} 
                      alt="Uploaded via widget" 
                      style={{ maxWidth: '100%', borderRadius: '4px' }} 
                    />
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <h5>Image Information</h5>
                    {widgetInfo && (
                      <pre style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '8px', 
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '12px'
                      }}>
                        {JSON.stringify({
                          publicId: widgetInfo.public_id,
                          url: widgetInfo.secure_url,
                          format: widgetInfo.format,
                          width: widgetInfo.width,
                          height: widgetInfo.height
                        }, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="direct-upload">
            <h3>Direct Cloudinary Upload</h3>
            <p>This method uses direct API upload. May have issues with Safari browser security.</p>
            
            <CloudinaryUpload 
              onUploadSuccess={handleDirectUploadSuccess}
              className="upload-button"
            />
            
            {directUrl && (
              <div className="result-section" style={{ marginTop: '20px' }}>
                <h4>Upload Result</h4>
                <p><strong>URL:</strong> {directUrl}</p>
              </div>
            )}
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff8e6', borderRadius: '4px' }}>
              <h4>Debug Notes</h4>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Direct uploads use the <code>property_images</code> unsigned upload preset.</li>
                <li>If you encounter "Unknown API key" errors, check that your upload preset is set to <strong>Unsigned</strong> in the Cloudinary dashboard.</li>
                <li>Safari may block direct uploads due to security restrictions.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="recommendations" style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '4px' }}>
        <h3>Implementation Recommendations</h3>
        <p>Based on testing, we recommend using the Cloudinary Widget approach because:</p>
        <ul>
          <li>It works reliably across browsers including Safari</li>
          <li>It provides image editing capabilities (crop, rotate, etc.)</li>
          <li>It handles upload progress and error states</li>
          <li>It's maintained by Cloudinary and kept up-to-date with browser security changes</li>
        </ul>
      </div>
    </div>
  );
};

export default CloudinaryDebug; 