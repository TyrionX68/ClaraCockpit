import React from 'react';
import { Search, Filter, Plus, Download, Settings } from 'lucide-react';
import ClaraButton from '../atoms/ClaraButton';

const ClaraDashboardHeader = ({ 
  title = "Dashboard", 
  subtitle = null,
  icon = null,
  actions = [],
  showSearch = false,
  showFilter = false,
  className = ""
}) => {
  const defaultActions = [
    { 
      icon: <Plus className="w-4 h-4" />, 
      label: "Hinzufügen", 
      variant: "primary",
      onClick: () => console.log("Add clicked")
    },
    { 
      icon: <Download className="w-4 h-4" />, 
      label: "Export", 
      variant: "secondary",
      onClick: () => console.log("Export clicked")
    },
    { 
      icon: <Settings className="w-4 h-4" />, 
      label: "Einstellungen", 
      variant: "ghost",
      onClick: () => console.log("Settings clicked")
    }
  ];

  const headerActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Suchen..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {showFilter && (
            <ClaraButton
              variant="ghost"
              size="sm"
              onClick={() => console.log("Filter clicked")}
            >
              <Filter className="w-4 h-4" />
              Filter
            </ClaraButton>
          )}
          <div className="flex items-center space-x-2">
            {headerActions.map((action, index) => (
              <ClaraButton
                key={index}
                variant={action.variant || "secondary"}
                size="sm"
                onClick={action.onClick}
                className="flex items-center space-x-2"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </ClaraButton>
            ))}
          </div>
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <nav className="flex space-x-4">
            <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-800 dark:hover:text-blue-300">
              Übersicht
            </button>
            <button className="text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300">
              Details
            </button>
            <button className="text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300">
              Verlauf
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ClaraDashboardHeader;
