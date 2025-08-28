import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer'
import './Admin.css';
import { adminAPI } from '../../services/api';

const Admin = ({ adminDetail, setAdminDetail, setListCompany }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [showError, setShowError] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState('');

  const topRef = useRef(null);

  const navigate = useNavigate();

  const showErrorMessage = (message) => {
    setShowError(true);
    setError(message);
    setShowSuccess(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showSuccessMessage = (message) => {
    setShowSuccess(true);
    setSuccess(message);
    setShowError(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      setShowSuccess(false);
      setSuccess('');
    }, 3000);
  };

  const clearMessages = () => {
    setShowError(false);
    setShowSuccess(false);
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = () => {
    clearMessages();

    if (newPassword !== confirmPassword) {
      showErrorMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showErrorMessage('Password must be at least 6 characters');
      return;
    }

    setAdminDetail({
      ...adminDetail,
      password: newPassword
    });
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    showSuccessMessage('Password changed successfully');
  };

  const handleFileChange = (e) => {
    clearMessages();
    const file = e.target.files[0];

    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      showErrorMessage('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    clearMessages();

    if (!selectedFile) {
      showErrorMessage('Please select a CSV file first');
      return;
    }

    if (!companyName.trim()) {
      showErrorMessage('Please enter a company name');
      return;
    }

    const fileName = selectedFile.name.replace(".csv", "").toLowerCase();
    const companyNameLower = companyName.trim().toLowerCase();

    if (fileName !== companyNameLower) {
      showErrorMessage("File name should be same as company name");
      return;
    }

    setUploadStatus('Uploading and processing CSV...');

    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      formData.append('companyName', companyName.trim());

      const result = await adminAPI.uploadCSV(formData);

      if (result.success) {
        setListCompany(prev => {
          const companyLower = companyName.toLowerCase();
          if (!prev.includes(companyLower)) {
            return [...prev, companyLower];
          }
          return prev;
        });

        setUploadStatus('');
        setSelectedFile(null);
        setCompanyName('');
        showSuccessMessage(`${result.message}! (${result.count} questions uploaded)`);
      } else {
        showErrorMessage(result.error || 'Upload failed');
        setUploadStatus('');
      }

    } catch (error) {
      showErrorMessage(`Upload failed: ${error.error || error.message}`);
      setUploadStatus('');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setAdminDetail({ name: '', email: '', password: '' });
      localStorage.removeItem('admin');
      navigate('/');
    }
  };

  return (
    <div className="admin-container">
      <div ref={topRef}></div>

      <div className="admin-header" id="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="message-container">
        {showError && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="success-message">
            {success}
          </div>
        )}
      </div>

      <div className="admin-content">
        <div className="admin-profile">
          <h2>Admin Profile</h2>

          <div className="profile-section">
            <div className="profile-item">
              <label>Name:</label>
              <span className="profile-value">{adminDetail.name || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <label>Email:</label>
              <span className="profile-value">{adminDetail.email || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <label>Password:</label>
              <span className="profile-value">{adminDetail.password}</span>
            </div>

            <div className="profile-item">
              <button
                className="change-password-btn"
                onClick={() => {
                  setShowPasswordChange(!showPasswordChange);
                  clearMessages();
                }}
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordChange && (
              <div className="password-change-section">
                <div className="form-group">
                  <label>New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearMessages();
                    }}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearMessages();
                    }}
                    placeholder="Confirm new password"
                  />
                </div>
                <button className="update-password-btn" onClick={handlePasswordChange}>
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="upload-section">
          <h2>Upload Questions</h2>

          <div className="warning">
            <h3>CSV File Format Requirements</h3>
            <p>CSV file should contain the following columns in this exact order:</p>
            <ul>
              <li><strong>Difficulty</strong> - Easy, Medium, Hard</li>
              <li><strong>Title</strong> - Question title</li>
              <li><strong>Frequency</strong> - Number (0-100)</li>
              <li><strong>Acceptance Rate</strong> - Percentage (e.g., 45.2%)</li>
              <li><strong>Link</strong> - LeetCode URL</li>
              <li><strong>Topics</strong> - Comma-separated tags</li>
            </ul>
            <p><strong>Note:</strong> File Name should be same as Company Name</p>
          </div>

          <div className="upload-form">
            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  clearMessages();
                }}
                placeholder="Enter company name (e.g., Google)"
                className="company-input"
              />
            </div>

            <div className="form-group">
              <label>Select CSV File:</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
              {selectedFile && (
                <div className="file-info">
                  <span>Selected: {selectedFile.name}</span>
                </div>
              )}
            </div>

            <button
              className="upload-btn"
              onClick={handleFileUpload}
              disabled={!selectedFile || !companyName.trim()}
            >
              Upload Questions
            </button>

            {uploadStatus && (
              <div className="upload-status loading">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
