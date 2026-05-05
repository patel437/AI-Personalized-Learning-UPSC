"""
Utilities Package
"""

from .constants import *
from .helpers import *
from .validators import *

__all__ = [
    # Constants
    'GS_SUBJECTS',
    'CSAT_SUBJECTS',
    'ALL_SUBJECTS',
    'SUBJECT_DISPLAY_NAMES',
    'SCORE_THRESHOLDS',
    'PRIORITY_LEVELS',
    'STUDY_HOURS',
    'MOCK_TEST',
    'CSAT_REQUIREMENTS',
    'GS_REQUIREMENTS',
    'API_MESSAGES',
    'HTTP_STATUS',
    'RESOURCE_TYPES',
    'DIFFICULTY_LEVELS',
    'COACHING_INSTITUTES',
    'STUDY_MATERIALS',
    'GRADUATION_STREAMS',
    'GENDER_OPTIONS',
    'PERFORMANCE_CATEGORIES',
    'CACHE_KEYS',
    'CACHE_TIMEOUT',
    'PAGINATION',
    'FILE_UPLOAD',
    'EMAIL_TEMPLATES',
    'FRONTEND_ROUTES',
    'API_VERSION',
    'API_PREFIX',
    
    # Helpers
    'validate_email',
    'validate_phone',
    'validate_password',
    'calculate_age',
    'calculate_percentage',
    'get_performance_category',
    'get_priority_from_score',
    'calculate_improvement_needed',
    'estimate_study_hours_needed',
    'convert_to_percentage',
    'normalize_scores',
    'calculate_consistency_score',
    'calculate_qualification_probability',
    'format_datetime',
    'parse_date',
    'generate_student_id',
    'safe_json_loads',
    'safe_json_dumps',
    'chunk_list',
    'get_week_dates',
    'calculate_streak',
    'mask_email',
    'mask_phone',
    'response_success',
    'response_error',
    'response_paginated',
    'validate_required_fields',
    'sanitize_string',
    'truncate_string',
    'convert_to_serializable',
    
    # Validators
    'StudentDataValidator',
    'StudyLogValidator',
    'RecommendationValidator',
    'UserValidator',
    'RequestValidator'
]