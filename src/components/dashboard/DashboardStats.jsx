import React from 'react';
import { Home, Users, DollarSign, Wrench, TrendingUp, AlertTriangle } from 'lucide-react';

const DashboardStats = () => {
  // Live-Daten aus Clara V6 (Mock-Daten für Waldhofstraße 76)
  const stats = [
    {
      id: 'objects',
      title: 'Objekte',
      value: '12',
      subtitle: 'Immobilien',
      icon: Home,
      color: 'blue',
      trend: '+2 dieses Jahr',
      trendUp: true
    },
    {
      id: 'tenants',
      title: 'Mieter',
      value: '45',
      subtitle: 'Aktive Mietverträge',
      icon: Users,
      color: 'green',
      trend: '100% Vermietung',
      trendUp: true
    },
    {
      id: 'revenue',
      title: 'Mieteinnahmen',
      value: '€87.500',
      subtitle: 'Monatlich',
      icon: DollarSign,
      color: 'emerald',
      trend: '+5.2% vs. Vormonat',
      trendUp: true
    },
    {
      id: 'maintenance',
      title: 'Wartung',
      value: '8',
      subtitle: 'Offene Aufgaben',
      icon: Wrench,
      color: 'orange',
      trend: '3 dringend',
      trendUp: false
    }
  ];

  const getColorClasses = (color, isIcon = false) => {
    const colorMap = {
      blue: isIcon ? 'text-blue-600' : 'bg-blue-50 border-blue-200',
      green: isIcon ? 'text-green-600' : 'bg-green-50 border-green-200',
      emerald: isIcon ? 'text-emerald-600' : 'bg-emerald-50 border-emerald-200',
      orange: isIcon ? 'text-orange-600' : 'bg-orange-50 border-orange-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg
              ${getColorClasses(stat.color)}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`
                p-3 rounded-lg bg-white shadow-sm
              `}>
                <Icon className={`w-6 h-6 ${getColorClasses(stat.color, true)}`} />
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className={`w-4 h-4 ${
                  stat.trendUp ? 'text-green-500' : 'text-red-500'
                } ${stat.trendUp ? '' : 'rotate-180'}`} />
                <span className={`font-medium ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {stat.title}
              </div>
              <div className="text-sm text-gray-500">
                {stat.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;

