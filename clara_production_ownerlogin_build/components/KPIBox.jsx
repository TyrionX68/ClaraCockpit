import React from 'react';

const KPIBox = ({ title, value, unit, trend, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (unit === '€') {
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      } else if (unit === '%') {
        return `${val.toFixed(1)}%`;
      } else {
        return val.toLocaleString('de-DE');
      }
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 10H7" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0-10h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </p>
            {getTrendIcon()}
          </div>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs. Vormonat
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full bg-white ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPIBox;

