/**
 * Sidebar Component
 * Main navigation sidebar with menu items
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, ADMIN_NAVIGATION_ITEMS } from '../../routes';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  // Get navigation items based on user role
  const getNavItems = () => {
    const items = [...NAVIGATION_ITEMS];
    if (isAdmin) {
      items.push(...ADMIN_NAVIGATION_ITEMS);
    }
    return items;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>UPSC PathFinder</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {getNavItems().map((item, index) => (
              <li key={index} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-info">
            <i className="fas fa-info-circle"></i>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;