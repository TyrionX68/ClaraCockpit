import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { id: 'clara-ki', label: 'Clara KI', icon: '🤖', path: '/clara-ki' },
    { id: 'banking', label: 'Banking', icon: '💳', path: '/banking' },
    { id: 'manifest', label: 'Manifest', icon: '⚙️', path: '/manifest' },
    { id: 'kommunikation', label: 'Kommunikation', icon: '💬', path: '/kommunikation' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="text-2xl mb-1">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNavigation;
