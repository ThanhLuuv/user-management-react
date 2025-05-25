import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import styles from './Login.module.css';
import { toast, ToastContainer } from 'react-toastify';
import { TOKEN_KEY, USER_ROLE_KEY } from '../../config/api.config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Thêm ref để track xem đã show toast chưa
  const toastShown = useRef(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    toastShown.current = false; // Reset toast flag
   
    try {
      const response = await authService.login(formData.email, formData.password);
      if (response.status === 'success' && response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_ROLE_KEY, response.data.role.name);
        
        // Chỉ show toast nếu chưa show
        if (!toastShown.current) {
          toast.success('Login successful!');
          toastShown.current = true;
        }
       
        setTimeout(() => {
          if (response.data.role.name === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/profile');
          }
        }, 1000);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      if (err.type === 'server' || err.type === 'network') {
        if (!toastShown.current) {
          toast.error(err.message);
          toastShown.current = true;
        }
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
        // Thêm prop để prevent duplicates
        limit={1}
      />
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <p className={styles.subtitle}>Welcome back! Please login to your account.</p>
        
        {error && (
          <div className={`${styles.alertDanger}`}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
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
                <span>Logging in...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{marginRight: '8px'}}></i>
                Login
              </>
            )}
          </button>

          <div className={styles.linkSection}>
            <p>
              Don't have an account? {' '}
              <Link to="/register">Register now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;