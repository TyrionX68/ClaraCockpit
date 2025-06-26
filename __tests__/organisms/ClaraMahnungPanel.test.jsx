import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClaraMahnungPanel from '../../src/components/organisms/ClaraMahnungPanel';

describe('ClaraMahnungPanel - Business Logic', () => {
  const baseProps = {
    tenantName: 'Max Mustermann',
    sollMiete: 1000,
    today: '2025-06-26'
  };

  it('shows status 0 when payment is complete', () => {
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={1000}
        lastPaymentDate=2025-06-01
      />
    );
    
    expect(screen.getByText('Zahlung aktuell')).toBeInTheDocument();
    expect(screen.getByText('Level 0')).toBeInTheDocument();
  });

  it('shows status 1 for 10 days overdue', () => {
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={500}
        lastPaymentDate=2025-06-16
      />
    );
    
    expect(screen.getByText('Zahlungserinnerung')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('shows status 2 for 20 days overdue', () => {
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={300}
        lastPaymentDate=2025-06-06
      />
    );
    
    expect(screen.getByText('Formelle Mahnung')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
  });

  it('shows status 3 for 40 days overdue', () => {
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={0}
        lastPaymentDate=2025-05-17
      />
    );
    
    expect(screen.getByText('Inkassovorbereitung')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
  });

  it('generates correct PDF link', () => {
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={500}
        lastPaymentDate=2025-06-16
      />
    );
    
    expect(screen.getByText('/mahnungen/Max_Mustermann_stufe1.pdf')).toBeInTheDocument();
  });

  it('calls onEscalate with correct parameters', () => {
    const mockOnEscalate = vi.fn();
    render(
      <ClaraMahnungPanel 
        {...baseProps}
        istMiete={500}
        lastPaymentDate=2025-06-16
        onEscalate={mockOnEscalate}
      />
    );
    
    const escalateButton = screen.getByText('Mahnstufe erhöhen');
    fireEvent.click(escalateButton);
    
    expect(mockOnEscalate).toHaveBeenCalledWith('Max Mustermann', 2);
  });
});
