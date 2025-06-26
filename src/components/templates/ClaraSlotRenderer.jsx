import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ClaraSlotRenderer - Template Component for Slot-based Dashboard Layout
 * Created: 2025-06-26_16-56-34
 * 
 * Provides unified framing and layout for dashboard components
 * Enables scalable, modular dashboard architecture
 * 
 * @param {Object} props
 * @param {string} props.slot - slot identifier/name
 * @param {React.ReactNode} props.component - component to render in slot
 * @param {boolean} props.placeholder - show placeholder instead of component
 * @param {string} props.title - optional custom title (defaults to slot name)
 * @param {string} props.description - optional slot description
 * @param {boolean} props.debug - show debug information
 */
const ClaraSlotRenderer = ({ 
  slot, 
  component, 
  placeholder = false,
  title,
  description,
  debug = false,
  className,
  ...props 
}) => {
  const slotTitle = title || slot.charAt(0).toUpperCase() + slot.slice(1);
  
  return (
    <div 
      className={cn(
        'rounded-xl border shadow-sm bg-white min-h-[300px] transition-all hover:shadow-md',
        placeholder ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {/* Slot Header */}
      <div className={cn(
        'px-6 py-4 border-b',
        placeholder ? 'border-gray-200' : 'border-gray-100'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn(
              'text-lg font-semibold',
              placeholder ? 'text-gray-500' : 'text-gray-900'
            )}>
              {slotTitle}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              placeholder 
                ? 'bg-gray-200 text-gray-600' 
                : 'bg-blue-100 text-blue-800'
            )}>
              {placeholder ? 'Placeholder' : 'Active'}
            </span>
            {debug && (
              <span className="text-xs text-gray-400 font-mono">
                slot:{slot}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Slot Content */}
      <div className="p-6">
        {placeholder ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-400">📦</span>
            </div>
            <p className="text-gray-500 italic mb-2">
              Slot "{slot}" ist noch leer
            </p>
            <p className="text-xs text-gray-400">
              Hier können zukünftige Komponenten eingefügt werden
            </p>
          </div>
        ) : (
          <div className="slot-content">
            {component}
          </div>
        )}
      </div>

      {/* Debug Footer */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <p className="text-xs text-gray-500 font-mono">
            Debug: Slot "{slot}" rendered at {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaraSlotRenderer;
