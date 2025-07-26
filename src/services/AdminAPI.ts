import { getApiBaseUrl } from '@/lib/api-config';

class AdminAPI {
  private static baseUrl = getApiBaseUrl();

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/admin${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // User management
  static async getUsers(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.request(`/users?${params.toString()}`);
  }

  static async deleteUser(userId: number) {
    return this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  static async updateUserStatus(userId: number, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async suspendUser(userId: number, reason: string) {
    return this.request(`/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async verifyUser(userId: number, data: any) {
    return this.request(`/users/${userId}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUserSubscription(userId: number, data: any) {
    return this.request(`/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async bulkUpdateUsers(userIds: number[], updates: any) {
    return this.request('/users/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ userIds, updates }),
    });
  }

  // Agency management
  static async getAgencies(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.request(`/agencies?${params.toString()}`);
  }

  // Custom packages
  static async getCustomPackages(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.request(`/custom-packages?${params.toString()}`);
  }

  static async createCustomPackage(userId: number, data: any) {
    return this.request(`/custom-packages`, {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    });
  }

  // Analytics
  static async getAnalytics(timeframe: string = '30d') {
    return this.request(`/analytics?timeframe=${timeframe}`);
  }

  // Trial templates
  static async getTrialTemplates() {
    return this.request('/trial-templates');
  }

  // Discount coupons
  static async getDiscountCoupons() {
    return this.request('/discount-coupons');
  }

  // Subscription history
  static async getSubscriptionHistory(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.request(`/subscription-history?${params.toString()}`);
  }

  // Trial management
  static async setUserTrial(userId: number, data: any) {
    return this.request(`/users/${userId}/trial`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Discount management
  static async applyUserDiscount(userId: number, data: any) {
    return this.request(`/users/${userId}/discount`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export { AdminAPI }; 