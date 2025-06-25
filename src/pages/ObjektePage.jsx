// ObjektePage.jsx - Objekte-Übersichtsseite
// Clara360 Objekt-Verwaltung - Slot A47.10 VPS-Integration

import React from 'react'
import { Building2, Plus, AlertCircle } from 'lucide-react'
import useProperties from '../components/Objekte/useProperties'
import ObjektCard from '../components/Objekte/ObjektCard'

const ObjektePage = () => {
  const { properties, loading, error, refetch } = useProperties()

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Meine Immobilienobjekte</h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Ihre Immobilien-Portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 w-20 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="w-full h-12 bg-gray-200 rounded"></div>
                  <div className="w-full h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Meine Immobilienobjekte</h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Ihre Immobilien-Portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Fehler beim Laden der Objekte
              </h3>
              <p className="text-red-700 mt-1">
                {error.message || 'Unbekannter Fehler beim Laden der Immobilienobjekte'}
              </p>
              <button 
                onClick={refetch}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Meine Immobilienobjekte</h1>
              <p className="text-gray-600 mt-1">
                {properties.length} {properties.length === 1 ? 'Objekt' : 'Objekte'} in Ihrem Portfolio
              </p>
            </div>
          </div>
          
          {/* Add Button (für später) */}
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            onClick={() => {
              console.log('[Objekte] Neues Objekt hinzufügen')
              // TODO: Navigation zu Objekt-Erstellung
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Objekt hinzufügen
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Noch kein Objekt vorhanden
          </h3>
          <p className="text-gray-600 mb-6">
            Fügen Sie Ihr erstes Immobilienobjekt hinzu, um mit der Verwaltung zu beginnen.
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center"
            onClick={() => {
              console.log('[Objekte] Erstes Objekt hinzufügen')
              // TODO: Navigation zu Objekt-Erstellung
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Erstes Objekt hinzufügen
          </button>
        </div>
      ) : (
        // Properties Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <ObjektCard 
              key={property.id} 
              property={property} 
            />
          ))}
        </div>
      )}

      {/* Statistics Summary (wenn Objekte vorhanden) */}
      {properties.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio-Übersicht</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {properties.length}
              </p>
              <p className="text-sm text-gray-600">
                {properties.length === 1 ? 'Objekt' : 'Objekte'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Einheiten gesamt</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                EUR {properties
                  .reduce((sum, prop) => sum + (prop.purchase_price || 0), 0)
                  .toLocaleString('de-DE')}
              </p>
              <p className="text-sm text-gray-600">Investitionssumme</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ObjektePage
