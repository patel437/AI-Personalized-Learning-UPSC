/**
 * Navbar Component
 * Top navigation bar with search, notifications, and user menu
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.full_name || user.username;
    return name.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return 'User';
    return user.full_name || user.username;
  };

  return (
    <nav className="top-navbar">
      {/* Left section - Menu toggle */}
      <div className="d-flex align-center">
        <button 
          className="menu-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
        </button>
      </div>

      {/* Center section - Search bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search subjects, topics, resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right section - Actions */}
      <div className="nav-actions">
        {/* Theme toggle */}
        <button 
          className="notification-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
        </button>

        {/* Notifications */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="btn-link">Mark all read</button>
              </div>
              <div className="dropdown-body">
                <div className="notification-item unread">
                  <div className="notification-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="notification-content">
                    <p>Your mock test score improved by 15 points!</p>
                    <span className="notification-time">2 hours ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="notification-content">
                    <p>New recommendations available for Economy</p>
                    <span className="notification-time">Yesterday</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">
                    <i className="fas fa-calendar"></i>
                  </div>
                  <div className="notification-content">
                    <p>Weekly report is ready to view</p>
                    <span className="notification-time">2 days ago</span>
                  </div>
                </div>
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications">View all notifications</Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <div 
            className="user-info"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="avatar">
              {getUserInitials()}
            </div>
            <span className="user-name hide-on-mobile">{getUserName()}</span>
            <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} hide-on-mobile`}></i>
          </div>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar-large">
                  {getUserInitials()}
                </div>
                <div className="user-details">
                  <h4>{getUserName()}</h4>
                  <p>{user?.email}</p>
                </div>
              </div>
              <div className="dropdown-body">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-user"></i>
                  <span>My Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </Link>
                <Link to="/analytics" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-chart-simple"></i>
                  <span>Analytics</span>
                </Link>
                <hr className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;