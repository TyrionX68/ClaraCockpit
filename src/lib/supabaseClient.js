// Clara360 Supabase Client - PRODUCTION READY
// Updated with working credentials after successful migration
// Author: Manus AI

import { createClient } from '@supabase/supabase-js'

// Environment variables with working credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://anhomormslputicoybng.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_SECRET_KEY || 'sb_secret_xcgpEzqGe5FMLa5v3kqD4A_RFShJtYq'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing!')
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SECRET_KEY')
}

// Create Supabase client with working configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'clara360-v2.1-migrated'
    }
  }
})

// Property Service - English Tables
export const propertyService = {
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Property Service Error:', error)
      return []
    }
    
    console.log('✅ Properties loaded:', data?.length || 0)
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Property by ID Error:', error)
      return null
    }
    
    return data
  }
}

// Owner Service - English Tables
export const ownerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Owner Service Error:', error)
      return []
    }
    
    console.log('✅ Owners loaded:', data?.length || 0)
    return data || []
  },

  async create(owner) {
    const { data, error } = await supabase
      .from('owners')
      .insert([owner])
      .select()
    
    if (error) {
      console.error('❌ Owner Create Error:', error)
      return null
    }
    
    console.log('✅ Owner created:', data[0])
    return data[0]
  }
}

// Tenant Service - English Tables
export const tenantService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Tenant Service Error:', error)
      return []
    }
    
    console.log('✅ Tenants loaded:', data?.length || 0)
    return data || []
  }
}

// KPI Service - Aggregated Data
export const kpiService = {
  async getDashboardData() {
    try {
      const [properties, owners, tenants] = await Promise.all([
        propertyService.getAll(),
        ownerService.getAll(),
        tenantService.getAll()
      ])

      return {
        properties: {
          total: properties.length,
          active: properties.filter(p => p.property_status === 'active').length
        },
        owners: {
          total: owners.length
        },
        tenants: {
          total: tenants.length,
          active: tenants.filter(t => t.status === 'active').length
        },
        timestamp: new Date().toISOString(),
        dataSource: 'live_supabase_migrated'
      }
    } catch (error) {
      console.error('❌ KPI Service Error:', error)
      return {
        error: 'KPI data not available',
        timestamp: new Date().toISOString(),
        dataSource: 'error'
      }
    }
  }
}

export default supabase
