import React, { useState, useEffect } from 'react';
import './Login.css';
import getApiBaseUrl, { API_OVERRIDE_STORAGE_KEY } from '../apiConfig';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiBase, setApiBase] = useState(getApiBaseUrl());

  // Test backend connection
  useEffect(() => {
    let isMounted = true;
    const testConnection = async () => {
      try {
        setBackendStatus('checking');
        const response = await fetch(`${apiBase}/api/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        if (isMounted) {
          if (response.ok) {
            setBackendStatus('connected');
          } else {
            setBackendStatus('error');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Connection test failed:', err);
          setBackendStatus('error');
        }
      }
    };

    const timer = setTimeout(testConnection, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [apiBase]);

  const handleUpdateApi = () => {
    const newApi = prompt('Enter Backend URL (e.g. http://192.168.1.5:5000):', apiBase);
    if (newApi && newApi.startsWith('http')) {
      localStorage.setItem(API_OVERRIDE_STORAGE_KEY, newApi);
      setApiBase(newApi);
      setError('');
    } else if (newApi) {
      alert('URL must start with http:// or https://');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    if (!validateEmail(formData.email)) {
      setEmailError('Invalid email format');
      setIsLoading(false);
      return;
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? `${apiBase}/auth/login` : `${apiBase}/users`;
      const payload = mode === 'login' ? {
        username: formData.email,
        email: formData.email,
        password: formData.password
      } : {
        name: formData.email.split('@')[0],
        username: formData.email,
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        onLogin({
          username: data.username || formData.email,
          email: data.email || formData.email,
          id: data.user_id,
          token: data.api_key,
          loginTime: new Date().toISOString()
        });
      } else {
        setError(data.error || data.message || 'Server error');
      }
    } catch (err) {
      setError(`Network error: ${err.message}. Check your internet and server status.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="login-container">
      <div className="auth-card">
        <div className="card-header">
          <div className="brand-icon">🏥</div>
          <h2>Health AI</h2>
          <p>{isRegister ? 'Create an account' : 'Sign in to your dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          {emailError && <span className="field-error">{emailError}</span>}

          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />

          {isRegister && (
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={isLoading || backendStatus === 'error'}>
            {isLoading ? 'Wait...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="auth-toggle">
          <span onClick={() => setMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </span>
        </div>

        <div className="status-indicator">
          <div className={`status-dot ${backendStatus}`}></div>
          <span>Backend: {backendStatus === 'connected' ? 'Online' : backendStatus === 'checking' ? 'Connecting...' : 'Offline'}</span>
          <button onClick={handleUpdateApi} className="change-btn">Change Server</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
