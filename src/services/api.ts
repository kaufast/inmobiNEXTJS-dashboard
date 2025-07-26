// API Service Layer for InMobi Dashboard

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://inmobi-express-api-production.up.railway.app';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'user' | 'manager';
  department?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  createdAt: string;
  lastActive?: string;
  bio?: string;
}

export interface Property {
  id: string;
  title: string;
  type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land';
  price: number;
  city: string;
  address: string;
  postalCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status: 'available' | 'sold' | 'rented' | 'pending' | 'withdrawn';
  listingType: 'sale' | 'rent' | 'both';
  yearBuilt?: number;
  features: string[];
  description?: string;
  images?: string[];
  ownerId?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'contract' | 'lease' | 'deed' | 'inspection' | 'financial' | 'legal' | 'insurance' | 'other';
  propertyId?: string;
  ownerId?: string;
  status: 'active' | 'pending' | 'approved' | 'expired' | 'archived';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  expirationDate?: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Helper Functions
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login or reload page
      window.location.href = '/';
      return {
        success: false,
        error: 'Authentication expired. Please login again.',
        message: 'Authentication expired'
      };
    }

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
        message: data.message
      };
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

const makeRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    return handleResponse<T>(response);
  } catch (error) {
    // Network error or other fetch failure
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'Network error: Unable to connect to server. Please check your connection and try again.'
    };
  }
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data || { success: false, message: response.error };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    try {
      await makeRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};

// Users API
export const usersAPI = {
  getAll: (page = 1, limit = 25): Promise<ApiResponse<{ users: User[], total: number, page: number }>> =>
    makeRequest(`/api/users?page=${page}&limit=${limit}`),

  getById: (id: string): Promise<ApiResponse<User>> =>
    makeRequest(`/api/users/${id}`),

  create: (userData: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> =>
    makeRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  update: (id: string, userData: Partial<User>): Promise<ApiResponse<User>> =>
    makeRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),

  delete: (id: string): Promise<ApiResponse<void>> =>
    makeRequest(`/api/users/${id}`, { method: 'DELETE' }),

  getStats: (): Promise<ApiResponse<{
    total: number;
    active: number;
    pending: number;
    agents: number;
  }>> => makeRequest('/api/users/stats')
};

// Properties API
export const propertiesAPI = {
  getAll: (page = 1, limit = 25, filters?: any): Promise<ApiResponse<{ properties: Property[], total: number, page: number }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters && Object.keys(filters).reduce((acc, key) => {
        if (filters[key]) acc[key] = filters[key];
        return acc;
      }, {} as any))
    });
    return makeRequest(`/api/properties?${params}`);
  },

  getById: (id: string): Promise<ApiResponse<Property>> =>
    makeRequest(`/api/properties/${id}`),

  create: (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Property>> =>
    makeRequest('/api/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    }),

  update: (id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> =>
    makeRequest(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData)
    }),

  delete: (id: string): Promise<ApiResponse<void>> =>
    makeRequest(`/api/properties/${id}`, { method: 'DELETE' }),

  getStats: (): Promise<ApiResponse<{
    total: number;
    available: number;
    sold: number;
    underReview: number;
    byType: Record<string, number>;
  }>> => makeRequest('/api/properties/stats'),

  uploadImages: (propertyId: string, files: FileList): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('authToken');
    return fetch(`${API_BASE_URL}/api/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(handleResponse);
  }
};

// Documents API
export const documentsAPI = {
  getAll: (page = 1, limit = 25, filters?: any): Promise<ApiResponse<{ documents: Document[], total: number, page: number }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters && Object.keys(filters).reduce((acc, key) => {
        if (filters[key]) acc[key] = filters[key];
        return acc;
      }, {} as any))
    });
    return makeRequest(`/api/documents?${params}`);
  },

  getById: (id: string): Promise<ApiResponse<Document>> =>
    makeRequest(`/api/documents/${id}`),

  upload: (documentData: {
    title: string;
    type: string;
    propertyId?: string;
    ownerId?: string;
    status: string;
    expirationDate?: string;
    description?: string;
  }, file: File): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(documentData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const token = localStorage.getItem('authToken');
    return fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(handleResponse);
  },

  update: (id: string, documentData: Partial<Document>): Promise<ApiResponse<Document>> =>
    makeRequest(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    }),

  delete: (id: string): Promise<ApiResponse<void>> =>
    makeRequest(`/api/documents/${id}`, { method: 'DELETE' }),

  download: (id: string): Promise<Response> =>
    fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    }),

  getStats: (): Promise<ApiResponse<{
    total: number;
    contracts: number;
    pending: number;
    archived: number;
  }>> => makeRequest('/api/documents/stats')
};

// Dashboard API
export const dashboardAPI = {
  getStats: (): Promise<ApiResponse<{
    properties: { total: number; change: string };
    users: { total: number; change: string };
    approvals: { total: number; change: string };
    revenue: { total: string; change: string };
  }>> => makeRequest('/api/dashboard/stats'),

  getRecentActivity: (limit = 10): Promise<ApiResponse<{
    icon: string;
    action: string;
    details: string;
    time: string;
    color: string;
  }[]>> => makeRequest(`/api/dashboard/activity?limit=${limit}`),

  getRevenueChart: (period = '6months'): Promise<ApiResponse<{
    labels: string[];
    data: number[];
  }>> => makeRequest(`/api/dashboard/revenue?period=${period}`),

  getPropertyDistribution: (): Promise<ApiResponse<{
    type: string;
    count: number;
    percentage: number;
    color: string;
  }[]>> => makeRequest('/api/dashboard/property-distribution')
};

// Settings API
export const settingsAPI = {
  get: (): Promise<ApiResponse<any>> => makeRequest('/api/settings'),
  
  update: (settings: any): Promise<ApiResponse<any>> =>
    makeRequest('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
};

// Export all APIs
export const API = {
  auth: authAPI,
  users: usersAPI,
  properties: propertiesAPI,
  documents: documentsAPI,
  dashboard: dashboardAPI,
  settings: settingsAPI
};

export default API;