import pytest
import pandas as pd
import numpy as np
from backend.models.ml_models import UPSCPerformancePredictor
from backend.models.performance_predictor import PerformancePredictor
from backend.models.recommendation_engine import UPSCRecommendationEngine

@pytest.fixture
def sample_student_data():
    """Fixture to provide dummy student performance data for testing"""
    return {
        'history_score': 40,
        'geography_score': 35,
        'polity_score': 75,
        'economy_score': 30,
        'science_tech_score': 60,
        'environment_score': 55,
        'current_affairs_score': 65,
        'art_culture_score': 45,
        'comprehension_score': 70,
        'logical_reasoning_score': 65,
        'quantitative_score': 40,
        'data_interpretation_score': 50,
        'decision_making_score': 60,
        'daily_study_hours': 6,
        'mock_tests_attempted': 20,
        'study_consistency': 80,
        'preparation_months': 8
    }

class TestUPSCPerformancePredictor:
    """Tests for the ML training and evaluation class"""
    
    def test_predictor_initialization(self):
        """Verify that all classification models are initialized correctly"""
        predictor = UPSCPerformancePredictor()
        assert 'Random Forest' in predictor.models
        assert 'Gradient Boosting' in predictor.models
        assert predictor.best_model is None

    def test_data_preparation(self):
        """Test the feature separation and numeric filtering logic"""
        predictor = UPSCPerformancePredictor()
        df = pd.DataFrame({
            'student_id': [1, 2],
            'target': [1, 0],
            'score': [80, 50],
            'category': ['A', 'B']  # Should be filtered out as non-numeric
        })
        X_train, X_test, y_train, y_test, features = predictor.prepare_data(df, target_col='target')
        
        assert 'score' in features
        assert 'category' not in features
        assert 'student_id' not in features
        assert len(X_train) + len(X_test) == 2

class TestPerformancePredictor:
    """Tests for the real-time scoring and trend prediction class"""

    def test_calculate_gs_prediction(self):
        """Verify GS score calculation logic and constraints"""
        predictor = PerformancePredictor()
        # Test parameters: avg_gs=50, hours=6, tests=20, consistency=80, prep=10
        score = predictor._calculate_gs_prediction(50, 6, 20, 80, 10)
        
        assert 100 <= score <= 200  # Base (100) + factors
        assert isinstance(score, float)

    def test_readiness_score_calculation(self, sample_student_data):
        """Test the weighted readiness score and categorization"""
        predictor = PerformancePredictor()
        readiness = predictor.get_readiness_score(sample_student_data)
        
        assert 'readiness_score' in readiness
        assert 'category' in readiness
        assert 'breakdown' in readiness
        assert 0 <= readiness['readiness_score'] <= 100

    def test_mock_test_trend_logic(self):
        """Test linear regression trend analysis for mock tests"""
        predictor = PerformancePredictor()
        past_scores = [100, 105, 110, 115, 120]
        trend = predictor.predict_mock_test_trend(past_scores)
        
        assert trend['trend'] == 'improving'
        assert len(trend['next_5_predictions']) == 5
        assert trend['next_5_predictions'][0] > 120

class TestRecommendationEngine:
    """Tests for the personalized recommendation and study plan logic"""

    def test_weakness_identification(self, sample_student_data):
        """Verify identification of subjects with low scores"""
        engine = UPSCRecommendationEngine(model_path=None, scaler_path=None)
        # Convert dict to DataFrame as required by the engine
        df = pd.DataFrame([sample_student_data])
        weaknesses = engine.identify_weaknesses(df)
        
        # Economy is 30, should be identified as 'High' severity weakness
        assert 'Economy' in weaknesses
        assert weaknesses['Economy']['severity'] == 'High'

    def test_study_plan_generation(self, sample_student_data):
        """Verify that the engine generates a 7-day study plan"""
        engine = UPSCRecommendationEngine(model_path=None, scaler_path=None)
        df = pd.DataFrame([sample_student_data])
        weaknesses = engine.identify_weaknesses(df)
        hours = engine.calculate_study_hours(weaknesses, available_hours=6)
        
        plan = engine.create_study_plan(weaknesses, hours)
        
        assert len(plan) == 7
        assert 'Monday' in plan
        assert 'primary_focus' in plan['Monday']
        assert 'strategy' in plan['Monday']

    def test_motivation_message_logic(self):
        """Test the logic for generating dynamic motivational text"""
        engine = UPSCRecommendationEngine(model_path=None, scaler_path=None)
        weaknesses = {'History': {}, 'Economy': {}, 'Geography': {}}
        prediction = {'estimated_improvement': 15, 'weeks_needed': 4}
        
        message = engine.generate_motivation_message(weaknesses, prediction)
        assert "3 areas" in message or "identified" in message
        assert "15%" in message