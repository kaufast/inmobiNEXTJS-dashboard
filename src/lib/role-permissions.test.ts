import { describe, it, expect } from 'vitest'
import {
  canAccessBulkUpload,
  isAdmin,
  isSuperAdmin,
  isAgencyAdmin,
  isVerifiedAgent,
  canManageProperties,
  getRoleDisplayName,
  getBulkUploadPermissionMessage,
  type User,
  type UserRole
} from './role-permissions'

describe('Role Permissions', () => {
  const createUser = (role: UserRole, isVerified = true, agencyId?: number): User => ({
    id: 1,
    role,
    isVerified,
    agencyId
  })

  describe('canAccessBulkUpload', () => {
    it('should allow admin users', () => {
      const user = createUser('admin')
      expect(canAccessBulkUpload(user)).toBe(true)
    })

    it('should allow agency admin users', () => {
      const user = createUser('agency_admin')
      expect(canAccessBulkUpload(user)).toBe(true)
    })

    it('should allow verified agents', () => {
      const user = createUser('agent', true)
      expect(canAccessBulkUpload(user)).toBe(true)
    })

    it('should allow verified agency agents', () => {
      const user = createUser('agency_agent', true)
      expect(canAccessBulkUpload(user)).toBe(true)
    })

    it('should deny unverified agents', () => {
      const user = createUser('agent', false)
      expect(canAccessBulkUpload(user)).toBe(false)
    })

    it('should deny unverified agency agents', () => {
      const user = createUser('agency_agent', false)
      expect(canAccessBulkUpload(user)).toBe(false)
    })

    it('should deny regular users', () => {
      const user = createUser('user')
      expect(canAccessBulkUpload(user)).toBe(false)
    })

    it('should deny null user', () => {
      expect(canAccessBulkUpload(null)).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      const user = createUser('admin')
      expect(isAdmin(user)).toBe(true)
    })

    it('should return false for non-admin users', () => {
      const roles: UserRole[] = ['user', 'agent', 'agency_admin', 'agency_agent']
      roles.forEach(role => {
        const user = createUser(role)
        expect(isAdmin(user)).toBe(false)
      })
    })

    it('should return false for null user', () => {
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('should return true for admin users', () => {
      const user = createUser('admin')
      expect(isSuperAdmin(user)).toBe(true)
    })

    it('should return false for non-admin users', () => {
      const roles: UserRole[] = ['user', 'agent', 'agency_admin', 'agency_agent']
      roles.forEach(role => {
        const user = createUser(role)
        expect(isSuperAdmin(user)).toBe(false)
      })
    })
  })

  describe('isAgencyAdmin', () => {
    it('should return true for agency admin users', () => {
      const user = createUser('agency_admin')
      expect(isAgencyAdmin(user)).toBe(true)
    })

    it('should return false for non-agency admin users', () => {
      const roles: UserRole[] = ['user', 'agent', 'admin', 'agency_agent']
      roles.forEach(role => {
        const user = createUser(role)
        expect(isAgencyAdmin(user)).toBe(false)
      })
    })
  })

  describe('isVerifiedAgent', () => {
    it('should return true for verified agents', () => {
      const user = createUser('agent', true)
      expect(isVerifiedAgent(user)).toBe(true)
    })

    it('should return true for verified agency agents', () => {
      const user = createUser('agency_agent', true)
      expect(isVerifiedAgent(user)).toBe(true)
    })

    it('should return false for unverified agents', () => {
      const user = createUser('agent', false)
      expect(isVerifiedAgent(user)).toBe(false)
    })

    it('should return false for unverified agency agents', () => {
      const user = createUser('agency_agent', false)
      expect(isVerifiedAgent(user)).toBe(false)
    })

    it('should return false for non-agent users', () => {
      const roles: UserRole[] = ['user', 'admin', 'agency_admin']
      roles.forEach(role => {
        const user = createUser(role)
        expect(isVerifiedAgent(user)).toBe(false)
      })
    })

    it('should return false for null user', () => {
      expect(isVerifiedAgent(null)).toBe(false)
    })
  })

  describe('canManageProperties', () => {
    it('should allow admin users', () => {
      const user = createUser('admin')
      expect(canManageProperties(user)).toBe(true)
    })

    it('should allow agency admin users', () => {
      const user = createUser('agency_admin')
      expect(canManageProperties(user)).toBe(true)
    })

    it('should allow verified agents', () => {
      const user = createUser('agent', true)
      expect(canManageProperties(user)).toBe(true)
    })

    it('should allow verified agency agents', () => {
      const user = createUser('agency_agent', true)
      expect(canManageProperties(user)).toBe(true)
    })

    it('should deny unverified agents', () => {
      const user = createUser('agent', false)
      expect(canManageProperties(user)).toBe(false)
    })

    it('should deny regular users', () => {
      const user = createUser('user')
      expect(canManageProperties(user)).toBe(false)
    })

    it('should deny null user', () => {
      expect(canManageProperties(null)).toBe(false)
    })
  })

  describe('getRoleDisplayName', () => {
    it('should return correct display names', () => {
      expect(getRoleDisplayName('admin')).toBe('Super Admin')
      expect(getRoleDisplayName('agency_admin')).toBe('Agency Admin')
      expect(getRoleDisplayName('agency_agent')).toBe('Agency Agent')
      expect(getRoleDisplayName('agent')).toBe('Agent')
      expect(getRoleDisplayName('user')).toBe('User')
    })

    it('should return Unknown for invalid roles', () => {
      expect(getRoleDisplayName('invalid' as UserRole)).toBe('Unknown')
    })
  })

  describe('getBulkUploadPermissionMessage', () => {
    it('should return login message for null user', () => {
      const message = getBulkUploadPermissionMessage(null)
      expect(message).toBe('Please log in to access bulk upload')
    })

    it('should return access message for admin', () => {
      const user = createUser('admin')
      const message = getBulkUploadPermissionMessage(user)
      expect(message).toBe('You have access to bulk upload properties')
    })

    it('should return access message for verified agent', () => {
      const user = createUser('agent', true)
      const message = getBulkUploadPermissionMessage(user)
      expect(message).toBe('You have access to bulk upload properties')
    })

    it('should return agent-only message for regular user', () => {
      const user = createUser('user')
      const message = getBulkUploadPermissionMessage(user)
      expect(message).toBe('Bulk upload is only available for verified agents and admins')
    })

    it('should return verification message for unverified agent', () => {
      const user = createUser('agent', false)
      const message = getBulkUploadPermissionMessage(user)
      expect(message).toBe('Please complete verification to access bulk upload')
    })

    it('should return verification message for unverified agency agent', () => {
      const user = createUser('agency_agent', false)
      const message = getBulkUploadPermissionMessage(user)
      expect(message).toBe('Please complete verification to access bulk upload')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined role gracefully', () => {
      const user = { id: 1, role: undefined as any, isVerified: true }
      expect(canAccessBulkUpload(user)).toBe(false)
      expect(canManageProperties(user)).toBe(false)
    })

    it('should handle missing isVerified property', () => {
      const user = { id: 1, role: 'agent' as UserRole, isVerified: undefined } as any
      expect(canAccessBulkUpload(user)).toBe(false)
      expect(isVerifiedAgent(user)).toBe(false)
    })

    it('should handle agency context', () => {
      const agencyAdmin = createUser('agency_admin', true, 123)
      const agencyAgent = createUser('agency_agent', true, 123)
      
      expect(canAccessBulkUpload(agencyAdmin)).toBe(true)
      expect(canAccessBulkUpload(agencyAgent)).toBe(true)
      expect(isAgencyAdmin(agencyAdmin)).toBe(true)
      expect(isVerifiedAgent(agencyAgent)).toBe(true)
    })
  })
})