import React from 'react';

const BottomNavigation = ({ activeItem = 'dashboard', onItemClick }) => {
  const navItems = [
    { id: 'ki', icon: '🤖', label: 'Clara KI' },
    { id: 'banking', icon: '💳', label: 'Banking' }, 
    { id: 'manifest', icon: '⚙️', label: 'Manifest' },
    { id: 'kommunikation', icon: '💬', label: 'Kommunikation' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`bottom-nav-item ${activeItem === item.id ? 'active' : ''}`}
          onClick={() => onItemClick?.(item.id)}
        >
          <span className="text-lg mb-1">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNavigation;
