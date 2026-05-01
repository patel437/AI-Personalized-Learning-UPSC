"""
Main API Routes for UPSC Learning System
Handles all core functionality endpoints
"""

from flask import request, jsonify, current_app
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
import pandas as pd

from ..database.db_manager import DatabaseManager
from ..services.data_preprocessing import DataPreprocessingService
from ..services.analytics_service import AnalyticsService
from ..services.notification_service import NotificationService
from ..utils.helpers import response_success, response_error
from ..utils.validators import RequestValidator

# Create blueprint
api_bp = Blueprint('api', __name__)

# Initialize services
db_manager = DatabaseManager()
data_preprocessor = DataPreprocessingService()
analytics_service = AnalyticsService()
notification_service = NotificationService()


# ==================== DASHBOARD ENDPOINTS ====================

@api_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """
    Get student dashboard data
    ---
    tags:
      - Dashboard
    responses:
      200:
        description: Dashboard data retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        
        # Get dashboard data from database manager
        dashboard_data = db_manager.get_dashboard_data(user_id)
        
        if not dashboard_data:
            return response_error("No data available", 404)
        
        return response_success(dashboard_data, "Dashboard data retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get dashboard: {str(e)}", 500)


@api_bp.route('/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    """
    Get dashboard overview statistics
    ---
    tags:
      - Dashboard
    responses:
      200:
        description: Overview retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        # Get latest scores
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        overview = {
            'student_name': profile.user.full_name if profile.user else 'Student',
            'overall_score': profile.overall_score or 0,
            'gs_average': profile.gs_average_score or 0,
            'csat_average': profile.csat_average_score or 0,
            'qualification_probability': profile.qualification_probability or 0,
            'daily_study_hours': profile.daily_study_hours or 0,
            'preparation_months': profile.preparation_months or 0,
            'mock_tests_taken': 0,  # Calculate from mock test table
            'weak_subjects_count': 0  # Calculate from scores
        }
        
        return response_success(overview, "Overview retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get overview: {str(e)}", 500)


# ==================== SUBJECT SCORES ENDPOINTS ====================

@api_bp.route('/scores', methods=['POST'])
@jwt_required()
def save_scores():
    """
    Save subject scores for student
    ---
    tags:
      - Scores
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            history_score:
              type: number
            geography_score:
              type: number
            polity_score:
              type: number
            economy_score:
              type: number
            science_tech_score:
              type: number
            environment_score:
              type: number
            current_affairs_score:
              type: number
            art_culture_score:
              type: number
            comprehension_score:
              type: number
            logical_reasoning_score:
              type: number
            quantitative_score:
              type: number
            data_interpretation_score:
              type: number
            decision_making_score:
              type: number
            exam_date:
              type: string
              format: date
    responses:
      200:
        description: Scores saved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json()
        
        # Validate scores
        errors = RequestValidator.validate_request('subject_scores', data)[0]
        if errors:
            return response_error("Validation failed", 400, errors)
        
        # Parse exam date
        exam_date = None
        if data.get('exam_date'):
            exam_date = datetime.strptime(data['exam_date'], '%Y-%m-%d').date()
        
        # Save scores
        scores, message = db_manager.save_subject_scores(
            student_id=profile.id,
            scores_dict=data,
            exam_date=exam_date
        )
        
        if not scores:
            return response_error(message, 400)
        
        # Update recommendation engine (optional - could be async)
        # This would trigger new recommendations based on updated scores
        
        return response_success({
            'scores': scores.to_dict()
        }, "Scores saved successfully")
        
    except Exception as e:
        return response_error(f"Failed to save scores: {str(e)}", 500)


@api_bp.route('/scores/latest', methods=['GET'])
@jwt_required()
def get_latest_scores():
    """
    Get latest subject scores
    ---
    tags:
      - Scores
    responses:
      200:
        description: Latest scores retrieved successfully
    """
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


@api_bp.route('/scores/history', methods=['GET'])
@jwt_required()
def get_score_history():
    """
    Get score history
    ---
    tags:
      - Scores
    parameters:
      - in: query
        name: limit
        type: integer
        default: 10
        description: Number of records to return
    responses:
      200:
        description: Score history retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        limit = request.args.get('limit', 10, type=int)
        scores = db_manager.get_score_history(profile.id, limit)
        
        return response_success({
            'scores': [s.to_dict() for s in scores],
            'count': len(scores)
        }, "Score history retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get score history: {str(e)}", 500)


# ==================== RECOMMENDATION ENDPOINTS ====================

@api_bp.route('/recommendations/generate', methods=['POST'])
@jwt_required()
def generate_recommendations():
    """
    Generate personalized recommendations
    ---
    tags:
      - Recommendations
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            daily_study_hours:
              type: number
              default: 6
    responses:
      200:
        description: Recommendations generated successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json() or {}
        daily_study_hours = data.get('daily_study_hours', profile.daily_study_hours or 6)
        
        # Get latest scores
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        if not latest_scores:
            return response_error("No scores available for recommendations", 404)
        
        # Prepare data for recommendation engine
        student_data = pd.DataFrame([{
            **profile.to_dict(),
            **latest_scores.to_dict()
        }])
        
        # Get recommendations from engine
        recommendation_engine = current_app.recommendation_engine
        
        if not recommendation_engine:
            return response_error("Recommendation engine not available", 503)
        
        recommendations = recommendation_engine.get_full_recommendations(
            student_data,
            daily_study_hours=daily_study_hours
        )
        
        # Save recommendations to database
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
    """
    Get saved recommendations
    ---
    tags:
      - Recommendations
    parameters:
      - in: query
        name: status
        type: string
        enum: [pending, viewed, completed]
        description: Filter by status
      - in: query
        name: limit
        type: integer
        default: 20
    responses:
      200:
        description: Recommendations retrieved successfully
    """
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
    """
    Mark recommendation as viewed
    ---
    tags:
      - Recommendations
    parameters:
      - in: path
        name: rec_id
        required: true
        type: integer
    responses:
      200:
        description: Recommendation marked as viewed
    """
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
    """
    Mark recommendation as completed
    ---
    tags:
      - Recommendations
    parameters:
      - in: path
        name: rec_id
        required: true
        type: integer
    responses:
      200:
        description: Recommendation marked as completed
    """
    try:
        success = db_manager.mark_recommendation_completed(rec_id)
        
        if not success:
            return response_error("Recommendation not found", 404)
        
        return response_success(None, "Recommendation marked as completed")
        
    except Exception as e:
        return response_error(f"Failed to update recommendation: {str(e)}", 500)


# ==================== MOCK TEST ENDPOINTS ====================

@api_bp.route('/mock-tests', methods=['POST'])
@jwt_required()
def save_mock_test():
    """
    Save mock test result
    ---
    tags:
      - Mock Tests
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - test_name
            - gs_score
            - csat_score
          properties:
            test_name:
              type: string
            gs_score:
              type: number
            csat_score:
              type: number
            accuracy:
              type: number
            time_taken:
              type: integer
            questions_attempted:
              type: integer
            correct_answers:
              type: integer
            wrong_answers:
              type: integer
            subject_wise_scores:
              type: object
    responses:
      200:
        description: Mock test saved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json()
        
        # Validate mock test data
        errors = RequestValidator.validate_request('mock_test', data)[0]
        if errors:
            return response_error("Validation failed", 400, errors)
        
        # Save mock test
        mock_test = db_manager.save_mock_test_result(
            student_id=profile.id,
            test_name=data['test_name'],
            gs_score=data['gs_score'],
            csat_score=data['csat_score'],
            subject_wise_scores=data.get('subject_wise_scores'),
            accuracy=data.get('accuracy'),
            time_taken=data.get('time_taken'),
            questions_attempted=data.get('questions_attempted'),
            correct_answers=data.get('correct_answers'),
            wrong_answers=data.get('wrong_answers')
        )
        
        if not mock_test:
            return response_error("Failed to save mock test", 400)
        
        return response_success({
            'mock_test': mock_test.to_dict()
        }, "Mock test saved successfully")
        
    except Exception as e:
        return response_error(f"Failed to save mock test: {str(e)}", 500)


@api_bp.route('/mock-tests', methods=['GET'])
@jwt_required()
def get_mock_tests():
    """
    Get mock test history
    ---
    tags:
      - Mock Tests
    parameters:
      - in: query
        name: limit
        type: integer
        default: 10
    responses:
      200:
        description: Mock tests retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        limit = request.args.get('limit', 10, type=int)
        mock_tests = db_manager.get_mock_test_history(profile.id, limit)
        
        return response_success({
            'mock_tests': [m.to_dict() for m in mock_tests],
            'count': len(mock_tests)
        }, "Mock tests retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get mock tests: {str(e)}", 500)


@api_bp.route('/mock-tests/trend', methods=['GET'])
@jwt_required()
def get_mock_test_trend():
    """
    Get mock test trend analysis
    ---
    tags:
      - Mock Tests
    responses:
      200:
        description: Trend analysis retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        trend = db_manager.get_mock_test_trend(profile.id)
        
        return response_success(trend, "Trend analysis retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get trend: {str(e)}", 500)


# ==================== STUDY LOG ENDPOINTS ====================

@api_bp.route('/study-logs', methods=['POST'])
@jwt_required()
def add_study_log():
    """
    Add daily study log
    ---
    tags:
      - Study Logs
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - log_date
            - study_hours
          properties:
            log_date:
              type: string
              format: date
            study_hours:
              type: number
            subjects_studied:
              type: array
              items:
                type: string
            topics_covered:
              type: array
              items:
                type: string
            quizzes_taken:
              type: integer
            quiz_scores:
              type: array
              items:
                type: number
            notes_taken:
              type: boolean
    responses:
      200:
        description: Study log saved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        data = request.get_json()
        
        # Validate study log
        errors = RequestValidator.validate_request('study_log', data)[0]
        if errors:
            return response_error("Validation failed", 400, errors)
        
        # Parse date
        log_date = datetime.strptime(data['log_date'], '%Y-%m-%d').date()
        
        # Save study log
        study_log = db_manager.add_study_log(
            student_id=profile.id,
            log_date=log_date,
            study_hours=data['study_hours'],
            subjects_studied=data.get('subjects_studied'),
            topics_covered=data.get('topics_covered'),
            quizzes_taken=data.get('quizzes_taken', 0),
            quiz_scores=data.get('quiz_scores')
        )
        
        if not study_log:
            return response_error("Failed to save study log", 400)
        
        return response_success({
            'study_log': study_log.to_dict()
        }, "Study log saved successfully")
        
    except Exception as e:
        return response_error(f"Failed to save study log: {str(e)}", 500)


@api_bp.route('/study-logs/weekly', methods=['GET'])
@jwt_required()
def get_weekly_study_summary():
    """
    Get weekly study summary
    ---
    tags:
      - Study Logs
    responses:
      200:
        description: Weekly summary retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        summary = db_manager.get_weekly_study_summary(profile.id)
        
        return response_success(summary, "Weekly summary retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get weekly summary: {str(e)}", 500)


# ==================== ANALYTICS ENDPOINTS ====================

@api_bp.route('/analytics/performance-trend', methods=['GET'])
@jwt_required()
def get_performance_trend():
    """
    Get performance trend analysis
    ---
    tags:
      - Analytics
    responses:
      200:
        description: Performance trend retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        # Get score history
        scores = db_manager.get_score_history(profile.id, limit=20)
        
        # Convert to dict for analytics
        score_dicts = [s.to_dict() for s in scores]
        
        # Generate trend analysis
        trend = analytics_service.generate_performance_trend(score_dicts)
        
        return response_success(trend, "Performance trend retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get performance trend: {str(e)}", 500)


@api_bp.route('/analytics/weaknesses', methods=['GET'])
@jwt_required()
def get_weakness_analysis():
    """
    Get weakness analysis
    ---
    tags:
      - Analytics
    responses:
      200:
        description: Weakness analysis retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        # Get latest scores
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        if not latest_scores:
            return response_error("No scores available for analysis", 404)
        
        # Generate weakness analysis
        weakness_analysis = analytics_service.analyze_weaknesses(
            latest_scores.to_dict()
        )
        
        return response_success(weakness_analysis, "Weakness analysis retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get weakness analysis: {str(e)}", 500)


@api_bp.route('/analytics/success-probability', methods=['GET'])
@jwt_required()
def get_success_probability():
    """
    Get success probability analysis
    ---
    tags:
      - Analytics
    responses:
      200:
        description: Success probability retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        # Get latest scores
        latest_scores = db_manager.get_latest_scores(profile.id)
        
        if not latest_scores:
            return response_error("No scores available for analysis", 404)
        
        # Prepare student data
        student_data = {
            **profile.to_dict(),
            **latest_scores.to_dict(),
            'daily_study_hours': profile.daily_study_hours,
            'mock_tests_attempted': 0,  # You can calculate from mock test table
            'study_consistency': 70  # You can calculate from study logs
        }
        
        # Generate probability analysis
        probability = analytics_service.calculate_success_probability(student_data)
        
        return response_success(probability, "Success probability retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get success probability: {str(e)}", 500)


@api_bp.route('/analytics/weekly-report', methods=['GET'])
@jwt_required()
def get_weekly_report():
    """
    Get weekly performance report
    ---
    tags:
      - Analytics
    responses:
      200:
        description: Weekly report retrieved successfully
    """
    try:
        user_id = get_jwt_identity()
        profile = db_manager.get_student_profile(user_id)
        
        if not profile:
            return response_error("Student profile not found", 404)
        
        # Get weekly data (last 7 days)
        from datetime import timedelta
        week_ago = date.today() - timedelta(days=7)
        
        # Get study logs for last 7 days
        # This is simplified - you would add a method to get logs by date range
        study_logs = []  # db_manager.get_study_logs_by_date_range(profile.id, week_ago, date.today())
        
        # Get mock tests for last 7 days
        mock_tests = db_manager.get_mock_test_history(profile.id, limit=10)
        # Filter for last 7 days
        recent_tests = [t for t in mock_tests if t.test_date and t.test_date >= week_ago]
        
        # Prepare data for analytics
        profile_dict = profile.to_dict()
        study_log_dicts = [log.to_dict() for log in study_logs]
        test_dicts = [test.to_dict() for test in recent_tests]
        
        # Generate weekly report
        report = analytics_service.generate_weekly_report(
            profile_dict,
            study_log_dicts,
            test_dicts
        )
        
        return response_success(report, "Weekly report generated")
        
    except Exception as e:
        return response_error(f"Failed to generate weekly report: {str(e)}", 500)


# ==================== NOTIFICATION ENDPOINTS ====================

@api_bp.route('/notifications/send-report', methods=['POST'])
@jwt_required()
def send_weekly_report_email():
    """
    Send weekly report via email
    ---
    tags:
      - Notifications
    responses:
      200:
        description: Report sent successfully
    """
    try:
        user_id = get_jwt_identity()
        user = db_manager.get_user_by_id(user_id)
        
        if not user:
            return response_error("User not found", 404)
        
        # Generate weekly report (same as above)
        # ... (report generation code)
        
        # For now, simplified version
        report_data = {
            'week_start': '2024-01-01',
            'week_end': '2024-01-07',
            'study_summary': {'total_hours': 35, 'average_daily': 5, 'streak': 7, 'consistency': 85},
            'test_summary': {'tests_taken': 2, 'average_gs': 112, 'trend': 'improving', 'weekly_improvement': 8},
            'recommendations': ['Increase daily study hours', 'Take more mock tests'],
            'achievements': ['Consistent effort award']
        }
        
        # Send email
        success = notification_service.send_weekly_report(
            to_email=user.email,
            name=user.full_name or user.username,
            report_data=report_data
        )
        
        if not success:
            return response_error("Failed to send email", 500)
        
        return response_success(None, "Weekly report sent to your email")
        
    except Exception as e:
        return response_error(f"Failed to send report: {str(e)}", 500)


# ==================== ADMIN ENDPOINTS ====================

@api_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """
    Get admin dashboard statistics
    ---
    tags:
      - Admin
    responses:
      200:
        description: Statistics retrieved successfully
    """
    try:
        # Check if user is admin
        user_id = get_jwt_identity()
        user = db_manager.get_user_by_id(user_id)
        
        if not user or not user.is_admin:
            return response_error("Admin access required", 403)
        
        stats = db_manager.get_admin_stats()
        
        return response_success(stats, "Admin statistics retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get admin stats: {str(e)}", 500)


@api_bp.route('/admin/students', methods=['GET'])
@jwt_required()
def get_all_students():
    """
    Get all students (admin only)
    ---
    tags:
      - Admin
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: per_page
        type: integer
        default: 20
    responses:
      200:
        description: Students retrieved successfully
    """
    try:
        # Check if user is admin
        user_id = get_jwt_identity()
        user = db_manager.get_user_by_id(user_id)
        
        if not user or not user.is_admin:
            return response_error("Admin access required", 403)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        students, total = db_manager.get_all_students(page, per_page)
        
        return response_success({
            'students': [s.to_dict() for s in students],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }, "Students retrieved")
        
    except Exception as e:
        return response_error(f"Failed to get students: {str(e)}", 500)


# ==================== PREDICTION ENDPOINTS ====================

@api_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_performance():
    """
    Predict performance using ML model
    ---
    tags:
      - Prediction
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            student_data:
              type: object
    responses:
      200:
        description: Prediction generated successfully
    """
    try:
        data = request.get_json()
        student_data = data.get('student_data', {})
        
        recommendation_engine = current_app.recommendation_engine
        
        if not recommendation_engine:
            return response_error("ML model not available", 503)
        
        # Prepare data for prediction
        df = pd.DataFrame([student_data])
        
        # Preprocess data
        processed_df = data_preprocessor.prepare_for_model(df)
        
        # Make prediction
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