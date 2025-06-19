/**
 * button.jsx
 * UI Button Components - Clara360 Design System
 * MANUS A Phase 2.1 - Saubere UI-Komponenten
 */
import React from "react";

export function Button({ children, variant = "default", ...props }) {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
  const variantClasses = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  
  const className = `${baseClasses} ${variantClasses[variant] || variantClasses.default}`;
  
  return <button className={className} {...props}>{children}</button>;
}
