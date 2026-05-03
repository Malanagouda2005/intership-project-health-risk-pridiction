import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import HealthDashboard from './components/HealthDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load user from localStorage on component mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken && savedToken !== 'undefined') {
        const userData = JSON.parse(savedUser);
        if (userData && typeof userData === 'object') {
          userData.token = savedToken;
          setUser(userData);
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      console.error('Error loading user from storage:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    if (!userData || !userData.token) {
      setError("Login failed: Invalid user data received from server.");
      return;
    }

    try {
      setUser(userData);
      setIsLoggedIn(true);
      setError(null);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email
      }));
      localStorage.setItem('token', userData.token);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(`Login Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (isInitialLoading) {
    return <div className="loading-screen">Loading Health AI...</div>;
  }

  if (error) {
    return (
      <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚠️ App Error</h2>
        <p>{error}</p>
        <button onClick={() => { setError(null); setIsLoggedIn(false); }}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="App">
      {!isLoggedIn || !user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <HealthDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
