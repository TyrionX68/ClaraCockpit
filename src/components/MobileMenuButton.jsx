import React from 'react';
import { Menu, X } from 'lucide-react';

const MobileMenuButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="md:hidden fixed top-4 left-4 z-[110] p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent transition-colors"
      aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-card-foreground" />
      ) : (
        <Menu className="w-6 h-6 text-card-foreground" />
      )}
    </button>
  );
};

export default MobileMenuButton;

