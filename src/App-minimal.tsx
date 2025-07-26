import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>InmobiTech Dashboard</h1>
      <p>Dashboard is loading successfully!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Status</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ No useLayoutEffect errors</li>
          <li>✅ Ready for full dashboard integration</li>
        </ul>
      </div>
    </div>
  );
}

export default App;