import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = False
    TESTING = False
    ENV = os.environ.get('FLASK_ENV', 'development')
    
    # API prefix
    API_PREFIX = '/api/v1'
    
    # Database settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///upsc_learning.db')
    
    # JWT Authentication settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production-2024')
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_IDENTITY_CLAIM = 'sub'
    
    # API settings
    API_TITLE = "UPSC Learning System API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "AI-Powered Personalized Learning System for UPSC Aspirants"
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(',')
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # ML Model paths
    MODEL_PATH = os.environ.get('MODEL_PATH', 'ml_models/saved_models/best_upsc_model.pkl')
    SCALER_PATH = os.environ.get('SCALER_PATH', 'ml_models/saved_models/scaler.pkl')
    FEATURE_NAMES_PATH = os.environ.get('FEATURE_NAMES_PATH', 'ml_models/saved_models/feature_names.txt')
    
    # Email settings (for notifications)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@upsclearning.com')
    
    # Rate limiting
    RATELIMIT_DEFAULT = "100 per day"
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # Pagination
    ITEMS_PER_PAGE = 20
    
    # UPSC specific constants
    GS_PASSING_SCORE = 100  # out of 200
    CSAT_PASSING_SCORE = 66  # out of 200 (33% required)
    
    # Study recommendations
    DEFAULT_DAILY_STUDY_HOURS = 6
    MAX_DAILY_STUDY_HOURS = 14
    MIN_DAILY_STUDY_HOURS = 2


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = 'development'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL', 'sqlite:///upsc_learning_dev.db')
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    ENV = 'testing'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    ENV = 'production'
    
    # In production, these must be set in environment
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production")
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be set in production")
    
    # Use PostgreSQL in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Production settings
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True


# Configuration dictionary
config_dict = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(config_name=None):
    """
    Get configuration based on environment name
    
    Args:
        config_name: Name of the configuration ('development', 'testing', 'production')
    
    Returns:
        Configuration class instance
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    config_class = config_dict.get(config_name, config_dict['default'])
    return config_class()


# For direct testing (only runs when script is executed directly)
if __name__ == "__main__":
    # Test different configurations
    print("=" * 60)
    print("CONFIGURATION TEST")
    print("=" * 60)
    
    dev_config = get_config('development')
    print(f"\n📝 Development Config:")
    print(f"  - Debug: {dev_config.DEBUG}")
    print(f"  - Environment: {dev_config.ENV}")
    print(f"  - Database URI: {dev_config.SQLALCHEMY_DATABASE_URI}")
    
    test_config = get_config('testing')
    print(f"\n🧪 Testing Config:")
    print(f"  - Testing: {test_config.TESTING}")
    print(f"  - Database URI: {test_config.SQLALCHEMY_DATABASE_URI}")
    
    print("\n✅ Configuration loaded successfully!")