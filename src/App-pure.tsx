import React, { useState } from 'react';

const PureDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name: 'John Doe', role: 'Admin' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser({ name: '', role: '' });
    setIsLoggedIn(false);
  };

  // Pure CSS styles
  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: '#374151',
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      maxHeight: '80%',
      overflow: 'auto',
    },
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ ...styles.card, width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
            InMobi Dashboard Login
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Email
              </label>
              <input 
                type="email" 
                placeholder="admin@inmobi.com" 
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Password
              </label>
              <input 
                type="password" 
                placeholder="Password" 
                style={styles.input}
              />
            </div>
            <button type="submit" style={{ ...styles.button, width: '100%', padding: '12px' }}>
              Sign In
            </button>
          </form>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
            <p><strong>Demo credentials:</strong></p>
            <p>Email: admin@inmobi.com</p>
            <p>Password: any password</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '256px', 
        backgroundColor: 'white', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ padding: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            InMobi Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Welcome, {user.name}</p>
        </div>
        
        <nav style={{ marginTop: '32px' }}>
          <div style={{ padding: '0 16px 8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
            Menu
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { icon: '🏠', label: 'Dashboard' },
              { icon: '🏢', label: 'Properties' },
              { icon: '👥', label: 'Users' },
              { icon: '📊', label: 'Analytics' },
              { icon: '⚙️', label: 'Settings' }
            ].map((item, index) => (
              <li key={index}>
                <button style={{
                  ...styles.buttonSecondary,
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0',
                }} onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }} onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                  <span style={{ marginRight: '12px' }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '256px', 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{user.role}</p>
            </div>
            <button style={styles.buttonSecondary} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Welcome back, {user.name}!
              </span>
              <button 
                onClick={() => setShowProfileModal(true)}
                style={{
                  ...styles.button,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {user.name.charAt(0)}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          overflow: 'auto', 
          backgroundColor: '#f9fafb', 
          padding: '24px' 
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Dashboard Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {[
                { title: 'Total Properties', value: '24', icon: '🏢', change: '+2 from last month' },
                { title: 'Active Users', value: '156', icon: '👥', change: '+12% from last month' },
                { title: 'Monthly Revenue', value: '€12,450', icon: '💰', change: '+8% from last month' }
              ].map((card, index) => (
                <div key={index} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      {card.title}
                    </h3>
                    <span style={{ fontSize: '24px' }}>{card.icon}</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                    {card.value}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {card.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px' 
              }}>
                <button 
                  onClick={() => setShowAddPropertyModal(true)}
                  style={{
                    ...styles.button,
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🏢</span>
                  Add Property
                </button>
                <button style={{
                  ...styles.buttonSecondary,
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                  Add User
                </button>
                <button style={{
                  ...styles.buttonSecondary,
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  View Reports
                </button>
                <button style={{
                  ...styles.buttonSecondary,
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>⚙️</span>
                  Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>User Profile</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Name
              </label>
              <input value={user.name} readOnly style={styles.input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Role
              </label>
              <input value={user.role} readOnly style={styles.input} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button style={styles.buttonSecondary} onClick={() => setShowProfileModal(false)}>
                Close
              </button>
              <button style={styles.button} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <div style={styles.modal} onClick={() => setShowAddPropertyModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Add New Property</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Property Title
              </label>
              <input placeholder="Enter property title" style={styles.input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Price
              </label>
              <input placeholder="Enter price" style={styles.input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Location
              </label>
              <input placeholder="Enter location" style={styles.input} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button style={styles.buttonSecondary} onClick={() => setShowAddPropertyModal(false)}>
                Cancel
              </button>
              <button style={styles.button} onClick={() => {
                alert('Property added successfully!');
                setShowAddPropertyModal(false);
              }}>
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PureDashboard;