import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CreditCard, TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react';

const BankingPage = ({ onNavigate }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock FinAPI data - in production this would connect to real FinAPI
  useEffect(() => {
    const mockAccounts = [
      {
        id: 'acc_1',
        name: 'Hausverwaltung Geschäftskonto',
        iban: 'DE89 3704 0044 0532 0130 00',
        balance: 45230.50,
        type: 'checking',
        bank: 'Commerzbank AG'
      },
      {
        id: 'acc_2', 
        name: 'Mieteinnahmen Konto',
        iban: 'DE12 3704 0044 0532 0130 01',
        balance: 8360.00,
        type: 'savings',
        bank: 'Commerzbank AG'
      }
    ];

    const mockTransactions = [
      {
        id: 'tx_1',
        date: '2025-06-26',
        description: 'Miete Familie Schmidt - 1.OG rechts',
        amount: 1200.00,
        type: 'credit',
        category: 'Mieteinnahmen'
      },
      {
        id: 'tx_2',
        date: '2025-06-25',
        description: 'Stadtwerke Heidelberg - Strom',
        amount: -245.80,
        type: 'debit',
        category: 'Betriebskosten'
      },
      {
        id: 'tx_3',
        date: '2025-06-24',
        description: 'Hausmeister Service GmbH',
        amount: -180.00,
        type: 'debit',
        category: 'Wartung'
      },
      {
        id: 'tx_4',
        date: '2025-06-23',
        description: 'Miete Familie Müller - EG links',
        amount: 950.00,
        type: 'credit',
        category: 'Mieteinnahmen'
      }
    ];

    setTimeout(() => {
      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Bankdaten werden geladen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('dashboard')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-500" />
                  Banking & Finanzen
                </h1>
                <p className="text-slate-400">Waldhofstraße 76 - Finanzübersicht</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-400">
              FinAPI Connected
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    {account.name}
                  </CardTitle>
                  <Badge variant={account.type === 'checking' ? 'default' : 'secondary'}>
                    {account.type === 'checking' ? 'Geschäftskonto' : 'Sparkonto'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400">
                  {account.bank} • {account.iban}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(account.balance)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {account.balance > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-slate-400">Aktueller Saldo</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Aktuelle Transaktionen
            </CardTitle>
            <CardDescription className="text-slate-400">
              Letzte Buchungen der vergangenen Tage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{transaction.description}</div>
                      <div className="text-sm text-slate-400">
                        {formatDate(transaction.date)} • {transaction.category}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FinAPI Integration Status */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">FinAPI Integration Status</CardTitle>
            <CardDescription className="text-slate-400">
              Verbindung zu Bankkonten und automatische Synchronisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400 mb-1">2</div>
                <div className="text-sm text-slate-400">Verbundene Konten</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">Live</div>
                <div className="text-sm text-slate-400">Synchronisation</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400 mb-1">24h</div>
                <div className="text-sm text-slate-400">Letzte Aktualisierung</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankingPage;
