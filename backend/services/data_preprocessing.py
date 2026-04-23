"""
Data Preprocessing Service
Handles data cleaning, feature engineering, and preparation for ML model
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import joblib

class DataPreprocessingService:
    """
    Service for preprocessing student data before feeding to ML model
    Handles missing values, feature engineering, and scaling
    """
    
    def __init__(self, scaler_path=None):
        """
        Initialize preprocessing service
        
        Args:
            scaler_path: Path to saved scaler (for production)
        """
        self.scaler = None
        if scaler_path:
            try:
                self.scaler = joblib.load(scaler_path)
                print("✅ Scaler loaded successfully")
            except Exception as e:
                print(f"⚠️ Could not load scaler: {e}")
        
        # Define subject columns
        self.gs_subjects = [
            'history_score', 'geography_score', 'polity_score', 
            'economy_score', 'science_tech_score', 'environment_score',
            'current_affairs_score', 'art_culture_score'
        ]
        
        self.csat_subjects = [
            'comprehension_score', 'logical_reasoning_score', 
            'quantitative_score', 'data_interpretation_score', 
            'decision_making_score'
        ]
        
        # Feature columns expected by model
        self.feature_columns = [
            'age', 'preparation_months', 'daily_study_hours', 'attempt_number',
            'gs_average_pct', 'csat_average_pct', 'overall_score',
            'weak_subjects_count', 'very_weak_subjects', 'strong_subjects_count',
            'weakest_subject_score', 'strongest_subject_score',
            'study_efficiency', 'mock_efficiency', 'consistency_score',
            'improvement_needed', 'quick_wins_count', 'estimated_hours_needed',
            'mock_tests_attempted', 'weekly_quizzes', 'avg_quiz_score',
            'test_readiness', 'revision_effectiveness', 'weekly_study_hours',
            'preparation_intensity', 'has_coaching', 'regular_quiz_taker',
            'high_mock_tester', 'ncert_reader', 'standard_books_user'
        ]
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean raw data by handling missing values and outliers
        
        Args:
            df: Raw dataframe
            
        Returns:
            Cleaned dataframe
        """
        df_clean = df.copy()
        
        # Handle missing values
        for col in df_clean.columns:
            if df_clean[col].dtype in ['float64', 'int64']:
                # Fill numerical missing with median
                df_clean[col].fillna(df_clean[col].median(), inplace=True)
            else:
                # Fill categorical missing with mode
                df_clean[col].fillna(df_clean[col].mode()[0] if len(df_clean[col].mode()) > 0 else 'Unknown', inplace=True)
        
        # Remove outliers using IQR method
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df_clean[col] = df_clean[col].clip(lower_bound, upper_bound)
        
        return df_clean
    
    def normalize_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize subject scores to percentage (0-100 scale)
        
        Args:
            df: Dataframe with raw scores
            
        Returns:
            Dataframe with normalized scores
        """
        df_norm = df.copy()
        
        # GS subjects (typically out of 25 in raw data)
        for subject in self.gs_subjects:
            if subject in df_norm.columns:
                # Check if score seems to be out of 25
                max_val = df_norm[subject].max()
                if max_val <= 25:
                    df_norm[f'{subject}_pct'] = df_norm[subject] * 4
                elif max_val <= 100:
                    df_norm[f'{subject}_pct'] = df_norm[subject]
                else:
                    df_norm[f'{subject}_pct'] = (df_norm[subject] / max_val) * 100
        
        # CSAT subjects (normalize based on max value)
        for subject in self.csat_subjects:
            if subject in df_norm.columns:
                max_val = df_norm[subject].max()
                if max_val > 0:
                    df_norm[f'{subject}_pct'] = (df_norm[subject] / max_val) * 100
        
        return df_norm
    
    def calculate_composite_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate composite scores like GS average, CSAT average, overall score
        
        Args:
            df: Dataframe with percentage scores
            
        Returns:
            Dataframe with composite scores added
        """
        df_comp = df.copy()
        
        # GS subjects percentage columns
        gs_pct_cols = [f'{sub}_pct' for sub in self.gs_subjects if f'{sub}_pct' in df_comp.columns]
        
        if gs_pct_cols:
            df_comp['gs_average_pct'] = df_comp[gs_pct_cols].mean(axis=1)
        
        # CSAT subjects percentage columns
        csat_pct_cols = [f'{sub}_pct' for sub in self.csat_subjects if f'{sub}_pct' in df_comp.columns]
        
        if csat_pct_cols:
            df_comp['csat_average_pct'] = df_comp[csat_pct_cols].mean(axis=1)
        
        # Overall score (70% GS + 30% CSAT as per UPSC)
        if 'gs_average_pct' in df_comp.columns and 'csat_average_pct' in df_comp.columns:
            df_comp['overall_score'] = (df_comp['gs_average_pct'] * 0.7) + (df_comp['csat_average_pct'] * 0.3)
        
        return df_comp
    
    def identify_weak_areas(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Identify weak and strong areas for each student
        
        Args:
            df: Dataframe with percentage scores
            
        Returns:
            Dataframe with weakness indicators added
        """
        df_weak = df.copy()
        
        gs_pct_cols = [f'{sub}_pct' for sub in self.gs_subjects if f'{sub}_pct' in df_weak.columns]
        
        if gs_pct_cols:
            # Count weak subjects (score below 50%)
            df_weak['weak_subjects_count'] = (df_weak[gs_pct_cols] < 50).sum(axis=1)
            
            # Count very weak subjects (score below 35%)
            df_weak['very_weak_subjects'] = (df_weak[gs_pct_cols] < 35).sum(axis=1)
            
            # Count strong subjects (score above 75%)
            df_weak['strong_subjects_count'] = (df_weak[gs_pct_cols] > 75).sum(axis=1)
            
            # Weakest subject score
            df_weak['weakest_subject_score'] = df_weak[gs_pct_cols].min(axis=1)
            
            # Strongest subject score
            df_weak['strongest_subject_score'] = df_weak[gs_pct_cols].max(axis=1)
        
        return df_weak
    
    def calculate_efficiency_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate study efficiency and consistency metrics
        
        Args:
            df: Dataframe with scores and study data
            
        Returns:
            Dataframe with efficiency metrics added
        """
        df_eff = df.copy()
        
        # Study efficiency (score per study hour)
        if 'overall_score' in df_eff.columns and 'daily_study_hours' in df_eff.columns:
            df_eff['study_efficiency'] = df_eff['overall_score'] / (df_eff['daily_study_hours'] + 1)
        
        # Mock test efficiency (score per mock test)
        if 'overall_score' in df_eff.columns and 'mock_tests_attempted' in df_eff.columns:
            df_eff['mock_efficiency'] = df_eff['overall_score'] / (df_eff['mock_tests_attempted'] + 1)
        
        # Calculate consistency (low variance = consistent performance)
        gs_pct_cols = [f'{sub}_pct' for sub in self.gs_subjects if f'{sub}_pct' in df_eff.columns]
        
        if gs_pct_cols:
            df_eff['subject_variance'] = df_eff[gs_pct_cols].var(axis=1)
            max_variance = df_eff['subject_variance'].max()
            if max_variance > 0:
                df_eff['consistency_score'] = 100 - (df_eff['subject_variance'] / max_variance * 100)
            else:
                df_eff['consistency_score'] = 100
        
        return df_eff
    
    def calculate_improvement_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate improvement potential metrics
        
        Args:
            df: Dataframe with scores
            
        Returns:
            Dataframe with improvement metrics added
        """
        df_imp = df.copy()
        
        # Improvement needed to reach 70%
        if 'overall_score' in df_imp.columns:
            df_imp['improvement_needed'] = 70 - df_imp['overall_score']
            df_imp['improvement_needed'] = df_imp['improvement_needed'].clip(lower=0)
        
        # Quick wins (subjects between 40-60%)
        gs_pct_cols = [f'{sub}_pct' for sub in self.gs_subjects if f'{sub}_pct' in df_imp.columns]
        
        if gs_pct_cols:
            quick_win_mask = (df_imp[gs_pct_cols] >= 40) & (df_imp[gs_pct_cols] < 60)
            df_imp['quick_wins_count'] = quick_win_mask.sum(axis=1)
        
        # Estimated hours needed (1% improvement needs 2 hours)
        if 'improvement_needed' in df_imp.columns:
            df_imp['estimated_hours_needed'] = df_imp['improvement_needed'] * 2
        
        return df_imp
    
    def calculate_engagement_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate engagement and behavioral features
        
        Args:
            df: Dataframe with raw engagement data
            
        Returns:
            Dataframe with engagement features added
        """
        df_eng = df.copy()
        
        # Test readiness
        if 'test_attendance_percent' in df_eng.columns and 'avg_quiz_score' in df_eng.columns:
            df_eng['test_readiness'] = (df_eng['test_attendance_percent'] + df_eng['avg_quiz_score']) / 2
        elif 'avg_quiz_score' in df_eng.columns:
            df_eng['test_readiness'] = df_eng['avg_quiz_score']
        
        # Study streak quality
        if 'study_streak_days' in df_eng.columns and 'daily_study_hours' in df_eng.columns:
            df_eng['streak_quality'] = df_eng['study_streak_days'] * df_eng['daily_study_hours']
        elif 'daily_study_hours' in df_eng.columns:
            df_eng['streak_quality'] = df_eng['daily_study_hours'] * 30
        
        # Revision effectiveness
        if 'revision_cycles' in df_eng.columns and 'avg_quiz_score' in df_eng.columns:
            df_eng['revision_effectiveness'] = df_eng['revision_cycles'] * (df_eng['avg_quiz_score'] / 100)
        else:
            df_eng['revision_effectiveness'] = 0
        
        # Weekly study hours
        if 'daily_study_hours' in df_eng.columns:
            df_eng['weekly_study_hours'] = df_eng['daily_study_hours'] * 7
        
        # Preparation intensity
        if 'preparation_months' in df_eng.columns and 'daily_study_hours' in df_eng.columns:
            df_eng['preparation_intensity'] = df_eng['preparation_months'] * df_eng['daily_study_hours']
        
        return df_eng
    
    def create_binary_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create binary/boolean features from categorical data
        
        Args:
            df: Dataframe with categorical data
            
        Returns:
            Dataframe with binary features added
        """
        df_bin = df.copy()
        
        # Has coaching
        if 'coaching' in df_bin.columns:
            df_bin['has_coaching'] = df_bin['coaching'].apply(
                lambda x: 1 if x != 'Self Study' and pd.notna(x) else 0
            )
        
        # Regular quiz taker (4+ quizzes per week)
        if 'weekly_quizzes' in df_bin.columns:
            df_bin['regular_quiz_taker'] = (df_bin['weekly_quizzes'] >= 4).astype(int)
        
        # High mock tester (50+ mock tests)
        if 'mock_tests_attempted' in df_bin.columns:
            df_bin['high_mock_tester'] = (df_bin['mock_tests_attempted'] >= 50).astype(int)
        
        # NCERT reader
        if 'ncert_read' in df_bin.columns:
            df_bin['ncert_reader'] = df_bin['ncert_read'].astype(int)
        
        # Standard books user
        if 'standard_books' in df_bin.columns:
            df_bin['standard_books_user'] = df_bin['standard_books'].astype(int)
        
        return df_bin
    
    def prepare_for_model(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare dataframe for ML model prediction
        
        Args:
            df: Raw student data
            
        Returns:
            Dataframe ready for model prediction
        """
        # Apply all preprocessing steps
        df_processed = self.clean_data(df)
        df_processed = self.normalize_scores(df_processed)
        df_processed = self.calculate_composite_scores(df_processed)
        df_processed = self.identify_weak_areas(df_processed)
        df_processed = self.calculate_efficiency_metrics(df_processed)
        df_processed = self.calculate_improvement_metrics(df_processed)
        df_processed = self.calculate_engagement_features(df_processed)
        df_processed = self.create_binary_features(df_processed)
        
        # Select only required features
        available_features = [col for col in self.feature_columns if col in df_processed.columns]
        
        # Add missing features with default values
        for col in self.feature_columns:
            if col not in available_features:
                df_processed[col] = 0
        
        return df_processed[self.feature_columns]
    
    def preprocess_student_data(self, student_data: Dict) -> pd.DataFrame:
        """
        Preprocess a single student's data for prediction
        
        Args:
            student_data: Dictionary containing student information
            
        Returns:
            Dataframe ready for model prediction
        """
        # Convert to DataFrame
        df = pd.DataFrame([student_data])
        
        # Prepare for model
        df_processed = self.prepare_for_model(df)
        
        # Scale if scaler is available
        if self.scaler:
            try:
                df_scaled = self.scaler.transform(df_processed)
                df_processed = pd.DataFrame(df_scaled, columns=df_processed.columns)
            except Exception as e:
                print(f"⚠️ Scaling failed: {e}")
        
        return df_processed
    
    def get_feature_summary(self, df: pd.DataFrame) -> Dict:
        """
        Get summary statistics of features
        
        Args:
            df: Dataframe with features
            
        Returns:
            Dictionary with feature summaries
        """
        summary = {}
        
        for col in df.columns:
            if df[col].dtype in ['float64', 'int64']:
                summary[col] = {
                    'mean': float(df[col].mean()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'missing': int(df[col].isnull().sum())
                }
        
        return summary