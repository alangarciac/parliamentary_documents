import React, { useState } from 'react';
import './App.css';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with credentials:', { ...credentials, password: '***' });
      
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      if (!data.user) {
        throw new Error('No user data received from server');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      console.log('Token stored in localStorage');
      
      // Call onLogin with both user data and token
      onLogin({
        ...data.user,
        token: data.token
      });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      // Clear any existing token on error
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Parlaments v1</h1>
      </header>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="filter-group">
            <label className="filter-label">Username or Email</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="login-input"
              required
              autoComplete="username"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="login-input"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 