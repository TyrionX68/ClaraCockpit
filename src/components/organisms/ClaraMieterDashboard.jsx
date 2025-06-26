import React, { useState, useEffect } from 'react';
import ClaraKpiBox from '../molecules/ClaraKpiBox';
import ClaraButton from '../atoms/ClaraButton';
import { cn } from '../../lib/utils';

/**
 * ClaraMieterDashboard - Main Tenant Management Dashboard
 * Created: 2025-06-26_16-33-27
 * 
 * First v3.0 Organism Component following Atomic Design
 * 
 * @param {Object} props
 * @param {Array} props.tenantData - array of tenant objects
 * @param {function} props.onSelectTenant - callback for tenant selection
 * @param {Object} props.filterOptions - filtering options
 */
const ClaraMieterDashboard = ({ 
  tenantData = [], 
  onSelectTenant, 
  filterOptions = {},
  className,
  ...props 
}) => {
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalTenants: 0,
    activeLeases: 0,
    overduePayments: 0,
    totalRevenue: 0
  });

  // Mock data for development
  const mockTenantData = [
    {
      id: 1,
      name: 'Max Mustermann',
      unit: 'Waldhofstraße 12, Wohnung 1A',
      rent: 850,
      status: 'active',
      paymentStatus: 'current',
      lastPayment: '2025-06-01'
    },
    {
      id: 2,
      name: 'Anna Schmidt',
      unit: 'Waldhofstraße 12, Wohnung 2B',
      rent: 920,
      status: 'active',
      paymentStatus: 'overdue',
      lastPayment: '2025-05-15'
    },
    {
      id: 3,
      name: 'Thomas Weber',
      unit: 'Waldhofstraße 12, Wohnung 3C',
      rent: 780,
      status: 'active',
      paymentStatus: 'current',
      lastPayment: '2025-06-01'
    }
  ];

  useEffect(() => {
    // Use provided data or fallback to mock data
    const dataToUse = tenantData.length > 0 ? tenantData : mockTenantData;
    setFilteredTenants(dataToUse);
    
    // Calculate dashboard statistics
    const stats = {
      totalTenants: dataToUse.length,
      activeLeases: dataToUse.filter(t => t.status === 'active').length,
      overduePayments: dataToUse.filter(t => t.paymentStatus === 'overdue').length,
      totalRevenue: dataToUse.reduce((sum, t) => sum + t.rent, 0)
    };
    setDashboardStats(stats);
  }, [tenantData]);

  const handleTenantClick = (tenant) => {
    if (onSelectTenant) {
      onSelectTenant(tenant);
    }
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mieter Dashboard</h2>
          <p className="text-gray-600">Übersicht aller Mieter und Zahlungsstatus</p>
        </div>
        <ClaraButton variant="primary">
          Neuen Mieter hinzufügen
        </ClaraButton>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClaraKpiBox
          title="Gesamte Mieter"
          value={dashboardStats.totalTenants}
          subtitle="Aktive Mietverträge"
          variant="info"
          icon={<span className="text-2xl">👥</span>}
        />
        <ClaraKpiBox
          title="Aktive Verträge"
          value={dashboardStats.activeLeases}
          subtitle="Laufende Mietverhältnisse"
          variant="success"
          trend="up"
          icon={<span className="text-2xl">📋</span>}
        />
        <ClaraKpiBox
          title="Überfällige Zahlungen"
          value={dashboardStats.overduePayments}
          subtitle="Benötigen Aufmerksamkeit"
          variant={dashboardStats.overduePayments > 0 ? "danger" : "success"}
          trend={dashboardStats.overduePayments > 0 ? "down" : "neutral"}
          icon={<span className="text-2xl">⚠️</span>}
        />
        <ClaraKpiBox
          title="Gesamtmiete"
          value={}
          subtitle="Monatliche Einnahmen"
          variant="default"
          trend="up"
          icon={<span className="text-2xl">💰</span>}
        />
      </div>

      {/* Tenant List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mieter Übersicht</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleTenantClick(tenant)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{tenant.name}</h4>
                  <p className="text-sm text-gray-600">{tenant.unit}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">€{tenant.rent}</p>
                    <p className="text-xs text-gray-500">Monatlich</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      tenant.paymentStatus === 'current' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {tenant.paymentStatus === 'current' ? 'Aktuell' : 'Überfällig'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaraMieterDashboard;
