import React, { useState, useEffect, useRef } from 'react';
import { FaHeartbeat, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ darkMode, onToggleDarkMode, user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`navbar ${darkMode ? 'navbar-dark' : ''}`}>
      <div className="navbar-brand">
        <div className="brand-icon">
          <FaHeartbeat />
        </div>
        <div>
          <p className="brand-subtitle">Health Risk Predictor</p>
          <h1>AI Healthcare Dashboard</h1>
        </div>
      </div>

      <div className="navbar-actions">
        <div className="theme-toggle-container">
          <span className="theme-label">{darkMode ? 'Dark' : 'Light'}</span>
          <label className="theme-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={onToggleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="profile-container" ref={profileRef}>
          <div className="profile-avatar" onClick={toggleProfile}>
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h4>{user.username || 'User'}</h4>
                  <p>Health Dashboard User</p>
                </div>
              </div>
              <div className="profile-details">
                <div className="profile-item">
                  <span className="profile-label">Email:</span>
                  <span className="profile-value">{user.email || 'Not provided'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Member since:</span>
                  <span className="profile-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={onLogout} className="profile-logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
