import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Some features may not work.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'inmobi-dashboard'
    }
  }
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Properties helpers (for the 80% operations on Supabase)
  async getProperties(limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
    
    return { properties: data || [], total: count || 0, error }
  },

  async searchProperties(params: any) {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })

    // Apply filters
    if (params.country) {
      query = query.ilike('country', `%${params.country}%`)
    }
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`)
    }
    if (params.minPrice) {
      query = query.gte('price', params.minPrice)
    }
    if (params.maxPrice) {
      query = query.lte('price', params.maxPrice)
    }
    if (params.bedrooms) {
      query = query.eq('bedrooms', params.bedrooms)
    }
    if (params.propertyType) {
      query = query.eq('property_type', params.propertyType)
    }
    if (params.listingType) {
      query = query.eq('listing_type', params.listingType)
    }

    // Apply pagination
    const limit = params.limit || 9
    const offset = params.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    return { properties: data || [], total: count || 0, error }
  },

  async getFeaturedProperties(limit = 6) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_premium', true)
      .limit(limit)
    
    return { properties: data || [], error }
  }
}

export default supabase