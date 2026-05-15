/**
 * Profile Page
 * View and edit user profile and student information
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { authAPI } from '../../assets/js/api';
import Loader from '../../components/Common/Loader';
import Modal from '../../components/Common/Modal';
import ProfileForm from '../../components/Forms/ProfileForm';
import PasswordChangeForm from '../../components/Forms/PasswordChangeForm';

const Profile = () => {
  const { user, studentProfile, loadStudentProfile, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!studentProfile) {
      loadStudentProfile();
    }
  }, []);

  const handleProfileUpdate = async (profileData) => {
    const result = await updateProfile(profileData);
    if (result.success) {
      showSuccess('Profile updated successfully');
      setShowEditModal(false);
      loadStudentProfile();
    } else {
      showError(result.error || 'Failed to update profile');
    }
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Profile | UPSC Learning System</title>
      </Helmet>

      <div className="profile-container">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-user"></i>
              <span>My Profile</span>
            </h1>
            <p className="page-subtitle">View and manage your account information</p>
          </div>
          <div className="header-right">
            <button className="btn btn-outline" onClick={() => setShowEditModal(true)}>
              <i className="fas fa-edit"></i>
              <span>Edit Profile</span>
            </button>
            <button className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>
              <i className="fas fa-key"></i>
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card-main">
          <div className="profile-avatar">
            <div className="avatar-large">{getInitials()}</div>
            <button className="avatar-edit-btn">
              <i className="fas fa-camera"></i>
            </button>
          </div>
          <div className="profile-info">
            <h2>{user?.full_name || user?.username}</h2>
            <p className="profile-email"><i className="fas fa-envelope"></i> {user?.email}</p>
            {user?.phone && <p className="profile-phone"><i className="fas fa-phone"></i> {user?.phone}</p>}
            <p className="profile-member"><i className="fas fa-calendar-alt"></i> Member since {new Date(user?.created_at).getFullYear()}</p>
          </div>
        </div>

        {/* Student Profile Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-graduation-cap"></i>
              <span>UPSC Preparation Details</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <label>Age</label>
                <span>{studentProfile?.age || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{studentProfile?.gender || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Graduation Stream</label>
                <span>{studentProfile?.graduation_stream || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Graduation Percentage</label>
                <span>{studentProfile?.graduation_percentage ? `${studentProfile.graduation_percentage}%` : 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Preparation Months</label>
                <span>{studentProfile?.preparation_months || 'Not set'} months</span>
              </div>
              <div className="info-item">
                <label>Daily Study Hours</label>
                <span>{studentProfile?.daily_study_hours || 'Not set'} hours/day</span>
              </div>
              <div className="info-item">
                <label>Attempt Number</label>
                <span>{studentProfile?.attempt_number || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Previous Prelims Qualified</label>
                <span>{studentProfile?.previous_prelims_qualified ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Coaching</label>
                <span>{studentProfile?.coaching || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>NCERT Read</label>
                <span>{studentProfile?.ncert_read ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Standard Books</label>
                <span>{studentProfile?.standard_books ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Target Exam Year</label>
                <span>{studentProfile?.target_exam_year || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Profile"
          size="large"
        >
          <ProfileForm 
            initialData={{ ...user, ...studentProfile }}
            onSubmit={handleProfileUpdate}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          size="small"
        >
          <PasswordChangeForm 
            onSubmit={() => setShowPasswordModal(false)}
            onCancel={() => setShowPasswordModal(false)}
          />
        </Modal>
      </div>
    </>
  );
};

export default Profile;