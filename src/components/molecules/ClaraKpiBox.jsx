import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ClaraKpiBox - Molecule Component for KPI Display
 * Created: 2025-06-26_16-33-00
 * 
 * @param {Object} props
 * @param {string} props.title - KPI title
 * @param {string|number} props.value - KPI value
 * @param {string} props.subtitle - optional subtitle
 * @param {string} props.trend - trend indicator (up, down, neutral)
 * @param {string} props.icon - icon component or class
 * @param {string} props.variant - color variant
 */
const ClaraKpiBox = ({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral', 
  icon, 
  variant = 'default',
  className,
  ...props 
}) => {
  const baseClasses = 'p-6 rounded-lg border bg-card text-card-foreground shadow-sm';
  
  const variants = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  };
  
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center mt-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {trend !== 'neutral' && (
              <span className={cn('ml-2 text-sm', trendColors[trend])}>
                {trend === 'up' ? '↗' : '↘'}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaraKpiBox;
