import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Router } from 'wouter'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock user factory for testing
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  role: 'agent' as const,
  isVerified: true,
  agencyId: 1,
  ...overrides,
})

// Mock property factory for testing
export const createMockProperty = (overrides = {}) => ({
  id: '1',
  title: 'Test Property',
  country: 'US',
  address: '123 Test St',
  city: 'New York',
  zipCode: '10001',
  telephone: '+1234567890',
  price: 500000,
  propertyType: 'House',
  listingType: 'Sale' as const,
  bedrooms: 2,
  toilets: 2,
  propertySize: 1000,
  yearBuilt: 2020,
  parkingSpace: '1 space',
  description: 'A test property with good amenities',
  isValid: true,
  errors: [],
  warnings: [],
  ...overrides,
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }