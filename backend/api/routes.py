"""
Main API Routes for UPSC Learning System
"""

from flask import request, jsonify, current_app
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
import pandas as pd

# Use relative imports
from ..database.db_manager import DatabaseManager
from ..services.data_preprocessing import DataPreprocessingService
from ..utils.helpers import response_success, response_error
from ..utils.validators import RequestValidator

# Create blueprint
api_bp = Blueprint('api', __name__)

# Initialize services
db_manager = DatabaseManager()
data_preprocessor = DataPreprocessingService()


# ==================== DASHBOARD ENDPOINTS ====================

@api_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get student dashboard data"""
    try:
        user_id = get_jwt_identity()
        dashboard_data = db_manager.get_dashboard_data(user_id)
        
        if not dashboard_data:
            return response_error("No data available", 404)
        
        return response_success(dashboard_data, "Dashboard data retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get dashboard: {str(e)}", 500)


@api_bp.route('/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    """Get dashboard overview statistics"""
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        overview = {
            'student_name': profile.user.full_name if profile.user and profile.user.full_name else 'Student',
            'overall_score': profile.overall_score or 0,
            'gs_average': profile.gs_average_score or 0,
            'csat_average': profile.csat_average_score or 0,
            'qualification_probability': profile.qualification_probability or 0,
            'daily_study_hours': profile.daily_study_hours or 0,
            'preparation_months': profile.preparation_months or 0,
            'mock_tests_taken': 0,
            'weak_subjects_count': 0
        }
        
        return response_success(overview, "Overview retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get overview: {str(e)}", 500)


# ==================== SUBJECT SCORES ENDPOINTS ====================

@api_bp.route('/scores', methods=['POST'])
@jwt_required()
def save_scores():
    """Save subject scores for student"""
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json()
        
        errors = RequestValidator.validate_request('subject_scores', data)[0]
        if errors:
            return response_error("Validation failed", 400, errors)
        
        exam_date = None
        if data.get('exam_date'):
            exam_date = datetime.strptime(data['exam_date'], '%Y-%m-%d').date()
        
        scores, message = db_manager.save_subject_scores(
            student_id=profile.id,
            scores_dict=data,
            exam_date=exam_date
        )
        
        if not scores:
            return response_error(message, 400)
        
        return response_success({
            'scores': scores.to_dict()
        }, "Scores saved successfully")
        
    except Exception as e:
        return response_error(f"Failed to save scores: {str(e)}", 500)


@api_bp.route('/scores/latest', methods=['GET'])
@jwt_required()
def get_latest_scores():
    """Get latest subject scores"""
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        scores = db_manager.get_latest_scores(profile.id)
        
        if not scores:
            return response_error("No scores found", 404)
        
        return response_success({
            'scores': scores.to_dict()
        }, "Latest scores retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get scores: {str(e)}", 500)


# ==================== RECOMMENDATION ENDPOINTS ====================

@api_bp.route('/recommendations/generate', methods=['POST'])
@jwt_required()
def generate_recommendations():
    """Generate personalized recommendations"""
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json() or {}
        daily_study_hours = data.get('daily_study_hours', profile.daily_study_hours or 6)
        
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        if not latest_scores:
            return response_error("No scores available for recommendations", 404)
        
        recommendation_engine = current_app.recommendation_engine
        
        if not recommendation_engine:
            return response_error("Recommendation engine not available", 503)
        
        student_data = pd.DataFrame([{
            **profile.to_dict(),
            **latest_scores.to_dict()
        }])
        
        recommendations = recommendation_engine.get_full_recommendations(
            student_data,
            daily_study_hours=daily_study_hours
        )
        
        saved_recs = []
        for subject, weakness in recommendations.get('weaknesses', {}).items():
            rec_data = {
                'recommendation_type': 'weakness_alert',
                'priority': weakness.get('severity', 'medium').lower(),
                'subject': subject,
                'content': f"Score: {weakness.get('score', 0)}%. {recommendation_engine.get_subject_strategy(subject, weakness.get('severity', 'medium'))}"
            }
            rec = db_manager.save_recommendation(
                student_id=profile.id,
                **rec_data
            )
            if rec:
                saved_recs.append(rec)
        
        return response_success({
            'recommendations': recommendations,
            'saved_count': len(saved_recs)
        }, "Recommendations generated")
        
    except Exception as e:
        return response_error(f"Failed to generate recommendations: {str(e)}", 500)


@api_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get saved recommendations"""
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        status = request.args.get('status')
        limit = request.args.get('limit', 20, type=int)
        
        recommendations = db_manager.get_all_recommendations(profile.id, status, limit)
        
        return response_success({
            'recommendations': [r.to_dict() for r in recommendations],
            'count': len(recommendations)
        }, "Recommendations retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get recommendations: {str(e)}", 500)


@api_bp.route('/recommendations/<int:rec_id>/view', methods=['PUT'])
@jwt_required()
def mark_recommendation_viewed(rec_id):
    """Mark recommendation as viewed"""
    try:
        success = db_manager.mark_recommendation_viewed(rec_id)
        
        if not success:
            return response_error("Recommendation not found", 404)
        
        return response_success(None, "Recommendation marked as viewed")
        
    except Exception as e:
        return response_error(f"Failed to update recommendation: {str(e)}", 500)


@api_bp.route('/recommendations/<int:rec_id>/complete', methods=['PUT'])
@jwt_required()
def mark_recommendation_completed(rec_id):
    """Mark recommendation as completed"""
    try:
        success = db_manager.mark_recommendation_completed(rec_id)
        
        if not success:
            return response_error("Recommendation not found", 404)
        
        return response_success(None, "Recommendation marked as completed")
        
    except Exception as e:
        return response_error(f"Failed to update recommendation: {str(e)}", 500)


# ==================== PREDICTION ENDPOINT ====================

@api_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_performance():
    """Predict performance using ML model"""
    try:
        data = request.get_json()
        student_data = data.get('student_data', {})
        
        recommendation_engine = current_app.recommendation_engine
        
        if not recommendation_engine:
            return response_error("ML model not available", 503)
        
        df = pd.DataFrame([student_data])
        processed_df = data_preprocessor.prepare_for_model(df)
        
        if recommendation_engine.model and recommendation_engine.scaler:
            try:
                scaled_data = recommendation_engine.scaler.transform(processed_df)
                probability = recommendation_engine.model.predict_proba(scaled_data)[0][1]
                prediction = 1 if probability > 0.5 else 0
                
                return response_success({
                    'prediction': bool(prediction),
                    'probability': round(probability * 100, 2),
                    'qualifies': bool(prediction)
                }, "Prediction generated")
            except Exception as e:
                return response_error(f"Prediction failed: {str(e)}", 500)
        else:
            return response_error("Model not loaded", 503)
        
    except Exception as e:
        return response_error(f"Failed to predict: {str(e)}", 500)


@api_bp.route('/health', methods=['GET'])
def api_health():
    """API health check endpoint"""
    return response_success({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }, "API is healthy")