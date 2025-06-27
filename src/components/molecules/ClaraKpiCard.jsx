import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ClaraKpiCard = ({ 
  icon,
  value,
  label,
  subtext = null,
  color = "blue",
  trend = null,
  trendValue = null,
  onClick = null,
  className = ""
}) => {
  const colorVariants = {
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      hover: "hover:border-blue-300 dark:hover:border-blue-700"
    },
    green: {
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      hover: "hover:border-green-300 dark:hover:border-green-700"
    },
    orange: {
      iconBg: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
      hover: "hover:border-orange-300 dark:hover:border-orange-700"
    },
    red: {
      iconBg: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      hover: "hover:border-red-300 dark:hover:border-red-700"
    },
    purple: {
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      hover: "hover:border-purple-300 dark:hover:border-purple-700"
    },
    gray: {
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
      hover: "hover:border-gray-300 dark:hover:border-gray-600"
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case "neutral":
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      case "neutral":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border-2 ${colors.border} ${colors.hover}
        rounded-xl p-6 
        transition-all duration-200 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {icon && (
            <div className={`
              inline-flex items-center justify-center 
              w-12 h-12 rounded-lg mb-4
              ${colors.iconBg}
            `}>
              <div className={colors.iconColor}>
                {icon}
              </div>
            </div>
          )}
          <div className="mb-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value || "—"}
            </h3>
          </div>
          <div className="mb-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </p>
          </div>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>
        {trend && (
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 mb-1">
              {getTrendIcon()}
              {trendValue && (
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {trendValue}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {(trend && trendValue) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Veränderung</span>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={getTrendColor()}>
                {trendValue}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaraKpiCard;
