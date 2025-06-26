/**
 * Mock Data for ClaraFileVault Component
 * Created: 2025-06-26_17-01-42
 * 
 * GDPR-compliant document storage simulation
 */

// Mock file data for document vault
export const mockFiles = [
  {
    id: 'file_001',
    name: 'Mietvertrag_Max_Mustermann.pdf',
    type: 'application/pdf',
    category: 'Vertrag',
    size: 2456789,
    uploadDate: '2025-06-01T10:30:00Z',
    tenantId: 'T001',
    url: '/documents/mietvertrag_max_mustermann.pdf',
    description: 'Mietvertrag für Waldhofstraße 12, Wohnung 1A'
  },
  {
    id: 'file_002',
    name: 'Nebenkostenabrechnung_2024.pdf',
    type: 'application/pdf',
    category: 'Abrechnung',
    size: 1234567,
    uploadDate: '2025-05-15T14:20:00Z',
    tenantId: 'T001',
    url: '/documents/nebenkostenabrechnung_2024.pdf',
    description: 'Nebenkostenabrechnung für das Jahr 2024'
  },
  {
    id: 'file_003',
    name: 'Übergabeprotokoll_Einzug.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'Protokoll',
    size: 987654,
    uploadDate: '2025-04-20T09:15:00Z',
    tenantId: 'T001',
    url: '/documents/uebergabeprotokoll_einzug.docx',
    description: 'Übergabeprotokoll bei Einzug'
  },
  {
    id: 'file_004',
    name: 'Wohnungsfotos_Zustand.jpg',
    type: 'image/jpeg',
    category: 'Dokumentation',
    size: 3456789,
    uploadDate: '2025-04-20T09:30:00Z',
    tenantId: 'T001',
    url: '/documents/wohnungsfotos_zustand.jpg',
    description: 'Fotos des Wohnungszustands bei Einzug'
  },
  {
    id: 'file_005',
    name: 'Kaution_Nachweis.pdf',
    type: 'application/pdf',
    category: 'Finanzen',
    size: 567890,
    uploadDate: '2025-03-10T16:45:00Z',
    tenantId: 'T001',
    url: '/documents/kaution_nachweis.pdf',
    description: 'Nachweis über Kautionszahlung'
  },
  {
    id: 'file_006',
    name: 'Reparatur_Rechnung_Heizung.pdf',
    type: 'application/pdf',
    category: 'Wartung',
    size: 234567,
    uploadDate: '2025-06-20T11:00:00Z',
    tenantId: 'T002',
    url: '/documents/reparatur_rechnung_heizung.pdf',
    description: 'Rechnung für Heizungsreparatur'
  }
];

// File categories configuration
export const fileCategories = [
  { id: 'all', name: 'Alle Dokumente', color: 'gray', icon: '📁' },
  { id: 'Vertrag', name: 'Verträge', color: 'blue', icon: '📋' },
  { id: 'Abrechnung', name: 'Abrechnungen', color: 'green', icon: '💰' },
  { id: 'Protokoll', name: 'Protokolle', color: 'orange', icon: '📝' },
  { id: 'Dokumentation', name: 'Dokumentation', color: 'purple', icon: '📸' },
  { id: 'Finanzen', name: 'Finanzen', color: 'yellow', icon: '💳' },
  { id: 'Wartung', name: 'Wartung', color: 'red', icon: '🔧' }
];

// File type configurations
export const fileTypeConfig = {
  'application/pdf': {
    icon: '📄',
    color: 'red',
    name: 'PDF',
    previewable: true
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: '📝',
    color: 'blue',
    name: 'Word',
    previewable: false
  },
  'application/msword': {
    icon: '📝',
    color: 'blue',
    name: 'Word',
    previewable: false
  },
  'image/jpeg': {
    icon: '🖼️',
    color: 'green',
    name: 'JPEG',
    previewable: true
  },
  'image/png': {
    icon: '🖼️',
    color: 'green',
    name: 'PNG',
    previewable: true
  },
  'image/gif': {
    icon: '🖼️',
    color: 'green',
    name: 'GIF',
    previewable: true
  },
  'text/plain': {
    icon: '📄',
    color: 'gray',
    name: 'Text',
    previewable: true
  },
  'application/vnd.ms-excel': {
    icon: '📊',
    color: 'green',
    name: 'Excel',
    previewable: false
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: '📊',
    color: 'green',
    name: 'Excel',
    previewable: false
  }
};

// GDPR consent configuration
export const gdprConfig = {
  title: 'Datenschutz-Hinweis',
  message: 'Durch das Hochladen von Dokumenten stimmen Sie der DSGVO-konformen Speicherung und Verarbeitung Ihrer Daten zu. Ihre Daten werden verschlüsselt gespeichert und nur für die Immobilienverwaltung verwendet.',
  acceptText: 'Ich stimme zu',
  declineText: 'Ablehnen',
  moreInfoText: 'Mehr Informationen',
  storageKey: 'clara_filevault_gdpr_consent'
};

// Helper functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeInfo = (mimeType) => {
  return fileTypeConfig[mimeType] || {
    icon: '📄',
    color: 'gray',
    name: 'Unbekannt',
    previewable: false
  };
};

export const getCategoryInfo = (categoryId) => {
  return fileCategories.find(cat => cat.id === categoryId) || fileCategories[0];
};

export const filterFilesByCategory = (files, categoryId) => {
  if (categoryId === 'all') return files;
  return files.filter(file => file.category === categoryId);
};

export const filterFilesByTenant = (files, tenantId) => {
  return files.filter(file => file.tenantId === tenantId);
};

// Mock upload function
export const mockUploadFile = (file, category, tenantId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFile = {
        id: ,
        name: file.name,
        type: file.type,
        category: category,
        size: file.size,
        uploadDate: new Date().toISOString(),
        tenantId: tenantId,
        url: ,
        description: 
      };
      resolve(newFile);
    }, 1000); // Simulate upload delay
  });
};
