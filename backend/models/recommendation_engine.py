import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import joblib

class UPSCRecommendationEngine:
    """
    Recommendation engine for UPSC Prelims aspirants
    Provides personalized study recommendations based on ML predictions
    """
    
    def __init__(self, model_path='ml_models/saved_models/best_upsc_model.pkl',
                 scaler_path='ml_models/saved_models/scaler.pkl'):
        """
        Initialize recommendation engine with trained model
        
        Args:
            model_path: Path to trained ML model
            scaler_path: Path to fitted scaler
        """
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            print("✅ Model and scaler loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load models: {e}")
            self.model = None
            self.scaler = None
        
        # Subject list for UPSC Prelims GS Paper 1
        self.gs_subjects = [
            'History', 'Geography', 'Polity', 'Economy',
            'Science_Technology', 'Environment', 'Current_Affairs', 'Art_Culture'
        ]
        
        # CSAT subjects
        self.csat_subjects = [
            'Comprehension', 'Logical_Reasoning', 'Quantitative_Aptitude',
            'Data_Interpretation', 'Decision_Making'
        ]
        
        # Initialize resource database
        self.resource_database = self._initialize_resources()
        
        # Difficulty levels
        self.difficulty_levels = ['Easy', 'Medium', 'Hard']
        
        # Learning language preference
        self.learning_upsc_py_language = "study efforts"
        
    def _initialize_resources(self) -> Dict:
        """
        Initialize comprehensive resource database for UPSC preparation
        
        Returns:
            Dictionary containing all study resources categorized by subject and topic
        """
        resources = {
            # History Resources
            'History': {
                'books': [
                    {'title': 'NCERT History (Class 6-12)', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'},
                    {'title': 'India\'s Ancient Past', 'author': 'R.S. Sharma', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'History of Medieval India', 'author': 'Satish Chandra', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'Modern India', 'author': 'Bipan Chandra', 'difficulty': 'Hard', 'type': 'Advanced'},
                    {'title': 'A Brief History of Modern India', 'author': 'Spectrum', 'difficulty': 'Medium', 'type': 'Standard'}
                ],
                'videos': [
                    {'title': 'Crash Course History Series', 'platform': 'YouTube', 'duration': '20 hrs', 'difficulty': 'Easy'},
                    {'title': 'History Optional Lectures', 'platform': 'Unacademy', 'duration': '40 hrs', 'difficulty': 'Medium'},
                    {'title': 'Modern History Marathon', 'platform': 'StudyIQ', 'duration': '15 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'History PYQs (1995-2024)', 'questions': 500, 'difficulty': 'Mixed'},
                    {'title': 'Topic-wise History MCQs', 'questions': 1000, 'difficulty': 'Medium'},
                    {'title': 'History Rapid Fire Quiz', 'questions': 200, 'difficulty': 'Easy'}
                ],
                'notes': [
                    {'title': 'Spectrum Summary Notes', 'pages': 150, 'difficulty': 'Easy'},
                    {'title': 'Art and Culture Notes', 'pages': 80, 'difficulty': 'Medium'}
                ]
            },
            
            # Geography Resources
            'Geography': {
                'books': [
                    {'title': 'NCERT Geography (Class 6-12)', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'},
                    {'title': 'Certificate Physical Geography', 'author': 'G.C. Leong', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'Indian Geography', 'author': 'Majid Husain', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'World Geography', 'author': 'Majid Husain', 'difficulty': 'Hard', 'type': 'Advanced'}
                ],
                'videos': [
                    {'title': 'Geography Mapping Series', 'platform': 'YouTube', 'duration': '25 hrs', 'difficulty': 'Easy'},
                    {'title': 'Physical Geography Lectures', 'platform': 'Vision IAS', 'duration': '30 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Geography PYQs', 'questions': 400, 'difficulty': 'Mixed'},
                    {'title': 'Map Based Questions', 'questions': 300, 'difficulty': 'Medium'},
                    {'title': 'World Geography MCQs', 'questions': 600, 'difficulty': 'Hard'}
                ],
                'notes': [
                    {'title': 'GC Leong Summary', 'pages': 120, 'difficulty': 'Medium'},
                    {'title': 'India Mapping Notes', 'pages': 60, 'difficulty': 'Easy'}
                ]
            },
            
            # Polity Resources
            'Polity': {
                'books': [
                    {'title': 'Indian Polity', 'author': 'M. Laxmikanth', 'difficulty': 'Hard', 'type': 'Standard'},
                    {'title': 'NCERT Political Science', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'},
                    {'title': 'Introduction to Constitution', 'author': 'D.D. Basu', 'difficulty': 'Hard', 'type': 'Advanced'}
                ],
                'videos': [
                    {'title': 'Polity Foundation Series', 'platform': 'YouTube', 'duration': '35 hrs', 'difficulty': 'Easy'},
                    {'title': 'Constitution Articles Explained', 'platform': 'Unacademy', 'duration': '20 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Polity PYQs', 'questions': 450, 'difficulty': 'Mixed'},
                    {'title': 'Constitution based MCQs', 'questions': 800, 'difficulty': 'Medium'},
                    {'title': 'Governance Questions', 'questions': 300, 'difficulty': 'Hard'}
                ],
                'notes': [
                    {'title': 'Laxmikanth Short Notes', 'pages': 200, 'difficulty': 'Hard'},
                    {'title': 'Article-wise Summary', 'pages': 100, 'difficulty': 'Medium'}
                ]
            },
            
            # Economy Resources
            'Economy': {
                'books': [
                    {'title': 'Indian Economy', 'author': 'Ramesh Singh', 'difficulty': 'Hard', 'type': 'Standard'},
                    {'title': 'Economic Survey Summary', 'author': 'Government of India', 'difficulty': 'Medium', 'type': 'Current'},
                    {'title': 'NCERT Economics', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'}
                ],
                'videos': [
                    {'title': 'Economy Basics Series', 'platform': 'YouTube', 'duration': '30 hrs', 'difficulty': 'Easy'},
                    {'title': 'Budget Analysis', 'platform': 'Various', 'duration': '10 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Economy PYQs', 'questions': 350, 'difficulty': 'Mixed'},
                    {'title': 'Budget Based Questions', 'questions': 200, 'difficulty': 'Hard'},
                    {'title': 'Economic Survey MCQs', 'questions': 400, 'difficulty': 'Medium'}
                ],
                'notes': [
                    {'title': 'Ramesh Singh Summary', 'pages': 180, 'difficulty': 'Hard'},
                    {'title': 'Economic Survey Highlights', 'pages': 80, 'difficulty': 'Medium'}
                ]
            },
            
            # Science & Technology Resources
            'Science_Technology': {
                'books': [
                    {'title': 'Science and Technology', 'author': 'Ravi P. Agrahari', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'NCERT Science', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'}
                ],
                'videos': [
                    {'title': 'Science & Tech Current Affairs', 'platform': 'YouTube', 'duration': '15 hrs', 'difficulty': 'Medium'},
                    {'title': 'Space Technology Series', 'platform': 'ISRO', 'duration': '10 hrs', 'difficulty': 'Hard'}
                ],
                'practice': [
                    {'title': 'Science PYQs', 'questions': 300, 'difficulty': 'Mixed'},
                    {'title': 'Tech Based MCQs', 'questions': 400, 'difficulty': 'Medium'}
                ],
                'notes': [
                    {'title': 'Science & Tech Notes', 'pages': 120, 'difficulty': 'Medium'},
                    {'title': 'Latest Tech Updates', 'pages': 50, 'difficulty': 'Easy'}
                ]
            },
            
            # Environment Resources
            'Environment': {
                'books': [
                    {'title': 'Environment and Ecology', 'author': 'Shankar IAS', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'NCERT Biology (Ecology section)', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'}
                ],
                'videos': [
                    {'title': 'Environment Series', 'platform': 'YouTube', 'duration': '20 hrs', 'difficulty': 'Easy'},
                    {'title': 'Biodiversity Lectures', 'platform': 'Unacademy', 'duration': '15 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Environment PYQs', 'questions': 250, 'difficulty': 'Mixed'},
                    {'title': 'Ecology MCQs', 'questions': 500, 'difficulty': 'Medium'}
                ],
                'notes': [
                    {'title': 'Shankar IAS Notes', 'pages': 150, 'difficulty': 'Medium'},
                    {'title': 'Environment Conventions', 'pages': 60, 'difficulty': 'Easy'}
                ]
            },
            
            # Current Affairs Resources
            'Current_Affairs': {
                'books': [
                    {'title': 'Monthly Current Affairs Magazine', 'author': 'Various', 'difficulty': 'Medium', 'type': 'Periodical'},
                    {'title': 'Yearly Compilation', 'author': 'Vision IAS', 'difficulty': 'Medium', 'type': 'Compilation'}
                ],
                'videos': [
                    {'title': 'Daily News Analysis', 'platform': 'YouTube', 'duration': '1 hr/day', 'difficulty': 'Easy'},
                    {'title': 'Weekly Current Affairs', 'platform': 'Various', 'duration': '2 hrs/week', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Current Affairs Quizzes', 'questions': 1000, 'difficulty': 'Mixed'},
                    {'title': 'Monthly MCQ Tests', 'questions': 300, 'difficulty': 'Medium'}  # Fixed: removed /month
                ],
                'notes': [
                    {'title': 'Current Affairs Summary', 'pages': 'Monthly', 'difficulty': 'Easy'},
                    {'title': 'Important Committees/Reports', 'pages': 80, 'difficulty': 'Medium'}
                ]
            },
            
            # Art & Culture Resources
            'Art_Culture': {
                'books': [
                    {'title': 'Indian Art and Culture', 'author': 'Nitin Singhania', 'difficulty': 'Medium', 'type': 'Standard'},
                    {'title': 'NCERT Fine Arts', 'author': 'NCERT', 'difficulty': 'Easy', 'type': 'Foundation'}
                ],
                'videos': [
                    {'title': 'Art & Culture Series', 'platform': 'YouTube', 'duration': '25 hrs', 'difficulty': 'Easy'},
                    {'title': 'Indian Architecture Lectures', 'platform': 'Unacademy', 'duration': '15 hrs', 'difficulty': 'Medium'}
                ],
                'practice': [
                    {'title': 'Art & Culture PYQs', 'questions': 200, 'difficulty': 'Mixed'},
                    {'title': 'Monuments Based MCQs', 'questions': 300, 'difficulty': 'Medium'}
                ],
                'notes': [
                    {'title': 'Nitin Singhania Notes', 'pages': 180, 'difficulty': 'Medium'},
                    {'title': 'Dance Forms Summary', 'pages': 40, 'difficulty': 'Easy'}
                ]
            },
            
            # CSAT Resources
            'CSAT': {
                'Comprehension': {
                    'books': [
                        {'title': 'CSAT Comprehension Workbook', 'author': 'TMH', 'difficulty': 'Easy', 'type': 'Practice'},
                        {'title': 'Reading Comprehension Passages', 'author': 'Arihant', 'difficulty': 'Medium', 'type': 'Standard'}
                    ],
                    'practice': [
                        {'title': 'RC Passages Practice', 'questions': 500, 'difficulty': 'Mixed'},
                        {'title': 'Speed Reading Exercises', 'questions': 200, 'difficulty': 'Easy'}
                    ]
                },
                'Logical_Reasoning': {
                    'books': [
                        {'title': 'Logical Reasoning for CSAT', 'author': 'R.S. Aggarwal', 'difficulty': 'Medium', 'type': 'Standard'},
                        {'title': 'Analytical Reasoning', 'author': 'M.K. Pandey', 'difficulty': 'Hard', 'type': 'Advanced'}
                    ],
                    'practice': [
                        {'title': 'LR Practice Sets', 'questions': 800, 'difficulty': 'Mixed'},
                        {'title': 'Puzzles and Syllogisms', 'questions': 400, 'difficulty': 'Medium'}
                    ]
                },
                'Quantitative_Aptitude': {
                    'books': [
                        {'title': 'Quantitative Aptitude', 'author': 'R.S. Aggarwal', 'difficulty': 'Medium', 'type': 'Standard'},
                        {'title': 'Fast Track Mathematics', 'author': 'Rajesh Verma', 'difficulty': 'Hard', 'type': 'Advanced'}
                    ],
                    'videos': [
                        {'title': 'QA Basics Series', 'platform': 'YouTube', 'duration': '30 hrs', 'difficulty': 'Easy'},
                        {'title': 'Data Interpretation Tricks', 'platform': 'Unacademy', 'duration': '15 hrs', 'difficulty': 'Medium'}
                    ],
                    'practice': [
                        {'title': 'QA Practice Sets', 'questions': 1000, 'difficulty': 'Mixed'},
                        {'title': 'DI Questions', 'questions': 400, 'difficulty': 'Medium'}
                    ]
                },
                'Data_Interpretation': {
                    'books': [
                        {'title': 'Data Interpretation', 'author': 'Arun Sharma', 'difficulty': 'Medium', 'type': 'Standard'}
                    ],
                    'practice': [
                        {'title': 'DI Practice Sets', 'questions': 500, 'difficulty': 'Mixed'},
                        {'title': 'Graph Based Questions', 'questions': 300, 'difficulty': 'Medium'}
                    ]
                },
                'Decision_Making': {
                    'books': [
                        {'title': 'Decision Making for CSAT', 'author': 'UPSC Guide', 'difficulty': 'Easy', 'type': 'Practice'}
                    ],
                    'practice': [
                        {'title': 'Situation Based Questions', 'questions': 400, 'difficulty': 'Medium'},
                        {'title': 'Ethical Dilemmas', 'questions': 200, 'difficulty': 'Hard'}
                    ]
                }
            }
        }
        
        return resources
    
    def identify_weaknesses(self, student_data: pd.DataFrame) -> Dict:
        """
        Identify weak areas of a student based on their scores
        
        Args:
            student_data: DataFrame containing student's scores and metrics
            
        Returns:
            Dictionary with identified weaknesses
        """
        weaknesses = {}
        
        # Check GS subjects
        for subject in self.gs_subjects:
            # Try different possible column names
            col_variations = [
                f'gs_{subject.lower()}',
                f'gs_{subject.lower()}_score',
                f'{subject.lower()}_score',
                f'gs_{subject.lower()}_pct'
            ]
            
            score = None
            for col in col_variations:
                if col in student_data.columns:
                    score = student_data[col].values[0] if hasattr(student_data[col], 'values') else student_data[col]
                    break
            
            if score is not None:
                if score < 40:
                    weaknesses[subject] = {'score': score, 'severity': 'High', 'priority': 1}
                elif score < 55:
                    weaknesses[subject] = {'score': score, 'severity': 'Medium', 'priority': 2}
                elif score < 70:
                    weaknesses[subject] = {'score': score, 'severity': 'Low', 'priority': 3}
        
        # Check CSAT subjects
        for subject in self.csat_subjects:
            col_variations = [
                f'csat_{subject.lower()}',
                f'csat_{subject.lower()}_score',
                f'{subject.lower()}_score'
            ]
            
            score = None
            for col in col_variations:
                if col in student_data.columns:
                    score = student_data[col].values[0] if hasattr(student_data[col], 'values') else student_data[col]
                    break
            
            if score is not None:
                if score < 40:
                    weaknesses[f'CSAT_{subject}'] = {'score': score, 'severity': 'High', 'priority': 1}
                elif score < 55:
                    weaknesses[f'CSAT_{subject}'] = {'score': score, 'severity': 'Medium', 'priority': 2}
        
        # Sort by priority (severity)
        weaknesses = dict(sorted(weaknesses.items(), key=lambda x: x[1]['priority']))
        
        return weaknesses
    
    def calculate_study_hours(self, weaknesses: Dict, available_hours: float = 6) -> Dict:
        """
        Calculate recommended study hours per subject based on weaknesses
        
        Args:
            weaknesses: Dictionary of identified weaknesses
            available_hours: Total daily study hours available
            
        Returns:
            Dictionary with recommended hours per subject
        """
        if not weaknesses:
            return {}
        
        total_priority = sum(1 / (w['priority'] + 1) for w in weaknesses.values())
        
        recommended_hours = {}
        for subject, weakness in weaknesses.items():
            # More hours for higher priority (lower priority number)
            weight = 1 / (weakness['priority'] + 1)
            hours = (weight / total_priority) * available_hours
            recommended_hours[subject] = round(hours, 1)
        
        return recommended_hours
    
    def get_subject_strategy(self, subject: str, severity: str) -> str:
        """
        Get subject-specific study strategy based on severity
        
        Args:
            subject: Subject name
            severity: High, Medium, or Low
            
        Returns:
            Strategy string
        """
        strategies = {
            'History': {
                'High': 'Start with NCERTs (Class 6-12). Create timeline charts. Focus on important dynasties and events. Practice previous year questions daily.',
                'Medium': 'Revise standard books (Spectrum/RS Sharma). Make short notes. Take weekly tests. Focus on Art & Culture portion.',
                'Low': 'Advanced topics and interlinkages. Practice mock tests. Focus on current affairs related to history.'
            },
            'Geography': {
                'High': 'Complete NCERTs first. Use atlas for map work. Focus on physical geography basics. Practice map-based questions.',
                'Medium': 'Study GC Leong thoroughly. Make climate and vegetation notes. Practice world mapping.',
                'Low': 'Indian geography in depth. Economic geography. Advanced mapping exercises.'
            },
            'Polity': {
                'High': 'Read Laxmikanth basic chapters. Focus on Parts 3,4,5 of Constitution. Make article-wise notes.',
                'Medium': 'Governance and Social Justice topics. Practice PYQs. Current affairs linkage.',
                'Low': 'Advanced constitutional provisions. Comparison with other countries. Judiciary topics.'
            },
            'Economy': {
                'High': 'Start with NCERT Economics. Understand basic concepts (GDP, Inflation, etc.). Read Economic Survey summary.',
                'Medium': 'Ramesh Singh book. Budget basics. Practice numerical questions.',
                'Low': 'Advanced topics like international economics. Read Economic Survey thoroughly.'
            },
            'Science_Technology': {
                'High': 'NCERT Science (Class 6-10). Focus on basic concepts. Daily science current affairs.',
                'Medium': 'Space and Defence technology. Biotechnology basics. Practice PYQs.',
                'Low': 'Advanced technologies (AI, Blockchain, Quantum). Latest developments.'
            },
            'Environment': {
                'High': 'NCERT Biology ecology chapters. Basic environmental concepts. National Parks mapping.',
                'Medium': 'Shankar IAS book. International conventions. Biodiversity topics.',
                'Low': 'Climate change mechanisms. Environmental impact assessment. Advanced ecology.'
            },
            'Current_Affairs': {
                'High': 'Daily newspaper reading (The Hindu/Indian Express). Make monthly compilations.',
                'Medium': 'Focus on government schemes. International relations. Weekly quizzes.',
                'Low': 'Analysis and interlinkages. Editorial reading. Advanced current affairs.'
            },
            'Art_Culture': {
                'High': 'NCERT Fine Arts. Basic architecture and dance forms. Make pictorial notes.',
                'Medium': 'Nitin Singhania book. Focus on important monuments. Literature and philosophy.',
                'Low': 'Detailed study of all art forms. Interlinking with history.'
            }
        }
        
        # Handle CSAT subjects
        if subject.startswith('CSAT_'):
            csat_subject = subject.replace('CSAT_', '')
            return f"Focus on {csat_subject} basics. Daily practice of 20-30 questions. Time management is key."
        
        return strategies.get(subject, {}).get(severity, 'Regular study with focus on weak areas. Practice tests regularly.')
    
    def get_resources_for_subject(self, subject: str, severity: str, limit: int = 5) -> List[Dict]:
        """
        Get recommended resources for a subject based on severity
        
        Args:
            subject: Subject name
            severity: High, Medium, or Low
            limit: Maximum number of resources to return
            
        Returns:
            List of resource dictionaries
        """
        resources = []
        
        # Handle CSAT subjects separately
        if subject.startswith('CSAT_'):
            csat_subject = subject.replace('CSAT_', '')
            if 'CSAT' in self.resource_database and csat_subject in self.resource_database['CSAT']:
                subject_resources = self.resource_database['CSAT'][csat_subject]
                for category, items in subject_resources.items():
                    for item in items[:2]:  # Take top 2 from each category
                        item_copy = item.copy()
                        item_copy['category'] = category
                        item_copy['subject'] = subject
                        resources.append(item_copy)
        else:
            # Handle GS subjects
            if subject in self.resource_database:
                subject_resources = self.resource_database[subject]
                
                # Add resources based on severity
                if severity == 'High':
                    # For high severity, start with easy/foundation resources
                    if 'books' in subject_resources:
                        for book in subject_resources['books']:
                            if book.get('difficulty') == 'Easy' or book.get('type') == 'Foundation':
                                book_copy = book.copy()
                                book_copy['type'] = 'book'
                                book_copy['subject'] = subject
                                resources.append(book_copy)
                    
                    if 'videos' in subject_resources:
                        for video in subject_resources['videos'][:2]:
                            video_copy = video.copy()
                            video_copy['type'] = 'video'
                            video_copy['subject'] = subject
                            resources.append(video_copy)
                            
                elif severity == 'Medium':
                    # For medium severity, focus on standard resources
                    if 'books' in subject_resources:
                        for book in subject_resources['books']:
                            if book.get('difficulty') == 'Medium' or book.get('type') == 'Standard':
                                book_copy = book.copy()
                                book_copy['type'] = 'book'
                                book_copy['subject'] = subject
                                resources.append(book_copy)
                    
                    if 'practice' in subject_resources:
                        for practice in subject_resources['practice'][:2]:
                            practice_copy = practice.copy()
                            practice_copy['type'] = 'practice'
                            practice_copy['subject'] = subject
                            resources.append(practice_copy)
                            
                else:  # Low severity
                    # For low severity, focus on advanced and practice resources
                    if 'books' in subject_resources:
                        for book in subject_resources['books']:
                            if book.get('difficulty') == 'Hard' or book.get('type') == 'Advanced':
                                book_copy = book.copy()
                                book_copy['type'] = 'book'
                                book_copy['subject'] = subject
                                resources.append(book_copy)
                    
                    if 'practice' in subject_resources:
                        for practice in subject_resources['practice'][:3]:
                            practice_copy = practice.copy()
                            practice_copy['type'] = 'practice'
                            practice_copy['subject'] = subject
                            resources.append(practice_copy)
                
                # Add notes for all severity levels
                if 'notes' in subject_resources and len(resources) < limit:
                    for note in subject_resources['notes'][:2]:
                        note_copy = note.copy()
                        note_copy['type'] = 'notes'
                        note_copy['subject'] = subject
                        resources.append(note_copy)
        
        return resources[:limit]
    
    def create_study_plan(self, weaknesses: Dict, recommended_hours: Dict, 
                          start_date: datetime = None) -> Dict:
        """
        Create a personalized weekly study plan
        
        Args:
            weaknesses: Dictionary of identified weaknesses
            recommended_hours: Recommended hours per subject
            start_date: Starting date for the plan
            
        Returns:
            Weekly study plan dictionary
        """
        if start_date is None:
            start_date = datetime.now()
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        study_plan = {}
        
        # Sort subjects by priority (highest first)
        sorted_subjects = sorted(weaknesses.items(), key=lambda x: x[1]['priority'])
        
        # Distribute subjects across week
        for i, day in enumerate(days):
            if i < len(sorted_subjects):
                subject, weakness = sorted_subjects[i]
                study_plan[day] = {
                    'primary_focus': subject,
                    'severity': weakness['severity'],
                    'recommended_hours': recommended_hours.get(subject, 2),
                    'strategy': self.get_subject_strategy(subject, weakness['severity']),
                    'resources': self.get_resources_for_subject(subject, weakness['severity'], limit=3)
                }
            else:
                # Revision day
                study_plan[day] = {
                    'primary_focus': 'Revision & Mock Test',
                    'severity': 'Medium',
                    'recommended_hours': 4,
                    'strategy': 'Take a full-length mock test. Revise all subjects. Analyze mistakes.',
                    'resources': [
                        {'title': 'Full Length Mock Test', 'type': 'practice', 'subject': 'All Subjects'},
                        {'title': 'Mistake Log Book', 'type': 'notes', 'subject': 'All Subjects'}
                    ]
                }
        
        return study_plan
    
    def predict_improvement(self, student_data: pd.DataFrame, 
                           recommendations: Dict) -> Dict:
        """
        Predict potential improvement after following recommendations
        
        Args:
            student_data: Student's current data
            recommendations: Generated recommendations
            
        Returns:
            Improvement prediction dictionary
        """
        # Get current overall score
        if 'overall_score' in student_data.columns:
            current_score = student_data['overall_score'].values[0]
        elif 'gs_average_pct' in student_data.columns:
            current_score = student_data['gs_average_pct'].values[0]
        else:
            current_score = 50  # default
        
        # Calculate total recommended hours per week
        total_hours = sum(rec.get('recommended_hours', 0) for rec in recommendations.get('study_plan', {}).values())
        
        # Improvement estimation (1% improvement per 20 study hours)
        estimated_improvement = min(30, total_hours / 20)
        
        # Adjust based on consistency (if study streak is good)
        if 'study_streak_days' in student_data.columns:
            streak = student_data['study_streak_days'].values[0]
            if streak > 30:
                estimated_improvement *= 1.2
        
        # Adjust based on mock tests
        if 'mock_tests_attempted' in student_data.columns:
            mocks = student_data['mock_tests_attempted'].values[0]
            if mocks > 50:
                estimated_improvement *= 1.1
        
        predicted_score = min(100, current_score + estimated_improvement)
        
        # Confidence level based on data availability
        if estimated_improvement > 20:
            confidence = 'High'
        elif estimated_improvement > 10:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        return {
            'current_score': round(current_score, 1),
            'predicted_score': round(predicted_score, 1),
            'estimated_improvement': round(estimated_improvement, 1),
            'hours_needed': round(total_hours, 1),
            'weeks_needed': round(total_hours / 35, 1),  # Assuming 5 hours/day
            'confidence': confidence
        }
    
    def generate_motivation_message(self, weaknesses: Dict, 
                                    improvement_prediction: Dict) -> str:
        """
        Generate personalized motivational message
        
        Args:
            weaknesses: Identified weaknesses
            improvement_prediction: Improvement prediction
            
        Returns:
            Motivational message string
        """
        weak_count = len(weaknesses)
        
        if weak_count == 0:
            return "🌟 Excellent work! You're on the right track. Keep maintaining your consistency and you'll definitely crack UPSC!"
        
        if weak_count <= 2:
            return f"💪 Great job! You have only {weak_count} weak area(s). With focused {self.learning_upsc_py_language} of {improvement_prediction.get('weeks_needed', 4)} weeks, you can improve your score by {improvement_prediction.get('estimated_improvement', 10)}%. Keep pushing!"
        elif weak_count <= 4:
            return f"📚 You have identified {weak_count} areas for improvement. Don't worry! With dedicated {self.learning_upsc_py_language} of {improvement_prediction.get('hours_needed', 50)} hours, you can boost your score by {improvement_prediction.get('estimated_improvement', 15)}%. Start with high priority subjects!"
        else:
            return f"🎯 You have {weak_count} areas to work on. But remember, every topper started somewhere! Focus on one subject at a time. In {improvement_prediction.get('weeks_needed', 8)} weeks of consistent effort, you can see significant improvement. You've got this!"
    
    def get_full_recommendations(self, student_data: pd.DataFrame, 
                                  daily_study_hours: float = 6) -> Dict:
        """
        Generate complete personalized recommendations for a student
        
        Args:
            student_data: DataFrame with student's data
            daily_study_hours: Available daily study hours
            
        Returns:
            Complete recommendations dictionary
        """
        # Identify weaknesses
        weaknesses = self.identify_weaknesses(student_data)
        
        # Calculate recommended hours
        recommended_hours = self.calculate_study_hours(weaknesses, daily_study_hours)
        
        # Create study plan
        study_plan = self.create_study_plan(weaknesses, recommended_hours)
        
        # Get resources for each weak subject
        all_resources = []
        for subject, weakness in weaknesses.items():
            resources = self.get_resources_for_subject(subject, weakness['severity'])
            all_resources.extend(resources)
        
        # Predict improvement
        improvement = self.predict_improvement(student_data, {'study_plan': study_plan})
        
        # Generate motivation
        motivation = self.generate_motivation_message(weaknesses, improvement)
        
        # ML model prediction (if available)
        ml_prediction = None
        qualification_probability = None
        
        if self.model is not None and self.scaler is not None:
            try:
                # Prepare features (need to match training features)
                # This is a simplified version - in production, use exact feature set
                features = student_data.select_dtypes(include=[np.number]).fillna(0)
                features_scaled = self.scaler.transform(features)
                qualification_probability = self.model.predict_proba(features_scaled)[0][1]
                ml_prediction = 1 if qualification_probability > 0.5 else 0
            except Exception as e:
                print(f"ML prediction error: {e}")
        
        # Get student ID safely
        student_id_val = student_data.get('student_id', 'Unknown')
        if hasattr(student_id_val, 'values'):
            student_id_val = student_id_val.values[0] if len(student_id_val.values) > 0 else 'Unknown'
        
        # Compile final recommendations
        recommendations = {
            'student_id': student_id_val,
            'weaknesses': weaknesses,
            'priority_subjects': list(weaknesses.keys())[:3],
            'recommended_hours': recommended_hours,
            'study_plan': study_plan,
            'recommended_resources': all_resources[:15],  # Limit to 15 resources
            'improvement_prediction': improvement,
            'motivation_message': motivation,
            'ml_prediction': {
                'qualifies': bool(ml_prediction) if ml_prediction is not None else None,
                'probability': round(qualification_probability * 100, 1) if qualification_probability is not None else None
            },
            'generated_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return recommendations


# Example usage and testing
if __name__ == "__main__":
    # Initialize the recommendation engine
    engine = UPSCRecommendationEngine()
    
    # Sample student data (replace with actual data from database)
    sample_student = pd.DataFrame({
        'student_id': [1001],
        'gs_history': [12],  # out of 25 (48%)
        'gs_geography': [8],  # out of 25 (32%)
        'gs_polity': [15],   # out of 25 (60%)
        'gs_economy': [6],    # out of 25 (24%)
        'daily_study_hours': [6],
        'mock_tests_attempted': [30],
        'study_streak_days': [45],
        'overall_score': [55]
    })
    
    # Convert to percentages
    for subject in engine.gs_subjects:
        col = f'gs_{subject.lower()}'
        if col in sample_student.columns:
            sample_student[f'{col}_pct'] = sample_student[col] * 4
    
    # Get recommendations
    recommendations = engine.get_full_recommendations(sample_student)
    
    # Print recommendations
 
    print("PERSONALIZED RECOMMENDATIONS")
    
    print(f"\n📊 Weak Areas Identified:")
    for subject, details in recommendations['weaknesses'].items():
        print(f"  - {subject}: {details['score']:.1f}% ({details['severity']} priority)")
    
    print(f"\n📚 Recommended Study Hours (daily):")
    for subject, hours in recommendations['recommended_hours'].items():
        print(f"  - {subject}: {hours} hours")
    
    print(f"\n📈 Improvement Prediction:")
    imp = recommendations['improvement_prediction']
    print(f"  - Current Score: {imp['current_score']:.1f}%")
    print(f"  - Predicted Score: {imp['predicted_score']:.1f}%")
    print(f"  - Estimated Improvement: +{imp['estimated_improvement']:.1f}%")
    print(f"  - Study Hours Needed: {imp['hours_needed']:.0f} hours")
    print(f"  - Weeks Needed: {imp['weeks_needed']:.1f} weeks")
    
    print(f"\n💪 {recommendations['motivation_message']}")
    
    print("\n✅ Recommendation Engine Ready!")