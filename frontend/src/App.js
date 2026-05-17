import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Import Layout Components
import PrivateRoute from './components/Common/PrivateRoute';
import Loader from './components/Common/Loader';
import Sidebar from './components/Common/Sidebar';
import Navbar from './components/Common/Navbar';

// Lazy loaded pages
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
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'));
const SystemStats = lazy(() => import('./pages/admin/SystemStats'));

// Reusable Layout Wrapper for Protected Routes
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" style={{ flexGrow: 1, width: '100%' }}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main style={{ padding: '20px' }}>
          <Outlet /> {/* This renders the individual child page components */}
        </main>
      </div>
    </div>
  );
};

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
          
          {/* Protected Routes inside Layout Shell */}
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/mock-tests" element={<MockTests />} />
            <Route path="/study-logs" element={<StudyLogs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Admin Sub-Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AllStudents />} />
            <Route path="/admin/students/:id" element={<StudentDetail />} />
            <Route path="/admin/stats" element={<SystemStats />} />
          </Route>
          
          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;