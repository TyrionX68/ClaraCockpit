/**
 * Mock Data for Clara360 Dashboard Testing
 * Created: 2025-06-26_16-56-52
 * 
 * Provides test data for dashboard components
 */

// Mock tenant data for ClaraMieterDashboard
export const tenantMocks = [
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
  },
  {
    id: 4,
    name: 'Maria Gonzalez',
    unit: 'Waldhofstraße 12, Wohnung 4D',
    rent: 950,
    status: 'active',
    paymentStatus: 'overdue',
    lastPayment: '2025-04-20'
  }
];

// Mock dunning data for ClaraMahnungPanel
export const mahnungMocks = [
  {
    tenantName: 'Anna Schmidt',
    sollMiete: 920,
    istMiete: 0,
    lastPaymentDate: '2025-05-15',
    today: '2025-06-26'
  },
  {
    tenantName: 'Maria Gonzalez', 
    sollMiete: 950,
    istMiete: 200,
    lastPaymentDate: '2025-04-20',
    today: '2025-06-26'
  },
  {
    tenantName: 'Klaus Müller',
    sollMiete: 800,
    istMiete: 400,
    lastPaymentDate: '2025-06-10',
    today: '2025-06-26'
  }
];

// Dashboard configuration
export const dashboardConfig = {
  title: 'Clara360 Dashboard',
  subtitle: 'Immobilienverwaltung v3.0',
  slots: {
    mieter: {
      title: 'Mieter Übersicht',
      description: 'Aktuelle Mieter und Zahlungsstatus',
      component: 'ClaraMieterDashboard'
    },
    mahnung: {
      title: 'Mahnwesen',
      description: 'Offene Forderungen und Mahnverfahren',
      component: 'ClaraMahnungPanel'
    },
    zukunft: {
      title: 'Erweiterungen',
      description: 'Platz für zukünftige Module',
      component: null
    }
  }
};

// Helper function to get random mock data
export const getRandomTenant = () => {
  return tenantMocks[Math.floor(Math.random() * tenantMocks.length)];
};

export const getRandomMahnung = () => {
  return mahnungMocks[Math.floor(Math.random() * mahnungMocks.length)];
};
