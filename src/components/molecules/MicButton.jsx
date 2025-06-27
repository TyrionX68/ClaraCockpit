import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const MicButton = ({ 
  isActive = false, 
  isListening = false, 
  onToggle,
  position = 'floating' // 'floating' or 'inline'
}) => {
  const baseClasses = `
    flex items-center justify-center
    transition-all duration-300 ease-in-out
    border-2 border-transparent
    focus:outline-none focus:ring-4 focus:ring-blue-200
    ${isActive 
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
    }
    ${isListening ? 'animate-pulse scale-110' : 'hover:scale-105'}
  `;

  const floatingClasses = `
    ${baseClasses}
    fixed bottom-6 right-6 z-50
    w-14 h-14 rounded-full
    shadow-2xl
  `;

  const inlineClasses = `
    ${baseClasses}
    w-10 h-10 rounded-lg
  `;

  const buttonClasses = position === 'floating' ? floatingClasses : inlineClasses;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={buttonClasses}
        title={isActive ? 'Voice deaktivieren' : 'Voice aktivieren'}
      >
        {isActive ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Pulse Animation Ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-75" />
        )}
      </button>

      {/* Status Indicator */}
      {position === 'floating' && (
        <div className={`
          absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white
          ${isActive 
            ? (isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500') 
            : 'bg-gray-400'
          }
        `} />
      )}
    </div>
  );
};

export default MicButton;

