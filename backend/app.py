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

# Add the parent directory to path so that 'backend' module can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now imports will work
from backend.config import get_config
from backend.database.models import db
from backend.database.db_manager import DatabaseManager
from backend.api.auth import auth_bp
from backend.api.routes import api_bp
from backend.models.recommendation_engine import UPSCRecommendationEngine


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
        app.config.from_object(get_config(os.environ.get('FLASK_ENV', 'default')))
    
    # Initialize extensions
    CORS(app, origins=app.config['CORS_ORIGINS'])
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Initialize Swagger for API documentation
    swagger = Swagger(app, template={
        'swagger': '2.0',
        'info': {
            'title': app.config['API_TITLE'],
            'description': app.config['API_DESCRIPTION'],
            'version': app.config['API_VERSION']
        },
        'basePath': app.config['API_PREFIX']
    })
    
    # Initialize database manager
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
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix=f"{app.config['API_PREFIX']}/auth")
    app.register_blueprint(api_bp, url_prefix=app.config['API_PREFIX'])
    
    # Error handlers
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
    
    # JWT error handlers
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
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified")
    
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
                'auth': f"{app.config['API_PREFIX']}/auth",
                'api': f"{app.config['API_PREFIX']}",
                'docs': '/apidocs'
            }
        }), 200
    
    print("="*60)
    print("🚀 UPSC Learning System API Started")
    print("="*60)
    print(f"Environment: {app.config.get('ENV', 'development')}")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"API Base URL: {app.config['API_PREFIX']}")
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