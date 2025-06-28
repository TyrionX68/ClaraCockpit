import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Download, 
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinancialAnalytics } from '@/hooks/useFinancialAnalytics';

/**
 * Banking Page with comprehensive Clara KI integration
 * Provides financial analytics, transaction management, and intelligent insights
 */
const BankingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showClaraInsights, setShowClaraInsights] = useState(true);
  
  // Financial Analytics Hook with Clara Integration
  const {
    transactions,
    cashFlow,
    financialMetrics,
    claraInsights,
    isLoading,
    error,
    loadFinancialData,
    filterTransactionsByDateRange,
    getTransactionsByCategory,
    exportForClaraContext,
    hasData,
    isPositiveCashFlow
  } = useFinancialAnalytics({
    propertyId: 'prop_001',
    autoLoad: true,
    onClaraInsight: (insight) => {
      console.log('🧠 Clara Insight:', insight);
    }
  });

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.tenant && transaction.tenant.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  // Handle Clara voice commands (integration point)
  const handleClaraCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('cashflow') || lowerCommand.includes('gewinn')) {
      return `Ihr aktueller Cashflow beträgt €${cashFlow.netCashFlow?.toFixed(2) || '0.00'}. ${isPositiveCashFlow ? 'Das ist positiv!' : 'Hier besteht Handlungsbedarf.'}`;
    }
    
    if (lowerCommand.includes('ausgaben') || lowerCommand.includes('kosten')) {
      return `Ihre Gesamtausgaben betragen €${cashFlow.expenses?.toFixed(2) || '0.00'}. Die größten Posten sind Wartung und Verwaltung.`;
    }
    
    if (lowerCommand.includes('einnahmen') || lowerCommand.includes('miete')) {
      return `Ihre Gesamteinnahmen betragen €${cashFlow.income?.toFixed(2) || '0.00'}. Hauptsächlich aus Mieteinnahmen.`;
    }
    
    if (lowerCommand.includes('transaktionen') || lowerCommand.includes('überweisungen')) {
      return `Sie haben ${transactions.length} Transaktionen. Die letzte war: ${transactions[transactions.length - 1]?.description || 'Keine Daten'}.`;
    }
    
    return 'Ich kann Ihnen bei Cashflow, Ausgaben, Einnahmen und Transaktionen helfen. Was möchten Sie wissen?';
  };

  // Export data for Clara context (interseitenlogik)
  useEffect(() => {
    if (hasData) {
      const contextData = exportForClaraContext();
      // Make data available globally for Clara
      window.claraBankingContext = {
        ...contextData,
        handleCommand: handleClaraCommand,
        navigateToTransaction: (transactionId) => {
          const transaction = transactions.find(t => t.id === transactionId);
          if (transaction) {
            console.log('Navigate to transaction:', transaction);
            // Could open modal or navigate to detail view
          }
        }
      };
    }
  }, [hasData, cashFlow, transactions, claraInsights]);

  // Render insight icon based on type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  // Render insight badge color
  const getInsightBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Finanzdaten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadFinancialData()}>Erneut versuchen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Banking & Finanzen</h1>
              <p className="text-muted-foreground mt-1">
                Finanzübersicht und Transaktionsmanagement mit Clara KI
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/clara-ki')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Mit Clara sprechen
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clara Insights Section */}
        {showClaraInsights && claraInsights.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                🧠 Clara KI Insights
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowClaraInsights(false)}
              >
                Ausblenden
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {claraInsights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-sm">{insight.category}</CardTitle>
                      </div>
                      <Badge className={getInsightBadgeColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.message}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      💡 {insight.suggestion}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Financial Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamteinnahmen</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                €{cashFlow.income?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Hauptsächlich Mieteinnahmen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtausgaben</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                €{cashFlow.expenses?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Wartung, Verwaltung, Instandhaltung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Netto Cashflow</CardTitle>
              <DollarSign className={`h-4 w-4 ${isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`}>
                €{cashFlow.netCashFlow?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPositiveCashFlow ? 'Profitabel' : 'Verlust'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gewinnmarge</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {cashFlow.profitMargin || '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Rendite auf Einnahmen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Transaktionen</CardTitle>
            <CardDescription>
              Verwalten Sie alle Ein- und Ausgaben Ihrer Immobilien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Transaktionen durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Alle Kategorien' : category}
                  </option>
                ))}
              </select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Zeitraum
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Datum</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Beschreibung</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kategorie</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Betrag</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(transaction.date).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-sm">{transaction.description}</div>
                          {transaction.tenant && (
                            <div className="text-xs text-muted-foreground">
                              {transaction.tenant} • {transaction.unit}
                            </div>
                          )}
                          {transaction.vendor && (
                            <div className="text-xs text-muted-foreground">
                              {transaction.vendor}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Abgeschlossen
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Transaktionen gefunden.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankingPage;

