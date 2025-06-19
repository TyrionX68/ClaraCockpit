// WebForm Modal - FinAPI WebForm Integration
// Clara360 Banking Module
// Author: Manus B

import React, { useState, useEffect } from 'react';
import { X, Search, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function WebFormModal({ onClose }) {
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Popular banks for quick selection
  const popularBanks = [
    { id: '280_20000', name: 'Sparkasse', bic: 'SPKODE' },
    { id: '700_20000', name: 'Deutsche Bank', bic: 'DEUTDE' },
    { id: '760_20000', name: 'Commerzbank', bic: 'COBADE' },
    { id: '500_10517', name: 'ING', bic: 'INGEDE' },
    { id: '120_30000', name: 'DKB', bic: 'BYLADEM1' }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setSearchTerm(bank.name);
    setError(null);
    setSuccess(`Bank ausgewählt: ${bank.name}`);
  };

  const handleWebFormStart = async () => {
    if (!selectedBank) {
      setError('Bitte wählen Sie zuerst eine Bank aus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the backend to create FinAPI WebForm
      const response = await fetch('/api/finapi/waldhofstrasse/webforms/bank-connection-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankId: selectedBank.id,
          accountTypes: ['CHECKING'],
          redirectUri: `${window.location.origin}/banking/callback`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.url) {
        // Redirect to FinAPI WebForm
        window.location.href = data.url;
      } else {
        throw new Error('WebForm URL nicht erhalten');
      }
    } catch (error) {
      console.error('WebForm creation error:', error);
      setError(`Fehler bei der WebForm-Erstellung: ${error.message}`);
    }
    setLoading(false);
  };

  const filteredBanks = popularBanks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bankverbindung hinzufügen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sichere FinAPI-Integration</p>
                <p>Ihre Daten werden verschlüsselt übertragen und nach höchsten Sicherheitsstandards verarbeitet.</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Bank Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank suchen
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Bank suchen (z.B. Sparkasse, Deutsche Bank...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Popular Banks */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              🏦 Beliebte Banken
            </h3>
            <div className="space-y-2">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedBank?.id === bank.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{bank.name}</p>
                      <p className="text-sm text-gray-600">{bank.bic}</p>
                    </div>
                    {selectedBank?.id === bank.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleWebFormStart}
              disabled={loading || !selectedBank}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !selectedBank
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gestartet...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Zu FinAPI weiterleiten
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

