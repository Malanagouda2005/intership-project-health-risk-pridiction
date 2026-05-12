import React, { useState, useEffect } from 'react';
import './Login.css';
import getApiBaseUrl from '../apiConfig';

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

  const [apiBase] = useState(
    'https://health-ai-project-internship-app-final.onrender.com'
  );

  // Test backend connection
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const testConnection = async () => {
      if (!apiBase) {
        if (isMounted) {
          setBackendStatus('error');
        }
        return;
      }

      try {
        setBackendStatus('checking');

        const timeoutId = window.setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${apiBase}/api/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        window.clearTimeout(timeoutId);

        if (!isMounted) return;

        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        if (!isMounted) return;

        console.error('Connection test failed:', err);
        setBackendStatus('error');
      }
    };

    const timer = window.setTimeout(testConnection, 500);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [apiBase]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setEmailError('');
    }
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

    if (
      mode === 'register' &&
      formData.password !== formData.confirmPassword
    ) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint =
        mode === 'login'
          ? `${apiBase}/auth/login`
          : `${apiBase}/users`;

      const payload =
        mode === 'login'
          ? {
              username: formData.email,
              email: formData.email,
              password: formData.password
            }
          : {
              name: formData.email.split('@')[0],
              username: formData.email,
              email: formData.email,
              password: formData.password
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      setError(
        `Network error: ${err.message}. Check your internet and server status.`
      );
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

          <p>
            {isRegister
              ? 'Create an account'
              : 'Sign in to your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          {emailError && (
            <span className="field-error">{emailError}</span>
          )}

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          {isRegister && (
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading || backendStatus === 'error'}
          >
            {isLoading
              ? 'Wait...'
              : isRegister
              ? 'Register'
              : 'Login'}
          </button>
        </form>

        <div className="auth-toggle">
          <span
            onClick={() =>
              setMode(isRegister ? 'login' : 'register')
            }
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
