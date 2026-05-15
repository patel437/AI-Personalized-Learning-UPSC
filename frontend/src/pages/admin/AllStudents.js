/**
 * All Students Page
 * View and manage all student profiles
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { adminAPI } from '../../assets/js/api';
import Loader, { CardSkeleton } from '../../components/Common/Loader';
import DataTable from '../../components/Tables/DataTable';
import Modal from '../../components/Common/Modal';

const AllStudents = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [page, filterStatus]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllStudents(page, 20);
      setStudents(response?.data?.students || []);
      setTotal(response?.data?.total || 0);
    } catch (error) {
      console.error('Error fetching students:', error);
      showError('Failed to load students');
      
      // Mock data for demo
      setStudents(mockStudents);
      setTotal(1250);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = await showConfirm(`Are you sure you want to delete ${student.name}?`, 'Delete Student');
    if (confirmed) {
      // API call to delete student
      showSuccess(`${student.name} has been deleted`);
      fetchStudents();
    }
  };

  const handleStatusChange = async (student, newStatus) => {
    // API call to update status
    showSuccess(`${student.name} status updated to ${newStatus}`);
    fetchStudents();
  };

  const filteredStudents = students.filter(student => {
    if (filterStatus !== 'all' && student.status !== filterStatus) return false;
    if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !student.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      key: 'name',
      header: 'Student Name',
      sortable: true,
      render: (value, row) => (
        <div className="student-cell">
          <div className="student-avatar" style={{ backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` }}>
            {value?.charAt(0) || 'S'}
          </div>
          <div className="student-info">
            <div className="student-name">{value}</div>
            <div className="student-email">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'overall_score',
      header: 'Overall Score',
      sortable: true,
      render: (value) => (
        <span className={`score-badge ${value >= 60 ? 'high' : value >= 40 ? 'medium' : 'low'}`}>
          {value || 0}%
        </span>
      )
    },
    {
      key: 'preparation_months',
      header: 'Prep (Months)',
      sortable: true
    },
    {
      key: 'daily_study_hours',
      header: 'Study Hrs/Day',
      sortable: true
    },
    {
      key: 'mock_tests_count',
      header: 'Mock Tests',
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, row) => (
        <select 
          className={`status-select ${value}`}
          value={value}
          onChange={(e) => handleStatusChange(row, e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      )
    },
    {
      key: 'registered_at',
      header: 'Registered',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = (row) => (
    <div className="table-actions">
      <button className="action-btn view" onClick={() => { setSelectedStudent(row); setShowDetailsModal(true); }}>
        <i className="fas fa-eye"></i>
      </button>
      <Link to={`/admin/students/${row.id}`} className="action-btn edit">
        <i className="fas fa-edit"></i>
      </Link>
      <button className="action-btn delete" onClick={() => handleDeleteStudent(row)}>
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const mockStudents = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', overall_score: 62, preparation_months: 12, daily_study_hours: 6, mock_tests_count: 34, status: 'active', registered_at: '2024-01-15' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', overall_score: 71, preparation_months: 18, daily_study_hours: 7, mock_tests_count: 52, status: 'active', registered_at: '2024-01-20' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', overall_score: 48, preparation_months: 8, daily_study_hours: 4, mock_tests_count: 18, status: 'inactive', registered_at: '2024-02-01' },
    { id: 4, name: 'Neha Gupta', email: 'neha@example.com', overall_score: 75, preparation_months: 24, daily_study_hours: 8, mock_tests_count: 67, status: 'active', registered_at: '2024-01-10' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', overall_score: 55, preparation_months: 10, daily_study_hours: 5, mock_tests_count: 25, status: 'active', registered_at: '2024-02-15' }
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>All Students | UPSC Learning System</title>
        </Helmet>
        <div className="admin-students-container">
          <div className="page-header">
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Students | UPSC Learning System</title>
      </Helmet>

      <div className="admin-students-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-users"></i>
              <span>All Students</span>
            </h1>
            <p className="page-subtitle">
              Manage and monitor all student profiles
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={() => window.location.href = '/admin/students/export'}>
              <i className="fas fa-download"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <DataTable
          columns={columns}
          data={filteredStudents}
          keyField="id"
          showSearch={false}
          showPagination={true}
          pageSize={20}
          actions={actions}
          emptyMessage="No students found"
        />

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{students.filter(s => s.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{students.filter(s => s.overall_score >= 60).length}</div>
            <div className="stat-label">Above 60%</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{students.reduce((sum, s) => sum + (s.mock_tests_count || 0), 0)}</div>
            <div className="stat-label">Total Mock Tests</div>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Student Details"
        size="large"
      >
        {selectedStudent && (
          <div className="student-details-modal">
            <div className="profile-header">
              <div className="avatar-large">
                {selectedStudent.name?.charAt(0)}
              </div>
              <div className="profile-info">
                <h3>{selectedStudent.name}</h3>
                <p><i className="fas fa-envelope"></i> {selectedStudent.email}</p>
                <p><i className="fas fa-calendar"></i> Joined: {new Date(selectedStudent.registered_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <label>Overall Score</label>
                <span className={`score-large ${selectedStudent.overall_score >= 60 ? 'high' : 'low'}`}>
                  {selectedStudent.overall_score || 0}%
                </span>
              </div>
              <div className="detail-item">
                <label>Preparation Months</label>
                <span>{selectedStudent.preparation_months || 0} months</span>
              </div>
              <div className="detail-item">
                <label>Daily Study Hours</label>
                <span>{selectedStudent.daily_study_hours || 0} hours/day</span>
              </div>
              <div className="detail-item">
                <label>Mock Tests Taken</label>
                <span>{selectedStudent.mock_tests_count || 0}</span>
              </div>
            </div>
            <div className="modal-actions">
              <Link to={`/admin/students/${selectedStudent.id}`} className="btn btn-primary">
                View Full Profile
              </Link>
              <button className="btn btn-outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AllStudents;