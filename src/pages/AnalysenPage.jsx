import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Home, Users, Wrench, 
  Calendar, BarChart3, PieChart, LineChart, Target, AlertCircle,
  ArrowUpRight, ArrowDownRight, Filter, Download, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

/**
 * Analysen-Seite - Umfassende KPI-Dashboards und Datenvisualisierung mit Clara KI Integration
 */
const AnalysenPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);

  // Mock-Daten für Analysen
  const kpiData = {
    revenue: {
      current: 156800,
      previous: 142300,
      change: 10.2,
      trend: 'up'
    },
    occupancy: {
      current: 94.5,
      previous: 91.2,
      change: 3.6,
      trend: 'up'
    },
    maintenance: {
      current: 12400,
      previous: 15600,
      change: -20.5,
      trend: 'down'
    },
    profit: {
      current: 89200,
      previous: 78900,
      change: 13.1,
      trend: 'up'
    }
  };

  // Monatliche Einnahmen-Daten
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 142000, expenses: 58000, profit: 84000 },
    { month: 'Feb', revenue: 138000, expenses: 62000, profit: 76000 },
    { month: 'Mär', revenue: 145000, expenses: 55000, profit: 90000 },
    { month: 'Apr', revenue: 152000, expenses: 59000, profit: 93000 },
    { month: 'Mai', revenue: 148000, expenses: 61000, profit: 87000 },
    { month: 'Jun', revenue: 156800, expenses: 67600, profit: 89200 },
    { month: 'Jul', revenue: 159000, expenses: 64000, profit: 95000 },
    { month: 'Aug', revenue: 162000, expenses: 66000, profit: 96000 },
    { month: 'Sep', revenue: 158000, expenses: 63000, profit: 95000 },
    { month: 'Okt', revenue: 165000, expenses: 68000, profit: 97000 },
    { month: 'Nov', revenue: 168000, expenses: 69000, profit: 99000 },
    { month: 'Dez', revenue: 172000, expenses: 71000, profit: 101000 }
  ];

  // Objektverteilung
  const propertyDistribution = [
    { name: 'Wohnungen', value: 65, count: 26, color: '#3B82F6' },
    { name: 'Büros', value: 25, count: 10, color: '#10B981' },
    { name: 'Gewerbe', value: 10, count: 4, color: '#F59E0B' }
  ];

  // Wartungskosten nach Kategorie
  const maintenanceCosts = [
    { category: 'Heizung', cost: 3200, percentage: 25.8 },
    { category: 'Sanitär', cost: 2800, percentage: 22.6 },
    { category: 'Elektrik', cost: 2100, percentage: 16.9 },
    { category: 'Fenster', cost: 1900, percentage: 15.3 },
    { category: 'Sonstiges', cost: 2400, percentage: 19.4 }
  ];

  // Mieteranalyse
  const tenantAnalysis = [
    { month: 'Jan', newTenants: 3, leavingTenants: 1, totalTenants: 38 },
    { month: 'Feb', newTenants: 2, leavingTenants: 2, totalTenants: 38 },
    { month: 'Mär', newTenants: 4, leavingTenants: 1, totalTenants: 41 },
    { month: 'Apr', newTenants: 1, leavingTenants: 3, totalTenants: 39 },
    { month: 'Mai', newTenants: 3, leavingTenants: 0, totalTenants: 42 },
    { month: 'Jun', newTenants: 2, leavingTenants: 2, totalTenants: 42 }
  ];

  // Clara KI Integration - Expose data globally
  useEffect(() => {
    window.claraAnalyticsContext = {
      kpis: kpiData,
      revenue: monthlyRevenueData,
      properties: propertyDistribution,
      maintenance: maintenanceCosts,
      tenants: tenantAnalysis,
      statistics: {
        totalRevenue: monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0),
        totalProfit: monthlyRevenueData.reduce((sum, item) => sum + item.profit, 0),
        averageOccupancy: kpiData.occupancy.current,
        totalProperties: propertyDistribution.reduce((sum, item) => sum + item.count, 0),
        maintenanceCosts: maintenanceCosts.reduce((sum, item) => sum + item.cost, 0)
      },
      actions: {
        setTimeframe: (timeframe) => setSelectedTimeframe(timeframe),
        setMetric: (metric) => setSelectedMetric(metric),
        refreshData: () => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1000);
        },
        showRevenueAnalysis: () => setSelectedMetric('revenue'),
        showProfitAnalysis: () => setSelectedMetric('profit'),
        showMaintenanceAnalysis: () => setSelectedMetric('maintenance'),
        showOccupancyAnalysis: () => setSelectedMetric('occupancy')
      }
    };

    return () => {
      delete window.claraAnalyticsContext;
    };
  }, [selectedTimeframe, selectedMetric, isLoading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getKPICard = (title, icon, data, format = 'currency') => {
    const IconComponent = icon;
    const isPositive = data.change > 0;
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isPositive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <IconComponent className={`w-6 h-6 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format === 'currency' ? formatCurrency(data.current) : 
                   format === 'percentage' ? `${data.current}%` : data.current}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendIcon className="w-4 h-4" />
              {formatPercentage(data.change)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysen & KPIs</h1>
              <p className="text-gray-600">Umfassende Datenanalyse und Leistungskennzahlen</p>
            </div>
          </div>

          {/* Clara KI Integration Panel */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Clara KI Analyse-Assistent</h3>
                <p className="text-sm text-green-700 mb-3">
                  Fragen Sie Clara: "Wie ist die Rendite?" • "Zeige mir die Wartungskosten" • "Welche Objekte sind am profitabelsten?"
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMetric('revenue')}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    💰 Umsatz-Analyse
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMetric('profit')}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📈 Gewinn-Trends
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMetric('occupancy')}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    🏠 Auslastung
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => setIsLoading(false), 1000);
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : '🔄'} Aktualisieren
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/clara-ki'}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Zu Clara KI
              </Button>
            </div>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Zeitraum:</span>
            <div className="flex gap-2">
              {[
                { id: '3m', label: '3 Monate' },
                { id: '6m', label: '6 Monate' },
                { id: '12m', label: '12 Monate' },
                { id: '24m', label: '2 Jahre' }
              ].map((timeframe) => (
                <Button
                  key={timeframe.id}
                  variant={selectedTimeframe === timeframe.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getKPICard('Gesamtumsatz', DollarSign, kpiData.revenue)}
          {getKPICard('Auslastung', Home, kpiData.occupancy, 'percentage')}
          {getKPICard('Wartungskosten', Wrench, kpiData.maintenance)}
          {getKPICard('Gewinn', TrendingUp, kpiData.profit)}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Umsatz & Gewinn Entwicklung
              </CardTitle>
              <CardDescription>
                Monatliche Entwicklung von Einnahmen und Gewinn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Umsatz"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Gewinn"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Objektverteilung
              </CardTitle>
              <CardDescription>
                Verteilung der Immobilien nach Typ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={propertyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {propertyDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count} Objekte</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Wartungskosten nach Kategorie
              </CardTitle>
              <CardDescription>
                Aufschlüsselung der Wartungsausgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={maintenanceCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="cost" fill="#F59E0B" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tenant Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mieter-Entwicklung
              </CardTitle>
              <CardDescription>
                Ein- und Auszüge der letzten Monate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tenantAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="newTenants" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981"
                    name="Neue Mieter"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leavingTenants" 
                    stackId="2" 
                    stroke="#EF4444" 
                    fill="#EF4444"
                    name="Auszüge"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Leistungsziele
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auslastung Ziel</span>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  95% erreicht
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gewinnmarge</span>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  56.9%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ROI</span>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  8.2%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Handlungsempfehlungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Wartungskosten für Heizung überdurchschnittlich hoch
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Auslastung über Zielwert - Mieterhöhung prüfen
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Gewinntrend positiv - Expansion möglich
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Prognosen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Umsatz Q4 2024</span>
                  <span className="font-semibold">{formatCurrency(485000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Jahresgewinn 2024</span>
                  <span className="font-semibold">{formatCurrency(1150000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysenPage;

