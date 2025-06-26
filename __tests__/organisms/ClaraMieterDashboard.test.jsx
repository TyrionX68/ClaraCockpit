import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClaraMieterDashboard from '../../src/components/organisms/ClaraMieterDashboard';

/**
 * ClaraMieterDashboard Tests
 * Created: 2025-06-26_16-34-05
 * 
 * Test suite for the main tenant dashboard organism component
 */

describe('ClaraMieterDashboard', () => {
  const mockTenantData = [
    {
      id: 1,
      name: 'Test Tenant 1',
      unit: 'Test Unit 1A',
      rent: 800,
      status: 'active',
      paymentStatus: 'current',
      lastPayment: '2025-06-01'
    },
    {
      id: 2,
      name: 'Test Tenant 2',
      unit: 'Test Unit 2B',
      rent: 900,
      status: 'active',
      paymentStatus: 'overdue',
      lastPayment: '2025-05-15'
    }
  ];

  it('renders dashboard header correctly', () => {
    render(<ClaraMieterDashboard />);
    
    expect(screen.getByText('Mieter Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Übersicht aller Mieter und Zahlungsstatus')).toBeInTheDocument();
    expect(screen.getByText('Neuen Mieter hinzufügen')).toBeInTheDocument();
  });

  it('displays KPI boxes with correct data', () => {
    render(<ClaraMieterDashboard tenantData={mockTenantData} />);
    
    expect(screen.getByText('Gesamte Mieter')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total tenants
    expect(screen.getByText('Aktive Verträge')).toBeInTheDocument();
    expect(screen.getByText('Überfällige Zahlungen')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Overdue payments
  });

  it('renders tenant list correctly', () => {
    render(<ClaraMieterDashboard tenantData={mockTenantData} />);
    
    expect(screen.getByText('Test Tenant 1')).toBeInTheDocument();
    expect(screen.getByText('Test Unit 1A')).toBeInTheDocument();
    expect(screen.getByText('Test Tenant 2')).toBeInTheDocument();
    expect(screen.getByText('Test Unit 2B')).toBeInTheDocument();
  });

  it('calls onSelectTenant when tenant is clicked', () => {
    const mockOnSelectTenant = vi.fn();
    render(
      <ClaraMieterDashboard 
        tenantData={mockTenantData} 
        onSelectTenant={mockOnSelectTenant} 
      />
    );
    
    const tenantRow = screen.getByText('Test Tenant 1').closest('div');
    fireEvent.click(tenantRow);
    
    expect(mockOnSelectTenant).toHaveBeenCalledWith(mockTenantData[0]);
  });

  it('displays payment status correctly', () => {
    render(<ClaraMieterDashboard tenantData={mockTenantData} />);
    
    expect(screen.getByText('Aktuell')).toBeInTheDocument();
    expect(screen.getByText('Überfällig')).toBeInTheDocument();
  });

  it('uses mock data when no tenant data provided', () => {
    render(<ClaraMieterDashboard />);
    
    // Should display mock data
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument();
    expect(screen.getByText('Thomas Weber')).toBeInTheDocument();
  });

  it('calculates total revenue correctly', () => {
    render(<ClaraMieterDashboard tenantData={mockTenantData} />);
    
    // Total revenue should be 800 + 900 = 1700
    expect(screen.getByText('€1.700')).toBeInTheDocument();
  });
});
