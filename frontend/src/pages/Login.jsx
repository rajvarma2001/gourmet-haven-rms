import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login, register, user, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Toggle active tab (login vs register)
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation feedback
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoading(true);

    if (isLogin) {
      // Login flow
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        navigate(redirect);
      }
    } else {
      // Register flow
      if (!name.trim()) {
        setValidationError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const result = await register(name, email, password);
      setLoading(false);
      if (result.success) {
        navigate(redirect);
      }
    }
  };

  const handleTabChange = (loginTab) => {
    setIsLogin(loginTab);
    setValidationError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page container section-padding animate-fade-in">
      <div className="login-card-container">
        {/* Toggle tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(true)}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Card Body */}
        <div className="login-card-body">
          <div className="login-card-header text-center">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="login-card-subtitle">
              {isLogin
                ? 'Sign in to access your Gourmet profile, checkout cart, and tracking status'
                : 'Register to start placing gourmet orders and tracking delivery'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Display Errors */}
            {(validationError || authError) && (
              <div className="login-error animate-fade-in">
                {validationError || authError}
              </div>
            )}

            {/* Registration field (Name) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="registerName">
                  Full Name
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="registerName"
                    type="text"
                    className="form-input has-icon"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label className="form-label" htmlFor="loginEmail">
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="loginEmail"
                  type="email"
                  className="form-input has-icon"
                  placeholder="e.g. food@gourmethaven.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label className="form-label" htmlFor="loginPassword">
                Password
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPasswordInput">
                  Confirm Password
                </label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="confirmPasswordInput"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-icon"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary submit-login-btn" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Mock Login helper for users */}
          <div className="quick-login-helper text-center">
            <span className="helper-label">Quick Admin Login for Testing:</span>
            <button
              className="quick-login-link-btn"
              onClick={() => {
                setIsLogin(true);
                setEmail('admin@haven.com');
                setPassword('admin123');
              }}
            >
              Fill Admin Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
