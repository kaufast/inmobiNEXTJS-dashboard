import React from 'react';

export default function BasicTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ Basic Test Page Working!</h1>
      <p>If you see this page, the routing is working correctly.</p>
      <div style={{ border: '2px solid blue', padding: '15px', margin: '20px 0' }}>
        <h2>Test Information:</h2>
        <ul>
          <li>URL: /basic-test</li>
          <li>Time: {new Date().toLocaleTimeString()}</li>
          <li>Status: Route is working</li>
        </ul>
      </div>
      <button 
        onClick={() => alert('Button clicked!')} 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Test Button
      </button>
    </div>
  );
}