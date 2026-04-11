"""
Synthetic Data Generator for UPSC Prelims Performance Prediction
Based on Official UPSC Guidelines and Real Exam Patterns
"""

import pandas as pd
import numpy as np
import random
# Set seed for reproducibility

np.random.seed(42)
random.seed(42)

# STUDENT DEMOGRAPHICS & BACKGROUND

def generate_realistic_upsc_dataset(num_students=1000):
    """
    Generate dataset following UPSC official rules:
    - GS Paper 1: 200 marks (100 questions × 2 marks)
    - CSAT Paper 2: 200 marks (80 questions × 2.5 marks)
    - CSAT qualifying: Minimum 33% (66.67 marks)
    - Merit based on GS only after CSAT qualification
    """
    # Demographics
    student_ids = range(1, num_students + 1)
    
    ages = np.random.randint(21, 35, num_students)
    genders = np.random.choice(['Male', 'Female'], num_students, p=[0.65, 0.35])
    graduation_percentage = np.random.randint(55, 95, num_students)
    graduation_stream = np.random.choice(
        ['Arts', 'Science', 'Commerce', 'Engineering', 'Medical'],
        num_students,
        p=[0.35, 0.25, 0.15, 0.15, 0.10]
    )
    #STUDY HABITS & PREPARATION

    prep_months = np.random.randint(3, 48, num_students)
    daily_study_hours = np.round(np.random.triangular(2, 8, 14, num_students), 1)
    mock_tests_attempted = np.random.randint(0, 100, num_students)
    revision_cycles = np.random.randint(0, 10, num_students)
    
    ncert_read = np.random.choice([0, 1], num_students, p=[0.15, 0.85])
    standard_books = np.random.choice([0, 1], num_students, p=[0.20, 0.80])
    coaching = np.random.choice([0, 1], num_students, p=[0.55, 0.45])
    online_resources = np.random.choice([0, 1], num_students, p=[0.35, 0.65])
    
    attempt_number = np.random.randint(1, 7, num_students)
    previous_attempts_cleared = np.random.choice([0, 1], num_students, p=[0.92, 0.08])

    print(previous_attempts_cleared.sum(), "students have cleared a previous attempt.")

    # GS PAPER 1 SCORES (200 Marks - 8 Subjects)

    # Calculate preparation quality score (0-100 scale)

    prep_quality = (
        (daily_study_hours / 14) * 30 +
        (prep_months / 48) * 20 +
        (mock_tests_attempted / 100) * 20 +
        (revision_cycles / 10) * 15 +
        ncert_read * 5 +
        standard_books * 5 +
        coaching * 3 +
        online_resources * 2
    )
    prep_quality = np.clip(prep_quality, 0, 100)

     # Each subject weight (total should sum to 200 marks)

    subject_weights = {
        'History': 25, 'Geography': 25, 'Polity': 25, 'Economy': 25,
        'Science_Tech': 25, 'Environment': 25, 'Current_Affairs': 25, 'Art_Culture': 25
    }

    # Subject difficulty multipliers (0-1, lower means harder)
    subject_difficulty = {
        'History': 0.90, 'Geography': 0.88, 'Polity': 0.85, 'Economy': 0.82,
        'Science_Tech': 0.86, 'Environment': 0.87, 'Current_Affairs': 0.78, 'Art_Culture': 0.89
    }
    
     # Generate subject-wise scores

    gs_subject_scores = {}
    subject_scores_list = []
    
    for subject, max_marks in subject_weights.items():
        difficulty = subject_difficulty[subject]

         # Base score depends on preparation quality and subject difficulty
        base_score = (prep_quality / 100) * max_marks * difficulty

        # Add random variation to simulate real-world performance differences
        variation = np.random.normal(0, 3, num_students)
        subject_score = base_score + variation
        
        # Some students have natural aptitude in certain subjects
        aptitude_boost = np.random.choice([0, np.random.uniform(1, 5)], num_students, p=[0.8, 0.2])
        subject_score += aptitude_boost

        # Clamp to realistic range (0 to max_marks)
        subject_score = np.clip(subject_score, 0, max_marks)
        subject_score = np.round(subject_score, 1)
        
        subject_key = f'gs_{subject.lower().replace("_", "")}'
        gs_subject_scores[subject_key] = subject_score
        subject_scores_list.append(subject_score)

    # Calculate GS total by summing individual subjects (NO approximation)
    total_gs_score = np.sum(subject_scores_list, axis=0)
    # Add small exam pressure factor (-3 to +3 marks)
    exam_pressure = np.random.normal(0, 1.5, num_students)
    total_gs_score = np.clip(total_gs_score + exam_pressure, 0, 200)
    total_gs_score = np.round(total_gs_score, 1)

    # CSAT PAPER SCORES (200 Marks - 5 Components)
    # Qualifying only - need 66.67 marks minimum
    # CSAT performance correlates with graduation percentage and aptitude    
    csat_aptitude = graduation_percentage * 0.4 + prep_quality * 0.3
    csat_aptitude = np.clip(csat_aptitude, 0, 100)

    
    # CSAT component marks distribution (total = 200 marks)
    csat_component_marks = {
        'Comprehension': 50, 'Logical_Reasoning': 40, 'Quantitative': 45,
        'Data_Interpretation': 35, 'Decision_Making': 30
    }
    
    # Component difficulty multipliers (0-1, lower means harder)
    csat_difficulty = {
        'Comprehension': 0.92, 'Logical_Reasoning': 0.85, 'Quantitative': 0.70,
        'Data_Interpretation': 0.80, 'Decision_Making': 0.88
    }
    
    csat_component_scores = {}
    csat_scores_list = []
    
    for component, max_marks in csat_component_marks.items():
        difficulty = csat_difficulty[component]
            # Base score depends on aptitude and component difficulty
        base_component_score = (csat_aptitude / 100) * max_marks * difficulty
            # Add random variation to simulate real-world performance differences
        variation = np.random.normal(0, 4, num_students)
        component_score = base_component_score + variation

        # Some students struggle with Quantitative specifically
        if component == 'Quantitative':
            quantitative_struggle = np.random.choice([0, np.random.uniform(3, 12)], num_students, p=[0.65, 0.35])
            component_score -= quantitative_struggle
            
        # Clamp to realistic range
        component_score = np.clip(component_score, 0, max_marks)
        component_score = np.round(component_score, 1)
        
        comp_key = f'csat_{component.lower().replace("_", "")}'
        csat_component_scores[comp_key] = component_score
        csat_scores_list.append(component_score)

    # Calculate CSAT total by summing individual components (NO approximation)
    total_csat_score = np.sum(csat_scores_list, axis=0)

    # Add exam day factor (some students perform better/worse on the day of the exam)
    exam_day_factor = np.random.normal(0, 2, num_students)
    total_csat_score = np.clip(total_csat_score + exam_day_factor, 0, 200)
    total_csat_score = np.round(total_csat_score, 1)
    
    # ENGAGEMENT & CONSISTENCY METRICS

    weekly_quizzes = np.random.poisson(5, num_students)
    weekly_quizzes = np.clip(weekly_quizzes, 0, 20)
    avg_quiz_score = np.round(np.random.uniform(40, 95, num_students), 1)
    study_streak = np.random.negative_binomial(10, 0.3, num_students)
    study_streak = np.clip(study_streak, 0, 200)
    test_attendance = np.round(np.random.uniform(30, 100, num_students), 1)
    
    # TARGET VARIABLE: PRELIMS QUALIFICATION (1 = Cleared, 0 = Not Cleared)
    gs_cutoff = random.uniform(85, 115)
    csat_qualified = total_csat_score >= 66.67
    gs_qualified = total_gs_score >= gs_cutoff
    prelims_cleared = (csat_qualified & gs_qualified).astype(int)
    
    # CREATE FINAL DATAFRAME

    df = pd.DataFrame({
        'student_id': student_ids,
        'age': ages,
        'gender': genders,
        'graduation_percentage': graduation_percentage,
        'graduation_stream': graduation_stream,
        'prep_months': prep_months,
        'daily_study_hours': daily_study_hours,
        'mock_tests_attempted': mock_tests_attempted,
        'revision_cycles': revision_cycles,
        'attempt_number': attempt_number,
        'ncert_read': ncert_read,
        'standard_books': standard_books,
        'coaching': coaching,
        'online_resources': online_resources,
        **gs_subject_scores,
        'gs_total_score': total_gs_score,
        **csat_component_scores,
        'csat_total_score': total_csat_score,
        'csat_qualified': csat_qualified.astype(int),
        'weekly_quizzes': weekly_quizzes,
        'avg_quiz_score': avg_quiz_score,
        'study_streak_days': study_streak,
        'test_attendance_percent': test_attendance,
        'target': prelims_cleared
    })
    
    return df

def save_dataset(df, filename='upsc_prelims_data.csv'):
    """Save dataset to CSV"""
    df.to_csv(filename, index=False)
    return filename

if __name__ == "__main__":
    dataset = generate_realistic_upsc_dataset(num_students=1000)
    save_dataset(dataset, 'backend/data/raw/upsc_prelims_data.csv')
