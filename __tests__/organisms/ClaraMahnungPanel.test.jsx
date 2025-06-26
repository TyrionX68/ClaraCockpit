import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClaraMahnungPanel from '../../src/components/organisms/ClaraMahnungPanel';

/**
 * ClaraMahnungPanel Tests
 * Created: 2025-06-26_16-50-17
 * 
 * Test suite for the dunning management panel organism component
 */

describe('ClaraMahnungPanel', () => {
  const defaultProps = {
    tenantId: 'T001',
    tenantName: 'Max Mustermann',
    dueAmount: 850,
    lastPaymentDate: '2025-05-15',
    status: 1
  };

  it('renders panel with correct tenant information', () => {
    render(<ClaraMahnungPanel {...defaultProps} />);
    
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('T001')).toBeInTheDocument();
    expect(screen.getByText('850,00 €')).toBeInTheDocument();
  });

  it('displays correct dunning level for status 1', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={1} />);
    
    expect(screen.getByText('1. Mahnung')).toBeInTheDocument();
    expect(screen.getByText('Freundliche Zahlungserinnerung')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('displays correct dunning level for status 2', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={2} />);
    
    expect(screen.getByText('2. Mahnung')).toBeInTheDocument();
    expect(screen.getByText('Dringende Zahlungsaufforderung')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('displays correct dunning level for status 3', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={3} />);
    
    expect(screen.getByText('3. Mahnung')).toBeInTheDocument();
    expect(screen.getByText('Letzte Mahnung vor Inkasso')).toBeInTheDocument();
    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('shows escalation warning for status 3', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={3} />);
    
    expect(screen.getByText('Inkassovorbereitung aktiv - Rechtliche Schritte eingeleitet')).toBeInTheDocument();
  });

  it('shows escalate button for status 1 and 2', () => {
    const { rerender } = render(<ClaraMahnungPanel {...defaultProps} status={1} />);
    expect(screen.getByText('Mahnstufe erhöhen')).toBeInTheDocument();
    
    rerender(<ClaraMahnungPanel {...defaultProps} status={2} />);
    expect(screen.getByText('Mahnstufe erhöhen')).toBeInTheDocument();
  });

  it('shows inkasso button for status 3', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={3} />);
    
    expect(screen.getByText('An Inkasso übergeben')).toBeInTheDocument();
    expect(screen.queryByText('Mahnstufe erhöhen')).not.toBeInTheDocument();
  });

  it('calls onEscalate when escalate button is clicked', () => {
    const mockOnEscalate = vi.fn();
    render(
      <ClaraMahnungPanel 
        {...defaultProps} 
        status={1} 
        onEscalate={mockOnEscalate} 
      />
    );
    
    const escalateButton = screen.getByText('Mahnstufe erhöhen');
    fireEvent.click(escalateButton);
    
    expect(mockOnEscalate).toHaveBeenCalledWith('T001', 2);
  });

  it('calls onGeneratePDF when PDF button is clicked', () => {
    const mockOnGeneratePDF = vi.fn();
    render(
      <ClaraMahnungPanel 
        {...defaultProps} 
        onGeneratePDF={mockOnGeneratePDF} 
      />
    );
    
    const pdfButton = screen.getByText('Mahnbrief generieren');
    fireEvent.click(pdfButton);
    
    expect(mockOnGeneratePDF).toHaveBeenCalledWith('T001', 1);
  });

  it('displays timeline with correct status highlighting', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={2} />);
    
    expect(screen.getByText('Mahnverfahren Timeline')).toBeInTheDocument();
    expect(screen.getByText('1. Mahnung versendet')).toBeInTheDocument();
    expect(screen.getByText('2. Mahnung versendet')).toBeInTheDocument();
    expect(screen.getByText('3. Mahnung / Inkassovorbereitung')).toBeInTheDocument();
  });

  it('allows editing internal notes', () => {
    render(<ClaraMahnungPanel {...defaultProps} />);
    
    const notesTextarea = screen.getByPlaceholderText('Notizen zum Mahnverfahren, Kontaktversuche, etc...');
    fireEvent.change(notesTextarea, { target: { value: 'Test note' } });
    
    expect(notesTextarea.value).toBe('Test note');
  });

  it('displays debug information', () => {
    render(<ClaraMahnungPanel {...defaultProps} status={2} dueAmount={1200} />);
    
    expect(screen.getByText('Entwickler-Debug: Status=2, Amount=1200')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<ClaraMahnungPanel {...defaultProps} dueAmount={1234.56} />);
    
    expect(screen.getByText('1.234,56 €')).toBeInTheDocument();
  });

  it('handles missing last payment date', () => {
    render(<ClaraMahnungPanel {...defaultProps} lastPaymentDate={null} />);
    
    expect(screen.getByText('Nicht verfügbar')).toBeInTheDocument();
  });
});
