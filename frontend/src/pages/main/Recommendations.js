/**
 * Recommendations Page
 * Displays personalized recommendations, study plan, and resources
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { recommendationsAPI, scoresAPI } from '../../assets/js/api';
import Loader, { CardSkeleton } from '../../components/Common/Loader';

// Import recommendation components
import RecommendationList from '../../components/Recommendations/RecommendationList';
import RecommendationFilters from '../../components/Recommendations/RecommendationFilters';
import StudyPlanView from '../../components/Recommendations/StudyPlanView';
import ResourceItem from '../../components/Recommendations/ResourceItem';

const Recommendations = () => {
  const { user, studentProfile } = useAuth();
  const { showError, showSuccess, showLoading, updateLoading } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    subject: 'all'
  });
  const [weaknesses, setWeaknesses] = useState({});
  const [improvementPrediction, setImprovementPrediction] = useState(null);

  // Fetch recommendations on load
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await recommendationsAPI.getRecommendations();
      setRecommendations(response?.data?.recommendations || []);
      
      // Also check if we have existing recommendations, if not, generate
      if (!response?.data?.recommendations || response.data.recommendations.length === 0) {
        await generateRecommendations();
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // If no recommendations, generate new ones
      await generateRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    const toastId = showLoading('Analyzing your performance and generating recommendations...');
    
    try {
      // Get latest scores first
      const scoresRes = await scoresAPI.getLatestScores();
      const studentScores = scoresRes?.data?.scores;
      
      if (!studentScores) {
        showError('Please add your subject scores first to get recommendations');
        setGenerating(false);
        updateLoading(toastId, 'No scores found. Please add your scores first.', 'error');
        return;
      }
      
      // Generate recommendations
      const response = await recommendationsAPI.generateRecommendations({
        daily_study_hours: studentProfile?.daily_study_hours || 6
      });
      
      if (response?.data?.recommendations) {
        const recData = response.data.recommendations;
        setRecommendations(recData.recommendations || []);
        setStudyPlan(recData.study_plan);
        setResources(recData.recommended_resources || []);
        setWeaknesses(recData.weaknesses || {});
        setImprovementPrediction(recData.improvement_prediction);
        
        updateLoading(toastId, 'Recommendations generated successfully!', 'success');
        showSuccess('New personalized recommendations are ready for you!');
      } else {
        updateLoading(toastId, 'Failed to generate recommendations', 'error');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      updateLoading(toastId, error?.message || 'Failed to generate recommendations', 'error');
      showError('Failed to generate recommendations. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRecommendationAction = async (recId, action) => {
    try {
      if (action === 'view') {
        await recommendationsAPI.markAsViewed(recId);
        setRecommendations(prev => prev.map(rec => 
          rec.id === recId ? { ...rec, status: 'viewed' } : rec
        ));
      } else if (action === 'complete') {
        await recommendationsAPI.markAsCompleted(recId);
        setRecommendations(prev => prev.map(rec => 
          rec.id === recId ? { ...rec, status: 'completed' } : rec
        ));
        showSuccess('Great job! Keep up the momentum!');
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  // Filter recommendations based on filters
  const getFilteredRecommendations = () => {
    let filtered = [...recommendations];
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === filters.priority);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(rec => rec.recommendation_type === filters.type);
    }
    
    if (filters.subject !== 'all') {
      filtered = filtered.filter(rec => rec.subject === filters.subject);
    }
    
    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  // Get counts by priority
  const getPriorityCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    recommendations.forEach(rec => {
      if (rec.priority === 'high') counts.high++;
      else if (rec.priority === 'medium') counts.medium++;
      else if (rec.priority === 'low') counts.low++;
    });
    return counts;
  };

  const priorityCounts = getPriorityCounts();

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Recommendations | UPSC Learning System</title>
        </Helmet>
        <div className="recommendations-container">
          <div className="recommendations-header">
            <CardSkeleton />
          </div>
          <div className="recommendations-content">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Recommendations | UPSC Learning System</title>
        <meta name="description" content="Personalized recommendations for your UPSC preparation" />
      </Helmet>

      <div className="recommendations-container">
        {/* Header Section */}
        <div className="recommendations-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-lightbulb"></i>
              <span>Personalized Recommendations</span>
            </h1>
            <p className="page-subtitle">
              AI-powered suggestions to improve your weak areas and boost your score
            </p>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-primary"
              onClick={generateRecommendations}
              disabled={generating}
            >
              {generating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i>
                  <span>Generate New Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Improvement Prediction Banner */}
        {improvementPrediction && (
          <div className="improvement-banner">
            <div className="banner-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="banner-content">
              <h3>Estimated Improvement</h3>
              <p>
                By following these recommendations, your score could increase by 
                <strong> +{improvementPrediction.estimated_improvement}%</strong> 
                in approximately <strong>{improvementPrediction.weeks_needed} weeks</strong>
              </p>
            </div>
            <div className="banner-stats">
              <div className="stat">
                <span className="stat-label">Current Score</span>
                <span className="stat-value">{improvementPrediction.current_score}%</span>
              </div>
              <div className="stat-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="stat">
                <span className="stat-label">Predicted Score</span>
                <span className="stat-value highlight">{improvementPrediction.predicted_score}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Priority Summary Cards */}
        <div className="priority-summary">
          <div className="priority-card high">
            <div className="priority-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="priority-info">
              <span className="priority-count">{priorityCounts.high}</span>
              <span className="priority-label">High Priority</span>
            </div>
          </div>
          <div className="priority-card medium">
            <div className="priority-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="priority-info">
              <span className="priority-count">{priorityCounts.medium}</span>
              <span className="priority-label">Medium Priority</span>
            </div>
          </div>
          <div className="priority-card low">
            <div className="priority-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="priority-info">
              <span className="priority-count">{priorityCounts.low}</span>
              <span className="priority-label">Low Priority</span>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="recommendations-layout">
          {/* Left Column - Study Plan */}
          <div className="left-column">
            {studyPlan && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-calendar-week"></i>
                    <span>Weekly Study Plan</span>
                  </h3>
                  <button className="btn-icon" title="Download Plan">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
                <div className="card-body">
                  <StudyPlanView studyPlan={studyPlan} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div className="right-column">
            {/* Filters */}
            <RecommendationFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              recommendations={recommendations}
            />

            {/* Recommendations List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-list"></i>
                  <span>Recommendations ({filteredRecommendations.length})</span>
                </h3>
              </div>
              <div className="card-body p-0">
                <RecommendationList 
                  recommendations={filteredRecommendations}
                  onAction={handleRecommendationAction}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        {resources.length > 0 && (
          <div className="resources-section">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-book"></i>
                  <span>Recommended Resources</span>
                </h3>
                <button className="btn-link">View All Resources →</button>
              </div>
              <div className="card-body">
                <div className="resources-grid">
                  {resources.slice(0, 6).map((resource, index) => (
                    <ResourceItem key={index} resource={resource} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motivation Section */}
        {improvementPrediction?.motivation_message && (
          <div className="motivation-section">
            <div className="card motivation-card">
              <i className="fas fa-quote-left"></i>
              <p className="motivation-text">{improvementPrediction.motivation_message}</p>
              <div className="motivation-footer">
                <i className="fas fa-heart"></i>
                <span>Stay consistent, stay motivated!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Recommendations;