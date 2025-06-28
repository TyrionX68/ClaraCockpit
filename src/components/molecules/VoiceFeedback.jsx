import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const VoiceFeedback = ({ 
  isActive = false, 
  isListening = false, 
  message = '', 
  status = 'idle', // idle, listening, processing, success, error
  onToggle 
}) => {
  const [visualBars, setVisualBars] = useState(Array(5).fill(0)); // Reduced from 10 to 5
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Optimized voice visualization with requestAnimationFrame
  const animateVoiceBars = useCallback(() => {
    if (isListening) {
      setVisualBars(prev => 
        prev.map(() => Math.floor(Math.random() * 15) + 3) // Reduced range
      );
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(animateVoiceBars, 300); // Reduced frequency from 150ms to 300ms
      });
    }
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      animateVoiceBars();
    } else {
      setVisualBars(Array(5).fill(0));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, animateVoiceBars]);

  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Volume2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'processing':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-border bg-card';
    }
  };

  if (!isActive && !message) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      flex items-center gap-2 
      px-3 py-2 rounded-lg border 
      shadow-md
      transition-opacity duration-200 ease-in-out
      ${getStatusColor()}
      ${isActive ? 'opacity-100' : 'opacity-90'}
    `}>
      {/* Voice Visualization - Simplified */}
      {isListening && (
        <div className="flex items-end gap-1 h-4">
          {visualBars.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-blue-500 rounded-full transition-all duration-200"
              style={{ height: `${Math.max(height, 2)}px` }}
            />
          ))}
        </div>
      )}

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* Message - Truncated for performance */}
      {message && (
        <span className="text-xs font-medium text-card-foreground max-w-[200px] truncate">
          {message}
        </span>
      )}

      {/* Toggle Button - Simplified */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={`
            flex-shrink-0 p-1 rounded-full transition-colors duration-200
            ${isActive 
              ? 'bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
            }
          `}
        >
          {isActive ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};

export default VoiceFeedback;

