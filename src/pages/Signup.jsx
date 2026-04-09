import React, { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../utils/roleRedirect';
import '../styles/auth.css';

const Signup = () => {
  const { user, register } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = t('Full name is required');
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = t('Name must be at least 3 characters');
    }

    if (!formData.email.trim()) {
      errors.email = t('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.password = t('Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('Password must be at least 6 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t('Password must contain uppercase, lowercase, and number');
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('Passwords do not match');
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
    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.role
    );

    if (result.success) {
      setSuccess(t('Account created successfully! Redirecting...'));
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
      <motion.div className="auth-card signup-card" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 variants={itemVariants} className="auth-title">
          {t('Create Account')}
        </motion.h1>
        <motion.p variants={itemVariants} className="auth-subtitle">
          {t('Join our platform to book appointments')}
        </motion.p>

        {error && (
          <motion.div variants={itemVariants} className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div variants={itemVariants} className="success-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="signup-form-grid">
          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="fullName">{t('Full Name')}</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t('John Doe')} className={validationErrors.fullName ? 'input-error' : ''} required />
            {validationErrors.fullName && <span className="field-error">{validationErrors.fullName}</span>}
          </motion.div>

          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="email">{t('Email Address')}</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('your.email@example.com')} className={validationErrors.email ? 'input-error' : ''} required />
            {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
          </motion.div>

          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="password">{t('Password')}</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={t('Enter password')} className={validationErrors.password ? 'input-error' : ''} required />
            {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
            <small className="password-hint">{t('Requires uppercase, lowercase, and number')}</small>
          </motion.div>

          <motion.div variants={itemVariants} className="form-group">
            <label htmlFor="confirmPassword">{t('Confirm Password')}</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t('Confirm password')} className={validationErrors.confirmPassword ? 'input-error' : ''} required />
            {validationErrors.confirmPassword && <span className="field-error">{validationErrors.confirmPassword}</span>}
          </motion.div>

          <motion.div variants={itemVariants} className="form-group form-group-full">
            <label htmlFor="role">{t('Register as')}</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="patient">{t('Patient')}</option>
              <option value="doctor">{t('Doctor')}</option>
            </select>
          </motion.div>

          <motion.button variants={itemVariants} type="submit" disabled={loading} className="btn-submit auth-submit-button form-group-full">
            <span>{loading ? t('Creating Account...') : t('Sign Up')}</span>
          </motion.button>
        </form>

        <motion.p variants={itemVariants} className="auth-footer">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="auth-link">
            {t('Login here')}
          </Link>
        </motion.p>
      </motion.div>

      <motion.div className="auth-bg" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 2 }}>
        <motion.div className="bg-circle bg-1" animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="bg-circle bg-2" animate={{ x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
      </motion.div>
    </div>
  );
};

export default Signup;
