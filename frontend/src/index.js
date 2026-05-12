/**
 * Application Entry Point
 * Sets up React and renders the main App component
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Import styles
import './assets/css/index.css';
import 'react-toastify/dist/ReactToastify.css';

// Import web vitals
import reportWebVitals from './reportWebVitals';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render application
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Web vitals reporting
reportWebVitals();