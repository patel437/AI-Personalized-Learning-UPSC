"""
API Layer for UPSC Learning System
Contains all API endpoints and route handlers
"""

from .auth import auth_bp
from .routes import api_bp

__all__ = ['auth_bp', 'api_bp']