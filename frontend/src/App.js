/**
 * Main App Component
 * Handles routing and layout structure
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Import components
import PrivateRoute from './components/Common/PrivateRoute';
import Loader from './components/Common/Loader';

// Lazy load pages for better performance
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

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AllStudents = lazy(() => import('./pages/admin/AllStudents'));

function App() {
  return (
    <>
      <Helmet>
        <title>UPSC Learning System - AI-Powered Personalized Learning</title>
        <meta name="description" content="Personalized UPSC preparation with AI-driven recommendations" />
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
          
          {/* Protected Routes - Admin */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/students" element={<PrivateRoute adminOnly><AllStudents /></PrivateRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;