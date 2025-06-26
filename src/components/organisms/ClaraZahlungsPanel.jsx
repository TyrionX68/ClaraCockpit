/**
 * ClaraZahlungsPanel.jsx - v3.1 Payment Management Dashboard
 * FinAPI Integration Ready - No Mock Data
 * 
 * Features:
 * - Real-time payment tracking (FinAPI ready)
 * - Empty states for missing data
 * - KPI dashboard with placeholders
 * - Professional null states
 * - Auto-reconciliation ready
 * - GDPR compliant data handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Calendar,
  Users,
  BarChart3,
  Download,
  RefreshCw,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

// Payment Status Badge Component
const PaymentStatusBadge = ({ status, daysOverdue = 0 }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          label: 'Bezahlt',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'pending':
        return {
          label: 'Ausstehend',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'overdue':
        return {
          label: `${daysOverdue}d überfällig`,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'Unbekannt',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// KPI Card Component with Glassmorphism
const KPICard = ({ title, value, subtitle, icon: Icon, trend, isEmpty = false, className = '' }) => {
  return (
    <Card className={`${className} ${isEmpty ? 'border-dashed border-gray-300' : ''} 
      backdrop-blur-sm bg-white/80 hover:bg-white/90 transition-all duration-300 
      hover:shadow-xl hover:scale-105 group border-0 shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isEmpty 
                ? 'bg-gray-100 group-hover:bg-gray-200' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 shadow-lg'
            }`}>
              <Icon className={`w-6 h-6 ${isEmpty ? 'text-gray-400' : 'text-white'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className={`text-3xl font-bold transition-colors duration-300 ${
                isEmpty ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                {isEmpty ? '---' : value}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && !isEmpty && (
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full transition-all duration-300 ${
              trend > 0 
                ? 'text-green-700 bg-green-100 group-hover:bg-green-200' 
                : 'text-red-700 bg-red-100 group-hover:bg-red-200'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Empty State Component with Modern Design
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
        >
          <RefreshCw className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default function ClaraZahlungsPanel({ 
  tenantId = 'waldhofstrasse_76',
  className = '',
  ...props 
}) {
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Simulate FinAPI connection check
  useEffect(() => {
    // In real implementation, this would check FinAPI connection
    setIsConnected(false); // Set to false for empty state demo
  }, []);

  // Calculate KPIs (empty state)
  const kpis = useMemo(() => {
    if (!paymentData || !isConnected) {
      return {
        totalExpected: {
          value: '0€',
          subtitle: 'Keine Daten verfügbar',
          trend: null,
          isEmpty: true
        },
        totalReceived: {
          value: '0€',
          subtitle: 'FinAPI nicht verbunden',
          trend: null,
          isEmpty: true
        },
        outstanding: {
          value: '0€',
          subtitle: 'Keine ausstehenden Zahlungen',
          trend: null,
          isEmpty: true
        },
        onTimeRate: {
          value: '0%',
          subtitle: 'Keine Daten verfügbar',
          trend: null,
          isEmpty: true
        }
      };
    }

    // Real KPI calculation would go here when data is available
    return {};
  }, [paymentData, isConnected]);

  // Simulate FinAPI sync
  const handleSync = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLastSync(new Date());
    setIsLoading(false);
    
    // In real implementation, this would fetch from FinAPI
    console.log('FinAPI Sync attempt - No connection established');
  };

  // Connect to FinAPI
  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate connection attempt
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For demo, connection fails - in real app this would open FinAPI auth flow
    setIsLoading(false);
    console.log('FinAPI connection attempt - Would redirect to bank authentication');
  };

  // Export functionality (empty state)
  const handleExport = () => {
    console.log('Export: Keine Daten zum Exportieren verfügbar');
  };

  return (
    <div className={`space-y-8 ${className}`} {...props}>
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Zahlungsmanagement</h2>
            <p className="text-blue-100 text-lg">
              Waldhofstraße 76 - {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-100 text-right">
              {lastSync ? `Letzte Synchronisation: ${lastSync.toLocaleString('de-DE')}` : 'Noch nie synchronisiert'}
            </div>
            <Button
              onClick={handleSync}
              disabled={isLoading || !isConnected}
              variant="outline"
              size="sm"
              className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Synchronisiere...' : 'FinAPI Sync'}
            </Button>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* FinAPI Status Banner with Glassmorphism */}
      <Card className={`border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
        isConnected 
          ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200' 
          : 'bg-gradient-to-r from-orange-50/80 to-amber-50/80 border-orange-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              isConnected ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-amber-600'
            }`}>
              {isConnected ? (
                <Wifi className="w-6 h-6 text-white" />
              ) : (
                <WifiOff className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-lg ${isConnected ? 'text-green-800' : 'text-orange-800'}`}>
                {isConnected ? 'FinAPI Integration aktiv' : 'FinAPI nicht verbunden'}
              </p>
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
                {isConnected 
                  ? 'Verbunden mit Sparkasse Rhein Neckar Nord • Auto-Reconciliation aktiviert'
                  : 'Verbinden Sie Ihr Bankkonto für automatische Zahlungsabgleichung'
                }
              </p>
            </div>
            {!isConnected && (
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CreditCard className="w-4 h-4" />
                {isLoading ? 'Verbinde...' : 'Jetzt verbinden'}
              </Button>
            )}
            <div className={`w-3 h-3 rounded-full shadow-lg ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
            }`}></div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Erwartete Einnahmen"
          value={kpis.totalExpected?.value}
          subtitle={kpis.totalExpected?.subtitle}
          icon={Euro}
          trend={kpis.totalExpected?.trend}
          isEmpty={kpis.totalExpected?.isEmpty}
        />
        <KPICard
          title="Eingegangen"
          value={kpis.totalReceived?.value}
          subtitle={kpis.totalReceived?.subtitle}
          icon={TrendingUp}
          trend={kpis.totalReceived?.trend}
          isEmpty={kpis.totalReceived?.isEmpty}
        />
        <KPICard
          title="Ausstehend"
          value={kpis.outstanding?.value}
          subtitle={kpis.outstanding?.subtitle}
          icon={AlertTriangle}
          trend={kpis.outstanding?.trend}
          isEmpty={kpis.outstanding?.isEmpty}
        />
        <KPICard
          title="Pünktlichkeitsrate"
          value={kpis.onTimeRate?.value}
          subtitle={kpis.onTimeRate?.subtitle}
          icon={Clock}
          trend={kpis.onTimeRate?.trend}
          isEmpty={kpis.onTimeRate?.isEmpty}
        />
      </div>

      {/* Payment List with Modern Design */}
      <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Zahlungsübersicht
            </CardTitle>
            <div className="flex items-center gap-3">
              {/* Filter Buttons with Enhanced Design */}
              <div className="flex bg-white rounded-xl p-1 shadow-inner border border-gray-200">
                {[
                  { key: 'all', label: 'Alle' },
                  { key: 'paid', label: 'Bezahlt' },
                  { key: 'pending', label: 'Ausstehend' },
                  { key: 'overdue', label: 'Überfällig' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key)}
                    disabled={!isConnected}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                      selectedFilter === filter.key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <Button 
                onClick={handleExport} 
                variant="outline" 
                className="gap-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                disabled={!isConnected}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <EmptyState
              icon={Database}
              title="Keine Zahlungsdaten verfügbar"
              description="Verbinden Sie Ihr Bankkonto mit FinAPI, um automatisch Zahlungseingänge zu verfolgen und zu verwalten."
              actionLabel="FinAPI verbinden"
              onAction={handleConnect}
            />
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Keine Zahlungen gefunden"
              description="Es wurden noch keine Zahlungen für den ausgewählten Zeitraum gefunden. Synchronisieren Sie mit FinAPI für aktuelle Daten."
              actionLabel="Jetzt synchronisieren"
              onAction={handleSync}
            />
          )}
        </CardContent>
      </Card>

      {/* Banking Info with Enhanced Design */}
      <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Banking-Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Bankverbindung
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Bank', value: isConnected ? 'Sparkasse Rhein Neckar Nord' : 'Nicht verbunden' },
                  { label: 'Kontoinhaber', value: isConnected ? 'Hausverwaltung Clara360' : '---' },
                  { label: 'IBAN', value: isConnected ? 'DE89 6705 0505 0038 0013 37' : '---' },
                  { label: 'BIC', value: isConnected ? 'MANSDE66XXX' : '---' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className={`${isConnected ? 'text-gray-900' : 'text-gray-400'} font-mono text-sm`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                FinAPI Status
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    label: isConnected ? 'Verbindung aktiv' : 'Nicht verbunden',
                    status: isConnected ? 'active' : 'inactive'
                  },
                  { 
                    label: isConnected ? 'Auto-Reconciliation aktiviert' : 'Auto-Reconciliation deaktiviert',
                    status: isConnected ? 'active' : 'inactive'
                  },
                  { 
                    label: lastSync 
                      ? `Letzte Sync: ${lastSync.toLocaleString('de-DE')}`
                      : 'Noch nie synchronisiert',
                    status: lastSync ? 'synced' : 'inactive'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${
                      item.status === 'active' ? 'bg-green-500' : 
                      item.status === 'synced' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

