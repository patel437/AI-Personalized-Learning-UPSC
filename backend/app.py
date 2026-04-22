"""
Main Flask Application Entry Point
UPSC Personalized Learning System
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger

# Add backend to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import configurations
from config import get_config
from database.models import db
from database.db_manager import DatabaseManager

# Import services
from models.recommendation_engine import UPSCRecommendationEngine


def create_app(config_name=None):
    """
    Application factory pattern
    Creates and configures the Flask app
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    if config_name:
        app.config.from_object(get_config(config_name))
    else:
        app.config.from_object(get_config(os.environ.get('FLASK_ENV', 'development')))
    
    # Initialize extensions in correct order
    # 1. First initialize db with app
    db.init_app(app)
    
    # 2. Then CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # 3. Then JWT
    jwt = JWTManager(app)
    
    # Initialize Swagger for API documentation
    swagger = Swagger(app, template={
        'swagger': '2.0',
        'info': {
            'title': app.config['API_TITLE'],
            'description': app.config['API_DESCRIPTION'],
            'version': app.config['API_VERSION']
        },
        'basePath': app.config.get('API_PREFIX', '/api/v1')
    })
    
    # Initialize database manager (pass the app, but it won't re-init db)
    db_manager = DatabaseManager(app)
    
    # Initialize recommendation engine
    try:
        recommendation_engine = UPSCRecommendationEngine(
            model_path=app.config['MODEL_PATH'],
            scaler_path=app.config['SCALER_PATH']
        )
        app.recommendation_engine = recommendation_engine
        print("✅ Recommendation engine loaded successfully")
    except Exception as e:
        print(f"⚠️ Could not load recommendation engine: {e}")
        app.recommendation_engine = None
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified")
    
    # ==================== ERROR HANDLERS ====================
    
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'errors': [str(error)]
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'errors': [str(error)]
        }), 500
    
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({
            'success': False,
            'message': 'Bad request',
            'errors': [str(error)]
        }), 400
    
    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify({
            'success': False,
            'message': 'Unauthorized access',
            'errors': [str(error)]
        }), 401
    
    # ==================== JWT ERROR HANDLERS ====================
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token',
            'errors': [error]
        }), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'errors': ['Please login again']
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing',
            'errors': [error]
        }), 401
    
    # ==================== ROUTES ====================
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'message': 'UPSC Learning System API is running',
            'version': app.config['API_VERSION']
        }), 200
    
    @app.route('/', methods=['GET'])
    def home():
        """Home endpoint"""
        return jsonify({
            'name': app.config['API_TITLE'],
            'description': app.config['API_DESCRIPTION'],
            'version': app.config['API_VERSION'],
            'endpoints': {
                'health': '/health',
                'docs': '/apidocs'
            }
        }), 200
    
    print("="*60)
    print("🚀 UPSC Learning System API Started")
    print("="*60)
    print(f"Environment: {app.config.get('ENV', 'development')}")
    print(f"Debug Mode: {app.config['DEBUG']}")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"API Docs: http://localhost:5000/apidocs")
    print("="*60)
    
    return app


# Create app instance for running directly
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or use 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=app.config['DEBUG']
    )