import sys
import os
import pytest
import pandas as pd
import numpy as np

# --- PATH CONFIGURATION ---
# This ensures the 'backend' package is discoverable by the test runner
# Moving up two levels from /tests/test_backend/ to reach the project root
ROOT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if ROOT_PATH not in sys.path:
    sys.path.insert(0, ROOT_PATH)

from backend.models.performance_predictor import PerformancePredictor

@pytest.fixture(scope="module")
def predictor():
    """
    Fixture to initialize the PerformancePredictor class.
    This test verifies that the .pkl files (model and scaler) 
    in ml_models/saved_models/ are present and loadable.
    """
    try:
        return PerformancePredictor()
    except Exception as e:
        pytest.fail(f"PerformancePredictor failed to initialize. Check .pkl file paths: {str(e)}")

def test_model_prediction_output(predictor):
    """
    Tests if the model generates a valid probability score (0.0 to 1.0).
    Input data matches the feature engineering performed in your EDA notebooks.
    """
    # Sample data structured as a dictionary (mapped to your model's expected features)
    sample_student_data = {
        "prep_months": 18,
        "daily_study_hours": 8.0,
        "attempt_number": 2,
        "gs_average_pct": 72.5,
        "csat_average_pct": 78.0,
        "overall_score": 75.25,
        "weak_subjects_count": 2,
        "very_weak_subjects": 1,
        "strong_subjects_count": 4,
        "weakest_subject_score": 42.0,
        "strongest_subject_score": 88.0,
        "study_efficiency": 0.85,
        "mock_efficiency": 0.76,
        "consistency_score": 0.92,
        "improvement_needed": 0.15,
        "quick_wins_count": 3,
        "estimated_hours_needed": 450,
        "mock_tests_attempted": 30,
        "weekly_quizzes": 4,
        "avg_quiz_score": 75.0,
        "test_readiness": 0.82,
        "revision_effectiveness": 0.88,
        "weekly_study_hours": 56.0,
        "preparation_intensity": 0.85,
        "has_coaching": 1,
        "regular_quiz_taker": 1,
        "high_mock_tester": 1,
        "ncert_reader": 1,
        "standard_books_user": 1,
        "gender_encoded": 1,           # Assuming 1 for Male, 0 for Female
        "graduation_stream_encoded": 2 # Assuming 2 for Engineering
    }

    # Generate prediction
    probability = predictor.predict_probability(sample_student_data)

    # Assertions
    assert isinstance(probability, (float, np.float64)), "Prediction output should be a float"
    assert 0.0 <= probability <= 1.0, f"Probability {probability} is out of bounds (0-1)"

def test_invalid_input_handling(predictor):
    """
    Tests if the model gracefully handles missing features or invalid data types.
    """
    incomplete_data = {
        "prep_months": 12
        # Missing other required features
    }
    
    with pytest.raises(Exception):
        predictor.predict_probability(incomplete_data)