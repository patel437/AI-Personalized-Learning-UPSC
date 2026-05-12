/**
 * Route Configuration
 * Centralized route definitions for the application
 */

// Route paths
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Main routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  RECOMMENDATIONS: '/recommendations',
  ANALYTICS: '/analytics',
  MOCK_TESTS: '/mock-tests',
  STUDY_LOGS: '/study-logs',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENT_DETAIL: '/admin/students/:id',
  ADMIN_STATS: '/admin/stats'
};

// Navigation items for sidebar
export const NAVIGATION_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: 'fa-solid fa-chart-line',
    roles: ['student', 'admin']
  },
  {
    path: ROUTES.RECOMMENDATIONS,
    label: 'Recommendations',
    icon: 'fa-solid fa-lightbulb',
    roles: ['student']
  },
  {
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: 'fa-solid fa-chart-simple',
    roles: ['student', 'admin']
  },
  {
    path: ROUTES.MOCK_TESTS,
    label: 'Mock Tests',
    icon: 'fa-solid fa-file-alt',
    roles: ['student']
  },
  {
    path: ROUTES.STUDY_LOGS,
    label: 'Study Logs',
    icon: 'fa-solid fa-book-open',
    roles: ['student']
  },
  {
    path: ROUTES.PROFILE,
    label: 'Profile',
    icon: 'fa-solid fa-user',
    roles: ['student', 'admin']
  },
  {
    path: ROUTES.SETTINGS,
    label: 'Settings',
    icon: 'fa-solid fa-gear',
    roles: ['student', 'admin']
  }
];

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
  {
    path: ROUTES.ADMIN,
    label: 'Admin Dashboard',
    icon: 'fa-solid fa-chart-pie',
    roles: ['admin']
  },
  {
    path: ROUTES.ADMIN_STUDENTS,
    label: 'All Students',
    icon: 'fa-solid fa-users',
    roles: ['admin']
  }
];

// Helper function to check if route is active
export const isActiveRoute = (currentPath, routePath) => {
  if (routePath === ROUTES.HOME) {
    return currentPath === routePath;
  }
  return currentPath.startsWith(routePath);
};

// Helper function to get page title from path
export const getPageTitle = (path) => {
  const titles = {
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.RECOMMENDATIONS]: 'Recommendations',
    [ROUTES.ANALYTICS]: 'Analytics',
    [ROUTES.MOCK_TESTS]: 'Mock Tests',
    [ROUTES.STUDY_LOGS]: 'Study Logs',
    [ROUTES.PROFILE]: 'Profile',
    [ROUTES.SETTINGS]: 'Settings',
    [ROUTES.ADMIN]: 'Admin Dashboard',
    [ROUTES.ADMIN_STUDENTS]: 'All Students'
  };
  
  return titles[path] || 'UPSC Learning System';
};