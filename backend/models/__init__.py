"""
Models Package for UPSC Learning System
Contains ML models and recommendation engine
"""

from .ml_models import UPSCPerformancePredictor
from .performance_predictor import PerformancePredictor
from .recommendation_engine import UPSCRecommendationEngine

__all__ = [
    'UPSCPerformancePredictor',
    'PerformancePredictor',
    'UPSCRecommendationEngine'
]