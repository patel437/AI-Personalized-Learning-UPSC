"""
Helper utility functions for UPSC Learning System
Common functions used across the application
"""

import re
import json
import hashlib
from datetime import datetime, date, timedelta
from functools import wraps
from flask import request, jsonify, current_app
import pandas as pd
import numpy as np


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate Indian phone number"""
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, str(phone)) is not None


def validate_password(password):
    """
    Validate password strength
    At least 8 characters, 1 uppercase, 1 lowercase, 1 digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, "Password is valid"


def calculate_age(birth_date):
    """Calculate age from birth date"""
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def calculate_percentage(score, total):
    """Calculate percentage"""
    if total == 0:
        return 0
    return round((score / total) * 100, 2)


def get_performance_category(score):
    """Get performance category based on score"""
    if score >= 85:
        return 'excellent'
    elif score >= 70:
        return 'good'
    elif score >= 55:
        return 'average'
    elif score >= 40:
        return 'needs_improvement'
    else:
        return 'critical'


def get_priority_from_score(score):
    """Get priority level based on low score"""
    if score < 40:
        return 'high'
    elif score < 55:
        return 'medium'
    elif score < 70:
        return 'low'
    else:
        return None


def calculate_improvement_needed(current_score, target_score=70):
    """Calculate improvement needed to reach target"""
    if current_score >= target_score:
        return 0
    return round(target_score - current_score, 1)


def estimate_study_hours_needed(improvement_needed, efficiency=0.5):
    """
    Estimate study hours needed for improvement
    Assuming 1% improvement requires approximately 2 hours of study
    """
    return round(improvement_needed * 2 / efficiency, 1)


def convert_to_percentage(score, max_score):
    """Convert raw score to percentage"""
    if max_score == 0:
        return 0
    return round((score / max_score) * 100, 2)


def normalize_scores(scores_list):
    """Normalize a list of scores to 0-100 scale"""
    scores = np.array(scores_list)
    min_score = scores.min()
    max_score = scores.max()
    
    if max_score == min_score:
        return [50] * len(scores_list)
    
    normalized = ((scores - min_score) / (max_score - min_score)) * 100
    return [round(x, 2) for x in normalized]


def calculate_consistency_score(scores_list):
    """Calculate consistency score (lower variance = higher consistency)"""
    if len(scores_list) < 2:
        return 100
    
    variance = np.var(scores_list)
    max_variance = 2500  # Maximum possible variance for 0-100 scale
    
    consistency = 100 - (variance / max_variance * 100)
    return round(max(0, min(100, consistency)), 2)


def calculate_qualification_probability(gs_score, csat_score):
    """
    Calculate qualification probability using logistic function
    GS out of 200, CSAT out of 200
    """
    # Normalize to 0-100 scale
    gs_percent = (gs_score / 200) * 100
    csat_percent = (csat_score / 200) * 100
    
    # Combined score (70% GS, 30% CSAT)
    combined = (gs_percent * 0.7) + (csat_percent * 0.3)
    
    # Logistic function (center at 50%)
    probability = 1 / (1 + np.exp(-(combined - 50) / 15))
    
    return round(probability, 3)


def format_datetime(dt):
    """Format datetime for JSON serialization"""
    if dt is None:
        return None
    return dt.isoformat()


def parse_date(date_string):
    """Parse date string to date object"""
    if not date_string:
        return None
    
    formats = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y%m%d']
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt).date()
        except ValueError:
            continue
    
    return None


def generate_student_id():
    """Generate a unique student ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = hashlib.md5(str(timestamp).encode()).hexdigest()[:6]
    return f"UPS{timestamp}{random_part}".upper()


def safe_json_loads(json_string, default=None):
    """Safely load JSON string"""
    if not json_string:
        return default or {}
    try:
        return json.loads(json_string)
    except:
        return default or {}


def safe_json_dumps(obj, default=None):
    """Safely dump object to JSON string"""
    try:
        return json.dumps(obj)
    except:
        return default or '{}'


def chunk_list(lst, chunk_size):
    """Split a list into chunks"""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


def get_week_dates(reference_date=None):
    """Get dates for current week (Monday to Sunday)"""
    if reference_date is None:
        reference_date = date.today()
    
    # Get Monday of current week
    monday = reference_date - timedelta(days=reference_date.weekday())
    
    week_dates = []
    for i in range(7):
        week_dates.append(monday + timedelta(days=i))
    
    return week_dates


def calculate_streak(log_dates):
    """
    Calculate consecutive study streak
    log_dates: list of dates when student studied
    """
    if not log_dates:
        return 0
    
    sorted_dates = sorted(set(log_dates), reverse=True)
    streak = 1
    expected_date = sorted_dates[0]
    
    for log_date in sorted_dates[1:]:
        if (expected_date - log_date).days == 1:
            streak += 1
            expected_date = log_date
        else:
            break
    
    return streak


def mask_email(email):
    """Mask email for privacy"""
    if not email:
        return email
    
    parts = email.split('@')
    if len(parts) != 2:
        return email
    
    username = parts[0]
    if len(username) <= 3:
        masked_username = username[0] + '*' * (len(username) - 1)
    else:
        masked_username = username[:3] + '*' * (len(username) - 3)
    
    return f"{masked_username}@{parts[1]}"


def mask_phone(phone):
    """Mask phone number for privacy"""
    if not phone or len(str(phone)) < 10:
        return phone
    
    phone_str = str(phone)
    return phone_str[:2] + '*' * 6 + phone_str[-2:]


def response_success(data=None, message="Success", status_code=200):
    """Create success response"""
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code


def response_error(message="Error", status_code=400, errors=None):
    """Create error response"""
    response = {
        'success': False,
        'message': message,
        'errors': errors or []
    }
    return jsonify(response), status_code


def response_paginated(items, total, page, per_page):
    """Create paginated response"""
    return {
        'items': items,
        'pagination': {
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }
    }


def validate_required_fields(data, required_fields):
    """Validate required fields in request data"""
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None


def sanitize_string(text):
    """Sanitize string input"""
    if not text:
        return ""
    
    # Remove special characters
    text = re.sub(r'[^\w\s\-\.]', '', text)
    
    # Trim whitespace
    text = text.strip()
    
    return text


def truncate_string(text, max_length=100):
    """Truncate string to max length"""
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - 3] + "..."


def convert_to_serializable(obj):
    """Convert non-serializable objects to serializable format"""
    if hasattr(obj, 'to_dict'):
        return obj.to_dict()
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, date):
        return obj.isoformat()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, pd.Series):
        return obj.to_dict()
    elif isinstance(obj, set):
        return list(obj)
    else:
        return obj