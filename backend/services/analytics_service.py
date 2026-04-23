"""
Analytics Service for UPSC Learning System
Generates insights, trends, and performance analytics
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import Counter

class AnalyticsService:
    """
    Service for generating analytics and insights about student performance
    """
    
    def __init__(self):
        """Initialize analytics service"""
        self.gs_subjects = [
            'history', 'geography', 'polity', 'economy',
            'science_tech', 'environment', 'current_affairs', 'art_culture'
        ]
        
        self.csat_subjects = [
            'comprehension', 'logical_reasoning', 'quantitative',
            'data_interpretation', 'decision_making'
        ]
    
    def generate_performance_trend(self, score_history: List[Dict]) -> Dict:
        """
        Generate performance trend from score history
        
        Args:
            score_history: List of score dictionaries with dates
            
        Returns:
            Trend analysis dictionary
        """
        if not score_history:
            return {
                'trend': 'No data',
                'improvement_rate': 0,
                'best_score': 0,
                'worst_score': 0,
                'average_score': 0,
                'scores_over_time': []
            }
        
        # Extract scores and dates
        scores = []
        dates = []
        
        for record in score_history:
            if 'overall_score' in record:
                scores.append(record['overall_score'])
                dates.append(record.get('exam_date', record.get('created_at', '')))
        
        if not scores:
            return {'trend': 'No score data'}
        
        # Calculate metrics
        recent_scores = scores[-5:] if len(scores) >= 5 else scores
        improvement = recent_scores[-1] - recent_scores[0] if len(recent_scores) > 1 else 0
        
        # Determine trend
        if improvement > 5:
            trend = 'Improving'
        elif improvement < -5:
            trend = 'Declining'
        else:
            trend = 'Stable'
        
        # Calculate moving average
        window = min(3, len(scores))
        moving_avg = []
        for i in range(len(scores)):
            start = max(0, i - window + 1)
            avg = sum(scores[start:i+1]) / (i - start + 1)
            moving_avg.append(round(avg, 2))
        
        return {
            'trend': trend,
            'improvement_rate': round(improvement, 2),
            'best_score': round(max(scores), 2),
            'worst_score': round(min(scores), 2),
            'average_score': round(sum(scores) / len(scores), 2),
            'scores_over_time': [
                {'date': dates[i], 'score': scores[i], 'moving_avg': moving_avg[i]}
                for i in range(len(scores))
            ]
        }
    
    def analyze_weaknesses(self, subject_scores: Dict) -> Dict:
        """
        Analyze student's weak areas across subjects
        
        Args:
            subject_scores: Dictionary of subject scores
            
        Returns:
            Weakness analysis dictionary
        """
        weaknesses = {}
        
        # Analyze GS subjects
        for subject in self.gs_subjects:
            score_key = f'{subject}_score'
            if score_key in subject_scores:
                score = subject_scores[score_key]
                
                if score < 40:
                    severity = 'high'
                    priority = 1
                elif score < 55:
                    severity = 'medium'
                    priority = 2
                elif score < 70:
                    severity = 'low'
                    priority = 3
                else:
                    continue
                
                weaknesses[subject] = {
                    'score': score,
                    'severity': severity,
                    'priority': priority,
                    'improvement_needed': round(70 - score, 1) if score < 70 else 0
                }
        
        # Analyze CSAT subjects
        for subject in self.csat_subjects:
            score_key = f'{subject}_score'
            if score_key in subject_scores:
                score = subject_scores[score_key]
                
                if score < 40:
                    weaknesses[f'CSAT_{subject}'] = {
                        'score': score,
                        'severity': 'high',
                        'priority': 1,
                        'improvement_needed': round(50 - score, 1)
                    }
                elif score < 55:
                    weaknesses[f'CSAT_{subject}'] = {
                        'score': score,
                        'severity': 'medium',
                        'priority': 2,
                        'improvement_needed': round(50 - score, 1)
                    }
        
        # Sort by priority
        weaknesses = dict(sorted(weaknesses.items(), key=lambda x: x[1]['priority']))
        
        return {
            'weak_subjects': weaknesses,
            'weak_count': len(weaknesses),
            'high_priority_count': len([w for w in weaknesses.values() if w['severity'] == 'high']),
            'medium_priority_count': len([w for w in weaknesses.values() if w['severity'] == 'medium']),
            'low_priority_count': len([w for w in weaknesses.values() if w['severity'] == 'low'])
        }
    
    def analyze_strengths(self, subject_scores: Dict) -> Dict:
        """
        Analyze student's strong areas
        
        Args:
            subject_scores: Dictionary of subject scores
            
        Returns:
            Strength analysis dictionary
        """
        strengths = {}
        
        for subject in self.gs_subjects:
            score_key = f'{subject}_score'
            if score_key in subject_scores:
                score = subject_scores[score_key]
                
                if score >= 75:
                    strengths[subject] = {
                        'score': score,
                        'level': 'excellent'
                    }
                elif score >= 65:
                    strengths[subject] = {
                        'score': score,
                        'level': 'good'
                    }
        
        return {
            'strong_subjects': strengths,
            'strong_count': len(strengths),
            'excellent_count': len([s for s in strengths.values() if s['level'] == 'excellent'])
        }
    
    def calculate_success_probability(self, student_data: Dict) -> Dict:
        """
        Calculate probability of success in UPSC Prelims
        
        Args:
            student_data: Dictionary with student scores and metrics
            
        Returns:
            Success probability analysis
        """
        # Get GS and CSAT scores
        gs_scores = [student_data.get(f'{sub}_score', 0) for sub in self.gs_subjects]
        csat_scores = [student_data.get(f'{sub}_score', 0) for sub in self.csat_subjects]
        
        avg_gs = np.mean(gs_scores) if gs_scores else 0
        avg_csat = np.mean(csat_scores) if csat_scores else 0
        
        # Historical success factors
        study_hours = student_data.get('daily_study_hours', 6)
        mock_tests = student_data.get('mock_tests_attempted', 0)
        consistency = student_data.get('study_consistency', 70)
        
        # Calculate probability using weighted factors
        score_factor = (avg_gs * 0.5 + avg_csat * 0.2) / 100
        study_factor = min(1, study_hours / 10) * 0.15
        mock_factor = min(1, mock_tests / 100) * 0.15
        consistency_factor = consistency / 100 * 0.1
        
        probability = (score_factor + study_factor + mock_factor + consistency_factor) * 100
        
        # Cap between 5% and 98%
        probability = max(5, min(98, probability))
        
        # Determine category
        if probability >= 70:
            category = 'High'
            message = 'You have a good chance of qualifying. Maintain your momentum!'
        elif probability >= 40:
            category = 'Medium'
            message = 'You need focused effort in weak areas to improve your chances.'
        else:
            category = 'Low'
            message = 'Significant improvement needed. Start with basics and build gradually.'
        
        return {
            'probability': round(probability, 1),
            'category': category,
            'message': message,
            'factors': {
                'score_factor': round(score_factor * 100, 1),
                'study_factor': round(study_factor * 100, 1),
                'mock_factor': round(mock_factor * 100, 1),
                'consistency_factor': round(consistency_factor * 100, 1)
            }
        }
    
    def analyze_mock_test_performance(self, mock_tests: List[Dict]) -> Dict:
        """
        Analyze mock test performance trends
        
        Args:
            mock_tests: List of mock test result dictionaries
            
        Returns:
            Mock test analysis
        """
        if not mock_tests:
            return {
                'total_tests': 0,
                'average_gs': 0,
                'average_csat': 0,
                'best_performance': None,
                'trend': 'No tests taken'
            }
        
        gs_scores = [test.get('gs_score', 0) for test in mock_tests]
        csat_scores = [test.get('csat_score', 0) for test in mock_tests]
        
        # Calculate averages
        avg_gs = np.mean(gs_scores)
        avg_csat = np.mean(csat_scores)
        
        # Find best performance
        best_index = np.argmax(gs_scores)
        best_performance = mock_tests[best_index] if best_index < len(mock_tests) else None
        
        # Calculate trend (last 5 tests)
        recent_gs = gs_scores[-5:] if len(gs_scores) >= 5 else gs_scores
        trend = 'improving' if len(recent_gs) > 1 and recent_gs[-1] > recent_gs[0] else 'declining' if len(recent_gs) > 1 and recent_gs[-1] < recent_gs[0] else 'stable'
        
        # Calculate improvement rate
        if len(gs_scores) >= 2:
            improvement = gs_scores[-1] - gs_scores[0]
        else:
            improvement = 0
        
        return {
            'total_tests': len(mock_tests),
            'average_gs': round(avg_gs, 1),
            'average_csat': round(avg_csat, 1),
            'best_performance': best_performance,
            'trend': trend,
            'improvement': round(improvement, 1),
            'recent_scores': [
                {'test_name': test.get('test_name', f'Test {i+1}'), 
                 'gs_score': test.get('gs_score', 0),
                 'date': test.get('test_date', '')}
                for i, test in enumerate(mock_tests[-5:])
            ]
        }
    
    def analyze_study_patterns(self, study_logs: List[Dict]) -> Dict:
        """
        Analyze student's study patterns and habits
        
        Args:
            study_logs: List of study log dictionaries
            
        Returns:
            Study pattern analysis
        """
        if not study_logs:
            return {
                'total_days': 0,
                'average_hours': 0,
                'most_studied_subjects': [],
                'best_time': 'No data',
                'streak': 0,
                'consistency_score': 0
            }
        
        # Calculate total study hours
        total_hours = sum(log.get('study_hours', 0) for log in study_logs)
        avg_hours = total_hours / len(study_logs) if study_logs else 0
        
        # Find most studied subjects
        all_subjects = []
        for log in study_logs:
            subjects = log.get('subjects_studied', [])
            if isinstance(subjects, str):
                try:
                    import json
                    subjects = json.loads(subjects)
                except:
                    subjects = []
            all_subjects.extend(subjects)
        
        subject_counts = Counter(all_subjects)
        most_studied = subject_counts.most_common(5)
        
        # Calculate streak
        streak = self._calculate_study_streak(study_logs)
        
        # Calculate consistency score
        study_hours_list = [log.get('study_hours', 0) for log in study_logs]
        if len(study_hours_list) > 1:
            variance = np.var(study_hours_list)
            consistency = max(0, min(100, 100 - (variance / 10)))
        else:
            consistency = 50
        
        # Find most productive time (if available)
        best_time = 'Not enough data'
        time_preferences = [log.get('productive_time', '') for log in study_logs if log.get('productive_time')]
        if time_preferences:
            best_time = Counter(time_preferences).most_common(1)[0][0]
        
        return {
            'total_days': len(study_logs),
            'total_hours': round(total_hours, 1),
            'average_hours': round(avg_hours, 1),
            'most_studied_subjects': [
                {'subject': subject, 'count': count} 
                for subject, count in most_studied
            ],
            'best_time': best_time,
            'streak': streak,
            'consistency_score': round(consistency, 1)
        }
    
    def _calculate_study_streak(self, study_logs: List[Dict]) -> int:
        """Calculate current study streak in days"""
        if not study_logs:
            return 0
        
        # Sort by date
        dates = []
        for log in study_logs:
            date_str = log.get('log_date', '')
            if date_str:
                try:
                    if isinstance(date_str, str):
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                    else:
                        date_obj = date_str
                    dates.append(date_obj)
                except:
                    continue
        
        if not dates:
            return 0
        
        dates = sorted(set(dates), reverse=True)
        
        streak = 1
        expected_date = dates[0]
        
        for log_date in dates[1:]:
            if (expected_date - log_date).days == 1:
                streak += 1
                expected_date = log_date
            else:
                break
        
        return streak
    
    def generate_comparison_insights(self, student_scores: Dict, 
                                     peer_group_stats: Dict) -> Dict:
        """
        Generate insights comparing student with peer group
        
        Args:
            student_scores: Student's subject scores
            peer_group_stats: Peer group statistics
            
        Returns:
            Comparison insights
        """
        insights = {
            'above_average': [],
            'below_average': [],
            'on_par': []
        }
        
        for subject in self.gs_subjects:
            score_key = f'{subject}_score'
            if score_key in student_scores:
                student_score = student_scores[score_key]
                peer_avg = peer_group_stats.get(f'avg_{subject}', 50)
                
                if student_score > peer_avg + 10:
                    insights['above_average'].append({
                        'subject': subject,
                        'student_score': student_score,
                        'peer_avg': peer_avg,
                        'difference': round(student_score - peer_avg, 1)
                    })
                elif student_score < peer_avg - 10:
                    insights['below_average'].append({
                        'subject': subject,
                        'student_score': student_score,
                        'peer_avg': peer_avg,
                        'difference': round(peer_avg - student_score, 1)
                    })
                else:
                    insights['on_par'].append({
                        'subject': subject,
                        'student_score': student_score,
                        'peer_avg': peer_avg
                    })
        
        return insights
    
    def generate_weekly_report(self, student_data: Dict, 
                               study_logs: List[Dict],
                               mock_tests: List[Dict]) -> Dict:
        """
        Generate weekly performance report
        
        Args:
            student_data: Student profile and scores
            study_logs: Weekly study logs
            mock_tests: Weekly mock tests
            
        Returns:
            Weekly report dictionary
        """
        # Get last 7 days of data
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        
        recent_logs = [
            log for log in study_logs 
            if log.get('log_date') and log.get('log_date') >= week_ago
        ]
        
        recent_tests = [
            test for test in mock_tests
            if test.get('test_date') and test.get('test_date') >= week_ago
        ]
        
        # Analyze study patterns
        study_analysis = self.analyze_study_patterns(recent_logs)
        
        # Analyze mock tests
        mock_analysis = self.analyze_mock_test_performance(recent_tests)
        
        # Calculate weekly improvement
        if len(mock_tests) >= 2:
            first_test = mock_tests[0].get('gs_score', 0)
            last_test = mock_tests[-1].get('gs_score', 0)
            weekly_improvement = last_test - first_test
        else:
            weekly_improvement = 0
        
        # Generate recommendations
        recommendations = []
        if study_analysis['average_hours'] < 6:
            recommendations.append("Increase daily study hours to at least 6 hours")
        if mock_analysis['total_tests'] < 2:
            recommendations.append("Take at least 2 mock tests per week")
        if weekly_improvement < 0:
            recommendations.append("Review mistakes from mock tests and practice weak areas")
        
        return {
            'week_start': week_ago.strftime('%Y-%m-%d'),
            'week_end': today.strftime('%Y-%m-%d'),
            'study_summary': {
                'total_hours': study_analysis['total_hours'],
                'average_daily': study_analysis['average_hours'],
                'streak': study_analysis['streak'],
                'consistency': study_analysis['consistency_score']
            },
            'test_summary': {
                'tests_taken': mock_analysis['total_tests'],
                'average_gs': mock_analysis['average_gs'],
                'trend': mock_analysis['trend'],
                'weekly_improvement': weekly_improvement
            },
            'recommendations': recommendations,
            'achievements': self._get_achievements(study_analysis, mock_analysis)
        }
    
    def _get_achievements(self, study_analysis: Dict, mock_analysis: Dict) -> List[str]:
        """Get achievements based on weekly performance"""
        achievements = []
        
        if study_analysis['streak'] >= 7:
            achievements.append("🎯 Perfect attendance - Studied every day this week!")
        elif study_analysis['streak'] >= 5:
            achievements.append("📚 Consistent effort - 5+ days of study streak!")
        
        if study_analysis['total_hours'] >= 40:
            achievements.append("💪 Dedication award - 40+ hours of study this week!")
        elif study_analysis['total_hours'] >= 30:
            achievements.append("⭐ Hard work recognized - 30+ hours of study!")
        
        if mock_analysis['total_tests'] >= 3:
            achievements.append("🏆 Practice Champion - 3+ mock tests this week!")
        
        if mock_analysis['improvement'] > 10:
            achievements.append("📈 Most Improved - Score increased by 10+ points!")
        
        if not achievements:
            achievements.append("🌱 Keep going! Every study session brings you closer to your goal.")
        
        return achievements