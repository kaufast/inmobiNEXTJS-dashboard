import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateProperty, PropertyRow, getCitiesForCountry, isCityValidForCountry } from './csv-parser'

describe('CSV Parser', () => {
  describe('getCitiesForCountry', () => {
    it('should return cities for valid countries', () => {
      const usCities = getCitiesForCountry('US')
      expect(usCities).toContain('New York')
      expect(usCities).toContain('Los Angeles')
      expect(usCities).toContain('Chicago')
    })

    it('should return empty array for invalid countries', () => {
      const cities = getCitiesForCountry('InvalidCountry')
      expect(cities).toEqual([])
    })
  })

  describe('isCityValidForCountry', () => {
    it('should validate US cities correctly', () => {
      expect(isCityValidForCountry('New York', 'US')).toBe(true)
      expect(isCityValidForCountry('InvalidCity', 'US')).toBe(false)
    })

    it('should return true for unknown countries', () => {
      expect(isCityValidForCountry('AnyCity', 'UnknownCountry')).toBe(true)
    })
  })

  describe('validateProperty', () => {
    let validProperty: PropertyRow

    beforeEach(() => {
      validProperty = {
        id: '1',
        title: 'Test Property',
        country: 'US',
        address: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        telephone: '+1234567890',
        price: 500000,
        propertyType: 'House',
        listingType: 'Sale',
        bedrooms: 2,
        toilets: 2,
        propertySize: 1000,
        yearBuilt: 2020,
        parkingSpace: '1 space',
        description: 'A test property with good amenities',
        isValid: false,
        errors: [],
        warnings: []
      }
    })

    it('should validate a valid property', () => {
      const result = validateProperty(validProperty)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const invalidProperty = { ...validProperty, title: '' }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    it('should validate price is a number', () => {
      const invalidProperty = { ...validProperty, price: 'not-a-number' as any }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('price'))).toBe(true)
    })

    it('should validate bedrooms and toilets are positive numbers', () => {
      const invalidProperty = { ...validProperty, bedrooms: -1, toilets: 0 }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('bedrooms'))).toBe(true)
    })

    it('should validate property type', () => {
      const invalidProperty = { ...validProperty, propertyType: 'invalid-type' as any }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('propertyType'))).toBe(true)
    })

    it('should validate listing type', () => {
      const invalidProperty = { ...validProperty, listingType: 'invalid-listing' as any }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('listingType'))).toBe(true)
    })

    it('should validate telephone length', () => {
      const invalidProperty = { ...validProperty, telephone: '123' }
      const result = validateProperty(invalidProperty)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('telephone'))).toBe(true)
    })

    it('should allow optional fields to be empty', () => {
      const propertyWithoutOptionals = {
        ...validProperty,
        yearBuilt: undefined,
        parkingSpace: undefined
      }
      const result = validateProperty(propertyWithoutOptionals)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('Property Type Validation', () => {
    it('should validate correct property types', () => {
      const validTypes = ['House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Commercial', 'Land']
      const baseProperty = {
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
        isValid: false,
        errors: [],
        warnings: []
      }
      
      validTypes.forEach(type => {
        const testProperty = { ...baseProperty, propertyType: type }
        const result = validateProperty(testProperty)
        expect(result.errors.some(error => error.includes('propertyType'))).toBe(false)
      })
    })

    it('should reject invalid property types', () => {
      const invalidTypes = ['mansion', 'castle', 'tent', 'boat', '']
      const baseProperty = {
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
        isValid: false,
        errors: [],
        warnings: []
      }
      
      invalidTypes.forEach(type => {
        const testProperty = { ...baseProperty, propertyType: type }
        const result = validateProperty(testProperty)
        expect(result.errors.some(error => error.includes('propertyType'))).toBe(true)
      })
    })
  })

  describe('Listing Type Validation', () => {
    it('should validate correct listing types', () => {
      const validTypes = ['Sale', 'Rent']
      const baseProperty = {
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
        isValid: false,
        errors: [],
        warnings: []
      }
      
      validTypes.forEach(type => {
        const testProperty = { ...baseProperty, listingType: type as 'Sale' | 'Rent' }
        const result = validateProperty(testProperty)
        expect(result.errors.some(error => error.includes('listingType'))).toBe(false)
      })
    })

    it('should reject invalid listing types', () => {
      const invalidTypes = ['lease', 'buy', 'sell', 'rental', '']
      const baseProperty = {
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
        isValid: false,
        errors: [],
        warnings: []
      }
      
      invalidTypes.forEach(type => {
        const testProperty = { ...baseProperty, listingType: type as 'Sale' | 'Rent' }
        const result = validateProperty(testProperty)
        expect(result.errors.some(error => error.includes('listingType'))).toBe(true)
      })
    })
  })
})