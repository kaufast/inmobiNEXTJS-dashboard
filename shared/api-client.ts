/**
 * Shared API Client
 * Works with both Next.js and Vite apps
 */

export interface ApiClientConfig {
  baseURL: string;
  appSource: 'dashboard' | 'public';
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseURL: string;
  private appSource: 'dashboard' | 'public';
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.appSource = config.appSource;
    this.timeout = config.timeout || 10000;
  }

  /**
   * Make HTTP request with common configuration
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-App-Source': this.appSource,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Always include cookies for auth
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
          data: data,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'X-App-Source': this.appSource,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });
  }
}

/**
 * Property-related API endpoints
 */
export class PropertyAPI {
  constructor(private client: ApiClient) {}

  async getProperties(params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    country?: string;
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    propertyType?: string;
  }) {
    return this.client.get('/api/properties', params);
  }

  async getFeaturedProperties(limit = 6) {
    return this.client.get('/api/properties/featured', { limit });
  }

  async getProperty(id: number) {
    return this.client.get(`/api/properties/${id}`);
  }

  async createProperty(propertyData: any) {
    return this.client.post('/api/properties', propertyData);
  }

  async updateProperty(id: number, propertyData: any) {
    return this.client.put(`/api/properties/${id}`, propertyData);
  }

  async deleteProperty(id: number) {
    return this.client.delete(`/api/properties/${id}`);
  }

  async searchProperties(searchParams: any) {
    return this.client.post('/api/properties/search', searchParams);
  }
}

/**
 * User-related API endpoints
 */
export class UserAPI {
  constructor(private client: ApiClient) {}

  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    return this.client.get('/api/users', params);
  }

  async getUser(id: number) {
    return this.client.get(`/api/users/${id}`);
  }

  async updateUser(id: number, userData: any) {
    return this.client.put(`/api/users/${id}`, userData);
  }

  async deleteUser(id: number) {
    return this.client.delete(`/api/users/${id}`);
  }

  async updateProfile(userData: any) {
    return this.client.put('/api/users/profile', userData);
  }
}

/**
 * Create configured API client instances
 */
export function createAPIClients(baseURL: string, appSource: 'dashboard' | 'public') {
  const apiClient = new ApiClient({ baseURL, appSource });
  
  return {
    client: apiClient,
    properties: new PropertyAPI(apiClient),
    users: new UserAPI(apiClient),
  };
}

/**
 * Utility function to handle API responses in components
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): boolean {
  if (response.success && response.data) {
    onSuccess?.(response.data);
    return true;
  } else {
    onError?.(response.error || 'Unknown error');
    return false;
  }
}