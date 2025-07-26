import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { BulkUploadButton } from './BulkUploadButton'
import { createMockUser } from '@/test/test-utils'

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock the role permissions
vi.mock('@/lib/role-permissions', () => ({
  canAccessBulkUpload: vi.fn(),
}))

import { canAccessBulkUpload } from '@/lib/role-permissions'

describe('BulkUploadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render button for users with access', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} />)

    expect(screen.getByRole('button', { name: /bulk upload/i })).toBeInTheDocument()
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument()
  })

  it('should not render button for users without access', () => {
    const mockUser = createMockUser({ role: 'user' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(false)

    render(<BulkUploadButton user={mockUser} />)

    expect(screen.queryByRole('button', { name: /bulk upload/i })).not.toBeInTheDocument()
  })

  it('should not render button for null user', () => {
    vi.mocked(canAccessBulkUpload).mockReturnValue(false)

    render(<BulkUploadButton user={null} />)

    expect(screen.queryByRole('button', { name: /bulk upload/i })).not.toBeInTheDocument()
  })

  it('should render with badge when showBadge is true', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} showBadge={true} />)

    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should not render badge when showBadge is false', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} showBadge={false} />)

    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} className="custom-class" />)

    const button = screen.getByRole('button', { name: /bulk upload/i })
    expect(button).toHaveClass('custom-class')
  })

  it('should render with different variants', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    const { rerender } = render(<BulkUploadButton user={mockUser} variant="outline" />)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<BulkUploadButton user={mockUser} variant="default" />)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<BulkUploadButton user={mockUser} variant="secondary" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should check access for admin user', () => {
    const mockUser = createMockUser({ role: 'admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} />)

    expect(canAccessBulkUpload).toHaveBeenCalledWith(mockUser)
  })

  it('should check access for agency admin user', () => {
    const mockUser = createMockUser({ role: 'agency_admin' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} />)

    expect(canAccessBulkUpload).toHaveBeenCalledWith(mockUser)
  })

  it('should check access for verified agent', () => {
    const mockUser = createMockUser({ role: 'agent', isVerified: true })
    vi.mocked(canAccessBulkUpload).mockReturnValue(true)

    render(<BulkUploadButton user={mockUser} />)

    expect(canAccessBulkUpload).toHaveBeenCalledWith(mockUser)
  })

  it('should deny access for unverified agent', () => {
    const mockUser = createMockUser({ role: 'agent', isVerified: false })
    vi.mocked(canAccessBulkUpload).mockReturnValue(false)

    render(<BulkUploadButton user={mockUser} />)

    expect(canAccessBulkUpload).toHaveBeenCalledWith(mockUser)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should deny access for regular user', () => {
    const mockUser = createMockUser({ role: 'user' })
    vi.mocked(canAccessBulkUpload).mockReturnValue(false)

    render(<BulkUploadButton user={mockUser} />)

    expect(canAccessBulkUpload).toHaveBeenCalledWith(mockUser)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})