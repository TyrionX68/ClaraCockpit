import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const VoiceFeedback = ({ 
  isActive = false, 
  isListening = false, 
  message = '', 
  status = 'idle', // idle, listening, processing, success, error
  onToggle 
}) => {
  const [visualBars, setVisualBars] = useState(Array(10).fill(0));

  // Animate voice visualization bars
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setVisualBars(prev => 
          prev.map(() => Math.floor(Math.random() * 20) + 5)
        );
      }, 150);
    } else {
      setVisualBars(Array(10).fill(0));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Volume2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'border-blue-500 bg-blue-50';
      case 'processing':
        return 'border-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  if (!isActive && !message) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      flex items-center gap-3 
      px-4 py-3 rounded-lg border-2 
      shadow-lg backdrop-blur-sm
      transition-all duration-300 ease-in-out
      ${getStatusColor()}
      ${isActive ? 'animate-slide-in-right' : ''}
    `}>
      {/* Voice Visualization */}
      {isListening && (
        <div className="flex items-end gap-1 h-6">
          {visualBars.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-blue-500 rounded-full transition-all duration-150"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      )}

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* Message */}
      {message && (
        <span className="text-sm font-medium text-gray-700 max-w-xs">
          {message}
        </span>
      )}

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={`
            flex-shrink-0 p-1 rounded-full transition-colors
            ${isActive 
              ? 'bg-red-100 hover:bg-red-200 text-red-600' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
            }
          `}
        >
          {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default VoiceFeedback;

