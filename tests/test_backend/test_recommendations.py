import pytest
import pandas as pd
from datetime import datetime
from backend.models.recommendation_engine import UPSCRecommendationEngine

@pytest.fixture
def engine():
    """Fixture to initialize the recommendation engine without requiring actual ML models"""
    return UPSCRecommendationEngine(model_path=None, scaler_path=None)

@pytest.fixture
def weak_student_data():
    """Fixture for a student with significant weaknesses in core subjects"""
    return {
        'student_id': 101,
        'gs_history': 30,      # High priority weakness (<40)
        'gs_economy': 45,      # Medium priority weakness (<55)
        'gs_polity': 80,       # Strong area
        'daily_study_hours': 6,
        'mock_tests_attempted': 10
    }

@pytest.fixture
def strong_student_data():
    """Fixture for a student with high scores across all areas"""
    return {
        'student_id': 102,
        'gs_history': 85,
        'gs_economy': 90,
        'gs_polity': 88,
        'daily_study_hours': 4,
        'mock_tests_attempted': 50
    }

class TestRecommendationEngineLogic:
    """Comprehensive tests for all methods in UPSCRecommendationEngine"""

    def test_resource_initialization(self, engine):
        """Verify that the resource database is correctly loaded for all subjects"""
        resources = engine.resource_database
        assert 'History' in resources
        assert 'Geography' in resources
        assert len(resources['History']['books']) > 0
        assert 'CSAT' in resources

    def test_identify_weaknesses_severity(self, engine, weak_student_data):
        """Verify correct severity classification (High/Medium/Low) based on scores"""
        # Convert to DataFrame as the engine expects
        df = pd.DataFrame([weak_student_data])
        weaknesses = engine.identify_weaknesses(df)
        
        # History (30) should be High severity
        assert weaknesses['History']['severity'] == 'High'
        # Economy (45) should be Medium severity
        assert weaknesses['Economy']['severity'] == 'Medium'
        # Polity (80) should NOT be in weaknesses
        assert 'Polity' not in weaknesses

    def test_calculate_study_hours_distribution(self, engine):
        """Verify that available hours are distributed based on priority"""
        weaknesses = {
            'History': {'priority': 1}, # Higher priority gets more hours
            'Economy': {'priority': 2}
        }
        hours = engine.calculate_study_hours(weaknesses, available_hours=6)
        
        assert hours['History'] > hours['Economy']
        assert sum(hours.values()) <= 6.1 # Allow for small rounding

    def test_get_subject_strategy(self, engine):
        """Verify that strategies are context-aware for different severities"""
        high_strategy = engine.get_subject_strategy('History', 'High')
        low_strategy = engine.get_subject_strategy('History', 'Low')
        
        assert "NCERT" in high_strategy # High severity focuses on basics
        assert "Advanced" in low_strategy or "mock tests" in low_strategy

    def test_resource_filtering_by_severity(self, engine):
        """Ensure the engine suggests 'Easy' resources for 'High' severity weaknesses"""
        resources = engine.get_resources_for_subject('History', 'High', limit=2)
        
        # Check if at least one resource is 'Easy' or 'Foundation'
        difficulties = [r.get('difficulty') for r in resources]
        assert 'Easy' in difficulties or 'Foundation' in [r.get('type') for r in resources]

    def test_full_7_day_study_plan(self, engine, weak_student_data):
        """Verify the creation of a complete weekly study plan including revision"""
        df = pd.DataFrame([weak_student_data])
        weaknesses = engine.identify_weaknesses(df)
        hours = engine.calculate_study_hours(weaknesses)
        
        plan = engine.create_study_plan(weaknesses, hours)
        
        assert len(plan) == 7
        assert 'Sunday' in plan
        assert "Revision" in plan['Sunday']['primary_focus']

    def test_improvement_prediction_logic(self, engine, weak_student_data):
        """Verify that improvement predictions are numerically sound"""
        df = pd.DataFrame([weak_student_data])
        recommendations = {'study_plan': {'Mon': {'recommended_hours': 5}}}
        
        prediction = engine.predict_improvement(df, recommendations)
        
        assert 'current_score' in prediction
        assert 'predicted_score' in prediction
        assert prediction['predicted_score'] >= prediction['current_score']

    def test_motivation_message_generation(self, engine):
        """Test that motivational messages change based on the number of weak areas"""
        msg_none = engine.generate_motivation_message({}, {})
        msg_many = engine.generate_motivation_message({'H': {}, 'E': {}, 'P': {}, 'G': {}, 'S': {}}, {})
        
        assert "Excellent" in msg_none
        assert "one subject at a time" in msg_many or "topper" in msg_many

    def test_get_full_recommendations_wrapper(self, engine, weak_student_data):
        """Test the master method that compiles all recommendation components"""
        df = pd.DataFrame([weak_student_data])
        full_rec = engine.get_full_recommendations(df, daily_study_hours=6)
        
        assert 'student_id' in full_rec
        assert 'study_plan' in full_rec
        assert 'recommended_resources' in full_rec
        assert 'motivation_message' in full_rec