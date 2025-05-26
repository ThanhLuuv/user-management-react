import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formErrors, setFormErrors] = useState({})
  const [isDeleteModalOpen, setIsDeleteModalOpen]= useState(false);
  const [userDeleteSelected, setUserDeleteSelected]= useState(null);

  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/profile');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await userService.getAllUsers();
      console.log(response)
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
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadUsers(true);
  };

  const handleViewDetails = (user) => {
    const formattedUser = {
      id: user.id,
      name: user.profile?.name || '',
      email: user.email || '',
      role: user.role?.name || '',
      role_id: user.role_id,
      date_of_birth: user.profile?.date_of_birth 
        ? new Date(user.profile.date_of_birth).toISOString().slice(0, 10) 
        : '',
      gender: user.profile?.gender || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
      city: user.profile?.city || '',
      district: user.profile?.district || '',
      ward: user.profile?.ward || ''
    };

    setSelectedUser(formattedUser);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const errors = {};

    if(!selectedUser.name.trim()) errors.name = "Name must be at least 2 characters long";
    if(!selectedUser.email.trim()){
      errors.email = "Please enter a valid email address";
    }else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(selectedUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.email && emailRef.current) {
        emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormErrors({});
    try {
      setIsUpdating(true);
      
      // Prepare update data
      const updateData = {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone || null,
        address: selectedUser.address || null,
        city: selectedUser.city || null,
        district: selectedUser.district || null,
        ward: selectedUser.ward || null,
        date_of_birth: selectedUser.date_of_birth || null, // Đảm bảo định dạng yyyy-mm-dd
        gender: selectedUser.gender || null,
        // avatar: selectedUser.avatar || null, // Nếu có
      };

      const response = await userService.updateUser(selectedUser.id, updateData);
      console.log(response)
      
      if (response.status === 'success') {
        toast.success('User updated successfully');
        handleCloseModal();
        loadUsers();
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      if (err.type === 'server' || err.type === 'network') {
        toast.error(err.message);
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = (user) => {
    setUserDeleteSelected(user);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserDeleteSelected(null);
  };

  const handleConfirmDelete = async () => {
    if (!userDeleteSelected) return;

    try {
      const response = await userService.deleteUser(userDeleteSelected.id);
      if (response.status === 'success') {
        setUsers(users.filter(user => user.id !== userDeleteSelected.id));
        toast.success('User deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsDeleteModalOpen(false);
      setUserDeleteSelected(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.pageLoader}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading users...</p>
        </div>
      </div>
    );
  }

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
          className={`${styles.refreshButton} ${isRefreshing ? styles.buttonLoading : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className={styles.buttonSpinner}></div>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
      
      <div className={styles.tableCard}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-users"></i>
            <p>No users found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
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
                    <td>{user.profile?.name || '-'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[`badge${user.role_id}`]}`}>
                        {user.role.name}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleViewDetails(user)}
                          className={`${styles.button} ${styles.buttonPrimary}`}
                          title="View details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
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
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>User Details</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.sectionTitle}>Basic Information</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                      ref={nameRef}
                      type="text"
                      name="name"
                      value={selectedUser.name}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.name ? styles.error : ''}`}
                      disabled={isUpdating}
                    />
                    { formErrors.name &&  <p className={styles.errorText}>{formErrors.name}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={selectedUser.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.email ? styles.error : ''}`}
                      disabled={isUpdating}
                    />
                    { formErrors.email && <p className={styles.errorText}>{formErrors.email}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <input
                      ref={emailRef}
                      type="text"
                      value={selectedUser.role}
                      className={styles.input}
                      disabled
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={selectedUser.date_of_birth}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Gender</label>
                    <select
                      name="gender"
                      value={selectedUser.gender}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={selectedUser.phone}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4 className={styles.sectionTitle}>Address Information</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={selectedUser.address}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={selectedUser.city}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>District</label>
                    <input
                      type="text"
                      name="district"
                      value={selectedUser.district}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ward</label>
                    <input
                      type="text"
                      name="ward"
                      value={selectedUser.ward}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={handleCloseModal}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`${styles.button} ${styles.buttonPrimary} ${isUpdating ? styles.buttonLoading : ''}`}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && userDeleteSelected && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.modalDelete} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Delete</h3>
              <button className={styles.closeButton} onClick={handleCancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteAlert}>Are you sure you want to delete <strong>{userDeleteSelected.profile.name}</strong>?</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;