// ObjektCard.jsx - Einzelne Property-Karte
// Clara360 Objekt-Verwaltung - Slot A47.10 VPS-Integration

import React from 'react'
import { Building2, MapPin, Users, Euro, Calendar } from 'lucide-react'

const ObjektCard = ({ property }) => {
  // Formatiere Kaufpreis
  const formatPrice = (price) => {
    if (price == null) return 'Nicht angegeben'
    return 'EUR ' + price.toLocaleString('de-DE')
  }

  // Formatiere Datum
  const formatDate = (dateString) => {
    if (dateString == null) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header mit Icon und Typ */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-3">
          <span className="text-sm text-gray-500 font-medium">
            {property.property_type || 'Immobilie'}
          </span>
        </div>
      </div>

      {/* Property Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {property.property_name}
      </h3>

      {/* Adresse */}
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-2" />
        <span className="text-sm">
          {property.address}
          {property.city && ', ' + property.city}
        </span>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Einheiten */}
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Einheiten</p>
            <p className="font-semibold text-gray-900">
              {property.total_units || 0}
            </p>
          </div>
        </div>

        {/* Kaufpreis */}
        <div className="flex items-center">
          <Euro className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Kaufpreis</p>
            <p className="font-semibold text-gray-900 text-sm">
              {formatPrice(property.purchase_price)}
            </p>
          </div>
        </div>
      </div>

      {/* Zusätzliche Informationen */}
      {property.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {property.notes}
          </p>
        </div>
      )}

      {/* Erstellungsdatum */}
      <div className="flex items-center text-xs text-gray-400 mb-4">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Erstellt: {formatDate(property.created_at)}</span>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={property.property_status === 'active' 
              ? 'bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' 
              : 'bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'}>
            {property.property_status === 'active' ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>
        
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          onClick={() => {
            console.log('[Objekte] Einheiten anzeigen für:', property.property_name)
            // TODO: Navigation zu Einheiten-Detailseite
          }}
        >
          Einheiten anzeigen
        </button>
      </div>
    </div>
  )
}

export default ObjektCard
