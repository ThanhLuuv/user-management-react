import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import styles from './Login.module.css';
import { toast, ToastContainer } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password length
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.password_confirmation) {
      setError('Password confirmation does not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(formData);

      if (response.status === 'success') {
        toast.success('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        console.log(response);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      console.log(err);
      if (err.type === 'server' || err.type === 'network') {
        toast.error(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        closeButton={false}
        style={{ top: '20px', right: '20px' }}
        toastStyle={{
          background: 'white',
          color: '#333',
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: 'fit-content',
          lineHeight: '1.2',
          minHeight: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      />
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>
        <p className={styles.subtitle}>Create a new account to start your journey.</p>
        
        {error && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <i className="fas fa-exclamation-circle" style={{marginRight: '8px'}}></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
              <i className={`fas fa-user ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
              <i className={`fas fa-envelope ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                required
                disabled={isLoading}
                minLength={8}
              />
              <i className={`fas fa-lock ${styles.inputIcon}`}></i>
            </div>
            {formData.password && formData.password.length < 8 && (
              <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                Password must be at least 8 characters
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password_confirmation" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              <i className={`fas fa-lock ${styles.inputIcon}`}></i>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.buttonLoading}>
                <div className={styles.spinner}></div>
                <span>Registering...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-user-plus" style={{marginRight: '8px'}}></i>
                Register
              </>
            )}
          </button>

          <div className={styles.linkSection}>
            <p>
              Already have an account? {' '}
              <Link to="/login">Login now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;