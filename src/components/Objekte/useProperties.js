// useProperties.js - ReadOnly Supabase Hook für Properties-Daten
// Clara360 Objekt-Verwaltung - Slot A47.10 VPS-Integration

import { useState, useEffect } from 'react'
import supabase from '../../lib/supabaseClient'

export const useProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[Objekte] Lade Properties aus Supabase (VPS ReadOnly)...')

      // ReadOnly Supabase-Abfrage für alle aktiven Objekte
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .eq('property_status', 'active')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.warn('[Objekte] Supabase Fehler:', supabaseError)
        setError(supabaseError)
        return
      }

      console.log('[Objekte] Properties geladen (VPS):', data)
      setProperties(data || [])

    } catch (err) {
      console.warn('[Objekte] Fehler beim Laden:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Lade Properties beim ersten Aufruf
  useEffect(() => {
    fetchProperties()
  }, [])

  // Einzelnes Property laden (ReadOnly)
  const getPropertyById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.warn('[Objekte] Fehler beim Laden einzelner Property:', error)
        return null
      }

      console.log('[Objekte] Property geladen (VPS):', data)
      return data
    } catch (err) {
      console.warn('[Objekte] Fehler:', err)
      return null
    }
  }

  // Statistiken berechnen (ReadOnly)
  const getPropertyStats = () => {
    const totalProperties = properties.length
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0)
    const totalInvestment = properties.reduce((sum, prop) => sum + (prop.purchase_price || 0), 0)
    
    return {
      totalProperties,
      totalUnits,
      totalInvestment
    }
  }

  // Nur ReadOnly-Funktionen exportieren
  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    getPropertyById,
    getPropertyStats
  }
}

export default useProperties
