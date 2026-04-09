import React, { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../utils/roleRedirect';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isAdminMode = location.pathname === '/admin/login';

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = t('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.password = t('Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('Password must be at least 6 characters');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (isAdminMode && result.user?.role !== 'admin') {
        logout();
        setError(t('Only admin users can login on the admin page.'));
        setLoading(false);
        return;
      }

      if (!isAdminMode && result.user?.role === 'admin') {
        logout();
        setError(t('Admin users must login from the admin login page.'));
        setLoading(false);
        return;
      }

      setSuccess(t('Login successful! Redirecting...'));
      setTimeout(() => {
        navigate(getDefaultRouteForRole(result.user?.role));
      }, 900);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card login-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="auth-title">
          {isAdminMode ? t('Admin Login') : t('Welcome Back')}
        </motion.h1>
        <motion.p variants={itemVariants} className="auth-subtitle">
          {isAdminMode ? t('Admin only access to the dashboard') : t('Sign in to access your account')}
        </motion.p>

        {error && (
          <motion.div
            variants={itemVariants}
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            variants={itemVariants}
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="email">{t('Email Address')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('your.email@example.com')}
              className={validationErrors.email ? 'input-error' : ''}
              required
            />
            {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
          </motion.div>

          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="password">{t('Password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('Enter password')}
              className={validationErrors.password ? 'input-error' : ''}
              required
            />
            {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
          </motion.div>

          <motion.button variants={itemVariants} type="submit" disabled={loading} className="btn-submit auth-submit-button">
            <span>{loading ? t('Logging in...') : isAdminMode ? t('Login as Admin') : t('Login')}</span>
          </motion.button>
        </form>

        <motion.p variants={itemVariants} className="auth-footer">
          {isAdminMode ? (
            <Link to="/login" className="auth-link">
              {t('Go to user login')}
            </Link>
          ) : (
            <>
              {t("Don't have an account yet?")}{' '}
              <Link to="/signup" className="auth-link">
                {t('Sign up here')}
              </Link>
            </>
          )}
        </motion.p>
      </motion.div>

      <motion.div className="auth-bg" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 2 }}>
        <motion.div
          className="bg-circle bg-1"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="bg-circle bg-2"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
};

export default Login;
