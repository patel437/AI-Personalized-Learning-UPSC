/**
 * Utility Functions
 * Common helper functions used across the application
 */

// Format date to readable string
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  const formats = {
    'DD/MM/YYYY': `${day}/${month}/${year}`,
    'MM/DD/YYYY': `${month}/${day}/${year}`,
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'DD MMM YYYY': `${day} ${getMonthName(d.getMonth())} ${year}`,
    'HH:MM': `${hours}:${minutes}`,
    'DD/MM/YYYY HH:MM': `${day}/${month}/${year} ${hours}:${minutes}`
  };
  
  return formats[format] || formats['DD/MM/YYYY'];
};

// Get month name
export const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

// Get day name
export const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

// Format number with commas
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${formatNumber(value, decimals)}%`;
};

// Format currency (INR)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${formatNumber(amount)}`;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert to title case
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Generate random color
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Get color based on score
export const getScoreColor = (score) => {
  if (score >= 75) return '#27ae60'; // Success
  if (score >= 60) return '#3498db'; // Info
  if (score >= 45) return '#f39c12'; // Warning
  return '#e74c3c'; // Danger
};

// Get badge class based on priority
export const getPriorityClass = (priority) => {
  const classes = {
    high: 'badge-danger',
    medium: 'badge-warning',
    low: 'badge-info'
  };
  return classes[priority] || 'badge-secondary';
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Get query parameter from URL
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Set query parameter in URL
export const setQueryParam = (param, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
};

// Remove query parameter from URL
export const removeQueryParam = (param) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key, defaultValue = null) => {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// Session storage helpers
export const session = {
  set: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get: (key, defaultValue = null) => {
    const value = sessionStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  remove: (key) => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  }
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Calculate average
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

// Filter unique values
export const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};