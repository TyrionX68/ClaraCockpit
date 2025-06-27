import React from 'react';

const ModernKpiCard = ({ 
  value, 
  label, 
  subtext, 
  icon, 
  trend = 'neutral',
  color = 'blue',
  onClick 
}) => {
  const colorClasses = {
    blue: 'border-blue-500/20 bg-blue-500/10',
    green: 'border-green-500/20 bg-green-500/10', 
    orange: 'border-orange-500/20 bg-orange-500/10',
    red: 'border-red-500/20 bg-red-500/10',
    purple: 'border-purple-500/20 bg-purple-500/10'
  };

  const trendIcons = {
    up: '↗',
    down: '↘', 
    neutral: '→'
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div 
      className={`glass-card hover:scale-105 transition-all duration-200 cursor-pointer ${colorClasses[color]}`}
      onClick={onClick}
    >
      {/* Icon */}
      {icon && (
        <div className="text-2xl mb-3 opacity-80">
          {icon}
        </div>
      )}
      
      {/* Große Zahl - Exakt wie Screenshots */}
      <div className="kpi-number mb-2">
        {value}
      </div>
      
      {/* Label */}
      <div className="kpi-label mb-1">
        {label}
      </div>
      
      {/* Subtext mit Trend */}
      {subtext && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {subtext}
          </span>
          {trend !== 'neutral' && (
            <span className={`text-sm ${trendColors[trend]}`}>
              {trendIcons[trend]}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernKpiCard;
