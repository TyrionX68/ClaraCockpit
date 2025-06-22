import React from 'react';

/**
 * ClaraPageHeader - Standardisierte Header-Komponente für alle Clara360-Seiten
 * 
 * @param {string} title - Haupttitel der Seite (z.B. "Objekte-Verwaltung")
 * @param {string} subtitle - Optionale Beschreibung/Untertitel
 * @param {React.ReactNode[]} actions - Array von Action-Buttons (rechtsbündig)
 * @param {React.ReactNode} icon - Optionales Icon für den Header
 */
const ClaraPageHeader = ({ title, subtitle, actions, icon }) => {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {actions.map((action, index) => (
            <div key={index} className="flex-shrink-0">
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaraPageHeader;

