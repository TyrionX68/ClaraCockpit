import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ThemedErrorAlert = ({ 
  type = 'error',
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props 
}) => {
  const alertConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-300',
      messageColor: 'text-red-700 dark:text-red-400',
      dismissColor: 'text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-200'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-300',
      messageColor: 'text-green-700 dark:text-green-400',
      dismissColor: 'text-green-400 hover:text-green-600 dark:text-green-300 dark:hover:text-green-200'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-300',
      messageColor: 'text-yellow-700 dark:text-yellow-400',
      dismissColor: 'text-yellow-400 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-200'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-300',
      messageColor: 'text-blue-700 dark:text-blue-400',
      dismissColor: 'text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200'
    }
  };

  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "relative rounded-lg border p-4",
        config.bgColor,
        config.borderColor,
        className
      )}
      {...props}
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent 
            className={cn("w-5 h-5", config.iconColor)}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {/* Title */}
          {title && (
            <h3 className={cn(
              "text-sm font-medium",
              config.titleColor
            )}>
              {title}
            </h3>
          )}

          {/* Message */}
          {message && (
            <div className={cn(
              "text-sm",
              title ? "mt-1" : "",
              config.messageColor
            )}>
              {message}
            </div>
          )}

          {/* Children Content */}
          {children && (
            <div className={cn(
              "text-sm",
              (title || message) ? "mt-2" : "",
              config.messageColor
            )}>
              {children}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  config.dismissColor,
                  "focus:ring-offset-transparent focus:ring-current"
                )}
                aria-label="Schließen"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience components for specific alert types
const ThemedErrorMessage = (props) => (
  <ThemedErrorAlert type="error" {...props} />
);

const ThemedSuccessMessage = (props) => (
  <ThemedErrorAlert type="success" {...props} />
);

const ThemedWarningMessage = (props) => (
  <ThemedErrorAlert type="warning" {...props} />
);

const ThemedInfoMessage = (props) => (
  <ThemedErrorAlert type="info" {...props} />
);

export { 
  ThemedErrorAlert, 
  ThemedErrorMessage, 
  ThemedSuccessMessage, 
  ThemedWarningMessage, 
  ThemedInfoMessage 
};

