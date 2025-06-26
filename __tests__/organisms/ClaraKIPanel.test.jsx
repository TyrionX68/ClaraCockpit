/**
 * ClaraKIPanel.test.jsx - Test Suite for v3.1 AI Assistant Panel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClaraKIPanel from '../../src/components/organisms/ClaraKIPanel';

// Mock ClaraButton component
vi.mock('../../src/components/atoms/ClaraButton', () => ({
  ClaraButton: ({ children, onClick, disabled, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}));

describe('ClaraKIPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating chat button when closed', () => {
    render(<ClaraKIPanel />);
    
    const chatButton = screen.getByLabelText('Clara KI-Assistent öffnen');
    expect(chatButton).toBeInTheDocument();
    expect(screen.getByText('Clara')).toBeInTheDocument();
  });

  it('opens chat panel when button is clicked', async () => {
    render(<ClaraKIPanel />);
    
    const chatButton = screen.getByLabelText('Clara KI-Assistent öffnen');
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByText('Clara KI-Assistent')).toBeInTheDocument();
      expect(screen.getByText('Hausverwaltung Waldhofstraße 76')).toBeInTheDocument();
    });
  });

  it('displays welcome message when no conversations exist', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    expect(screen.getByText('Hallo! Ich bin Clara 👋')).toBeInTheDocument();
    expect(screen.getByText('Fragen Sie mich zu Mieten, Rückständen oder Wartungen!')).toBeInTheDocument();
  });

  it('sends message and receives AI response', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Hallo Clara' } });
    fireEvent.click(sendButton);
    
    // Check user message appears
    await waitFor(() => {
      expect(screen.getByText('Hallo Clara')).toBeInTheDocument();
    });
    
    // Check thinking indicator
    expect(screen.getByText('Clara denkt...')).toBeInTheDocument();
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/Hallo! Ich bin Clara, Ihr KI-Assistent/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles Enter key to send message', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('disables input and send button while thinking', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);
    
    // During thinking state
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  it('shows character count for input', () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    expect(screen.getByText('5/500 Zeichen')).toBeInTheDocument();
  });

  it('responds appropriately to rent-related questions', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Wie ist der Mietzahlungsstatus?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Für Mietangelegenheiten kann ich Ihnen/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('responds appropriately to maintenance questions', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Wartungsanfrage für Heizung' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Ich kann Wartungsanfragen verwalten/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('closes panel when close button is clicked', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const closeButton = screen.getByLabelText('Chat schließen');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Clara KI-Assistent')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Clara KI-Assistent öffnen')).toBeInTheDocument();
    });
  });

  it('calls onConversationUpdate when provided', async () => {
    const mockCallback = vi.fn();
    render(<ClaraKIPanel initialOpen={true} onConversationUpdate={mockCallback} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it('displays confidence indicators for AI responses', async () => {
    render(<ClaraKIPanel initialOpen={true} />);
    
    const input = screen.getByPlaceholderText('Fragen Sie Clara...');
    const sendButton = screen.getByLabelText('Nachricht senden');
    
    fireEvent.change(input, { target: { value: 'Hallo' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Vertrauen: \d+%/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
