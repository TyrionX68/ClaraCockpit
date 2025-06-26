import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from '../../src/pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders dashboard header correctly', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Clara360 Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Immobilienverwaltung v3.0')).toBeInTheDocument();
  });

  it('renders all three slots', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Mieter Übersicht')).toBeInTheDocument();
    expect(screen.getByText('Mahnwesen')).toBeInTheDocument();
    expect(screen.getByText('Erweiterungen')).toBeInTheDocument();
  });

  it('shows placeholder for future extensions slot', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Slot zukunft ist noch leer')).toBeInTheDocument();
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
  });

  it('toggles debug mode correctly', () => {
    render(<DashboardPage />);
    
    const debugButton = screen.getByText('Debug: OFF');
    fireEvent.click(debugButton);
    
    expect(screen.getByText('Debug: ON')).toBeInTheDocument();
    expect(screen.getByText('DEBUG INFORMATION')).toBeInTheDocument();
  });

  it('displays tenant and mahnung data counts in debug mode', () => {
    render(<DashboardPage />);
    
    const debugButton = screen.getByText('Debug: OFF');
    fireEvent.click(debugButton);
    
    expect(screen.getByText(/Tenant data: \d+ entries loaded/)).toBeInTheDocument();
    expect(screen.getByText(/Mahnung data: \d+ entries loaded/)).toBeInTheDocument();
  });

  it('renders footer with version information', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Clara360 v3.0 - Modular Dashboard Architecture')).toBeInTheDocument();
    expect(screen.getByText('Powered by Atomic Design')).toBeInTheDocument();
  });
});
