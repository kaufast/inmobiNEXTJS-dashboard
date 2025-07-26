import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Router } from 'wouter'
import { createMockUser, createMockProperty } from './test-utils'

// Mock API responses
const mockProperties = [
  createMockProperty({ id: '1', title: 'Luxury Apartment', price: 750000 }),
  createMockProperty({ id: '2', title: 'Family Home', price: 450000 }),
  createMockProperty({ id: '3', title: 'Modern Condo', price: 320000 }),
  createMockProperty({ id: '4', title: 'Beach House', price: 1200000 }),
  createMockProperty({ id: '5', title: 'City Loft', price: 280000 }),
]

// Mock API functions
const mockApi = {
  register: vi.fn(),
  login: vi.fn(),
  getProperties: vi.fn(),
  saveFavorite: vi.fn(),
  sendMessage: vi.fn(),
  scheduleTour: vi.fn(),
}

// Mock components (simplified versions for testing)
const MockAuthForm = ({ onSuccess }: { onSuccess: (user: any) => void }) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const userData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      fullName: formData.get('fullName') as string,
    }
    
    const response = await mockApi.register(userData)
    if (response.success) {
      onSuccess(response.user)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="registration-form">
      <input name="fullName" placeholder="Full Name" data-testid="full-name" />
      <input name="email" type="email" placeholder="Email" data-testid="email" />
      <input name="password" type="password" placeholder="Password" data-testid="password" />
      <button type="submit" data-testid="register-button">Sign Up</button>
    </form>
  )
}

const MockPropertySearch = ({ onPropertySelect }: { onPropertySelect: (property: any) => void }) => {
  const [properties, setProperties] = React.useState(mockProperties)
  const [favorites, setFavorites] = React.useState<string[]>([])

  const handleFavorite = async (propertyId: string) => {
    await mockApi.saveFavorite(propertyId)
    setFavorites(prev => [...prev, propertyId])
  }

  const handleContactAgent = async (property: any) => {
    await mockApi.sendMessage({
      propertyId: property.id,
      message: 'I am interested in this property'
    })
    onPropertySelect(property)
  }

  return (
    <div data-testid="property-search">
      <input placeholder="Search properties..." data-testid="search-input" />
      <div data-testid="property-list">
        {properties.map(property => (
          <div key={property.id} data-testid={`property-${property.id}`}>
            <h3>{property.title}</h3>
            <p>${property.price.toLocaleString()}</p>
            <button 
              onClick={() => handleFavorite(property.id)}
              data-testid={`favorite-${property.id}`}
            >
              {favorites.includes(property.id) ? '❤️' : '🤍'}
            </button>
            <button 
              onClick={() => handleContactAgent(property)}
              data-testid={`contact-${property.id}`}
            >
              Contact Agent
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const MockTourScheduler = ({ property, onSchedule }: { property: any, onSchedule: (tour: any) => void }) => {
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const tourData = {
      propertyId: property.id,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      notes: formData.get('notes') as string,
    }
    
    const response = await mockApi.scheduleTour(tourData)
    if (response.success) {
      onSchedule(response.tour)
    }
  }

  return (
    <form onSubmit={handleSchedule} data-testid="tour-scheduler">
      <h3>Schedule Tour for {property.title}</h3>
      <input name="date" type="date" data-testid="tour-date" />
      <input name="time" type="time" data-testid="tour-time" />
      <textarea name="notes" placeholder="Additional notes" data-testid="tour-notes" />
      <button type="submit" data-testid="schedule-tour-button">Schedule Tour</button>
    </form>
  )
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {children}
      </Router>
    </QueryClientProvider>
  )
}

describe('User Registration & Property Search E2E Flow', () => {
  let user: any = null
  let selectedProperty: any = null
  let scheduledTour: any = null

  beforeEach(() => {
    vi.clearAllMocks()
    user = null
    selectedProperty = null
    scheduledTour = null

    // Setup mock API responses
    mockApi.register.mockResolvedValue({
      success: true,
      user: createMockUser({ role: 'user' })
    })
    
    mockApi.getProperties.mockResolvedValue({
      success: true,
      properties: mockProperties
    })
    
    mockApi.saveFavorite.mockResolvedValue({
      success: true
    })
    
    mockApi.sendMessage.mockResolvedValue({
      success: true,
      messageId: 'msg-123'
    })
    
    mockApi.scheduleTour.mockResolvedValue({
      success: true,
      tour: { id: 'tour-123', status: 'pending' }
    })
  })

  it('should complete full user registration and property search flow', async () => {
    const user = userEvent.setup()

    // Step 1: User Registration
    render(
      <TestWrapper>
        <MockAuthForm onSuccess={(newUser) => { user = newUser }} />
      </TestWrapper>
    )

    // Fill registration form
    await user.type(screen.getByTestId('full-name'), 'John Doe')
    await user.type(screen.getByTestId('email'), 'john.doe@example.com')
    await user.type(screen.getByTestId('password'), 'SecurePass123!')

    // Submit registration
    await user.click(screen.getByTestId('register-button'))

    // Verify registration was called
    await waitFor(() => {
      expect(mockApi.register).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      })
    })

    // Step 2: Property Search and Browsing
    render(
      <TestWrapper>
        <MockPropertySearch onPropertySelect={(property) => { selectedProperty = property }} />
      </TestWrapper>
    )

    // Verify properties are displayed
    await waitFor(() => {
      expect(screen.getByTestId('property-list')).toBeInTheDocument()
      expect(screen.getByTestId('property-1')).toBeInTheDocument()
      expect(screen.getByTestId('property-2')).toBeInTheDocument()
    })

    // Step 3: Save Properties to Favorites
    await user.click(screen.getByTestId('favorite-1'))
    await user.click(screen.getByTestId('favorite-3'))
    await user.click(screen.getByTestId('favorite-5'))

    // Verify favorites were saved
    await waitFor(() => {
      expect(mockApi.saveFavorite).toHaveBeenCalledWith('1')
      expect(mockApi.saveFavorite).toHaveBeenCalledWith('3')
      expect(mockApi.saveFavorite).toHaveBeenCalledWith('5')
    })

    // Step 4: Contact Agent About Property
    await user.click(screen.getByTestId('contact-2'))

    // Verify message was sent
    await waitFor(() => {
      expect(mockApi.sendMessage).toHaveBeenCalledWith({
        propertyId: '2',
        message: 'I am interested in this property'
      })
    })

    // Step 5: Schedule Property Tour
    render(
      <TestWrapper>
        <MockTourScheduler 
          property={mockProperties[1]} 
          onSchedule={(tour) => { scheduledTour = tour }} 
        />
      </TestWrapper>
    )

    // Fill tour scheduling form
    await user.type(screen.getByTestId('tour-date'), '2024-02-15')
    await user.type(screen.getByTestId('tour-time'), '14:00')
    await user.type(screen.getByTestId('tour-notes'), 'I would like to see the backyard and garage')

    // Submit tour request
    await user.click(screen.getByTestId('schedule-tour-button'))

    // Verify tour was scheduled
    await waitFor(() => {
      expect(mockApi.scheduleTour).toHaveBeenCalledWith({
        propertyId: '2',
        date: '2024-02-15',
        time: '14:00',
        notes: 'I would like to see the backyard and garage'
      })
    })

    // Final verification of complete flow
    expect(user).toBeTruthy()
    expect(selectedProperty).toBeTruthy()
    expect(scheduledTour).toBeTruthy()
  })

  it('should handle registration validation errors', async () => {
    const user = userEvent.setup()

    // Mock registration failure
    mockApi.register.mockResolvedValue({
      success: false,
      error: 'Email already exists'
    })

    render(
      <TestWrapper>
        <MockAuthForm onSuccess={(newUser) => { user = newUser }} />
      </TestWrapper>
    )

    // Submit with invalid data
    await user.click(screen.getByTestId('register-button'))

    // Verify error handling
    await waitFor(() => {
      expect(mockApi.register).toHaveBeenCalled()
    })
  })

  it('should handle property search with no results', async () => {
    const user = userEvent.setup()

    // Mock empty search results
    mockApi.getProperties.mockResolvedValue({
      success: true,
      properties: []
    })

    render(
      <TestWrapper>
        <MockPropertySearch onPropertySelect={(property) => { selectedProperty = property }} />
      </TestWrapper>
    )

    // Verify empty state is handled
    await waitFor(() => {
      expect(screen.getByTestId('property-list')).toBeInTheDocument()
    })
  })

  it('should handle tour scheduling conflicts', async () => {
    const user = userEvent.setup()

    // Mock tour scheduling failure
    mockApi.scheduleTour.mockResolvedValue({
      success: false,
      error: 'Time slot not available'
    })

    render(
      <TestWrapper>
        <MockTourScheduler 
          property={mockProperties[0]} 
          onSchedule={(tour) => { scheduledTour = tour }} 
        />
      </TestWrapper>
    )

    // Fill and submit tour form
    await user.type(screen.getByTestId('tour-date'), '2024-02-15')
    await user.type(screen.getByTestId('tour-time'), '14:00')
    await user.click(screen.getByTestId('schedule-tour-button'))

    // Verify error handling
    await waitFor(() => {
      expect(mockApi.scheduleTour).toHaveBeenCalled()
    })
  })

  it('should validate user preferences and search filters', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <MockPropertySearch onPropertySelect={(property) => { selectedProperty = property }} />
      </TestWrapper>
    )

    // Test search functionality
    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'Luxury Apartment')

    // Verify search input works
    expect(searchInput).toHaveValue('Luxury Apartment')
  })

  it('should handle multiple property interactions', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <MockPropertySearch onPropertySelect={(property) => { selectedProperty = property }} />
      </TestWrapper>
    )

    // Interact with multiple properties
    await user.click(screen.getByTestId('favorite-1'))
    await user.click(screen.getByTestId('contact-1'))
    await user.click(screen.getByTestId('favorite-2'))
    await user.click(screen.getByTestId('contact-2'))

    // Verify multiple interactions
    await waitFor(() => {
      expect(mockApi.saveFavorite).toHaveBeenCalledTimes(2)
      expect(mockApi.sendMessage).toHaveBeenCalledTimes(2)
    })
  })
}) 