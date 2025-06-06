import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import userService from '../../services/user.service';
import styles from './Profile.module.css';

const Profile = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const dateBirthRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    date_of_birth: '',
  });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // Page loading state

  useEffect(() => {
    loadProfile();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const loadProfile = async () => {
    try {
      setIsPageLoading(true);
      const response = await userService.getProfile();
      if (response.status === 'success' && response.data) {
        const data = response.data;
        setProfile({
          name: data.profile.name || '',
          email: data.account.email || '',
          date_of_birth: data.profile.date_of_birth || '',
          gender: data.profile.gender || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          city: data.profile.city || '',
          district: data.profile.district || '',
          ward: data.profile.ward || ''
        });
      }
    } catch (err) {
      if (err.type === 'server' || err.type === 'network') {
        toast.error(err.message);
      } else {
        setErrors(prev => ({
          ...prev,
          general: err.message
        }));
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    
    // Validate fields
    const newErrors = {
      name: '',
      email: '',
      date_of_birth: '',
    };

    if(profile.date_of_birth){
      const selectedDate = new Date(profile.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // So sánh không có giờ phút

      if (selectedDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    if (!validateName(profile.name)) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!validateEmail(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    // If there are any errors, don't submit
    if (newErrors.name || newErrors.email || newErrors.date_of_birth) {
      if (newErrors.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.email && emailRef.current) {
        emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }else if (newErrors.date_of_birth && dateBirthRef.current) {
        dateBirthRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await userService.updateProfile(profile);
      if (response.status === 'success') {
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      if (err.type === 'server' || err.type === 'network') {
        toast.error(err.message);
      } else {
        setErrors(prev => ({
          ...prev,
          general: err.message
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Page loading spinner
  if (isPageLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.pageLoader}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading profile...</p>
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
      <h2 className={styles.title}>Profile</h2>
      {errors.general && <div className={`${styles.alert} ${styles.alertDanger}`}>{errors.general}</div>}
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}
      
      <div className={styles.formsContainer}>
        {/* Basic Information Form */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Information</h3>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                ref={nameRef}
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.error : ''}`}
                required
                disabled={isLoading}
              />
              {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                required
                disabled={isLoading}
              />
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date_of_birth" className={styles.label}>Date of Birth</label>
                <input
                  ref={dateBirthRef}
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={profile.date_of_birth? new Date(profile.date_of_birth).toISOString().slice(0,10): ''}
                  onChange={handleChange}
                  className={styles.input}
                  disabled={isLoading}
                />
                {
                  errors.date_of_birth && ( <div className={styles.errorMessage}>{errors.date_of_birth}</div>)
                }
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gender" className={styles.label}>Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className={styles.input}
                  disabled={isLoading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        {/* Address Form */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Address</h3>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="district" className={styles.label}>District</label>
              <input
                type="text"
                id="district"
                name="district"
                value={profile.district}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ward" className={styles.label}>Ward</label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={profile.ward}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
      <button 
        type="submit" 
        className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`} 
        onClick={handleSubmit} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className={styles.buttonSpinner}></div>
            <span>Updating...</span>
          </>
        ) : (
          'Update Profile'
        )}
      </button>
    </div>
  );
};

export default Profile;