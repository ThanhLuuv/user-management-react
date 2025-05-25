// Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className="material-icons">people</span>
          <span className={styles.logoText}>UserHub</span>
        </Link>
        
        <div className={styles.navItems}>
          {isAuthenticated ? (
            <>
              {userRole === 'admin' && (
                <Link to="/dashboard" className={styles.navLink} title="Dashboard">
                  <span className="material-icons">dashboard</span>
                </Link>
              )}
              <Link to="/profile" className={styles.navLink} title="Profile">
                <span className="material-icons">account_circle</span>
              </Link>
              <button 
                onClick={handleLogout}
                className={styles.navButton}
                title="Logout"
              >
                <span className="material-icons">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink} title="Login">
                <span className="material-icons">login</span>
              </Link>
              <Link to="/register" className={styles.navLink} title="Register">
                <span className="material-icons">person_add</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;