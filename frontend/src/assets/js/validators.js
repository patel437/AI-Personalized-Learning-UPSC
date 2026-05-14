/**
 * Form Validation Functions
 * Validation rules for all forms in the application
 */

// Email validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

// Username validation
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be less than 50 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

// Phone validation (Indian)
export const validatePhone = (phone) => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit Indian phone number';
  return null;
};

// Age validation
export const validateAge = (age) => {
  if (!age) return null;
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) return 'Age must be a number';
  if (ageNum < 18) return 'Age must be at least 18 years';
  if (ageNum > 60) return 'Age must be less than 60 years';
  return null;
};

// Percentage validation
export const validatePercentage = (value, fieldName = 'Score') => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < 0) return `${fieldName} cannot be negative`;
  if (num > 100) return `${fieldName} cannot exceed 100`;
  return null;
};

// Study hours validation
export const validateStudyHours = (hours) => {
  if (!hours && hours !== 0) return 'Study hours are required';
  const num = parseFloat(hours);
  if (isNaN(num)) return 'Study hours must be a number';
  if (num < 0) return 'Study hours cannot be negative';
  if (num > 24) return 'Study hours cannot exceed 24';
  return null;
};

// Preparation months validation
export const validateMonths = (months) => {
  if (!months && months !== 0) return 'Preparation months are required';
  const num = parseInt(months);
  if (isNaN(num)) return 'Months must be a number';
  if (num < 0) return 'Months cannot be negative';
  if (num > 60) return 'Months cannot exceed 60';
  return null;
};

// Mock test score validation
export const validateMockTestScore = (score, maxScore = 200) => {
  if (!score && score !== 0) return 'Score is required';
  const num = parseFloat(score);
  if (isNaN(num)) return 'Score must be a number';
  if (num < 0) return 'Score cannot be negative';
  if (num > maxScore) return `Score cannot exceed ${maxScore}`;
  return null;
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value && value !== 0) return `${fieldName} is required`;
  if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
  return null;
};

// Number range validation
export const validateRange = (value, min, max, fieldName = 'Value') => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must be at most ${max}`;
  return null;
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return null;
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (!urlRegex.test(url)) return 'Please enter a valid URL';
  return null;
};

// Registration form validation
export const validateRegistration = (data) => {
  const errors = {};
  
  errors.username = validateUsername(data.username);
  errors.email = validateEmail(data.email);
  errors.password = validatePassword(data.password);
  errors.confirmPassword = validateConfirmPassword(data.password, data.confirmPassword);
  errors.phone = validatePhone(data.phone);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login form validation
export const validateLogin = (data) => {
  const errors = {};
  
  if (!data.usernameOrEmail) {
    errors.usernameOrEmail = 'Username or email is required';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Student profile validation
export const validateStudentProfile = (data) => {
  const errors = {};
  
  errors.age = validateAge(data.age);
  errors.graduationPercentage = validatePercentage(data.graduationPercentage, 'Graduation percentage');
  errors.preparationMonths = validateMonths(data.preparationMonths);
  errors.dailyStudyHours = validateStudyHours(data.dailyStudyHours);
  errors.attemptNumber = validateRange(data.attemptNumber, 1, 10, 'Attempt number');
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Subject scores validation
export const validateSubjectScores = (scores) => {
  const errors = {};
  const subjects = [
    'history', 'geography', 'polity', 'economy',
    'science_tech', 'environment', 'current_affairs', 'art_culture',
    'comprehension', 'logical_reasoning', 'quantitative',
    'data_interpretation', 'decision_making'
  ];
  
  subjects.forEach(subject => {
    const score = scores[`${subject}_score`];
    if (score !== undefined && score !== null) {
      const error = validatePercentage(score, subject.replace('_', ' ').toUpperCase());
      if (error) errors[`${subject}_score`] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Mock test validation
export const validateMockTest = (data) => {
  const errors = {};
  
  if (!data.testName || !data.testName.trim()) {
    errors.testName = 'Test name is required';
  }
  
  errors.gsScore = validateMockTestScore(data.gsScore, 200);
  errors.csatScore = validateMockTestScore(data.csatScore, 200);
  errors.accuracy = validatePercentage(data.accuracy, 'Accuracy');
  errors.timeTaken = validateRange(data.timeTaken, 0, 240, 'Time taken');
  errors.questionsAttempted = validateRange(data.questionsAttempted, 0, 200, 'Questions attempted');
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Study log validation
export const validateStudyLog = (data) => {
  const errors = {};
  
  if (!data.logDate) {
    errors.logDate = 'Date is required';
  }
  
  errors.studyHours = validateStudyHours(data.studyHours);
  errors.quizzesTaken = validateRange(data.quizzesTaken, 0, 50, 'Quizzes taken');
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Password change validation
export const validatePasswordChange = (data) => {
  const errors = {};
  
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  errors.newPassword = validatePassword(data.newPassword);
  errors.confirmPassword = validateConfirmPassword(data.newPassword, data.confirmPassword);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Forgot password validation
export const validateForgotPassword = (data) => {
  const errors = {};
  errors.email = validateEmail(data.email);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Reset password validation
export const validateResetPassword = (data) => {
  const errors = {};
  errors.password = validatePassword(data.password);
  errors.confirmPassword = validateConfirmPassword(data.password, data.confirmPassword);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 