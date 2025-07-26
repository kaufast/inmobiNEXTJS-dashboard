import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export interface UserSearchParams {
  query?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
}

export interface Agency {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  licenseNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  verified: boolean;
  memberCount: number;
  createdAt: string;
}

export interface AgencyResult {
  agencies: Agency[];
  total: number;
}

// Use the real backend for all environments
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://inmobi-app-40848611182.us-central1.run.app/api'
  : 'http://localhost:8090/api';
// 
// // Temporary solution: Point to test server for user creation
// const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:8889/api' : '/api';
// Original API base
// const API_BASE = '/api';

export const UserService = {
  /**
   * Get all users with optional filters
   */
  async getUsers(filters: any = {}): Promise<UserSearchResult> {
    try {
      // For now, use the basic users endpoint until admin getUsers is fixed
      const response = await fetch(`${API_BASE}/users?limit=${filters.limit || 20}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty result if the endpoint fails
      return { users: [], total: 0 };
    }
  },

  /**
   * Get a user by ID
   */
  async getUser(id: string | number): Promise<User> {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },

  /**
   * Create a new user
   */
  async createUser(userData: any): Promise<User> {
    console.log('Creating user with data:', userData);
    
    const response = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    return response.json();
  },

  /**
   * Update a user
   */
  async updateUser(id: string | number, userData: any): Promise<User> {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    
    return response.json();
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string | number): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  /**
   * Suspend a user's account (using fullName modification as temporary solution)
   */
  async suspendUser(id: string | number): Promise<User> {
    const user = await this.getUser(id);
    const updatedFullName = user.fullName.includes('(SUSPENDED)') 
      ? user.fullName 
      : `${user.fullName} (SUSPENDED)`;
    
    return this.updateUser(id, { fullName: updatedFullName });
  },

  /**
   * Reactivate a user's account (using fullName modification as temporary solution)
   */
  async reactivateUser(id: string | number): Promise<User> {
    const user = await this.getUser(id);
    const updatedFullName = user.fullName.replace(' (SUSPENDED)', '');
    
    return this.updateUser(id, { fullName: updatedFullName });
  },

  /**
   * Reset a user's password
   */
  async resetPassword(id: string | number, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: number[]): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/users/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userIds }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete users');
    }
  },

  /**
   * Bulk suspend users (using individual operations)
   */
  async bulkSuspendUsers(userIds: number[]): Promise<void> {
    await Promise.all(userIds.map(id => this.suspendUser(id)));
  },

  /**
   * Bulk reactivate users (using individual operations)
   */
  async bulkReactivateUsers(userIds: number[]): Promise<void> {
    await Promise.all(userIds.map(id => this.reactivateUser(id)));
  },

  /**
   * Verify a user
   */
  async verifyUser(id: string | number, verificationData: any): Promise<User> {
    const response = await fetch(`${API_BASE}/admin/users/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify user');
    }
    
    return response.json();
  },

  /**
   * Get all agencies
   */
  async getAgencies(): Promise<AgencyResult> {
    const response = await apiRequest("GET", "/api/agencies");
    return response.json();
  },

  /**
   * Get an agency by ID
   */
  async getAgency(id: number): Promise<Agency> {
    const response = await apiRequest("GET", `/api/agencies/${id}`);
    return response.json();
  },

  /**
   * Create a new agency
   */
  async createAgency(agencyData: any): Promise<Agency> {
    const response = await apiRequest("POST", "/api/agencies/register", agencyData);
    return response.json();
  },

  /**
   * Update an agency
   */
  async updateAgency(id: number, agencyData: Partial<Agency>): Promise<Agency> {
    const response = await apiRequest("PUT", `/api/agencies/${id}`, agencyData);
    return response.json();
  },

  /**
   * Delete an agency
   */
  async deleteAgency(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/agencies/${id}`);
  },

  /**
   * Get users by agency ID
   */
  async getUsersByAgency(agencyId: number): Promise<UserSearchResult> {
    const response = await apiRequest("GET", `/api/agencies/${agencyId}/members`);
    return response.json();
  },

  /**
   * Add user to agency
   */
  async addUserToAgency(agencyId: number, userId: number, role: string = 'agent'): Promise<void> {
    await apiRequest("POST", `/api/agencies/${agencyId}/users`, { userId, role });
  },

  /**
   * Remove user from agency
   */
  async removeUserFromAgency(agencyId: number, userId: number): Promise<void> {
    await apiRequest("DELETE", `/api/agencies/${agencyId}/users/${userId}`);
  },

  /**
   * Verify an agency
   */
  async verifyAgency(id: number): Promise<Agency> {
    const response = await apiRequest("POST", `/api/agencies/${id}/verify`);
    return response.json();
  },

  /**
   * Unverify an agency
   */
  async unverifyAgency(id: number): Promise<Agency> {
    const response = await apiRequest("POST", `/api/agencies/${id}/unverify`);
    return response.json();
  }
}; 