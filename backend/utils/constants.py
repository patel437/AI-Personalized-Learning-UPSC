"""
Project constants and configuration values
Centralized constants used across the application
"""

# UPSC Subjects
GS_SUBJECTS = [
    'history',
    'geography', 
    'polity',
    'economy',
    'science_tech',
    'environment',
    'current_affairs',
    'art_culture'
]

CSAT_SUBJECTS = [
    'comprehension',
    'logical_reasoning',
    'quantitative',
    'data_interpretation',
    'decision_making'
]

ALL_SUBJECTS = GS_SUBJECTS + CSAT_SUBJECTS

# Subject display names
SUBJECT_DISPLAY_NAMES = {
    'history': 'History & Culture',
    'geography': 'Geography',
    'polity': 'Indian Polity',
    'economy': 'Economy',
    'science_tech': 'Science & Technology',
    'environment': 'Environment & Ecology',
    'current_affairs': 'Current Affairs',
    'art_culture': 'Art & Culture',
    'comprehension': 'Reading Comprehension',
    'logical_reasoning': 'Logical Reasoning',
    'quantitative': 'Quantitative Aptitude',
    'data_interpretation': 'Data Interpretation',
    'decision_making': 'Decision Making'
}

# Score thresholds
SCORE_THRESHOLDS = {
    'excellent': 85,
    'good': 70,
    'average': 55,
    'poor': 40,
    'very_poor': 25
}

# Priority levels
PRIORITY_LEVELS = {
    'high': 1,
    'medium': 2,
    'low': 3
}

# Study hours recommendations
STUDY_HOURS = {
    'min': 2,
    'optimal': 6,
    'max': 12,
    'high_priority_subject': 3,
    'medium_priority_subject': 2,
    'low_priority_subject': 1
}

# Mock test recommendations
MOCK_TEST = {
    'target_per_week': 2,
    'min_before_exam': 50,
    'analysis_hours': 2
}

# CSAT requirements (qualifying in nature)
CSAT_REQUIREMENTS = {
    'passing_percentage': 33,
    'passing_score': 66,  # out of 200
    'min_qualifying_score': 66
}

# GS requirements
GS_REQUIREMENTS = {
    'expected_cutoff': 100,  # out of 200
    'safe_score': 120,
    'top_score': 150
}

# API Response Messages
API_MESSAGES = {
    'success': 'Operation completed successfully',
    'created': 'Resource created successfully',
    'updated': 'Resource updated successfully',
    'deleted': 'Resource deleted successfully',
    'not_found': 'Resource not found',
    'unauthorized': 'Unauthorized access',
    'forbidden': 'Access forbidden',
    'validation_error': 'Validation error occurred',
    'server_error': 'Internal server error'
}

# HTTP Status Codes
HTTP_STATUS = {
    'ok': 200,
    'created': 201,
    'accepted': 202,
    'no_content': 204,
    'bad_request': 400,
    'unauthorized': 401,
    'forbidden': 403,
    'not_found': 404,
    'conflict': 409,
    'unprocessable': 422,
    'server_error': 500
}

# Resource types for recommendations
RESOURCE_TYPES = {
    'book': '📚 Book',
    'video': '🎥 Video Lecture',
    'notes': '📝 Notes',
    'practice': '✍️ Practice Questions',
    'mock_test': '📊 Mock Test',
    'article': '📄 Article',
    'course': '🎓 Online Course'
}

# Difficulty levels
DIFFICULTY_LEVELS = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
}

# Coaching institutes
COACHING_INSTITUTES = [
    'Vajiram and Ravi',
    'Vision IAS',
    'Insights on India',
    'Forum IAS',
    'Next IAS',
    'Self Study'
]

# Study materials
STUDY_MATERIALS = [
    'NCERT',
    'Standard Books',
    'Coaching Notes',
    'Online Courses',
    'Newspapers',
    'Monthly Magazines',
    'PYQs'
]

# Graduation streams
GRADUATION_STREAMS = [
    'Arts',
    'Science',
    'Commerce',
    'Engineering',
    'Medical',
    'Law',
    'Other'
]

# Gender options
GENDER_OPTIONS = ['Male', 'Female', 'Other']

# Performance categories
PERFORMANCE_CATEGORIES = {
    'excellent': 'Excellent (85%+)',
    'good': 'Good (70-85%)',
    'average': 'Average (55-70%)',
    'needs_improvement': 'Needs Improvement (40-55%)',
    'critical': 'Critical (<40%)'
}

# Cache keys
CACHE_KEYS = {
    'student_dashboard': 'student_dashboard_{}',
    'recommendations': 'recommendations_{}',
    'subject_scores': 'subject_scores_{}',
    'mock_test_trend': 'mock_test_trend_{}'
}

# Cache timeout in seconds
CACHE_TIMEOUT = {
    'dashboard': 300,  # 5 minutes
    'recommendations': 600,  # 10 minutes
    'scores': 3600,  # 1 hour
    'analytics': 1800  # 30 minutes
}

# Pagination defaults
PAGINATION = {
    'default_per_page': 20,
    'max_per_page': 100
}

# File upload settings
FILE_UPLOAD = {
    'allowed_extensions': {'csv', 'xlsx', 'xls', 'pdf', 'jpg', 'png'},
    'max_file_size': 16 * 1024 * 1024,  # 16 MB
    'avatar_size': 512 * 512  # 512x512 pixels
}

# Email templates
EMAIL_TEMPLATES = {
    'welcome': 'emails/welcome.html',
    'recommendations': 'emails/recommendations.html',
    'weekly_report': 'emails/weekly_report.html',
    'password_reset': 'emails/password_reset.html'
}

# Frontend routes
FRONTEND_ROUTES = {
    'login': '/login',
    'dashboard': '/dashboard',
    'recommendations': '/recommendations',
    'analytics': '/analytics',
    'profile': '/profile',
    'settings': '/settings'
}

# API version
API_VERSION = 'v1'
API_PREFIX = f'/api/{API_VERSION}'