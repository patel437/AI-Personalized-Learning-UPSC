# test_student_profile_fixed.py
import requests
import json

BASE_URL = "http://localhost:5000"
API_PREFIX = "/api/v1"

def test_complete_workflow():
    print("=" * 60)
    print("UPSC API - Complete Working Test (Fixed Schema)")
    print("=" * 60)
    
    # Step 1: Login
    print("\n1️⃣ Logging in...")
    login_response = requests.post(
        f"{BASE_URL}{API_PREFIX}/auth/login",
        json={
            "username_or_email": "newuser@example.com",
            "password": "Password123!"
        }
    )
    
    if login_response.status_code != 200:
        print("❌ Login failed")
        return
    
    token = login_response.json()['data']['access_token']
    print("✅ Login successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Get user profile
    print("\n2️⃣ Getting user profile...")
    profile_response = requests.get(
        f"{BASE_URL}{API_PREFIX}/auth/profile",
        headers=headers
    )
    
    if profile_response.status_code == 200:
        user_data = profile_response.json()['data']['user']
        print(f"✅ User: {user_data['full_name']} (ID: {user_data['id']})")
    else:
        print("❌ Could not get profile")
    
    # Step 3: Create student profile with CORRECT field names
    print("\n3️⃣ Creating student profile...")
    
    # Use actual fields from StudentProfile model
    student_profile_data = {
        "age": 25,
        "gender": "Male",
        "graduation_percentage": 75.5,
        "graduation_stream": "Arts",
        "preparation_months": 12,
        "daily_study_hours": 6.5,
        "attempt_number": 1,
        "previous_prelims_qualified": False,
        "coaching": "Vision IAS",
        "ncert_read": True,
        "standard_books": True,
        "online_resources": True,
        "target_exam_year": 2026,
        "target_exam_attempt": 1
    }
    
    print("Sending data:", json.dumps(student_profile_data, indent=2))
    
    student_response = requests.post(
        f"{BASE_URL}{API_PREFIX}/auth/student-profile",
        json=student_profile_data,
        headers=headers
    )
    
    print(f"\nStatus: {student_response.status_code}")
    if student_response.status_code in [200, 201]:
        print("✅ Student profile created successfully!")
        result = student_response.json()
        print(json.dumps(result, indent=2))
    else:
        print(f"❌ Failed: {student_response.json().get('message')}")
    
    # Step 4: Retrieve student profile
    print("\n4️⃣ Retrieving student profile...")
    get_response = requests.get(
        f"{BASE_URL}{API_PREFIX}/auth/student-profile",
        headers=headers
    )
    
    if get_response.status_code == 200:
        print("✅ Student profile retrieved:")
        profile_data = get_response.json()['data']['student_profile']
        print(json.dumps(profile_data, indent=2))
        
        # Display key information
        print("\n📊 Profile Summary:")
        print(f"  - Daily Study Hours: {profile_data.get('daily_study_hours')}")
        print(f"  - Preparation Months: {profile_data.get('preparation_months')}")
        print(f"  - Graduation: {profile_data.get('graduation_percentage')}% ({profile_data.get('graduation_stream')})")
        print(f"  - Target Exam: UPSC {profile_data.get('target_exam_year')}")
    
    # Step 5: Add subject scores (optional)
    print("\n5️⃣ Adding subject scores...")
    scores_data = {
        "history_score": 75.0,
        "geography_score": 68.5,
        "polity_score": 82.0,
        "economy_score": 71.0,
        "science_tech_score": 65.0,
        "environment_score": 70.0,
        "current_affairs_score": 78.0,
        "art_culture_score": 72.0,
        "comprehension_score": 80.0,
        "logical_reasoning_score": 75.0,
        "quantitative_score": 68.0,
        "data_interpretation_score": 72.0,
        "decision_making_score": 85.0,
    }
    
    scores_response = requests.post(
        f"{BASE_URL}{API_PREFIX}/scores",
        json=scores_data,
        headers=headers
    )
    
    if scores_response.status_code in [200, 201]:
        print("✅ Scores saved successfully!")
    else:
        print(f"Note: Scores not saved - {scores_response.json().get('message', 'No scores endpoint')}")

if __name__ == "__main__":
    test_complete_workflow()