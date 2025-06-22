import * as React from "react"
import { cn } from "../../lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

const DialogHeader = ({ className, children, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const DialogTitle = ({ className, children, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h2>
);

const DialogTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger }

