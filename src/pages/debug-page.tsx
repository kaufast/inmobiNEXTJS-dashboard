import React from "react";

export default function DebugPage() {
  console.log('DebugPage rendering');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page</h1>
      <p>If you can see this, React is working correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>User agent: {navigator.userAgent}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Links:</h2>
        <ul>
          <li><a href="/dashboard/analytics-test">Analytics Test Page</a></li>
          <li><a href="/dashboard/analytics-simple">Analytics Simple Page</a></li>
          <li><a href="/dashboard/analytics">Analytics Full Page</a></li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test API:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/analytics/dashboard', {
                credentials: 'include',
              });
              const data = await response.json();
              console.log('API Response:', data);
              alert('Check console for API response');
            } catch (error) {
              console.error('API Error:', error);
              alert('API Error: ' + error.message);
            }
          }}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Analytics API
        </button>
      </div>
    </div>
  );
}