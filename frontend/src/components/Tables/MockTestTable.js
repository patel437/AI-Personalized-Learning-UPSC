/**
 * MockTestTable Component
 * Specialized table for mock test data with performance indicators
 */

import React from 'react';
import DataTable from './DataTable';
import { formatDate } from '../../assets/js/utils';

const MockTestTable = ({ data, onViewDetails, onDelete }) => {
  
  const getScoreColor = (score) => {
    if (score >= 150) return '#27ae60';
    if (score >= 120) return '#4a90e2';
    if (score >= 100) return '#f39c12';
    return '#e74c3c';
  };

  const getQualificationStatus = (gsScore, csatScore) => {
    if (gsScore >= 100 && csatScore >= 66) {
      return { text: 'Qualified', color: '#27ae60', icon: 'fas fa-check-circle' };
    }
    if (gsScore >= 90 && csatScore >= 60) {
      return { text: 'Borderline', color: '#f39c12', icon: 'fas fa-exclamation-triangle' };
    }
    return { text: 'Not Qualified', color: '#e74c3c', icon: 'fas fa-times-circle' };
  };

  const columns = [
    {
      key: 'test_name',
      header: 'Test Name',
      sortable: true,
      width: '25%'
    },
    {
      key: 'test_date',
      header: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'gs_score',
      header: 'GS Score',
      sortable: true,
      render: (value, row) => (
        <span style={{ color: getScoreColor(value), fontWeight: 'bold' }}>
          {value}/200
        </span>
      )
    },
    {
      key: 'csat_score',
      header: 'CSAT Score',
      sortable: true,
      render: (value) => (
        <span style={{ color: value >= 66 ? '#27ae60' : '#e74c3c' }}>
          {value}/200
        </span>
      )
    },
    {
      key: 'total_score',
      header: 'Total',
      sortable: true,
      render: (value, row) => (row.gs_score + row.csat_score) + '/400'
    },
    {
      key: 'accuracy',
      header: 'Accuracy',
      sortable: true,
      render: (value) => value ? `${value}%` : '-'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, row) => {
        const status = getQualificationStatus(row.gs_score, row.csat_score);
        return (
          <span className="status-badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
            <i className={status.icon}></i>
            <span>{status.text}</span>
          </span>
        );
      }
    }
  ];

  const actions = (row) => (
    <div className="table-actions">
      <button className="action-btn view" onClick={() => onViewDetails(row)} title="View Details">
        <i className="fas fa-eye"></i>
      </button>
      <button className="action-btn delete" onClick={() => onDelete(row)} title="Delete">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="id"
      showSearch={true}
      showPagination={true}
      pageSize={10}
      onRowClick={onViewDetails}
      actions={actions}
      emptyMessage="No mock test records found. Add your first test result!"
    />
  );
};

export default MockTestTable;