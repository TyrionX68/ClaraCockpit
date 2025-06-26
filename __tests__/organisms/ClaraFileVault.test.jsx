import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClaraFileVault from '../../src/components/organisms/ClaraFileVault';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('ClaraFileVault', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('true');
    vi.clearAllMocks();
  });

  it('renders file vault with category filters', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText('Alle Dokumente')).toBeInTheDocument();
    expect(screen.getByText('Verträge')).toBeInTheDocument();
    expect(screen.getByText('Abrechnungen')).toBeInTheDocument();
    expect(screen.getByText('Protokolle')).toBeInTheDocument();
  });

  it('displays upload zone with drag and drop', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText('Dateien hier ablegen oder')).toBeInTheDocument();
    expect(screen.getByText('Dateien auswählen')).toBeInTheDocument();
    expect(screen.getByText('PDF, Word, Excel, Bilder bis 10MB')).toBeInTheDocument();
  });

  it('shows file list with correct information', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText('Mietvertrag_Max_Mustermann.pdf')).toBeInTheDocument();
    expect(screen.getByText('Nebenkostenabrechnung_2024.pdf')).toBeInTheDocument();
    expect(screen.getByText('Übergabeprotokoll_Einzug.docx')).toBeInTheDocument();
  });

  it('filters files by category', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    // Click on Verträge category
    fireEvent.click(screen.getByText('Verträge'));
    
    expect(screen.getByText('Mietvertrag_Max_Mustermann.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Nebenkostenabrechnung_2024.pdf')).not.toBeInTheDocument();
  });

  it('shows file type icons and information', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Word')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
  });

  it('displays file sizes in readable format', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText('2.34 MB')).toBeInTheDocument();
    expect(screen.getByText('1.18 MB')).toBeInTheDocument();
  });

  it('shows preview button for previewable files', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    const previewButtons = screen.getAllByText('👁️ Vorschau');
    expect(previewButtons.length).toBeGreaterThan(0);
  });

  it('shows download and delete buttons for all files', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    const downloadButtons = screen.getAllByText('📥 Download');
    const deleteButtons = screen.getAllByText('🗑️');
    
    expect(downloadButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('opens delete confirmation modal', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    const deleteButton = screen.getAllByText('🗑️')[0];
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('Datei löschen')).toBeInTheDocument();
    expect(screen.getByText('Sind Sie sicher, dass Sie diese Datei unwiderruflich löschen möchten?')).toBeInTheDocument();
  });

  it('shows GDPR consent modal when not accepted', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ClaraFileVault tenantId=T001 />);
    
    fireEvent.click(screen.getByText('Dateien auswählen'));
    
    expect(screen.getByText('Datenschutz-Hinweis')).toBeInTheDocument();
    expect(screen.getByText('Ich stimme zu')).toBeInTheDocument();
    expect(screen.getByText('Ablehnen')).toBeInTheDocument();
  });

  it('accepts GDPR consent and stores in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ClaraFileVault tenantId=T001 />);
    
    fireEvent.click(screen.getByText('Dateien auswählen'));
    fireEvent.click(screen.getByText('Ich stimme zu'));
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('clara_filevault_gdpr_consent', 'true');
  });

  it('shows empty state when no files in category', () => {
    render(<ClaraFileVault tenantId=T999 />);
    
    expect(screen.getByText('Keine Dokumente in dieser Kategorie')).toBeInTheDocument();
  });

  it('displays file count correctly', () => {
    render(<ClaraFileVault tenantId=T001 />);
    
    expect(screen.getByText(/Dokumente \(\d+\)/)).toBeInTheDocument();
  });
});
