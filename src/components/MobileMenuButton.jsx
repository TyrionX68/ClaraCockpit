import React from 'react';
import { Menu, X } from 'lucide-react';

const MobileMenuButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-black dark:text-white" />
      ) : (
        <Menu className="w-6 h-6 text-black dark:text-white" />
      )}
    </button>
  );
};

export default MobileMenuButton;

