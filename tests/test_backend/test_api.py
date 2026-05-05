import requests
import pytest

# Configuration based on your root .env
BASE_URL = "http://localhost:5000"
API_PREFIX = "/api/v1"

@pytest.fixture(scope="module")
def auth_headers():
    """
    Fixture to handle test user registration and login.
    Returns headers with a valid JWT token[cite: 1].
    """
    test_user = {
        "username": "api_test_user",
        "email": "api_test@example.com",
        "password": "TestPassword123!",
        "full_name": "API Integration Tester"
    }
    
    # Attempt to register (ignores 409 if user already exists)[cite: 1]
    requests.post(f"{BASE_URL}{API_PREFIX}/auth/register", json=test_user)
    
    # Login to get the access token[cite: 1]
    login_data = {
        "username_or_email": test_user["email"],
        "password": test_user["password"]
    }
    response = requests.post(f"{BASE_URL}{API_PREFIX}/auth/login", json=login_data)
    
    if response.status_code == 200:
        token = response.json()['data']['access_token']
        return {"Authorization": f"Bearer {token}"}
    else:
        pytest.fail("Failed to login and obtain test token.")

def test_profile_retrieval(auth_headers):
    """Verifies the /auth/profile endpoint returns the correct user data[cite: 1]."""
    response = requests.get(f"{BASE_URL}{API_PREFIX}/auth/profile", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()['success'] is True
    assert "user" in response.json()['data']

def test_create_student_profile(auth_headers):
    """
    Tests creating a student profile with correct field validation.
    Enforces 'Male' capitalization discovered in previous fixes[cite: 1].
    """
    student_data = {
        "age": 24,
        "gender": "Male",  # Fixed: Must be capitalized[cite: 1]
        "graduation_percentage": 78.5,
        "graduation_stream": "Engineering",
        "preparation_months": 15,
        "daily_study_hours": 7.5,
        "attempt_number": 1,
        "previous_prelims_qualified": False,
        "coaching": "Abhivyakti IAS",
        "ncert_read": True,
        "standard_books": True,
        "online_resources": True,
        "target_exam_year": 2026,
        "target_exam_attempt": 1
    }
    
    response = requests.post(
        f"{BASE_URL}{API_PREFIX}/auth/student-profile", 
        json=student_data, 
        headers=auth_headers
    )
    # 200 if update, 201 if created[cite: 1]
    assert response.status_code in [200, 201]
    assert response.json()['success'] is True

def test_submit_subject_scores(auth_headers):
    """
    Tests score submission.
    Note: 'exam_date' is excluded as the backend handles this automatically[cite: 1].
    """
    scores_data = {
        "history_score": 82.0,
        "geography_score": 75.5,
        "polity_score": 88.0,
        "economy_score": 70.0,
        "science_tech_score": 68.0,
        "environment_score": 72.0,
        "current_affairs_score": 90.0,
        "art_culture_score": 65.0,
        "comprehension_score": 85.0,
        "logical_reasoning_score": 80.0,
        "quantitative_score": 75.0,
        "data_interpretation_score": 77.0,
        "decision_making_score": 95.0
    }
    
    response = requests.post(
        f"{BASE_URL}{API_PREFIX}/scores", 
        json=scores_data, 
        headers=auth_headers
    )
    assert response.status_code in [200, 201]
    assert response.json()['success'] is True