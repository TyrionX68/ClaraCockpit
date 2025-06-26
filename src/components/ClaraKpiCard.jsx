import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ClaraKpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className = "",
  valueColor = "text-gray-900"
}) => {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-bold mb-1 ${valueColor}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {trend === 'up' && '↗️'}
            {trend === 'down' && '↘️'}
            {trend === 'neutral' && '➡️'}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaraKpiCard;

