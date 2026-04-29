"""
Authentication API Routes
Handles user registration, login, logout, and profile management
"""

from flask import request, jsonify, current_app
from flask import Blueprint
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import timedelta
import re

# Use relative imports (no 'backend.' prefix)
from ..database.db_manager import DatabaseManager
from ..utils.validators import RequestValidator
from ..utils.helpers import response_success, response_error

# Create blueprint
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    """
    try:
        data = request.get_json()
        
        # Initialize db manager
        db_manager = DatabaseManager()
        
        # Validate input
        errors, _ = RequestValidator.validate_request('registration', data)
        if errors:
            return response_error("Validation failed", 400, errors)
        
        # Register user
        user, message = db_manager.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            full_name=data.get('full_name'),
            phone=data.get('phone')
        )
        
        if not user:
            return response_error(message, 409)
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return response_success({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, message, 201)
        
    except Exception as e:
        return response_error(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        db_manager = DatabaseManager()
        
        errors, _ = RequestValidator.validate_request('login', data)
        if errors:
            return response_error("Validation failed", 400, errors)
        
        user, message = db_manager.authenticate_user(
            data['username_or_email'],
            data['password']
        )
        
        if not user:
            return response_error(message, 401)
        
        # Create tokens with proper identity
        access_token = create_access_token(
            identity=str(user.id),  # Convert to string to ensure compatibility
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=str(user.id),  # Convert to string
            expires_delta=timedelta(days=30)
        )
        
        # Log for debugging
        current_app.logger.info(f"Token created for user {user.id}")
        current_app.logger.info(f"Token length: {len(access_token)}")
        
        return response_success({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, "Login successful")
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return response_error(f"Login failed: {str(e)}", 500)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(
            identity=current_user_id,
            expires_delta=timedelta(hours=24)
        )
        
        return response_success({
            'access_token': new_access_token
        }, "Token refreshed")
        
    except Exception as e:
        return response_error(f"Token refresh failed: {str(e)}", 500)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    return response_success(None, "Logout successful")


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        db_manager = DatabaseManager()
        user = db_manager.get_user_by_id(user_id)
        
        if not user:
            return response_error("User not found", 404)
        
        student_profile = db_manager.get_student_profile(user_id)
        
        return response_success({
            'user': user.to_dict(),
            'student_profile': student_profile.to_dict() if student_profile else None
        }, "Profile retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get profile: {str(e)}", 500)


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        db_manager = DatabaseManager()
        
        success, message = db_manager.update_user(user_id, **data)
        
        if not success:
            return response_error(message, 404)
        
        user = db_manager.get_user_by_id(user_id)
        
        return response_success({
            'user': user.to_dict()
        }, "Profile updated")
        
    except Exception as e:
        return response_error(f"Failed to update profile: {str(e)}", 500)


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        errors, _ = RequestValidator.validate_request('password_change', data)
        if errors:
            return response_error("Validation failed", 400, errors)
        
        db_manager = DatabaseManager()
        
        user = db_manager.get_user_by_id(user_id)
        if not user or not user.check_password(data['current_password']):
            return response_error("Current password is incorrect", 401)
        
        user.set_password(data['new_password'])
        
        from ..database.models import db
        db.session.commit()
        
        return response_success(None, "Password changed successfully")
        
    except Exception as e:
        return response_error(f"Failed to change password: {str(e)}", 500)


@auth_bp.route('/student-profile', methods=['POST'])
@jwt_required()
def create_student_profile():
    """Create or update student profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        db_manager = DatabaseManager()
        
        errors = RequestValidator.validate_request('student_profile', data)[0]
        if errors:
            return response_error("Validation failed", 400, errors)
        
        profile, message = db_manager.create_student_profile(user_id, **data)
        
        if not profile:
            return response_error(message, 400)
        
        return response_success({
            'student_profile': profile.to_dict()
        }, "Student profile saved")
        
    except Exception as e:
        return response_error(f"Failed to save profile: {str(e)}", 500)


@auth_bp.route('/student-profile', methods=['GET'])
@jwt_required()
def get_student_profile():
    """Get student profile"""
    try:
        user_id = get_jwt_identity()
        db_manager = DatabaseManager()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        return response_success({
            'student_profile': profile.to_dict()
        }, "Profile retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get profile: {str(e)}", 500)