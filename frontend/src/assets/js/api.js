/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';
import { storage } from './utils';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = storage.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          });
          
          if (response.data?.data?.access_token) {
            storage.set('access_token', response.data.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        storage.clear();
        window.location.href = '/login';
      }
    }
    
    // Return error response
    return Promise.reject(error.response?.data || error);
  }
);

// ==================== AUTHENTICATION APIs ====================

export const authAPI = {
  // Register new user
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  // Login user
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  // Refresh token
  refreshToken: () => {
    return apiClient.post('/auth/refresh');
  },
  
  // Logout user
  logout: () => {
    return apiClient.post('/auth/logout');
  },
  
  // Get user profile
  getProfile: () => {
    return apiClient.get('/auth/profile');
  },
  
  // Update user profile
  updateProfile: (profileData) => {
    return apiClient.put('/auth/profile', profileData);
  },
  
  // Change password
  changePassword: (passwordData) => {
    return apiClient.post('/auth/change-password', passwordData);
  },
  
  // Get student profile
  getStudentProfile: () => {
    return apiClient.get('/auth/student-profile');
  },
  
  // Create/Update student profile
  saveStudentProfile: (profileData) => {
    return apiClient.post('/auth/student-profile', profileData);
  }
};

// ==================== DASHBOARD APIs ====================

export const dashboardAPI = {
  // Get dashboard data
  getDashboard: () => {
    return apiClient.get('/dashboard');
  },
  
  // Get dashboard overview
  getOverview: () => {
    return apiClient.get('/dashboard/overview');
  }
};

// ==================== SCORES APIs ====================

export const scoresAPI = {
  // Save subject scores
  saveScores: (scoresData) => {
    return apiClient.post('/scores', scoresData);
  },
  
  // Get latest scores
  getLatestScores: () => {
    return apiClient.get('/scores/latest');
  },
  
  // Get score history
  getScoreHistory: (limit = 10) => {
    return apiClient.get(`/scores/history?limit=${limit}`);
  }
};

// ==================== RECOMMENDATIONS APIs ====================

export const recommendationsAPI = {
  // Generate recommendations
  generateRecommendations: (options = {}) => {
    return apiClient.post('/recommendations/generate', options);
  },
  
  // Get saved recommendations
  getRecommendations: (status = null, limit = 20) => {
    let url = `/recommendations?limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiClient.get(url);
  },
  
  // Mark recommendation as viewed
  markAsViewed: (recId) => {
    return apiClient.put(`/recommendations/${recId}/view`);
  },
  
  // Mark recommendation as completed
  markAsCompleted: (recId) => {
    return apiClient.put(`/recommendations/${recId}/complete`);
  }
};

// ==================== MOCK TEST APIs ====================

export const mockTestsAPI = {
  // Save mock test result
  saveMockTest: (testData) => {
    return apiClient.post('/mock-tests', testData);
  },
  
  // Get mock test history
  getMockTests: (limit = 10) => {
    return apiClient.get(`/mock-tests?limit=${limit}`);
  },
  
  // Get mock test trend
  getMockTestTrend: () => {
    return apiClient.get('/mock-tests/trend');
  }
};

// ==================== STUDY LOG APIs ====================

export const studyLogsAPI = {
  // Add study log
  addStudyLog: (logData) => {
    return apiClient.post('/study-logs', logData);
  },
  
  // Get weekly study summary
  getWeeklySummary: () => {
    return apiClient.get('/study-logs/weekly');
  }
};

// ==================== ANALYTICS APIs ====================

export const analyticsAPI = {
  // Get performance trend
  getPerformanceTrend: () => {
    return apiClient.get('/analytics/performance-trend');
  },
  
  // Get weakness analysis
  getWeaknessAnalysis: () => {
    return apiClient.get('/analytics/weaknesses');
  },
  
  // Get success probability
  getSuccessProbability: () => {
    return apiClient.get('/analytics/success-probability');
  },
  
  // Get weekly report
  getWeeklyReport: () => {
    return apiClient.get('/analytics/weekly-report');
  }
};

// ==================== PREDICTION APIs ====================

export const predictionAPI = {
  // Predict performance
  predictPerformance: (studentData) => {
    return apiClient.post('/predict', { student_data: studentData });
  }
};

// ==================== ADMIN APIs ====================

export const adminAPI = {
  // Get admin statistics
  getAdminStats: () => {
    return apiClient.get('/admin/stats');
  },
  
  // Get all students
  getAllStudents: (page = 1, perPage = 20) => {
    return apiClient.get(`/admin/students?page=${page}&per_page=${perPage}`);
  }
};

// Export all APIs
export default {
  auth: authAPI,
  dashboard: dashboardAPI,
  scores: scoresAPI,
  recommendations: recommendationsAPI,
  mockTests: mockTestsAPI,
  studyLogs: studyLogsAPI,
  analytics: analyticsAPI,
  prediction: predictionAPI,
  admin: adminAPI
};