import React, { useState } from 'react';

const CompleteDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });
  const [activeSection, setActiveSection] = useState('Dashboard');
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
    setActiveSection('Dashboard');
  };

  // Navigation items matching your screenshot
  const navigationItems = [
    { icon: '📊', label: 'Dashboard', id: 'dashboard' },
    { icon: '👥', label: 'Users', id: 'users' },
    { icon: '🏢', label: 'Properties', id: 'properties' },
    { icon: '💬', label: 'Messages', id: 'messages' },
    { icon: '🗓️', label: 'Tours', id: 'tours' },
    { icon: '✅', label: 'Approvals', id: 'approvals' },
    { icon: '🔍', label: 'Verification', id: 'verification' },
    { icon: '⚙️', label: 'Verification Management', id: 'verification-management' },
    { icon: '📄', label: 'Documents', id: 'documents' },
    { icon: '📈', label: 'Analytics', id: 'analytics' },
    { icon: '🛠️', label: 'Settings', id: 'settings' },
    { icon: '⭐', label: 'Subscription', id: 'subscription' },
    { icon: '🏠', label: 'Back to Home', id: 'back-home' }
  ];

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
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80%',
      overflow: 'auto',
    },
    navItem: (isActive: boolean) => ({
      width: '100%',
      textAlign: 'left' as const,
      padding: '12px 16px',
      backgroundColor: isActive ? '#eff6ff' : 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      color: isActive ? '#1d4ed8' : '#374151',
      fontWeight: isActive ? '600' : '400',
      margin: '2px 8px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
    }),
  };

  // Content renderer based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {[
                { title: 'Total Properties', value: '247', icon: '🏢', change: '+12 from last month', color: '#3b82f6' },
                { title: 'Active Users', value: '1,234', icon: '👥', change: '+8% from last month', color: '#10b981' },
                { title: 'Pending Approvals', value: '23', icon: '✅', change: '5 new today', color: '#f59e0b' },
                { title: 'Monthly Revenue', value: '€45,230', icon: '💰', change: '+15% from last month', color: '#8b5cf6' }
              ].map((card, index) => (
                <div key={index} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      {card.title}
                    </h3>
                    <span style={{ fontSize: '24px' }}>{card.icon}</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: card.color, marginBottom: '8px' }}>
                    {card.value}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {card.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Users':
        return (
          <div style={styles.card}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>User Management</h2>
            <div style={{ marginBottom: '16px' }}>
              <button style={styles.button}>Add New User</button>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
                    { name: 'Jane Smith', email: 'jane@example.com', role: 'Agent', status: 'Active' },
                    { name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Pending' }
                  ].map((user, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px', fontSize: '14px' }}>{user.name}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px' }}>{user.email}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px' }}>{user.role}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: user.status === 'Active' ? '#dcfce7' : '#fef3c7',
                          color: user.status === 'Active' ? '#166534' : '#92400e'
                        }}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Properties':
        return (
          <div style={styles.card}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Property Management</h2>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <button style={styles.button} onClick={() => setShowAddPropertyModal(true)}>
                Add Property
              </button>
              <button style={styles.buttonSecondary}>Import Properties</button>
              <button style={styles.buttonSecondary}>Export Data</button>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {[
                { title: 'Modern Apartment Barcelona', price: '€450,000', status: 'Active', image: '🏢' },
                { title: 'Villa with Pool Madrid', price: '€680,000', status: 'Pending', image: '🏠' },
                { title: 'Beach House Valencia', price: '€520,000', status: 'Active', image: '🏖️' }
              ].map((property, index) => (
                <div key={index} style={{
                  ...styles.card,
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
                    {property.image}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {property.title}
                  </h3>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                    {property.price}
                  </p>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: property.status === 'Active' ? '#dcfce7' : '#fef3c7',
                    color: property.status === 'Active' ? '#166534' : '#92400e'
                  }}>
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Messages':
        return (
          <div style={styles.card}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Messages</h2>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Conversations</h3>
                {[
                  { name: 'Alice Johnson', message: 'Interested in the Barcelona apartment...', time: '2m ago', unread: true },
                  { name: 'Carlos Martinez', message: 'Can we schedule a tour?', time: '1h ago', unread: false },
                  { name: 'Emma Wilson', message: 'Thank you for the information', time: '3h ago', unread: false }
                ].map((msg, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    backgroundColor: msg.unread ? '#eff6ff' : 'white',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{msg.name}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{msg.message}</p>
                  </div>
                ))}
              </div>
              <div style={{ flex: 2, padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Select a conversation to view messages</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={styles.card}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{activeSection}</h2>
            <p style={{ color: '#6b7280' }}>
              This section is under development. Content for {activeSection} will be available soon.
            </p>
            <div style={{ marginTop: '24px' }}>
              <button style={styles.button}>Coming Soon</button>
            </div>
          </div>
        );
    }
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
      {/* Sidebar matching the screenshot */}
      <div style={{ 
        width: '280px', 
        backgroundColor: 'white', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            [ inmobi ]
          </h1>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 0', overflow: 'auto' }}>
          {navigationItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => setActiveSection(item.label)}
              style={styles.navItem(activeSection === item.label)}
              onMouseOver={(e) => {
                if (activeSection !== item.label) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== item.label) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User section at bottom */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
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
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {activeSection}
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
                  width: '40px',
                  height: '40px',
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
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {renderContent()}
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Description
              </label>
              <textarea 
                placeholder="Enter property description" 
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              />
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

export default CompleteDashboard;