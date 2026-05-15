/**
 * App.js - Optimized with Code Splitting and Lazy Loading
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Import only critical components normally
import PrivateRoute from './components/Common/PrivateRoute';
import Loader from './components/Common/Loader';

// Lazy load non-critical pages for better initial load time
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/main/Dashboard'));
const Recommendations = lazy(() => import('./pages/main/Recommendations'));
const Analytics = lazy(() => import('./pages/main/Analytics'));
const MockTests = lazy(() => import('./pages/main/MockTests'));
const StudyLogs = lazy(() => import('./pages/main/StudyLogs'));
const Profile = lazy(() => import('./pages/main/Profile'));
const Settings = lazy(() => import('./pages/main/Settings'));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AllStudents = lazy(() => import('./pages/admin/AllStudents'));
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'));
const SystemStats = lazy(() => import('./pages/admin/SystemStats'));

// Performance monitoring
const ReportWebVitals = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);
  return null;
};

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ReportWebVitals />
      <Helmet defaultTitle="UPSC Learning System" titleTemplate="%s | UPSC Learning System">
        <html lang="en" />
        <meta name="theme-color" content="#4a90e2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes - Student */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/mock-tests" element={<PrivateRoute><MockTests /></PrivateRoute>} />
          <Route path="/study-logs" element={<PrivateRoute><StudyLogs /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/students" element={<PrivateRoute adminOnly><AllStudents /></PrivateRoute>} />
          <Route path="/admin/students/:id" element={<PrivateRoute adminOnly><StudentDetail /></PrivateRoute>} />
          <Route path="/admin/stats" element={<PrivateRoute adminOnly><SystemStats /></PrivateRoute>} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;