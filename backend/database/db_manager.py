"""
Database Manager for UPSC Learning System
Handles all database operations, CRUD operations, and queries
"""

from datetime import datetime, date, timedelta
from sqlalchemy import func, and_, or_
import json

from .models import db, User, StudentProfile, SubjectScore, Recommendation, MockTestResult, StudyLog


class DatabaseManager:
    """Centralized database operations manager"""
    
    def __init__(self, app=None):
        """Initialize with Flask app"""
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database with app - only called once"""
        # DO NOT call db.init_app(app) here - it's already initialized in app.py
        # Just store reference
        self.app = app
        
        # Set as attribute on app for easy access
        app.db_manager = self
    
    # ==================== USER MANAGEMENT ====================
    
    def create_user(self, username, email, password, full_name=None, phone=None):
        """Create a new user"""
        try:
            # Check if user already exists
            if self.get_user_by_email(email):
                return None, "Email already registered"
            if self.get_user_by_username(username):
                return None, "Username already taken"
            
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                phone=phone
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            return user, "User created successfully"
        except Exception as e:
            db.session.rollback()
            return None, f"Error creating user: {str(e)}"
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    def get_user_by_email(self, email):
        """Get user by email"""
        return User.query.filter_by(email=email).first()
    
    def get_user_by_username(self, username):
        """Get user by username"""
        return User.query.filter_by(username=username).first()
    
    def authenticate_user(self, username_or_email, password):
        """Authenticate user by username/email and password"""
        user = User.query.filter(
            or_(
                User.username == username_or_email,
                User.email == username_or_email
            )
        ).first()
        
        if user and user.check_password(password):
            user.last_login = datetime.utcnow()
            db.session.commit()
            return user, "Login successful"
        
        return None, "Invalid credentials"
    
    def update_user(self, user_id, **kwargs):
        """Update user details"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False, "User not found"
        
        allowed_fields = ['full_name', 'phone', 'is_active', 'is_admin']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(user, field, value)
        
        db.session.commit()
        return True, "User updated"
    
    def delete_user(self, user_id):
        """Delete user and all associated data"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False, "User not found"
            
            # Delete associated student profile first (cascade will handle)
            if user.student_profile:
                db.session.delete(user.student_profile)
            
            db.session.delete(user)
            db.session.commit()
            return True, "User deleted"
        except Exception as e:
            db.session.rollback()
            return False, f"Error: {str(e)}"
    
    # ==================== STUDENT PROFILE ====================
    
    def create_student_profile(self, user_id, **kwargs):
        """Create or update student profile"""
        try:
            # Check if profile exists
            profile = StudentProfile.query.filter_by(user_id=user_id).first()
            
            if profile:
                # Update existing
                for key, value in kwargs.items():
                    if hasattr(profile, key) and value is not None:
                        setattr(profile, key, value)
            else:
                # Create new
                profile = StudentProfile(user_id=user_id, **kwargs)
                db.session.add(profile)
            
            db.session.commit()
            return profile, "Profile saved successfully"
        except Exception as e:
            db.session.rollback()
            return None, f"Error: {str(e)}"
    
    def get_student_profile(self, user_id):
        """Get student profile by user ID"""
        return StudentProfile.query.filter_by(user_id=user_id).first()
    
    def get_student_profile_by_id(self, profile_id):
        """Get student profile by profile ID"""
        return StudentProfile.query.get(profile_id)
    
    def get_all_students(self, page=1, per_page=20):
        """Get all students with pagination"""
        pagination = StudentProfile.query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination.items, pagination.total
    
    # ==================== SUBJECT SCORES ====================
    
    def save_subject_scores(self, student_id, scores_dict, exam_date=None):
        """Save or update subject scores"""
        try:
            # Check if scores already exist for this exam date
            existing = SubjectScore.query.filter_by(
                student_id=student_id,
                exam_date=exam_date or date.today()
            ).first()
            
            if existing:
                # Update existing
                for key, value in scores_dict.items():
                    if hasattr(existing, key) and value is not None:
                        setattr(existing, key, value)
                score_record = existing
            else:
                # Create new
                score_record = SubjectScore(
                    student_id=student_id,
                    exam_date=exam_date or date.today(),
                    **scores_dict
                )
                db.session.add(score_record)
            
            # Update overall average in student profile
            self._update_student_averages(student_id)
            
            db.session.commit()
            return score_record, "Scores saved"
        except Exception as e:
            db.session.rollback()
            return None, f"Error: {str(e)}"
    
    def get_latest_scores(self, student_id):
        """Get latest subject scores for a student"""
        return SubjectScore.query.filter_by(student_id=student_id)\
            .order_by(SubjectScore.exam_date.desc())\
            .first()
    
    def get_score_history(self, student_id, limit=10):
        """Get score history for a student"""
        return SubjectScore.query.filter_by(student_id=student_id)\
            .order_by(SubjectScore.exam_date.desc())\
            .limit(limit)\
            .all()
    
    def _update_student_averages(self, student_id):
        """Update average scores in student profile"""
        latest_scores = self.get_latest_scores(student_id)
        if latest_scores:
            profile = StudentProfile.query.get(student_id)
            if profile:
                # Calculate GS average (excluding CSAT)
                gs_fields = ['history_score', 'geography_score', 'polity_score', 
                           'economy_score', 'science_tech_score', 'environment_score',
                           'current_affairs_score', 'art_culture_score']
                
                gs_scores = [getattr(latest_scores, field, 0) for field in gs_fields if getattr(latest_scores, field) is not None]
                if gs_scores:
                    profile.gs_average_score = sum(gs_scores) / len(gs_scores)
                
                # Calculate CSAT average
                csat_fields = ['comprehension_score', 'logical_reasoning_score', 
                              'quantitative_score', 'data_interpretation_score', 'decision_making_score']
                
                csat_scores = [getattr(latest_scores, field, 0) for field in csat_fields if getattr(latest_scores, field) is not None]
                if csat_scores:
                    profile.csat_average_score = sum(csat_scores) / len(csat_scores)
                
                # Calculate overall score (70% GS + 30% CSAT)
                if profile.gs_average_score and profile.csat_average_score:
                    profile.overall_score = (profile.gs_average_score * 0.7) + (profile.csat_average_score * 0.3)
    
    # ==================== RECOMMENDATIONS ====================
    
    def save_recommendation(self, student_id, recommendation_type, priority, 
                            subject, content, resources=None):
        """Save a recommendation for a student"""
        try:
            rec = Recommendation(
                student_id=student_id,
                recommendation_type=recommendation_type,
                priority=priority,
                subject=subject,
                content=content,
                resources=json.dumps(resources) if resources else None,
                status='pending'
            )
            db.session.add(rec)
            db.session.commit()
            return rec
        except Exception as e:
            db.session.rollback()
            return None
    
    def save_multiple_recommendations(self, student_id, recommendations_list):
        """Save multiple recommendations at once"""
        saved_recs = []
        for rec_data in recommendations_list:
            rec = self.save_recommendation(student_id, **rec_data)
            if rec:
                saved_recs.append(rec)
        return saved_recs
    
    def get_pending_recommendations(self, student_id, limit=10):
        """Get pending recommendations for a student"""
        # Using case statement for ordering
        priority_order = db.case(
            {'high': 1, 'medium': 2, 'low': 3},
            value=Recommendation.priority
        )
        return Recommendation.query.filter_by(
            student_id=student_id,
            status='pending'
        ).order_by(priority_order).limit(limit).all()
    
    def get_all_recommendations(self, student_id, status=None, limit=50):
        """Get all recommendations for a student"""
        query = Recommendation.query.filter_by(student_id=student_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Recommendation.created_at.desc()).limit(limit).all()
    
    def mark_recommendation_viewed(self, recommendation_id):
        """Mark recommendation as viewed"""
        rec = Recommendation.query.get(recommendation_id)
        if rec:
            rec.status = 'viewed'
            rec.viewed_at = datetime.utcnow()
            db.session.commit()
            return True
        return False
    
    def mark_recommendation_completed(self, recommendation_id):
        """Mark recommendation as completed"""
        rec = Recommendation.query.get(recommendation_id)
        if rec:
            rec.status = 'completed'
            rec.completed_at = datetime.utcnow()
            db.session.commit()
            return True
        return False
    
    # ==================== MOCK TESTS ====================
    
    def save_mock_test_result(self, student_id, test_name, gs_score, csat_score,
                              subject_wise_scores=None, accuracy=None, **kwargs):
        """Save mock test result"""
        try:
            mock_test = MockTestResult(
                student_id=student_id,
                test_name=test_name,
                test_date=date.today(),
                gs_score=gs_score,
                csat_score=csat_score,
                total_score=gs_score + csat_score,
                subject_wise_scores=json.dumps(subject_wise_scores) if subject_wise_scores else None,
                accuracy=accuracy,
                **kwargs
            )
            db.session.add(mock_test)
            db.session.commit()
            return mock_test
        except Exception as e:
            db.session.rollback()
            return None
    
    def get_mock_test_history(self, student_id, limit=10):
        """Get mock test history"""
        return MockTestResult.query.filter_by(student_id=student_id)\
            .order_by(MockTestResult.test_date.desc())\
            .limit(limit)\
            .all()
    
    def get_mock_test_trend(self, student_id):
        """Get mock test score trend"""
        tests = self.get_mock_test_history(student_id, limit=5)
        if not tests:
            return {'gs_scores': [], 'csat_scores': [], 'dates': []}
        
        return {
            'gs_scores': [t.gs_score for t in tests[::-1]],
            'csat_scores': [t.csat_score for t in tests[::-1]],
            'dates': [t.test_date.strftime('%Y-%m-%d') for t in tests[::-1]]
        }
    
    # ==================== STUDY LOGS ====================
    
    def add_study_log(self, student_id, log_date, study_hours, subjects_studied=None,
                      topics_covered=None, quizzes_taken=0, quiz_scores=None):
        """Add daily study log"""
        try:
            # Check if log already exists for this date
            existing = StudyLog.query.filter_by(
                student_id=student_id,
                log_date=log_date
            ).first()
            
            if existing:
                # Update existing
                existing.study_hours = study_hours
                existing.subjects_studied = json.dumps(subjects_studied) if subjects_studied else existing.subjects_studied
                existing.topics_covered = json.dumps(topics_covered) if topics_covered else existing.topics_covered
                existing.quizzes_taken = quizzes_taken
                existing.quiz_scores = json.dumps(quiz_scores) if quiz_scores else existing.quiz_scores
                log = existing
            else:
                # Create new
                log = StudyLog(
                    student_id=student_id,
                    log_date=log_date,
                    study_hours=study_hours,
                    subjects_studied=json.dumps(subjects_studied) if subjects_studied else None,
                    topics_covered=json.dumps(topics_covered) if topics_covered else None,
                    quizzes_taken=quizzes_taken,
                    quiz_scores=json.dumps(quiz_scores) if quiz_scores else None
                )
                db.session.add(log)
            
            db.session.commit()
            return log
        except Exception as e:
            db.session.rollback()
            return None
    
    def get_weekly_study_summary(self, student_id):
        """Get weekly study summary"""
        end_date = date.today()
        start_date = end_date - timedelta(days=7)
        
        logs = StudyLog.query.filter(
            and_(
                StudyLog.student_id == student_id,
                StudyLog.log_date >= start_date,
                StudyLog.log_date <= end_date
            )
        ).all()
        
        total_hours = sum(log.study_hours for log in logs)
        avg_hours = total_hours / 7 if logs else 0
        days_studied = len([log for log in logs if log.study_hours > 0])
        
        return {
            'total_hours': round(total_hours, 1),
            'average_daily_hours': round(avg_hours, 1),
            'days_studied': days_studied,
            'streak': self._calculate_streak(student_id)
        }
    
    def _calculate_streak(self, student_id):
        """Calculate current study streak in days"""
        today = date.today()
        streak = 0
        
        # Get logs for last 30 days
        logs = StudyLog.query.filter(
            and_(
                StudyLog.student_id == student_id,
                StudyLog.log_date >= today - timedelta(days=30)
            )
        ).order_by(StudyLog.log_date.desc()).all()
        
        for log in logs:
            if log.study_hours > 0:
                streak += 1
            else:
                break
        
        return streak
    
    # ==================== ANALYTICS & REPORTS ====================
    
    def get_dashboard_data(self, student_id):
        """Get all data needed for student dashboard"""
        profile = self.get_student_profile(student_id)
        if not profile:
            return None
        
        latest_scores = self.get_latest_scores(student_id)
        recommendations = self.get_pending_recommendations(student_id, limit=5)
        mock_trend = self.get_mock_test_trend(student_id)
        weekly_summary = self.get_weekly_study_summary(student_id)
        
        return {
            'profile': profile.to_dict() if hasattr(profile, 'to_dict') else {'id': profile.id},
            'latest_scores': latest_scores.to_dict() if latest_scores and hasattr(latest_scores, 'to_dict') else None,
            'recommendations': [rec.to_dict() for rec in recommendations] if recommendations else [],
            'mock_test_trend': mock_trend,
            'weekly_study': weekly_summary,
            'qualification_probability': profile.qualification_probability
        }
    
    def get_admin_stats(self):
        """Get admin dashboard statistics"""
        total_users = User.query.count()
        total_students = StudentProfile.query.count()
        
        # Qualification stats
        qualified_count = StudentProfile.query.filter(
            StudentProfile.qualification_probability >= 0.6
        ).count()
        
        # Average scores
        avg_overall = db.session.query(db.func.avg(StudentProfile.overall_score)).scalar() or 0
        
        # Recent signups (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.query.filter(User.created_at >= week_ago).count()
        
        return {
            'total_users': total_users,
            'total_students': total_students,
            'qualified_students': qualified_count,
            'qualification_rate': round((qualified_count / total_students * 100), 1) if total_students > 0 else 0,
            'average_overall_score': round(avg_overall, 1),
            'recent_signups': recent_users
        }