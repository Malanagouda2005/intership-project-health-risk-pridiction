import React, { useState, useEffect } from 'react';
import './Login.css';
// import getApiBaseUrl, { isAndroidPlatform, API_OVERRIDE_STORAGE_KEY, isCapacitorWebView } from '../apiConfig';
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
  // const [backendError, setBackendError] = useState('');
  const [apiBase, setApiBase] = useState(getApiBaseUrl());

  const normalizeApiUrl = (value) => {
    if (!value) return '';
    let url = "https://health-ai-project-internship-app-final.onrender.com/";
    if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
    try {
      return new URL(url).origin;
    } catch {
      return '';
    }
  };

  // Log platform info on mount
  useEffect(() => {
    // console.log('[Login] Platform Detection:');
    // console.log('  - Is Android:', isAndroidPlatform());
    // console.log('  - Is Capacitor WebView:', isCapacitorWebView());
    // console.log('  - User Agent:', navigator.userAgent);
    // console.log('  - Window Location:', window.location.href);
    // console.log('  - Backend URL:', apiBase);
  }, [apiBase]);

  // Test backend connection
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const testConnection = async () => {
      if (!apiBase) {
        if (isMounted) {
          setBackendStatus('error');
          setBackendError('Backend URL is invalid');
        }
        return;
      }

      try {
        setBackendStatus('checking');
        setBackendError('');
        // console.log('[Login] Sending status request to', `${apiBase}/api/status`);

        const timeoutId = window.setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${apiBase}/api/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        window.clearTimeout(timeoutId);
        // console.log('[Login] Status response', response.status, response.statusText);

        if (!isMounted) return;

        if (response.ok) {
          setBackendStatus('connected');
          setBackendError('');
        } else {
          setBackendStatus('error');
          setBackendError(`${response.status} ${response.statusText}`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Connection test failed:', err);
        setBackendStatus('error');
        setBackendError(err.name === 'AbortError' ? 'Request timed out' : err.message);
      }
    };

    const timer = window.setTimeout(testConnection, 500);
    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [apiBase]);

  const handleUpdateApi = () => {
    const rawValue = prompt('Enter Backend URL (e.g. http://192.168.1.5:5000):', apiBase);
    if (!rawValue) return;

    const normalized = normalizeApiUrl(rawValue);
    if (normalized) {
      localStorage.setItem(API_OVERRIDE_STORAGE_KEY, normalized);
      setApiBase(normalized);
      setError('');
      setBackendError('');
    } else {
      alert('Enter a valid backend URL like http://10.75.149.30:5000');
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
      // console.log('[Login] Sending request to', endpoint, 'payload:', {
      //   ...payload,
      //   password: payload.password ? '***' : undefined
      // });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      // console.log('[Login] Response body:', data);

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
          <h1>Health AI</h1>
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

        {/* <div className="status-indicator">
          <div className={`status-dot ${backendStatus}`}></div>
          <div className="status-info">
            <span>Backend: {backendStatus === 'connected' ? 'Online' : backendStatus === 'checking' ? 'Connecting...' : 'Offline'}</span>
            <span className="current-api">{apiBase}</span>
            {backendError && <span className="backend-error">{backendError}</span>}
          </div>
          <button onClick={handleUpdateApi} className="change-btn">Change Server</button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
