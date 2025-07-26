/**
 * Role-based permission utilities
 */

export type UserRole = 'user' | 'agent' | 'agency_admin' | 'agency_agent' | 'admin';

export interface User {
  id: number;
  role: UserRole;
  isVerified: boolean;
  agencyId?: number;
}

/**
 * Check if user can access bulk upload feature
 * Only allowed for: admin, agency_admin, verified agents (agent, agency_agent)
 */
export function canAccessBulkUpload(user: User | null): boolean {
  if (!user) return false;

  switch (user.role) {
    case 'admin':
      return true; // Admins always have access
    
    case 'agency_admin':
      return true; // Agency admins always have access
    
    case 'agent':
    case 'agency_agent':
      return Boolean(user.isVerified); // Agents need to be verified
    
    case 'user':
    default:
      return false; // Regular users cannot access bulk upload
  }
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user has super admin privileges (admin role)
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user is an agency admin
 */
export function isAgencyAdmin(user: User | null): boolean {
  return user?.role === 'agency_admin';
}

/**
 * Check if user is a verified agent
 */
export function isVerifiedAgent(user: User | null): boolean {
  if (!user) return false;
  return (user.role === 'agent' || user.role === 'agency_agent') && Boolean(user.isVerified);
}

/**
 * Check if user can manage properties (admin, agency_admin, verified agents)
 */
export function canManageProperties(user: User | null): boolean {
  if (!user) return false;
  
  return (
    user.role === 'admin' ||
    user.role === 'agency_admin' ||
    (isVerifiedAgent(user))
  );
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Super Admin';
    case 'agency_admin':
      return 'Agency Admin';
    case 'agency_agent':
      return 'Agency Agent';
    case 'agent':
      return 'Agent';
    case 'user':
      return 'User';
    default:
      return 'Unknown';
  }
}

/**
 * Get permission level description for bulk upload
 */
export function getBulkUploadPermissionMessage(user: User | null): string {
  if (!user) {
    return 'Please log in to access bulk upload';
  }

  if (!canAccessBulkUpload(user)) {
    if (user.role === 'user') {
      return 'Bulk upload is only available for verified agents and admins';
    }
    if ((user.role === 'agent' || user.role === 'agency_agent') && !user.isVerified) {
      return 'Please complete verification to access bulk upload';
    }
    return 'You do not have permission to access bulk upload';
  }

  return 'You have access to bulk upload properties';
}