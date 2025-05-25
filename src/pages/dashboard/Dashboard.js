import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/profile');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers();
      if (response.status === 'success' && response.data) {
        setUsers(response.data);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      if (err.type === 'server' || err.type === 'network') {
        toast.error(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        if (response.status === 'success') {
          setUsers(users.filter(user => user.id !== userId));
          toast.success('User deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (err) {
        if (err.type === 'server' || err.type === 'network') {
          toast.error(err.message);
        } else {
          setError(err.message);
        }
      }
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
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <button 
          className={styles.refreshButton}
          onClick={loadUsers}
          disabled={isLoading}
        >
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
      
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-users"></i>
            <p>No users found</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge${user.role.name}`]}`}>
                      {user.role.name}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={`${styles.button} ${styles.buttonDanger}`}
                        title="Delete user"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 