/**
 * Settings Page
 * App preferences and notification settings
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { storage } from '../../assets/js/utils';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { showSuccess } = useNotification();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    studyReminders: true,
    weeklyReports: true,
    dailyReminderTime: '09:00',
    studyGoalHours: 6,
    defaultDashboardView: 'overview',
    language: 'en'
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = storage.get('app_settings');
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.set('app_settings', newSettings);
    showSuccess('Settings saved successfully');
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  return (
    <>
      <Helmet>
        <title>Settings | UPSC Learning System</title>
      </Helmet>

      <div className="settings-container">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </h1>
            <p className="page-subtitle">Manage your app preferences and notifications</p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-palette"></i>
              <span>Appearance</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Dark Mode</label>
                <p className="setting-description">Switch between light and dark theme</p>
              </div>
              <div className="setting-control">
                <button className="theme-toggle" onClick={toggleTheme}>
                  <i className={`fas fa-${isDark ? 'sun' : 'moon'}`}></i>
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Email Notifications</label>
                <p className="setting-description">Receive email updates about your progress</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Daily Study Reminders</label>
                <p className="setting-description">Get reminded to log your study hours</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.studyReminders}
                    onChange={() => handleToggle('studyReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Weekly Reports</label>
                <p className="setting-description">Receive weekly performance reports</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.weeklyReports}
                    onChange={() => handleToggle('weeklyReports')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {settings.studyReminders && (
              <div className="setting-item">
                <div className="setting-info">
                  <label>Reminder Time</label>
                  <p className="setting-description">When to send daily study reminders</p>
                </div>
                <div className="setting-control">
                  <input 
                    type="time" 
                    value={settings.dailyReminderTime}
                    onChange={(e) => handleChange('dailyReminderTime', e.target.value)}
                    className="time-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Study Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-line"></i>
              <span>Study Preferences</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Daily Study Goal</label>
                <p className="setting-description">Target study hours per day</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.studyGoalHours}
                  onChange={(e) => handleChange('studyGoalHours', parseInt(e.target.value))}
                  className="select-input"
                >
                  <option value={2}>2 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={8}>8 hours</option>
                  <option value={10}>10 hours</option>
                  <option value={12}>12 hours</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Default Dashboard View</label>
                <p className="setting-description">Which section to show first on dashboard</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.defaultDashboardView}
                  onChange={(e) => handleChange('defaultDashboardView', e.target.value)}
                  className="select-input"
                >
                  <option value="overview">Overview</option>
                  <option value="subjects">Subjects</option>
                  <option value="mocktests">Mock Tests</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-language"></i>
              <span>Language</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>App Language</label>
                <p className="setting-description">Choose your preferred language</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="select-input"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-shield-alt"></i>
              <span>Account</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Delete Account</label>
                <p className="setting-description text-danger">Permanently delete your account and all data</p>
              </div>
              <div className="setting-control">
                <button className="btn btn-danger">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;