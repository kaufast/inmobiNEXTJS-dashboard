import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component
function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard Test</h1>
      <p>This is a simple test to verify the dashboard loads.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render
const root = createRoot(rootElement);
root.render(<SimpleApp />);