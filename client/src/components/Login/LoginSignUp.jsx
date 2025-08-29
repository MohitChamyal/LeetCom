import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './LoginSignUp.css';

const LoginSignUp = ({ setAdminDetail }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    secretKey: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    ;
    const testConnection = async () => {
      try {
        await adminAPI.testConnection();
      } catch (error) {
        console.log(error.message);
      }
    };
    testConnection();
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
    setError('');
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!loginData.email || !loginData.password) {
        setError('Please fill in all fields');
        return;
      }

      const response = await adminAPI.login(loginData);

      if (response.success && response.admin) {
        localStorage.setItem('admin', JSON.stringify(response.admin));
        setAdminDetail(response.admin);
        setSuccess('Login successful! Redirecting...');

        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setError('Invalid response from server');
      }

    } catch (error) {
      const errorMessage = error.error || error.message || 'Admin login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!signupData.name) {
        setError('Name is required');
        return;
      }

      if (!signupData.email) {
        setError('Email is required');
        return;
      }

      if (!signupData.password) {
        setError('Password is required');
        return;
      }

      if (signupData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (!signupData.secretKey) {
        setError('Admin secret key is required');
        return;
      }

      const response = await adminAPI.signup(signupData);

      if (response.success) {
        setSuccess('Admin registration successful! You can now login.');
        setIsLogin(true);
        
        setSignupData({
          name: '',
          email: '',
          password: '',
          secretKey: ''
        });
      }
    } catch (error) {
      setError(error.error || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuth = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-container">
      <div className={isLogin ? 'login' : 'signup'}>
        <h2 className="auth-title">
          {isLogin ? 'Admin Login' : 'Admin Registration'}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Access the admin dashboard'
            : 'Create a new admin account'
          }
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Admin Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create password (min 6 characters)"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Admin Secret Key</label>
              <input
                type="password"
                name="secretKey"
                value={signupData.secretKey}
                onChange={handleSignupChange}
                placeholder="Enter admin secret key"
                required
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Contact system administrator for the secret key
              </small>
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating admin account...' : 'Create Admin Account'}
            </button>
          </form>
        )}

        <div className="toggle-auth">
          <span className="form-footer">
            {isLogin ? "Need to create admin account? " : "Already have admin account? "}
            <span
              className="toggle-link"
              onClick={handleToggleAuth}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;
