import React, { useState, useEffect } from 'react';

const TypingIndicator = ({ 
  isVisible = false, 
  message = "Clara denkt...",
  duration = 1500,
  className = ""
}) => {
  const [dots, setDots] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowMessage(false);
      setDots('');
      return;
    }

    // Show message after a brief delay
    const showTimer = setTimeout(() => {
      setShowMessage(true);
    }, 200);

    // Animate dots
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, [isVisible]);

  if (!isVisible || !showMessage) return null;

  return (
    <div className={`flex justify-start animate-fade-in ${className}`}>
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {message}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1 w-4 text-left">
              {dots}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

