/**
 * ScoreHistoryTable Component
 * Displays subject score history over time
 */

import React, { useState } from 'react';
import DataTable from './DataTable';
import { formatDate } from '../../assets/js/utils';

const ScoreHistoryTable = ({ data, subjects = [] }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  // Default subjects if none provided
  const defaultSubjects = [
    'history_score', 'geography_score', 'polity_score', 'economy_score',
    'science_tech_score', 'environment_score', 'current_affairs_score', 'art_culture_score'
  ];

  const subjectDisplayNames = {
    'history_score': 'History',
    'geography_score': 'Geography',
    'polity_score': 'Polity',
    'economy_score': 'Economy',
    'science_tech_score': 'Science & Tech',
    'environment_score': 'Environment',
    'current_affairs_score': 'Current Affairs',
    'art_culture_score': 'Art & Culture',
    'comprehension_score': 'Comprehension',
    'logical_reasoning_score': 'Logical Reasoning',
    'quantitative_score': 'Quantitative Aptitude',
    'data_interpretation_score': 'Data Interpretation',
    'decision_making_score': 'Decision Making'
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#27ae60';
    if (score >= 60) return '#4a90e2';
    if (score >= 45) return '#f39c12';
    return '#e74c3c';
  };

  const calculateOverallScore = (row) => {
    const gsScores = defaultSubjects.map(s => row[s] || 0);
    const csatScores = ['comprehension_score', 'logical_reasoning_score', 'quantitative_score', 
                        'data_interpretation_score', 'decision_making_score'].map(s => row[s] || 0);
    
    const avgGs = gsScores.reduce((a, b) => a + b, 0) / gsScores.length;
    const avgCsat = csatScores.reduce((a, b) => a + b, 0) / csatScores.length;
    
    return Math.round((avgGs * 0.7) + (avgCsat * 0.3));
  };

  const columns = [
    {
      key: 'exam_date',
      header: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'overall',
      header: 'Overall Score',
      sortable: true,
      render: (value, row) => {
        const score = value || calculateOverallScore(row);
        return (
          <span style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
            {score}%
          </span>
        );
      }
    },
    {
      key: 'gs_average',
      header: 'GS Avg',
      sortable: true,
      render: (value, row) => {
        const gsScores = defaultSubjects.map(s => row[s] || 0);
        const avg = Math.round(gsScores.reduce((a, b) => a + b, 0) / gsScores.length);
        return <span style={{ color: getScoreColor(avg) }}>{avg}%</span>;
      }
    },
    {
      key: 'csat_average',
      header: 'CSAT Avg',
      sortable: true,
      render: (value, row) => {
        const csatSubjects = ['comprehension_score', 'logical_reasoning_score', 'quantitative_score', 
                              'data_interpretation_score', 'decision_making_score'];
        const csatScores = csatSubjects.map(s => row[s] || 0);
        const avg = Math.round(csatScores.reduce((a, b) => a + b, 0) / csatScores.length);
        return <span style={{ color: getScoreColor(avg) }}>{avg}%</span>;
      }
    },
    {
      key: 'improvement',
      header: 'vs Previous',
      sortable: true,
      render: (value, row, index, allData) => {
        if (index === 0) return '-';
        const prevScore = calculateOverallScore(allData[index - 1]);
        const currentScore = calculateOverallScore(row);
        const change = currentScore - prevScore;
        
        if (change === 0) return <span className="no-change">0</span>;
        return (
          <span className={change > 0 ? 'positive-change' : 'negative-change'}>
            {change > 0 ? '+' : ''}{change}%
            <i className={`fas fa-arrow-${change > 0 ? 'up' : 'down'}`}></i>
          </span>
        );
      }
    }
  ];

  // Add subject columns if specific subjects are requested
  const getDynamicColumns = () => {
    if (subjects.length === 0) return columns;
    
    const subjectColumns = subjects.map(subject => ({
      key: subject,
      header: subjectDisplayNames[subject] || subject.replace('_score', '').replace('_', ' '),
      sortable: true,
      render: (value) => (
        <span style={{ color: getScoreColor(value || 0) }}>
          {value || 0}%
        </span>
      )
    }));
    
    return [...columns.slice(0, 2), ...subjectColumns, ...columns.slice(2)];
  };

  const actions = (row) => (
    <div className="table-actions">
      <button 
        className="action-btn view" 
        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
        title="View Details"
      >
        <i className={`fas fa-chevron-${expandedRow === row.id ? 'up' : 'down'}`}></i>
      </button>
    </div>
  );

  // Custom row renderer for expanded details
  const renderExpandedRow = (row) => {
    if (expandedRow !== row.id) return null;
    
    const allSubjects = [...defaultSubjects, 'comprehension_score', 'logical_reasoning_score', 
                         'quantitative_score', 'data_interpretation_score', 'decision_making_score'];
    
    return (
      <tr className="expanded-row">
        <td colSpan={columns.length + 1}>
          <div className="expanded-content">
            <h4>Detailed Subject Scores</h4>
            <div className="subject-scores-grid">
              {allSubjects.map(subject => (
                <div key={subject} className="subject-score-item">
                  <span className="subject-name">{subjectDisplayNames[subject] || subject}</span>
                  <div className="subject-score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${row[subject] || 0}%`, backgroundColor: getScoreColor(row[subject] || 0) }}
                    ></div>
                  </div>
                  <span className="subject-score">{row[subject] || 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="score-history-table">
      <DataTable
        columns={getDynamicColumns()}
        data={data}
        keyField="id"
        showSearch={true}
        showPagination={true}
        pageSize={10}
        actions={actions}
        emptyMessage="No score records found. Add your subject scores to track progress!"
      />
      {/* Note: Expanded row rendering would need modification of DataTable to support this */}
    </div>
  );
};

export default ScoreHistoryTable;