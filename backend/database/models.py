"""
Database Models for UPSC Learning System
Defines all database tables using SQLAlchemy ORM
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """User model for authentication and profile"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, lazy=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class StudentProfile(db.Model):
    """Student profile with academic and preparation details"""
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Personal details
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    graduation_percentage = db.Column(db.Float)
    graduation_stream = db.Column(db.String(50))
    
    # Preparation details
    preparation_months = db.Column(db.Integer, default=0)
    daily_study_hours = db.Column(db.Float, default=6.0)
    attempt_number = db.Column(db.Integer, default=1)
    previous_prelims_qualified = db.Column(db.Boolean, default=False)
    
    # Study resources used
    coaching = db.Column(db.String(100))
    ncert_read = db.Column(db.Boolean, default=False)
    standard_books = db.Column(db.Boolean, default=False)
    online_resources = db.Column(db.Boolean, default=False)
    
    # Performance metrics
    overall_score = db.Column(db.Float)
    gs_average_score = db.Column(db.Float)
    csat_average_score = db.Column(db.Float)
    qualification_probability = db.Column(db.Float)
    
    # Target
    target_exam_year = db.Column(db.Integer)
    target_exam_attempt = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'age': self.age,
            'gender': self.gender,
            'graduation_percentage': self.graduation_percentage,
            'graduation_stream': self.graduation_stream,
            'preparation_months': self.preparation_months,
            'daily_study_hours': self.daily_study_hours,
            'attempt_number': self.attempt_number,
            'previous_prelims_qualified': self.previous_prelims_qualified,
            'coaching': self.coaching,
            'ncert_read': self.ncert_read,
            'standard_books': self.standard_books,
            'online_resources': self.online_resources,
            'overall_score': self.overall_score,
            'gs_average_score': self.gs_average_score,
            'csat_average_score': self.csat_average_score,
            'qualification_probability': self.qualification_probability,
            'target_exam_year': self.target_exam_year,
            'target_exam_attempt': self.target_exam_attempt
        }


class SubjectScore(db.Model):
    """Subject-wise scores for students"""
    __tablename__ = 'subject_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    
    # GS Subjects (score out of 100)
    history_score = db.Column(db.Float)
    geography_score = db.Column(db.Float)
    polity_score = db.Column(db.Float)
    economy_score = db.Column(db.Float)
    science_tech_score = db.Column(db.Float)
    environment_score = db.Column(db.Float)
    current_affairs_score = db.Column(db.Float)
    art_culture_score = db.Column(db.Float)
    
    # CSAT Subjects (score out of 100)
    comprehension_score = db.Column(db.Float)
    logical_reasoning_score = db.Column(db.Float)
    quantitative_score = db.Column(db.Float)
    data_interpretation_score = db.Column(db.Float)
    decision_making_score = db.Column(db.Float)
    
    exam_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    student = db.relationship('StudentProfile', backref='scores', lazy=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'history': self.history_score,
            'geography': self.geography_score,
            'polity': self.polity_score,
            'economy': self.economy_score,
            'science_tech': self.science_tech_score,
            'environment': self.environment_score,
            'current_affairs': self.current_affairs_score,
            'art_culture': self.art_culture_score,
            'comprehension': self.comprehension_score,
            'logical_reasoning': self.logical_reasoning_score,
            'quantitative': self.quantitative_score,
            'data_interpretation': self.data_interpretation_score,
            'decision_making': self.decision_making_score,
            'exam_date': self.exam_date.isoformat() if self.exam_date else None
        }


class Recommendation(db.Model):
    """Stored recommendations for students"""
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    
    # Recommendation details
    recommendation_type = db.Column(db.String(50))  # study_plan, resource, strategy
    priority = db.Column(db.String(20))  # high, medium, low
    subject = db.Column(db.String(50))
    content = db.Column(db.Text)
    resources = db.Column(db.Text)  # JSON string of resources
    
    # Status tracking
    status = db.Column(db.String(20), default='pending')  # pending, viewed, completed
    viewed_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    student = db.relationship('StudentProfile', backref='recommendations', lazy=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
        return {
            'id': self.id,
            'student_id': self.student_id,
            'recommendation_type': self.recommendation_type,
            'priority': self.priority,
            'subject': self.subject,
            'content': self.content,
            'resources': json.loads(self.resources) if self.resources else [],
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MockTestResult(db.Model):
    """Mock test results for students"""
    __tablename__ = 'mock_test_results'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    
    test_name = db.Column(db.String(100))
    test_date = db.Column(db.Date)
    
    # Scores
    gs_score = db.Column(db.Float)  # out of 200
    csat_score = db.Column(db.Float)  # out of 200
    total_score = db.Column(db.Float)
    rank = db.Column(db.Integer)
    percentile = db.Column(db.Float)
    
    # Subject-wise breakdown (JSON)
    subject_wise_scores = db.Column(db.Text)  # JSON string
    
    # Analysis
    accuracy = db.Column(db.Float)
    time_taken = db.Column(db.Integer)  # in minutes
    questions_attempted = db.Column(db.Integer)
    correct_answers = db.Column(db.Integer)
    wrong_answers = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    student = db.relationship('StudentProfile', backref='mock_tests', lazy=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
        return {
            'id': self.id,
            'student_id': self.student_id,
            'test_name': self.test_name,
            'test_date': self.test_date.isoformat() if self.test_date else None,
            'gs_score': self.gs_score,
            'csat_score': self.csat_score,
            'total_score': self.total_score,
            'rank': self.rank,
            'percentile': self.percentile,
            'subject_wise_scores': json.loads(self.subject_wise_scores) if self.subject_wise_scores else {},
            'accuracy': self.accuracy,
            'time_taken': self.time_taken,
            'questions_attempted': self.questions_attempted,
            'correct_answers': self.correct_answers,
            'wrong_answers': self.wrong_answers
        }


class StudyLog(db.Model):
    """Daily study logs for tracking engagement"""
    __tablename__ = 'study_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    
    log_date = db.Column(db.Date, nullable=False)
    study_hours = db.Column(db.Float, default=0)
    subjects_studied = db.Column(db.Text)  # JSON list
    topics_covered = db.Column(db.Text)  # JSON list
    quizzes_taken = db.Column(db.Integer, default=0)
    quiz_scores = db.Column(db.Text)  # JSON list
    notes_taken = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    student = db.relationship('StudentProfile', backref='study_logs', lazy=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
        return {
            'id': self.id,
            'student_id': self.student_id,
            'log_date': self.log_date.isoformat() if self.log_date else None,
            'study_hours': self.study_hours,
            'subjects_studied': json.loads(self.subjects_studied) if self.subjects_studied else [],
            'topics_covered': json.loads(self.topics_covered) if self.topics_covered else [],
            'quizzes_taken': self.quizzes_taken,
            'quiz_scores': json.loads(self.quiz_scores) if self.quiz_scores else [],
            'notes_taken': self.notes_taken
        }