import React from 'react';
import BottomNavigation from '../components/molecules/BottomNavigation';

const BankingPage = () => {
  const mockAccounts = [
    {
      id: 'acc_1',
      name: 'Hausverwaltung Geschäftskonto',
      iban: 'DE89 3704 0044 0532 0130 00',
      balance: 45230.50,
      type: 'checking'
    },
    {
      id: 'acc_2', 
      name: 'Rücklagen-Konto',
      iban: 'DE89 3704 0044 0532 0130 01',
      balance: 12500.00,
      type: 'savings'
    }
  ];

  const mockTransactions = [
    {
      id: 'tx_1',
      date: '2025-06-26',
      description: 'Miete Familie Schmidt',
      amount: 1200.00,
      type: 'credit'
    },
    {
      id: 'tx_2',
      date: '2025-06-25', 
      description: 'Heizungsreparatur',
      amount: -450.00,
      type: 'debit'
    },
    {
      id: 'tx_3',
      date: '2025-06-24',
      description: 'Miete Familie Müller',
      amount: 980.00,
      type: 'credit'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">🏦 Banking & Finanzen</h1>
        <p className="text-slate-300 mt-2">FinAPI Integration - Konten und Transaktionen</p>
      </div>

      {/* Accounts Overview */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Konten-Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {mockAccounts.map((account) => (
            <div key={account.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{account.name}</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                  {account.type === 'checking' ? 'Girokonto' : 'Sparkonto'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{account.iban}</p>
              <div className="text-2xl font-bold text-green-400">
                €{account.balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <h2 className="text-lg font-semibold mb-4">Aktuelle Transaktionen</h2>
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          {mockTransactions.map((transaction, index) => (
            <div 
              key={transaction.id} 
              className={`p-4 flex items-center justify-between ${
                index !== mockTransactions.length - 1 ? 'border-b border-slate-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-slate-400">{transaction.date}</p>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        {/* FinAPI Status */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-300 font-medium">FinAPI Status</span>
          </div>
          <p className="text-sm text-blue-200 mt-1">
            Mock-Daten aktiv. Für Live-Banking FinAPI-Credentials konfigurieren.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default BankingPage;
