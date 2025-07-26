import React, { useState, useEffect } from 'react';
import { API, User, Property, Document } from './services/api';
import { useApi, useApiMutation, usePagination } from './hooks/useApi';

const CompleteDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(API.auth.isAuthenticated());
  const [user, setUser] = useState<User | null>(API.auth.getCurrentUser());
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Form states for different sections
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as 'admin' | 'agent' | 'user' | 'manager' | '',
    department: '',
    status: 'active' as 'active' | 'pending' | 'suspended' | 'inactive',
    bio: ''
  });

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    type: '' as 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | '',
    price: 0,
    city: '',
    address: '',
    postalCode: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    status: 'available' as 'available' | 'sold' | 'rented' | 'pending' | 'withdrawn',
    listingType: 'sale' as 'sale' | 'rent' | 'both',
    yearBuilt: 0,
    features: [] as string[],
    description: ''
  });

  const [documentForm, setDocumentForm] = useState({
    title: '',
    type: '' as 'contract' | 'lease' | 'deed' | 'inspection' | 'financial' | 'legal' | 'insurance' | 'other' | '',
    propertyId: '',
    ownerId: '',
    status: 'active' as 'active' | 'pending' | 'approved' | 'expired' | 'archived',
    expirationDate: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    companyName: '',
    contactEmail: '',
    phoneNumber: '',
    timeZone: '',
    currency: '',
    language: '',
    emailNotifications: true,
    smsNotifications: true,
    propertyUpdates: true,
    userRegistration: true,
    documentApprovals: true,
    paymentReminders: true
  });

  // API Hooks
  const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = 
    useApi(() => API.dashboard.getStats(), [isLoggedIn]);
  
  const { data: recentActivity, loading: activityLoading } = 
    useApi(() => API.dashboard.getRecentActivity(), [isLoggedIn]);

  // Users API hooks
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = 
    useApi(() => API.users.getAll(), [isLoggedIn, activeSection]);
  
  const { data: usersStats, loading: usersStatsLoading } = 
    useApi(() => API.users.getStats(), [isLoggedIn, activeSection]);

  // Properties API hooks
  const { data: propertiesData, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = 
    useApi(() => API.properties.getAll(), [isLoggedIn, activeSection]);
  
  const { data: propertiesStats, loading: propertiesStatsLoading } = 
    useApi(() => API.properties.getStats(), [isLoggedIn, activeSection]);

  // Documents API hooks
  const { data: documentsData, loading: documentsLoading, error: documentsError, refetch: refetchDocuments } = 
    useApi(() => API.documents.getAll(), [isLoggedIn, activeSection]);
  
  const { data: documentsStats, loading: documentsStatsLoading } = 
    useApi(() => API.documents.getStats(), [isLoggedIn, activeSection]);

  // Settings API hooks
  const { data: settingsData, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = 
    useApi(() => API.settings.get(), [isLoggedIn, activeSection]);

  const { mutate: loginMutation, loading: loginLoading } = useApiMutation(
    ({ email, password }: { email: string; password: string }) => 
      API.auth.login(email, password)
  );

  // Users mutation hooks
  const { mutate: createUser, loading: createUserLoading } = useApiMutation(
    (userData: Omit<User, 'id' | 'createdAt'>) => API.users.create(userData)
  );
  
  const { mutate: updateUser, loading: updateUserLoading } = useApiMutation(
    ({ id, userData }: { id: string; userData: Partial<User> }) => API.users.update(id, userData)
  );
  
  const { mutate: deleteUser, loading: deleteUserLoading } = useApiMutation(
    (id: string) => API.users.delete(id)
  );

  // Properties mutation hooks
  const { mutate: createProperty, loading: createPropertyLoading } = useApiMutation(
    (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => API.properties.create(propertyData)
  );
  
  const { mutate: updateProperty, loading: updatePropertyLoading } = useApiMutation(
    ({ id, propertyData }: { id: string; propertyData: Partial<Property> }) => API.properties.update(id, propertyData)
  );
  
  const { mutate: deleteProperty, loading: deletePropertyLoading } = useApiMutation(
    (id: string) => API.properties.delete(id)
  );

  // Documents mutation hooks
  const { mutate: uploadDocument, loading: uploadDocumentLoading } = useApiMutation(
    ({ documentData, file }: { documentData: any; file: File }) => API.documents.upload(documentData, file)
  );
  
  const { mutate: updateDocument, loading: updateDocumentLoading } = useApiMutation(
    ({ id, documentData }: { id: string; documentData: Partial<Document> }) => API.documents.update(id, documentData)
  );
  
  const { mutate: deleteDocument, loading: deleteDocumentLoading } = useApiMutation(
    (id: string) => API.documents.delete(id)
  );

  // Settings mutation hooks
  const { mutate: updateSettings, loading: updateSettingsLoading } = useApiMutation(
    (settings: any) => API.settings.update(settings)
  );

  // Check authentication status on mount
  useEffect(() => {
    const currentUser = API.auth.getCurrentUser();
    if (currentUser && API.auth.isAuthenticated()) {
      setIsLoggedIn(true);
      setUser(currentUser);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter both email and password');
      return;
    }

    const result = await loginMutation(loginForm);
    
    if (result.success && result.data) {
      setUser(result.data.user || null);
      setIsLoggedIn(true);
      setLoginForm({ email: '', password: '' });
    } else {
      setLoginError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await API.auth.logout();
    setUser(null);
    setIsLoggedIn(false);
    setActiveSection('Dashboard');
  };

  // Navigation handler for different types of navigation
  const handleNavigation = (item: any) => {
    switch (item.id) {
      case 'back-home':
        // Navigate to main site
        window.location.href = import.meta.env.VITE_SITE_URL || 'https://inmobi-public-app.vercel.app';
        break;
      default:
        // Internal section navigation
        setActiveSection(item.label);
        break;
    }
  };

  // Action button handler
  const handleActionButton = (action: string) => {
    switch (action) {
      case 'Add Property':
        setActiveSection('Properties');
        setShowAddPropertyModal(true);
        break;
      case 'Add User':
        setActiveSection('Users');
        break;
      case 'Upload Document':
        setActiveSection('Documents');
        break;
      case 'View Reports':
        setActiveSection('Analytics');
        break;
      case 'Send Message':
        setActiveSection('Messages');
        break;
      case 'Settings':
        setActiveSection('Settings');
        break;
      default:
        console.log(`Action: ${action}`);
        break;
    }
  };

  // User form handlers
  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      alert('Please fill in all required fields (Name, Email, Role)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const userData = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role as 'admin' | 'agent' | 'user' | 'manager',
        department: userForm.department,
        status: userForm.status,
        bio: userForm.bio
      };

      let result;
      if (editingUser) {
        // Update existing user
        result = await updateUser({ id: editingUser.id, userData });
        if (result.success) {
          alert('User updated successfully!');
          setEditingUser(null);
        }
      } else {
        // Create new user
        result = await createUser(userData);
        if (result.success) {
          alert('User created successfully!');
        }
      }

      if (result.success) {
        // Reset form
        setUserForm({
          name: '',
          email: '',
          phone: '',
          role: '',
          department: '',
          status: 'active',
          bio: ''
        });
        // Refresh users list
        refetchUsers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while saving the user');
      console.error('Save user error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      alert('User deleted successfully!');
      refetchUsers();
    } else {
      alert(`Error deleting user: ${result.error}`);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      status: user.status,
      bio: user.bio || ''
    });
  };

  // Property form handlers
  const handleSaveProperty = async () => {
    if (!propertyForm.title || !propertyForm.type || !propertyForm.city) {
      alert('Please fill in all required fields (Title, Type, City)');
      return;
    }

    // Price validation
    if (propertyForm.price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    try {
      const propertyData = { ...propertyForm };

      let result;
      if (editingProperty) {
        // Update existing property
        result = await updateProperty({ id: editingProperty.id, propertyData });
        if (result.success) {
          alert('Property updated successfully!');
          setEditingProperty(null);
        }
      } else {
        // Create new property
        result = await createProperty(propertyData);
        if (result.success) {
          alert('Property created successfully!');
        }
      }

      if (result.success) {
        // Reset form
        setPropertyForm({
          title: '',
          type: '',
          price: 0,
          city: '',
          address: '',
          postalCode: '',
          bedrooms: 0,
          bathrooms: 0,
          area: 0,
          status: 'available',
          listingType: 'sale',
          yearBuilt: 0,
          features: [],
          description: ''
        });
        // Refresh properties list
        refetchProperties();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while saving the property');
      console.error('Save property error:', error);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      type: property.type,
      price: property.price,
      city: property.city,
      address: property.address,
      postalCode: property.postalCode || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.area || 0,
      status: property.status,
      listingType: property.listingType,
      yearBuilt: property.yearBuilt || 0,
      features: property.features || [],
      description: property.description || ''
    });
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    const result = await deleteProperty(propertyId);
    if (result.success) {
      alert('Property deleted successfully!');
      refetchProperties();
    } else {
      alert(`Error deleting property: ${result.error}`);
    }
  };

  // Document form handlers
  const handleUploadDocument = async () => {
    if (!documentForm.title || !documentForm.type || !selectedFile) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

    if (selectedFile.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }

    if (!allowedTypes.includes(fileExtension)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    try {
      const result = await uploadDocument({ 
        documentData: documentForm, 
        file: selectedFile 
      });
      
      if (result.success) {
        alert('Document uploaded successfully!');
        // Reset form
        setDocumentForm({
          title: '',
          type: '',
          propertyId: '',
          ownerId: '',
          status: 'active',
          expirationDate: '',
          description: ''
        });
        setSelectedFile(null);
        // Refresh documents list
        refetchDocuments();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while uploading the document');
      console.error('Upload document error:', error);
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setDocumentForm({
      title: document.title,
      type: document.type,
      propertyId: document.propertyId || '',
      ownerId: document.ownerId || '',
      status: document.status,
      expirationDate: document.expirationDate || '',
      description: document.description || ''
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    const result = await deleteDocument(documentId);
    if (result.success) {
      alert('Document deleted successfully!');
      refetchDocuments();
    } else {
      alert(`Error deleting document: ${result.error}`);
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const response = await API.documents.download(documentId);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${documentId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading document');
      }
    } catch (error) {
      alert('Error downloading document');
      console.error('Download error:', error);
    }
  };

  // Settings form handlers
  const handleSaveSettings = async () => {
    try {
      const result = await updateSettings(settingsForm);
      if (result.success) {
        alert('Settings saved successfully!');
        refetchSettings();
      } else {
        alert(`Error saving settings: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while saving settings');
      console.error('Save settings error:', error);
    }
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
            {/* Main Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {statsLoading ? (
                // Loading state
                [1, 2, 3, 4].map((_, index) => (
                  <div key={index} style={{ ...styles.card, opacity: 0.7 }}>
                    <div style={{ height: '80px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
                    </div>
                  </div>
                ))
              ) : (
                // Real data or fallback mock data
                [
                  { 
                    title: 'Total Properties', 
                    value: dashboardStats?.properties?.total?.toString() || '247', 
                    icon: '🏢', 
                    change: dashboardStats?.properties?.change || '+12 from last month', 
                    color: '#3b82f6' 
                  },
                  { 
                    title: 'Active Users', 
                    value: dashboardStats?.users?.total?.toString() || '1,234', 
                    icon: '👥', 
                    change: dashboardStats?.users?.change || '+8% from last month', 
                    color: '#10b981' 
                  },
                  { 
                    title: 'Pending Approvals', 
                    value: dashboardStats?.approvals?.total?.toString() || '23', 
                    icon: '✅', 
                    change: dashboardStats?.approvals?.change || '5 new today', 
                    color: '#f59e0b' 
                  },
                  { 
                    title: 'Monthly Revenue', 
                    value: dashboardStats?.revenue?.total || '€45,230', 
                    icon: '💰', 
                    change: dashboardStats?.revenue?.change || '+15% from last month', 
                    color: '#8b5cf6' 
                  }
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
                ))
              )}
              
              {/* API Status Indicator */}
              {statsError && (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '6px', 
                  padding: '12px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  ⚠️ API Connection Issue: Using fallback data. Error: {statsError}
                  <button 
                    onClick={refetchStats}
                    style={{ 
                      ...styles.buttonSecondary, 
                      marginLeft: '12px', 
                      padding: '4px 8px', 
                      fontSize: '12px' 
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Charts and Analytics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Revenue Chart */}
              <div style={styles.card}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Monthly Revenue Trend</h3>
                <div style={{ height: '200px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                    <p style={{ color: '#6b7280' }}>Revenue chart visualization</p>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Jan: €38k | Feb: €42k | Mar: €45k</div>
                  </div>
                </div>
              </div>

              {/* Property Types */}
              <div style={styles.card}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Property Distribution</h3>
                <div style={{ height: '200px' }}>
                  {[
                    { type: 'Apartments', count: 124, percentage: 50, color: '#3b82f6' },
                    { type: 'Houses', count: 68, percentage: 28, color: '#10b981' },
                    { type: 'Villas', count: 35, percentage: 14, color: '#f59e0b' },
                    { type: 'Commercial', count: 20, percentage: 8, color: '#8b5cf6' }
                  ].map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        backgroundColor: item.color, 
                        borderRadius: '4px',
                        marginRight: '12px'
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.type}</span>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.count}</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          backgroundColor: '#e5e7eb', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            backgroundColor: item.color
                          }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '24px' 
            }}>
              {/* Recent Activity */}
              <div style={styles.card}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Activity</h3>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {[
                    { icon: '🏢', action: 'New property listed', details: 'Modern Apartment in Barcelona', time: '2 hours ago', color: '#10b981' },
                    { icon: '👤', action: 'User registered', details: 'John Doe joined as Agent', time: '4 hours ago', color: '#3b82f6' },
                    { icon: '💰', action: 'Payment received', details: '€2,500 commission payment', time: '6 hours ago', color: '#f59e0b' },
                    { icon: '📄', action: 'Document uploaded', details: 'Contract for Property #123', time: '1 day ago', color: '#8b5cf6' },
                    { icon: '✅', action: 'Property approved', details: 'Villa in Madrid approved', time: '1 day ago', color: '#10b981' }
                  ].map((activity, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 0',
                      borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: activity.color + '20',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        fontSize: '18px'
                      }}>
                        {activity.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                          {activity.action}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                          {activity.details}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={styles.card}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                  gap: '12px' 
                }}>
                  {[
                    { icon: '🏢', label: 'Add Property', color: '#3b82f6' },
                    { icon: '👥', label: 'Add User', color: '#10b981' },
                    { icon: '📄', label: 'Upload Document', color: '#f59e0b' },
                    { icon: '📊', label: 'View Reports', color: '#8b5cf6' },
                    { icon: '💬', label: 'Send Message', color: '#ec4899' },
                    { icon: '⚙️', label: 'Settings', color: '#6b7280' }
                  ].map((action, index) => (
                    <button 
                      key={index}
                      onClick={() => handleActionButton(action.label)}
                      style={{
                        ...styles.button,
                        backgroundColor: action.color,
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* System Status */}
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>System Status</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { service: 'API Server', status: 'Online', color: '#10b981' },
                      { service: 'Database', status: 'Online', color: '#10b981' },
                      { service: 'File Storage', status: 'Online', color: '#10b981' },
                      { service: 'Email Service', status: 'Maintenance', color: '#f59e0b' }
                    ].map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>{item.service}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: '500',
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: item.color,
                            borderRadius: '50%',
                            marginRight: '6px'
                          }}></div>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'Users':
        return (
          <div>
            {/* Users Overview Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {usersStatsLoading ? (
                [1, 2, 3, 4].map((_, index) => (
                  <div key={index} style={{ ...styles.card, opacity: 0.7 }}>
                    <div style={{ height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { 
                    title: 'Total Users', 
                    value: usersStats?.total?.toString() || '1,234', 
                    icon: '👥', 
                    color: '#3b82f6' 
                  },
                  { 
                    title: 'Active Users', 
                    value: usersStats?.active?.toString() || '1,156', 
                    icon: '✅', 
                    color: '#10b981' 
                  },
                  { 
                    title: 'Pending Approvals', 
                    value: usersStats?.pending?.toString() || '23', 
                    icon: '⏳', 
                    color: '#f59e0b' 
                  },
                  { 
                    title: 'Agents', 
                    value: usersStats?.agents?.toString() || '45', 
                    icon: '🏢', 
                    color: '#8b5cf6' 
                  }
                ].map((card, index) => (
                  <div key={index} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                        {card.title}
                      </h3>
                      <span style={{ fontSize: '20px' }}>{card.icon}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
                      {card.value}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Management Section */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>User Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    style={styles.button}
                    onClick={() => console.log('Add New User clicked')}
                  >
                    Add New User
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => console.log('Import Users clicked')}
                  >
                    Import Users
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => console.log('Export Data clicked')}
                  >
                    Export Data
                  </button>
                </div>
              </div>

              {/* User Form */}
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input 
                      placeholder="Enter full name" 
                      style={styles.input}
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      disabled={createUserLoading || updateUserLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      placeholder="user@example.com" 
                      style={styles.input}
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      disabled={createUserLoading || updateUserLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+34 123 456 789" 
                      style={styles.input}
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      disabled={createUserLoading || updateUserLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Role *
                    </label>
                    <select 
                      style={styles.input}
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      disabled={createUserLoading || updateUserLoading}
                    >
                      <option value="">Select role</option>
                      <option value="admin">Admin</option>
                      <option value="agent">Agent</option>
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Department
                    </label>
                    <select 
                      style={styles.input}
                      value={userForm.department}
                      onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                      disabled={createUserLoading || updateUserLoading}
                    >
                      <option value="">Select department</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="support">Support</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select 
                      style={styles.input}
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                      disabled={createUserLoading || updateUserLoading}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Bio/Notes
                  </label>
                  <textarea 
                    placeholder="Additional information about the user..." 
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    value={userForm.bio}
                    onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                    disabled={createUserLoading || updateUserLoading}
                  />
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    style={{
                      ...styles.button,
                      backgroundColor: (createUserLoading || updateUserLoading) ? '#9ca3af' : '#3b82f6',
                      cursor: (createUserLoading || updateUserLoading) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSaveUser}
                    disabled={createUserLoading || updateUserLoading}
                  >
                    {createUserLoading || updateUserLoading ? 'Saving...' : (editingUser ? 'Update User' : 'Save User')}
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      setUserForm({
                        name: '',
                        email: '',
                        phone: '',
                        role: '',
                        department: '',
                        status: 'active',
                        bio: ''
                      });
                      setEditingUser(null);
                    }}
                    disabled={createUserLoading || updateUserLoading}
                  >
                    {editingUser ? 'Cancel Edit' : 'Reset Form'}
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Department</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Last Active</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      [1, 2, 3, 4, 5].map((_, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td colSpan={6} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                            Loading users...
                          </td>
                        </tr>
                      ))
                    ) : usersError ? (
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td colSpan={6} style={{ padding: '12px 8px', textAlign: 'center', color: '#dc2626' }}>
                          Error loading users: {usersError}
                        </td>
                      </tr>
                    ) : !usersData?.users || usersData.users.length === 0 ? (
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td colSpan={6} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                          No users found
                        </td>
                      </tr>
                    ) : (
                      usersData.users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{user.name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '14px', textTransform: 'capitalize' }}>{user.role}</td>
                          <td style={{ padding: '12px 8px', fontSize: '14px' }}>{user.department || 'N/A'}</td>
                          <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              textTransform: 'capitalize',
                              backgroundColor: user.status === 'active' ? '#dcfce7' : user.status === 'pending' ? '#fef3c7' : user.status === 'suspended' ? '#fee2e2' : '#f3f4f6',
                              color: user.status === 'active' ? '#166534' : user.status === 'pending' ? '#92400e' : user.status === 'suspended' ? '#dc2626' : '#6b7280'
                            }}>
                              {user.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button 
                                style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                                onClick={() => handleEditUser(user)}
                              >
                                Edit
                              </button>
                              <button 
                                style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                                onClick={() => console.log('View user:', user.id)}
                              >
                                View
                              </button>
                              <button 
                                style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px', color: '#dc2626' }}
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteUserLoading}
                              >
                                {deleteUserLoading ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Properties':
        return (
          <div>
            {/* Properties Overview Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {propertiesStatsLoading ? (
                [1, 2, 3, 4].map((_, index) => (
                  <div key={index} style={{ ...styles.card, opacity: 0.7 }}>
                    <div style={{ height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { 
                    title: 'Total Properties', 
                    value: propertiesStats?.total?.toString() || '247', 
                    icon: '🏢', 
                    color: '#3b82f6' 
                  },
                  { 
                    title: 'Available', 
                    value: propertiesStats?.available?.toString() || '189', 
                    icon: '✅', 
                    color: '#10b981' 
                  },
                  { 
                    title: 'Sold', 
                    value: propertiesStats?.sold?.toString() || '32', 
                    icon: '💰', 
                    color: '#f59e0b' 
                  },
                  { 
                    title: 'Under Review', 
                    value: propertiesStats?.underReview?.toString() || '26', 
                    icon: '⏳', 
                    color: '#8b5cf6' 
                  }
                ].map((card, index) => (
                  <div key={index} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                        {card.title}
                      </h3>
                      <span style={{ fontSize: '20px' }}>{card.icon}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
                      {card.value}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Property Management Section */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Property Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={styles.button} onClick={() => setShowAddPropertyModal(true)}>
                    Add Property
                  </button>
                  <button style={styles.buttonSecondary}>Import Properties</button>
                  <button style={styles.buttonSecondary}>Export Data</button>
                </div>
              </div>

              {/* Property Form */}
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Add/Edit Property</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Property Title *
                    </label>
                    <input 
                      placeholder="Modern Apartment in Barcelona" 
                      style={styles.input} 
                      value={propertyForm.title}
                      onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Property Type *
                    </label>
                    <select 
                      style={styles.input}
                      value={propertyForm.type}
                      onChange={(e) => setPropertyForm({...propertyForm, type: e.target.value as any})}
                    >
                      <option value="">Select type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Price (€) *
                    </label>
                    <input 
                      type="number" 
                      placeholder="450000" 
                      style={styles.input} 
                      value={propertyForm.price || ''}
                      onChange={(e) => setPropertyForm({...propertyForm, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input 
                      placeholder="Barcelona" 
                      style={styles.input} 
                      value={propertyForm.city}
                      onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Address *
                    </label>
                    <input 
                      placeholder="Carrer de Balmes, 123" 
                      style={styles.input} 
                      value={propertyForm.address}
                      onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Postal Code
                    </label>
                    <input placeholder="08008" style={styles.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Bedrooms
                    </label>
                    <select style={styles.input}>
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Bathrooms
                    </label>
                    <select style={styles.input}>
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Area (m²)
                    </label>
                    <input type="number" placeholder="120" style={styles.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select style={styles.input}>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                      <option value="pending">Pending</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Listing Type
                    </label>
                    <select style={styles.input}>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="both">Sale & Rent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Year Built
                    </label>
                    <input type="number" placeholder="2020" style={styles.input} />
                  </div>
                </div>

                {/* Features Checkboxes */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Features & Amenities
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '8px' 
                  }}>
                    {[
                      'Parking', 'Elevator', 'Balcony', 'Garden', 'Pool', 'Gym', 
                      'Security', 'Air Conditioning', 'Heating', 'Fireplace', 'Storage', 'Terrace'
                    ].map((feature, index) => (
                      <label key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input type="checkbox" style={{ marginRight: '8px' }} />
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea 
                    placeholder="Detailed description of the property..." 
                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    style={{
                      ...styles.button,
                      backgroundColor: (createPropertyLoading || updatePropertyLoading) ? '#9ca3af' : '#3b82f6',
                      cursor: (createPropertyLoading || updatePropertyLoading) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSaveProperty}
                    disabled={createPropertyLoading || updatePropertyLoading}
                  >
                    {createPropertyLoading || updatePropertyLoading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Save Property')}
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      console.log('Reset Property Form clicked');
                      // Reset form logic would go here
                    }}
                  >
                    Reset Form
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      console.log('Upload Images clicked');
                      // Image upload logic would go here
                    }}
                  >
                    Upload Images
                  </button>
                </div>
              </div>

              {/* Properties Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '20px' 
              }}>
                {propertiesLoading ? (
                  [1, 2, 3, 4].map((_, index) => (
                    <div key={index} style={{ ...styles.card, padding: '16px', opacity: 0.7 }}>
                      <div style={{ height: '200px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
                      </div>
                    </div>
                  ))
                ) : propertiesError ? (
                  <div style={{ ...styles.card, padding: '16px', textAlign: 'center', color: '#dc2626' }}>
                    Error loading properties: {propertiesError}
                  </div>
                ) : !propertiesData?.properties || propertiesData.properties.length === 0 ? (
                  <div style={{ ...styles.card, padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                    No properties found
                  </div>
                ) : (
                  propertiesData.properties.map((property) => {
                    const getPropertyIcon = (type: string) => {
                      switch (type) {
                        case 'apartment': return '🏢';
                        case 'house': return '🏠';
                        case 'villa': return '🏡';
                        case 'commercial': return '🏢';
                        case 'land': return '🌾';
                        default: return '🏠';
                      }
                    };

                    const formatPrice = (price: number) => {
                      return new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(price);
                    };

                    return (
                      <div key={property.id} style={{
                        ...styles.card,
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
                          {getPropertyIcon(property.type)}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', minHeight: '40px' }}>
                          {property.title}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          {property.address}, {property.city}
                        </p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '12px' }}>
                          {formatPrice(property.price)}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          marginBottom: '12px'
                        }}>
                          <span>🛏️ {property.bedrooms || 'N/A'}</span>
                          <span>🚿 {property.bathrooms || 'N/A'}</span>
                          <span>📐 {property.area ? `${property.area}m²` : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            textTransform: 'capitalize',
                            backgroundColor: property.status === 'available' ? '#dcfce7' : 
                                           property.status === 'sold' ? '#fee2e2' : 
                                           property.status === 'rented' ? '#e0e7ff' : '#fef3c7',
                            color: property.status === 'available' ? '#166534' : 
                                   property.status === 'sold' ? '#dc2626' : 
                                   property.status === 'rented' ? '#3730a3' : '#92400e'
                          }}>
                            {property.status}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleEditProperty(property)}
                            >
                              Edit
                            </button>
                            <button 
                              style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => console.log('View property:', property.id)}
                            >
                              View
                            </button>
                            <button 
                              style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px', color: '#dc2626' }}
                              onClick={() => handleDeleteProperty(property.id)}
                              disabled={deletePropertyLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
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

      case 'Documents':
        return (
          <div>
            {/* Documents Overview Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {documentsStatsLoading ? (
                [1, 2, 3, 4].map((_, index) => (
                  <div key={index} style={{ ...styles.card, opacity: 0.7 }}>
                    <div style={{ height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { 
                    title: 'Total Documents', 
                    value: documentsStats?.total?.toString() || '1,847', 
                    icon: '📄', 
                    color: '#3b82f6' 
                  },
                  { 
                    title: 'Contracts', 
                    value: documentsStats?.contracts?.toString() || '234', 
                    icon: '📝', 
                    color: '#10b981' 
                  },
                  { 
                    title: 'Pending Review', 
                    value: documentsStats?.pending?.toString() || '12', 
                    icon: '⏳', 
                    color: '#f59e0b' 
                  },
                  { 
                    title: 'Archive', 
                    value: documentsStats?.archived?.toString() || '567', 
                    icon: '📦', 
                    color: '#8b5cf6' 
                  }
                ].map((card, index) => (
                  <div key={index} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                        {card.title}
                      </h3>
                      <span style={{ fontSize: '20px' }}>{card.icon}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
                      {card.value}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Document Management Section */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Document Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={styles.button}>Upload Document</button>
                  <button style={styles.buttonSecondary}>Bulk Upload</button>
                  <button style={styles.buttonSecondary}>Archive Selected</button>
                </div>
              </div>

              {/* Document Upload Form */}
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Upload New Document</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Document Title *
                    </label>
                    <input 
                      placeholder="Property Purchase Agreement" 
                      style={styles.input} 
                      value={documentForm.title}
                      onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Document Type *
                    </label>
                    <select 
                      style={styles.input}
                      value={documentForm.type}
                      onChange={(e) => setDocumentForm({...documentForm, type: e.target.value as any})}
                    >
                      <option value="">Select type</option>
                      <option value="contract">Contract</option>
                      <option value="lease">Lease Agreement</option>
                      <option value="deed">Property Deed</option>
                      <option value="inspection">Inspection Report</option>
                      <option value="financial">Financial Document</option>
                      <option value="legal">Legal Document</option>
                      <option value="insurance">Insurance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Property ID
                    </label>
                    <input 
                      placeholder="PROP-2024-001" 
                      style={styles.input} 
                      value={documentForm.propertyId}
                      onChange={(e) => setDocumentForm({...documentForm, propertyId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Client/Owner
                    </label>
                    <input 
                      placeholder="John Doe" 
                      style={styles.input} 
                      value={documentForm.ownerId}
                      onChange={(e) => setDocumentForm({...documentForm, ownerId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select 
                      style={styles.input}
                      value={documentForm.status}
                      onChange={(e) => setDocumentForm({...documentForm, status: e.target.value as any})}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="expired">Expired</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Expiration Date
                    </label>
                    <input 
                      type="date" 
                      style={styles.input} 
                      value={documentForm.expirationDate}
                      onChange={(e) => setDocumentForm({...documentForm, expirationDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* File Upload Area */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Upload File *
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                    <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                      Drag and drop your file here, or click to browse
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                      Supports: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </p>
                    <input 
                      id="document-file-input"
                      type="file" 
                      style={{ display: 'none' }} 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const maxSize = 10 * 1024 * 1024; // 10MB
                          if (file.size > maxSize) {
                            alert('File size exceeds 10MB limit');
                            e.target.value = ''; // Reset input
                            return;
                          }
                          setSelectedFile(file);
                        } else {
                          setSelectedFile(null);
                        }
                      }}
                    />
                    <button 
                      style={styles.buttonSecondary}
                      onClick={() => document.getElementById('document-file-input')?.click()}
                    >
                      Choose File
                    </button>
                    {selectedFile && (
                      <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px' }}>
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Description/Notes
                  </label>
                  <textarea 
                    placeholder="Additional notes about this document..." 
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    style={{
                      ...styles.button,
                      backgroundColor: uploadDocumentLoading ? '#9ca3af' : '#3b82f6',
                      cursor: uploadDocumentLoading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleUploadDocument}
                    disabled={uploadDocumentLoading}
                  >
                    {uploadDocumentLoading ? 'Uploading...' : 'Upload Document'}
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      alert('Document saved as draft! (Demo)');
                      console.log('Save as Draft clicked');
                    }}
                  >
                    Save as Draft
                  </button>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      console.log('Reset Document Form clicked');
                      // Reset form logic would go here
                    }}
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              {/* Documents List */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Documents</h3>
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Document</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Type</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Property</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Owner</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Date</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentsLoading ? (
                        [1, 2, 3, 4, 5].map((_, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td colSpan={7} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                              Loading documents...
                            </td>
                          </tr>
                        ))
                      ) : documentsError ? (
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td colSpan={7} style={{ padding: '12px 8px', textAlign: 'center', color: '#dc2626' }}>
                            Error loading documents: {documentsError}
                          </td>
                        </tr>
                      ) : !documentsData?.documents || documentsData.documents.length === 0 ? (
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td colSpan={7} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                            No documents found
                          </td>
                        </tr>
                      ) : (
                        documentsData.documents.map((doc) => {
                          const getFileIcon = (fileType: string) => {
                            if (fileType.includes('pdf')) return '📄';
                            if (fileType.includes('doc')) return '📝';
                            if (fileType.includes('image')) return '🖼️';
                            return '📄';
                          };

                          return (
                            <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span style={{ marginRight: '8px', fontSize: '16px' }}>
                                    {getFileIcon(doc.fileType)}
                                  </span>
                                  <div>
                                    <div style={{ fontWeight: '500' }}>{doc.title}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                      {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px', textTransform: 'capitalize' }}>
                                {doc.type}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                {doc.propertyId || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                {doc.ownerId || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  textTransform: 'capitalize',
                                  backgroundColor: doc.status === 'active' ? '#dcfce7' : 
                                                 doc.status === 'approved' ? '#dbeafe' :
                                                 doc.status === 'pending' ? '#fef3c7' : 
                                                 doc.status === 'expired' ? '#fee2e2' : '#f3f4f6',
                                  color: doc.status === 'active' ? '#166534' : 
                                         doc.status === 'approved' ? '#1e40af' :
                                         doc.status === 'pending' ? '#92400e' : 
                                         doc.status === 'expired' ? '#dc2626' : '#6b7280'
                                }}>
                                  {doc.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button 
                                    style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                                    onClick={() => console.log('View document:', doc.id)}
                                  >
                                    View
                                  </button>
                                  <button 
                                    style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                                    onClick={() => handleDownloadDocument(doc.id)}
                                  >
                                    Download
                                  </button>
                                  <button 
                                    style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px' }}
                                    onClick={() => handleEditDocument(doc)}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    style={{ ...styles.buttonSecondary, padding: '4px 8px', fontSize: '12px', color: '#dc2626' }}
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    disabled={deleteDocumentLoading}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div>
            {/* Settings Overview */}
            <div style={styles.card}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>System Settings</h2>
              
              {/* Settings Sections */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '24px' 
              }}>
                
                {/* General Settings */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '20px', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>General Settings</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Company Name
                      </label>
                      <input value="InMobi Real Estate" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Contact Email
                      </label>
                      <input value="info@inmobi.com" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Phone Number
                      </label>
                      <input value="+34 123 456 789" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Time Zone
                      </label>
                      <select style={styles.input}>
                        <option value="europe/madrid">Europe/Madrid (GMT+1)</option>
                        <option value="europe/london">Europe/London (GMT+0)</option>
                        <option value="america/new_york">America/New_York (GMT-5)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Currency
                      </label>
                      <select style={styles.input}>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Language
                      </label>
                      <select style={styles.input}>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="ca">Català</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '20px', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Notification Settings</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '16px' 
                  }}>
                    {[
                      { label: 'Email Notifications', sublabel: 'Receive email updates for important events' },
                      { label: 'SMS Notifications', sublabel: 'Get SMS alerts for urgent matters' },
                      { label: 'Property Updates', sublabel: 'Notifications about property status changes' },
                      { label: 'User Registration', sublabel: 'Alerts when new users register' },
                      { label: 'Document Approvals', sublabel: 'Notifications for document review requests' },
                      { label: 'Payment Reminders', sublabel: 'Reminders for upcoming payments' }
                    ].map((setting, index) => (
                      <label key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input type="checkbox" defaultChecked style={{ marginRight: '12px' }} />
                        <div>
                          <div style={{ fontWeight: '500' }}>{setting.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{setting.sublabel}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security Settings */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '20px', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Security Settings</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Session Timeout (minutes)
                      </label>
                      <input type="number" value="30" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Password Minimum Length
                      </label>
                      <input type="number" value="8" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Login Attempt Limit
                      </label>
                      <input type="number" value="5" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Two-Factor Authentication
                      </label>
                      <select style={styles.input}>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                        <option value="optional">Optional</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                      Require password change every 90 days
                    </label>
                  </div>
                </div>

                {/* System Preferences */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '20px', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>System Preferences</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Records per Page
                      </label>
                      <select style={styles.input}>
                        <option value="10">10</option>
                        <option value="25" selected>25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Date Format
                      </label>
                      <select style={styles.input}>
                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Auto-backup Frequency
                      </label>
                      <select style={styles.input}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Theme
                      </label>
                      <select style={styles.input}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        alert('Settings reset to defaults! (Demo)');
                        console.log('Reset to Defaults clicked');
                      }
                    }}
                  >
                    Reset to Defaults
                  </button>
                  <button 
                    style={{
                      ...styles.button,
                      backgroundColor: updateSettingsLoading ? '#9ca3af' : '#3b82f6',
                      cursor: updateSettingsLoading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSaveSettings}
                    disabled={updateSettingsLoading}
                  >
                    {updateSettingsLoading ? 'Saving...' : 'Save All Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Subscription':
        return (
          <div>
            {/* Current Plan Overview */}
            <div style={styles.card}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Current Subscription</h2>
              <div style={{ 
                backgroundColor: '#eff6ff', 
                border: '2px solid #3b82f6',
                borderRadius: '8px', 
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>Professional Plan</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>Active until March 15, 2025</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>€89/month</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Billed monthly</div>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '32px'
              }}>
                {[
                  { title: 'Properties Listed', used: '247', limit: '500', percentage: 49 },
                  { title: 'Users', used: '23', limit: '50', percentage: 46 },
                  { title: 'Storage Used', used: '12.4 GB', limit: '50 GB', percentage: 25 },
                  { title: 'API Calls', used: '14,567', limit: '25,000', percentage: 58 }
                ].map((stat, index) => (
                  <div key={index} style={{ ...styles.card, padding: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
                      {stat.title}
                    </h4>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {stat.used} / {stat.limit}
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${stat.percentage}%`,
                        height: '100%',
                        backgroundColor: stat.percentage > 80 ? '#dc2626' : stat.percentage > 60 ? '#f59e0b' : '#10b981',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Plans */}
            <div style={styles.card}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Available Plans</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
              }}>
                {[
                  {
                    name: 'Starter',
                    price: '€29',
                    period: 'month',
                    description: 'Perfect for small agencies',
                    features: [
                      'Up to 50 properties',
                      '5 users',
                      '10 GB storage',
                      'Basic support',
                      'Email notifications'
                    ],
                    current: false,
                    popular: false
                  },
                  {
                    name: 'Professional',
                    price: '€89',
                    period: 'month',
                    description: 'Most popular for growing businesses',
                    features: [
                      'Up to 500 properties',
                      '50 users',
                      '50 GB storage',
                      'Priority support',
                      'Advanced analytics',
                      'API access',
                      'Custom branding'
                    ],
                    current: true,
                    popular: true
                  },
                  {
                    name: 'Enterprise',
                    price: '€199',
                    period: 'month',
                    description: 'For large organizations',
                    features: [
                      'Unlimited properties',
                      'Unlimited users',
                      '500 GB storage',
                      '24/7 phone support',
                      'Advanced security',
                      'Custom integrations',
                      'Dedicated account manager',
                      'White-label solution'
                    ],
                    current: false,
                    popular: false
                  }
                ].map((plan, index) => (
                  <div key={index} style={{
                    ...styles.card,
                    padding: '24px',
                    border: plan.current ? '2px solid #3b82f6' : plan.popular ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                    position: 'relative'
                  }}>
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 16px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Most Popular
                      </div>
                    )}
                    {plan.current && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '4px 16px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Current Plan
                      </div>
                    )}
                    
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{plan.name}</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>{plan.description}</p>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
                        {plan.price}
                        <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#6b7280' }}>/{plan.period}</span>
                      </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          <span style={{ marginRight: '8px', color: '#10b981' }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button style={{
                      ...styles.button,
                      width: '100%',
                      backgroundColor: plan.current ? '#6b7280' : '#3b82f6',
                      cursor: plan.current ? 'not-allowed' : 'pointer'
                    }} disabled={plan.current}>
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Billing Information */}
              <div style={{ 
                marginTop: '32px',
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '8px' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Billing Information</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Payment Method
                    </label>
                    <div style={{ ...styles.input, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>💳</span>
                      **** **** **** 4532
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Next Billing Date
                    </label>
                    <input value="2024-02-15" style={styles.input} readOnly />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Billing Address
                    </label>
                    <input value="Barcelona, Spain" style={styles.input} readOnly />
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button style={styles.buttonSecondary}>Update Payment Method</button>
                  <button style={styles.buttonSecondary}>Download Invoice</button>
                  <button style={{ ...styles.buttonSecondary, color: '#dc2626' }}>Cancel Subscription</button>
                </div>
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
          
          {loginError && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px', 
              fontSize: '14px' 
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Email
              </label>
              <input 
                type="email" 
                placeholder="admin@inmobi.com" 
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                style={styles.input}
                disabled={loginLoading}
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Password
              </label>
              <input 
                type="password" 
                placeholder="Password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                style={styles.input}
                disabled={loginLoading}
                required
              />
            </div>
            <button 
              type="submit" 
              style={{ 
                ...styles.button, 
                width: '100%', 
                padding: '12px',
                backgroundColor: loginLoading ? '#9ca3af' : '#3b82f6',
                cursor: loginLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
            <p><strong>Backend API Integration:</strong></p>
            <p>This form now connects to the real API</p>
            <p>API URL: {import.meta.env.VITE_API_URL || 'Not configured'}</p>
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
              onClick={() => handleNavigation(item)}
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
              <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{user?.role || 'Role'}</p>
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
                Welcome back, {user?.name || 'User'}!
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
                {user?.name?.charAt(0) || 'U'}
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
              <input value={user?.name || ''} readOnly style={styles.input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Role
              </label>
              <input value={user?.role || ''} readOnly style={styles.input} />
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