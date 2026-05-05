"""
Performance Predictor for UPSC Aspirants
Provides real-time performance predictions and improvement suggestions
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
import joblib

class PerformancePredictor:
    """
    Real-time performance predictor for UPSC aspirants
    Predicts future performance based on current trends and study patterns
    """
    
    def __init__(self, model_path=None, scaler_path=None):
        """
        Initialize performance predictor
        
        Args:
            model_path: Path to trained ML model
            scaler_path: Path to fitted scaler
        """
        self.model = None
        self.scaler = None
        
        if model_path:
            try:
                self.model = joblib.load(model_path)
                print(f"✅ Model loaded from {model_path}")
            except Exception as e:
                print(f"⚠️ Could not load model: {e}")
        
        if scaler_path:
            try:
                self.scaler = joblib.load(scaler_path)
                print(f"✅ Scaler loaded from {scaler_path}")
            except Exception as e:
                print(f"⚠️ Could not load scaler: {e}")
    
    def predict_prelims_score(self, student_data):
        """
        Predict UPSC Prelims score based on current performance
        
        Args:
            student_data: Dictionary with student scores and metrics
            
        Returns:
            Predicted score range and probability
        """
        # Extract current GS and CSAT scores
        gs_subjects = ['history', 'geography', 'polity', 'economy', 
                      'science_tech', 'environment', 'current_affairs', 'art_culture']
        
        gs_scores = [student_data.get(f'{sub}_score', 0) for sub in gs_subjects]
        avg_gs = np.mean(gs_scores) if gs_scores else 0
        
        csat_subjects = ['comprehension', 'logical_reasoning', 'quantitative',
                        'data_interpretation', 'decision_making']
        
        csat_scores = [student_data.get(f'{sub}_score', 0) for sub in csat_subjects]
        avg_csat = np.mean(csat_scores) if csat_scores else 0
        
        # Study factors
        study_hours = student_data.get('daily_study_hours', 6)
        mock_tests = student_data.get('mock_tests_attempted', 0)
        consistency = student_data.get('study_consistency', 70)
        preparation_months = student_data.get('preparation_months', 12)
        
        # Calculate predicted GS score (out of 200)
        gs_prediction = self._calculate_gs_prediction(avg_gs, study_hours, mock_tests, consistency, preparation_months)
        
        # Calculate predicted CSAT score (out of 200)
        csat_prediction = self._calculate_csat_prediction(avg_csat, study_hours, mock_tests)
        
        # Confidence level
        confidence = self._calculate_confidence(study_hours, mock_tests, consistency)
        
        return {
            'predicted_gs_score': round(gs_prediction, 1),
            'predicted_csat_score': round(csat_prediction, 1),
            'total_predicted_score': round(gs_prediction + csat_prediction, 1),
            'confidence_level': confidence,
            'qualification_likely': gs_prediction >= 100 and csat_prediction >= 66,
            'gs_cutoff_met': gs_prediction >= 100,
            'csat_cutoff_met': csat_prediction >= 66
        }
    
    def _calculate_gs_prediction(self, avg_gs, study_hours, mock_tests, consistency, prep_months):
        """Calculate predicted GS score"""
        # Base score from current average
        base_score = avg_gs * 2  # Convert to 200 scale
        
        # Improvement factors
        study_factor = min(20, study_hours * 1.5)
        mock_factor = min(15, mock_tests * 0.3)
        consistency_factor = min(10, consistency / 10)
        time_factor = min(15, prep_months * 0.5)
        
        # Total predicted score (cap at 200)
        predicted = base_score + study_factor + mock_factor + consistency_factor + time_factor
        predicted = min(200, max(0, predicted))
        
        return predicted
    
    def _calculate_csat_prediction(self, avg_csat, study_hours, mock_tests):
        """Calculate predicted CSAT score"""
        # Base score from current average
        base_score = avg_csat * 2  # Convert to 200 scale
        
        # Improvement factors (CSAT is qualifying, less weight)
        study_factor = min(10, study_hours)
        mock_factor = min(10, mock_tests * 0.2)
        
        # Total predicted score (cap at 200)
        predicted = base_score + study_factor + mock_factor
        predicted = min(200, max(0, predicted))
        
        return predicted
    
    def _calculate_confidence(self, study_hours, mock_tests, consistency):
        """Calculate confidence level in prediction"""
        score = 0
        
        if study_hours >= 6:
            score += 30
        elif study_hours >= 4:
            score += 20
        else:
            score += 10
        
        if mock_tests >= 50:
            score += 40
        elif mock_tests >= 30:
            score += 30
        elif mock_tests >= 15:
            score += 20
        else:
            score += 10
        
        if consistency >= 80:
            score += 30
        elif consistency >= 60:
            score += 20
        else:
            score += 10
        
        if score >= 80:
            return "High"
        elif score >= 50:
            return "Medium"
        else:
            return "Low"
    
    def predict_score_improvement(self, current_scores, target_scores, study_hours_available):
        """
        Predict how much score can improve in given time
        
        Args:
            current_scores: Dictionary of current subject scores
            target_scores: Dictionary of target scores
            study_hours_available: Hours available per day
            
        Returns:
            Improvement prediction with timeline
        """
        improvements = {}
        total_hours_needed = 0
        
        for subject, current in current_scores.items():
            target = target_scores.get(subject, 70)
            if current < target:
                # 1% improvement needs approximately 2 study hours
                improvement_needed = target - current
                hours_needed = improvement_needed * 2
                total_hours_needed += hours_needed
                
                improvements[subject] = {
                    'current': current,
                    'target': target,
                    'improvement_needed': improvement_needed,
                    'hours_needed': round(hours_needed, 1),
                    'days_needed': round(hours_needed / study_hours_available, 1)
                }
        
        # Overall estimate
        weeks_needed = round(total_hours_needed / (study_hours_available * 7), 1)
        
        return {
            'subject_improvements': improvements,
            'total_hours_needed': round(total_hours_needed, 1),
            'weeks_needed': weeks_needed,
            'feasible': weeks_needed <= 12,  # Within 3 months
            'recommended_daily_hours': max(6, round(total_hours_needed / (weeks_needed * 7), 1))
        }
    
    def predict_mock_test_trend(self, past_scores):
        """
        Predict future mock test scores based on past trends
        
        Args:
            past_scores: List of past mock test scores
            
        Returns:
            Predicted trend for next 5 tests
        """
        if len(past_scores) < 3:
            return {'error': 'Need at least 3 mock test scores for trend prediction'}
        
        # Simple linear regression for trend
        x = np.arange(len(past_scores))
        y = np.array(past_scores)
        
        # Calculate trend line
        z = np.polyfit(x, y, 1)
        slope = z[0]
        intercept = z[1]
        
        # Predict next 5 scores
        predictions = []
        for i in range(1, 6):
            next_score = intercept + slope * (len(past_scores) + i - 1)
            predictions.append(round(max(0, min(200, next_score)), 1))
        
        # Calculate improvement rate
        current_avg = np.mean(y[-3:]) if len(y) >= 3 else np.mean(y)
        future_avg = np.mean(predictions[-3:])
        monthly_improvement = (future_avg - current_avg) * 4  # Assuming weekly tests
        
        return {
            'trend': 'improving' if slope > 0 else 'declining' if slope < 0 else 'stable',
            'slope': round(slope, 2),
            'next_5_predictions': predictions,
            'predicted_average': round(future_avg, 1),
            'monthly_improvement_rate': round(monthly_improvement, 1),
            'confidence': 'High' if abs(slope) > 2 else 'Medium' if abs(slope) > 0.5 else 'Low'
        }
    
    def predict_rank(self, current_score, peer_average, peer_std):
        """
        Predict rank based on current score and peer performance
        
        Args:
            current_score: Student's current score
            peer_average: Average score of peer group
            peer_std: Standard deviation of peer scores
            
        Returns:
            Estimated rank and percentile
        """
        if peer_std == 0:
            return {'estimated_rank': 'N/A', 'percentile': 50, 'message': 'Insufficient peer data'}
        
        # Calculate z-score
        z_score = (current_score - peer_average) / peer_std if peer_std > 0 else 0
        
        # Estimate percentile (using normal distribution approximation)
        from scipy import stats
        percentile = stats.norm.cdf(z_score) * 100
        
        # Estimate rank (assuming 500,000 candidates)
        total_candidates = 500000
        estimated_rank = int(total_candidates * (1 - percentile / 100))
        
        # Categorize
        if percentile >= 90:
            category = "Excellent"
        elif percentile >= 75:
            category = "Good"
        elif percentile >= 50:
            category = "Average"
        elif percentile >= 25:
            category = "Below Average"
        else:
            category = "Needs Improvement"
        
        return {
            'estimated_rank': estimated_rank,
            'percentile': round(percentile, 1),
            'z_score': round(z_score, 2),
            'category': category,
            'total_candidates': total_candidates,
            'message': f"You are in the top {round(100 - percentile, 1)}% of aspirants"
        }
    
    def predict_study_effectiveness(self, study_logs):
        """
        Predict which study habits are most effective
        
        Args:
            study_logs: List of study log dictionaries
            
        Returns:
            Analysis of effective study patterns
        """
        if len(study_logs) < 7:
            return {'error': 'Need at least 7 days of study logs'}
        
        # Analyze study patterns
        morning_hours = []
        afternoon_hours = []
        evening_hours = []
        night_hours = []
        
        subject_performance = {}
        quiz_performance = []
        consistency_scores = []
        
        for log in study_logs:
            # Time of day effectiveness
            time_of_day = log.get('productive_time', 'Morning')
            hours = log.get('study_hours', 0)
            score = log.get('quiz_scores', [0])[0] if log.get('quiz_scores') else 0
            
            if time_of_day == 'Morning':
                morning_hours.append((hours, score))
            elif time_of_day == 'Afternoon':
                afternoon_hours.append((hours, score))
            elif time_of_day == 'Evening':
                evening_hours.append((hours, score))
            else:
                night_hours.append((hours, score))
            
            # Subject effectiveness
            subjects = log.get('subjects_studied', [])
            for subject in subjects:
                if subject not in subject_performance:
                    subject_performance[subject] = {'hours': [], 'scores': []}
                subject_performance[subject]['hours'].append(hours)
                subject_performance[subject]['scores'].append(score)
            
            quiz_performance.append(score if score > 0 else 0)
            consistency_scores.append(1 if hours >= 4 else 0)
        
        # Find best time of day
        time_effectiveness = {
            'Morning': np.mean([s for h, s in morning_hours]) if morning_hours else 0,
            'Afternoon': np.mean([s for h, s in afternoon_hours]) if afternoon_hours else 0,
            'Evening': np.mean([s for h, s in evening_hours]) if evening_hours else 0,
            'Night': np.mean([s for h, s in night_hours]) if night_hours else 0
        }
        
        best_time = max(time_effectiveness, key=time_effectiveness.get)
        
        # Find best subjects
        subject_effectiveness = {}
        for subject, data in subject_performance.items():
            if data['scores']:
                subject_effectiveness[subject] = np.mean(data['scores'])
        
        best_subjects = sorted(subject_effectiveness.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Predict future performance based on patterns
        avg_quiz = np.mean(quiz_performance) if quiz_performance else 0
        consistency_rate = np.mean(consistency_scores) * 100
        
        predicted_improvement = 0
        if consistency_rate > 80:
            predicted_improvement += 10
        if avg_quiz > 70:
            predicted_improvement += 5
        
        return {
            'best_study_time': best_time,
            'time_effectiveness': time_effectiveness,
            'best_subjects': [{'subject': s, 'effectiveness': round(e, 1)} for s, e in best_subjects],
            'current_quiz_average': round(avg_quiz, 1),
            'consistency_rate': round(consistency_rate, 1),
            'predicted_improvement': round(predicted_improvement, 1),
            'recommendation': f"Study during {best_time} for best results. Focus on {best_subjects[0][0] if best_subjects else 'all subjects'}."
        }
    
    def predict_week_wise_performance(self, current_scores, study_plan):
        """
        Predict week-by-week performance improvement
        
        Args:
            current_scores: Current subject scores
            study_plan: Weekly study plan with hours per subject
            
        Returns:
            Week-by-week performance predictions
        """
        weeks = [1, 2, 3, 4, 5, 6, 7, 8]  # 8 weeks prediction
        predictions = []
        
        current = current_scores.copy()
        
        for week in weeks:
            week_prediction = {'week': week, 'scores': {}}
            
            for subject, score in current.items():
                # Improvement per week based on study hours
                study_hours = study_plan.get(subject, 0)
                improvement = min(5, study_hours * 0.5)  # Max 5% improvement per week
                
                new_score = min(100, score + improvement)
                week_prediction['scores'][subject] = round(new_score, 1)
                current[subject] = new_score
            
            # Calculate overall
            week_prediction['overall'] = round(np.mean(list(week_prediction['scores'].values())), 1)
            week_prediction['qualified'] = week_prediction['overall'] >= 70
            
            predictions.append(week_prediction)
        
        return {
            'weekly_predictions': predictions,
            'target_week': next((w['week'] for w in predictions if w['qualified']), None),
            'total_improvement': round(predictions[-1]['overall'] - predictions[0]['overall'], 1)
        }
    
    def get_readiness_score(self, student_data):
        """
        Calculate overall exam readiness score
        
        Args:
            student_data: Complete student data dictionary
            
        Returns:
            Readiness score with breakdown
        """
        # Components and weights
        components = {
            'subject_knowledge': 0.4,
            'mock_test_performance': 0.25,
            'study_consistency': 0.2,
            'time_management': 0.15
        }
        
        # Calculate subject knowledge score
        gs_subjects = ['history', 'geography', 'polity', 'economy', 'science_tech', 'environment', 'current_affairs', 'art_culture']
        gs_scores = [student_data.get(f'{sub}_score', 0) for sub in gs_subjects]
        subject_knowledge = np.mean(gs_scores)
        
        # Calculate mock test performance
        mock_tests = student_data.get('mock_tests_attempted', 0)
        if mock_tests >= 50:
            mock_score = 90
        elif mock_tests >= 30:
            mock_score = 70
        elif mock_tests >= 15:
            mock_score = 50
        else:
            mock_score = 30
        
        # Calculate study consistency
        study_hours = student_data.get('daily_study_hours', 0)
        if study_hours >= 8:
            consistency = 90
        elif study_hours >= 6:
            consistency = 75
        elif study_hours >= 4:
            consistency = 55
        else:
            consistency = 30
        
        # Calculate time management
        prep_months = student_data.get('preparation_months', 0)
        if prep_months >= 12:
            time_management = 80
        elif prep_months >= 6:
            time_management = 60
        else:
            time_management = 40
        
        # Calculate weighted score
        readiness = (
            subject_knowledge * components['subject_knowledge'] +
            mock_score * components['mock_test_performance'] +
            consistency * components['study_consistency'] +
            time_management * components['time_management']
        )
        
        # Determine category
        if readiness >= 80:
            category = "Ready for Prelims"
            message = "You are well-prepared! Maintain your consistency and focus on revision."
        elif readiness >= 60:
            category = "Almost Ready"
            message = "Good progress! Focus on weak areas and increase mock tests."
        elif readiness >= 40:
            category = "Need Improvement"
            message = "You need more preparation. Increase study hours and take more tests."
        else:
            category = "Critical"
            message = "Significant improvement needed. Start with basics and build gradually."
        
        return {
            'readiness_score': round(readiness, 1),
            'category': category,
            'message': message,
            'breakdown': {
                'subject_knowledge': round(subject_knowledge, 1),
                'mock_test_performance': mock_score,
                'study_consistency': consistency,
                'time_management': time_management
            },
            'recommendations': self._get_readiness_recommendations(subject_knowledge, mock_score, consistency, time_management)
        }
    
    def _get_readiness_recommendations(self, subject_knowledge, mock_score, consistency, time_management):
        """Get recommendations based on readiness components"""
        recommendations = []
        
        if subject_knowledge < 60:
            recommendations.append("Focus on strengthening core concepts in weak subjects")
        
        if mock_score < 70:
            recommendations.append("Take more mock tests - aim for 2-3 per week")
        
        if consistency < 70:
            recommendations.append("Maintain a consistent daily study schedule")
        
        if time_management < 60:
            recommendations.append("Create a structured timetable and stick to it")
        
        if not recommendations:
            recommendations.append("Keep up the good work! Focus on revision and practice")
        
        return recommendations


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = PerformancePredictor()
    
    # Sample student data
    sample_data = {
        'history_score': 65,
        'geography_score': 55,
        'polity_score': 70,
        'economy_score': 45,
        'science_tech_score': 60,
        'environment_score': 58,
        'current_affairs_score': 62,
        'art_culture_score': 50,
        'comprehension_score': 70,
        'logical_reasoning_score': 65,
        'quantitative_score': 45,
        'data_interpretation_score': 55,
        'decision_making_score': 60,
        'daily_study_hours': 6,
        'mock_tests_attempted': 35,
        'study_consistency': 75,
        'preparation_months': 10
    }
    
    # Get predictions
    prelims_pred = predictor.predict_prelims_score(sample_data)
    print("Prelims Score Prediction:", prelims_pred)
    
    readiness = predictor.get_readiness_score(sample_data)
    print("Readiness Score:", readiness)
    
    print("\nPerformancePredictor class is ready to use!")