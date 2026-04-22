"""
Input validators for UPSC Learning System
Validates all incoming request data
"""

import re
from datetime import datetime
from flask import request


class StudentDataValidator:
    """Validator for student-related data"""
    
    @staticmethod
    def validate_student_profile(data):
        """Validate student profile data"""
        errors = []
        
        # Age validation
        if 'age' in data and data['age']:
            try:
                age = int(data['age'])
                if age < 18 or age > 60:
                    errors.append("Age must be between 18 and 60")
            except:
                errors.append("Age must be a valid number")
        
        # Gender validation
        if 'gender' in data and data['gender']:
            valid_genders = ['Male', 'Female', 'Other']
            if data['gender'] not in valid_genders:
                errors.append(f"Gender must be one of: {', '.join(valid_genders)}")
        
        # Graduation percentage validation
        if 'graduation_percentage' in data and data['graduation_percentage']:
            try:
                percentage = float(data['graduation_percentage'])
                if percentage < 0 or percentage > 100:
                    errors.append("Graduation percentage must be between 0 and 100")
            except:
                errors.append("Graduation percentage must be a valid number")
        
        # Preparation months validation
        if 'preparation_months' in data and data['preparation_months']:
            try:
                months = int(data['preparation_months'])
                if months < 0 or months > 60:
                    errors.append("Preparation months must be between 0 and 60")
            except:
                errors.append("Preparation months must be a valid number")
        
        # Daily study hours validation
        if 'daily_study_hours' in data and data['daily_study_hours']:
            try:
                hours = float(data['daily_study_hours'])
                if hours < 0 or hours > 16:
                    errors.append("Daily study hours must be between 0 and 16")
            except:
                errors.append("Daily study hours must be a valid number")
        
        # Attempt number validation
        if 'attempt_number' in data and data['attempt_number']:
            try:
                attempts = int(data['attempt_number'])
                if attempts < 1 or attempts > 10:
                    errors.append("Attempt number must be between 1 and 10")
            except:
                errors.append("Attempt number must be a valid number")
        
        return errors
    
    @staticmethod
    def validate_subject_scores(data):
        """Validate subject scores"""
        errors = []
        
        # Validate GS subjects (typically out of 25 or 100)
        gs_subjects = ['history_score', 'geography_score', 'polity_score', 
                       'economy_score', 'science_tech_score', 'environment_score',
                       'current_affairs_score', 'art_culture_score']
        
        for subject in gs_subjects:
            if subject in data and data[subject] is not None:
                try:
                    score = float(data[subject])
                    if score < 0 or score > 100:
                        errors.append(f"{subject} must be between 0 and 100")
                except:
                    errors.append(f"{subject} must be a valid number")
        
        # Validate CSAT subjects
        csat_subjects = ['comprehension_score', 'logical_reasoning_score',
                        'quantitative_score', 'data_interpretation_score',
                        'decision_making_score']
        
        for subject in csat_subjects:
            if subject in data and data[subject] is not None:
                try:
                    score = float(data[subject])
                    if score < 0 or score > 100:
                        errors.append(f"{subject} must be between 0 and 100")
                except:
                    errors.append(f"{subject} must be a valid number")
        
        return errors
    
    @staticmethod
    def validate_mock_test(data):
        """Validate mock test data"""
        errors = []
        
        # Test name validation
        if 'test_name' in data and data['test_name']:
            if len(data['test_name']) < 3 or len(data['test_name']) > 100:
                errors.append("Test name must be between 3 and 100 characters")
        
        # GS Score validation (out of 200)
        if 'gs_score' in data and data['gs_score'] is not None:
            try:
                score = float(data['gs_score'])
                if score < 0 or score > 200:
                    errors.append("GS Score must be between 0 and 200")
            except:
                errors.append("GS Score must be a valid number")
        
        # CSAT Score validation (out of 200)
        if 'csat_score' in data and data['csat_score'] is not None:
            try:
                score = float(data['csat_score'])
                if score < 0 or score > 200:
                    errors.append("CSAT Score must be between 0 and 200")
            except:
                errors.append("CSAT Score must be a valid number")
        
        # Accuracy validation
        if 'accuracy' in data and data['accuracy'] is not None:
            try:
                accuracy = float(data['accuracy'])
                if accuracy < 0 or accuracy > 100:
                    errors.append("Accuracy must be between 0 and 100")
            except:
                errors.append("Accuracy must be a valid number")
        
        # Time taken validation
        if 'time_taken' in data and data['time_taken'] is not None:
            try:
                time_taken = int(data['time_taken'])
                if time_taken < 0 or time_taken > 240:
                    errors.append("Time taken must be between 0 and 240 minutes")
            except:
                errors.append("Time taken must be a valid number")
        
        return errors


class StudyLogValidator:
    """Validator for study log data"""
    
    @staticmethod
    def validate_study_log(data):
        """Validate study log entry"""
        errors = []
        
        # Log date validation
        if 'log_date' in data and data['log_date']:
            try:
                datetime.strptime(data['log_date'], '%Y-%m-%d')
            except:
                errors.append("Log date must be in YYYY-MM-DD format")
        
        # Study hours validation
        if 'study_hours' in data and data['study_hours'] is not None:
            try:
                hours = float(data['study_hours'])
                if hours < 0 or hours > 24:
                    errors.append("Study hours must be between 0 and 24")
            except:
                errors.append("Study hours must be a valid number")
        
        # Subjects studied validation
        if 'subjects_studied' in data and data['subjects_studied']:
            if not isinstance(data['subjects_studied'], list):
                errors.append("Subjects studied must be a list")
            else:
                valid_subjects = ['history', 'geography', 'polity', 'economy',
                                 'science_tech', 'environment', 'current_affairs',
                                 'art_culture', 'comprehension', 'logical_reasoning',
                                 'quantitative', 'data_interpretation', 'decision_making']
                for subject in data['subjects_studied']:
                    if subject not in valid_subjects:
                        errors.append(f"Invalid subject: {subject}")
        
        # Quizzes taken validation
        if 'quizzes_taken' in data and data['quizzes_taken'] is not None:
            try:
                quizzes = int(data['quizzes_taken'])
                if quizzes < 0 or quizzes > 50:
                    errors.append("Quizzes taken must be between 0 and 50")
            except:
                errors.append("Quizzes taken must be a valid number")
        
        return errors


class RecommendationValidator:
    """Validator for recommendation data"""
    
    @staticmethod
    def validate_recommendation(data):
        """Validate recommendation data"""
        errors = []
        
        # Recommendation type validation
        valid_types = ['study_plan', 'resource', 'strategy', 'motivation']
        if 'recommendation_type' in data:
            if data['recommendation_type'] not in valid_types:
                errors.append(f"Recommendation type must be one of: {', '.join(valid_types)}")
        
        # Priority validation
        valid_priorities = ['high', 'medium', 'low']
        if 'priority' in data and data['priority']:
            if data['priority'] not in valid_priorities:
                errors.append(f"Priority must be one of: {', '.join(valid_priorities)}")
        
        # Subject validation
        valid_subjects = ['history', 'geography', 'polity', 'economy',
                         'science_tech', 'environment', 'current_affairs',
                         'art_culture', 'csat_comprehension', 'csat_logical_reasoning',
                         'csat_quantitative', 'csat_data_interpretation', 
                         'csat_decision_making', 'general']
        
        if 'subject' in data and data['subject']:
            if data['subject'] not in valid_subjects:
                errors.append(f"Invalid subject: {data['subject']}")
        
        # Content validation
        if 'content' in data and data['content']:
            if len(data['content']) < 10 or len(data['content']) > 5000:
                errors.append("Content must be between 10 and 5000 characters")
        
        return errors


class UserValidator:
    """Validator for user-related data"""
    
    @staticmethod
    def validate_registration(data):
        """Validate user registration data"""
        errors = []
        
        # Username validation
        if 'username' not in data or not data['username']:
            errors.append("Username is required")
        else:
            if len(data['username']) < 3 or len(data['username']) > 50:
                errors.append("Username must be between 3 and 50 characters")
            if not re.match(r'^[a-zA-Z0-9_]+$', data['username']):
                errors.append("Username can only contain letters, numbers, and underscores")
        
        # Email validation
        if 'email' not in data or not data['email']:
            errors.append("Email is required")
        else:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data['email']):
                errors.append("Invalid email format")
        
        # Password validation
        if 'password' not in data or not data['password']:
            errors.append("Password is required")
        else:
            if len(data['password']) < 8:
                errors.append("Password must be at least 8 characters")
            if not re.search(r'[A-Z]', data['password']):
                errors.append("Password must contain at least one uppercase letter")
            if not re.search(r'[a-z]', data['password']):
                errors.append("Password must contain at least one lowercase letter")
            if not re.search(r'\d', data['password']):
                errors.append("Password must contain at least one digit")
        
        # Password confirmation
        if 'confirm_password' in data:
            if data['password'] != data['confirm_password']:
                errors.append("Passwords do not match")
        
        return errors
    
    @staticmethod
    def validate_login(data):
        """Validate login data"""
        errors = []
        
        if 'username_or_email' not in data or not data['username_or_email']:
            errors.append("Username or email is required")
        
        if 'password' not in data or not data['password']:
            errors.append("Password is required")
        
        return errors
    
    @staticmethod
    def validate_password_change(data):
        """Validate password change request"""
        errors = []
        
        if 'current_password' not in data or not data['current_password']:
            errors.append("Current password is required")
        
        if 'new_password' not in data or not data['new_password']:
            errors.append("New password is required")
        else:
            if len(data['new_password']) < 8:
                errors.append("New password must be at least 8 characters")
            if not re.search(r'[A-Z]', data['new_password']):
                errors.append("New password must contain at least one uppercase letter")
            if not re.search(r'[a-z]', data['new_password']):
                errors.append("New password must contain at least one lowercase letter")
            if not re.search(r'\d', data['new_password']):
                errors.append("New password must contain at least one digit")
        
        if 'confirm_password' in data:
            if data['new_password'] != data['confirm_password']:
                errors.append("New passwords do not match")
        
        return errors


class RequestValidator:
    """Main request validator that uses all validators"""
    
    @staticmethod
    def validate_request(validation_type, data=None):
        """
        Validate request based on type
        
        validation_type can be:
        - 'student_profile'
        - 'subject_scores'
        - 'mock_test'
        - 'study_log'
        - 'recommendation'
        - 'registration'
        - 'login'
        - 'password_change'
        """
        
        if data is None:
            data = request.get_json() or {}
        
        validators = {
            'student_profile': StudentDataValidator.validate_student_profile,
            'subject_scores': StudentDataValidator.validate_subject_scores,
            'mock_test': StudentDataValidator.validate_mock_test,
            'study_log': StudyLogValidator.validate_study_log,
            'recommendation': RecommendationValidator.validate_recommendation,
            'registration': UserValidator.validate_registration,
            'login': UserValidator.validate_login,
            'password_change': UserValidator.validate_password_change
        }
        
        if validation_type not in validators:
            return [], None
        
        errors = validators[validation_type](data)
        
        return errors, data if not errors else None