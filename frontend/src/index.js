// frontend/src/index.js - CORRECTED ORDER

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SkipToContent } from './components/Common/AccessibleButton';

// Import styles
import './assets/css/index.css';
import './assets/css/dashboard.css';
import './assets/css/auth.css';
import './assets/css/responsive.css';
import 'react-toastify/dist/ReactToastify.css';

// Create root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app - IMPORTANT: Wrap ErrorBoundary INSIDE providers, not outside
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <SkipToContent />
              <App />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                limit={3}
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);