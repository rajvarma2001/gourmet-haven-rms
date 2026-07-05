import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Lock, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback states
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Prefill details on user load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setUpdating(true);

    const payload = { name, phone, address };
    if (password) {
      payload.password = password;
    }

    const result = await updateProfile(payload);
    setUpdating(false);

    if (result.success) {
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="profile-page container section-padding animate-fade-in">
      <div className="profile-header text-left">
        <h1 className="profile-title">Account Settings</h1>
      </div>

      <div className="profile-card">
        {/* Sidebar avatar */}
        <div className="profile-avatar-side">
          <div className="profile-avatar-large">
            {user ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <h2 className="profile-name-display">{user ? user.name : 'User'}</h2>
          <span className="profile-role-badge">{user ? user.role : 'Customer'}</span>
          <span className="profile-email-sub">{user ? user.email : ''}</span>
        </div>

        {/* Update form */}
        <div className="profile-form-main">
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <h3 className="profile-form-subtitle">Personal Details</h3>
            <hr className="profile-divider" />

            {message && (
              <div className="profile-alert alert-success animate-fade-in">
                <CheckCircle2 size={16} />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="profile-alert alert-danger animate-fade-in">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="profileName">
                <User size={14} className="input-label-icon" /> Full Name
              </label>
              <input
                id="profileName"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profilePhone">
                <Phone size={14} className="input-label-icon" /> Phone Number
              </label>
              <input
                id="profilePhone"
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profileAddress">
                <MapPin size={14} className="input-label-icon" /> Saved Delivery Address
              </label>
              <textarea
                id="profileAddress"
                rows="3"
                className="form-input form-textarea"
                placeholder="Apt#, Street Address, City, Zipcode..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <h3 className="profile-form-subtitle spacing-top">Change Password</h3>
            <hr className="profile-divider" />
            <p className="password-tip">Leave blank if you do not want to change your password.</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="profilePassword">
                  <Lock size={14} className="input-label-icon" /> New Password
                </label>
                <input
                  id="profilePassword"
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profileConfirmPassword">
                  <Lock size={14} className="input-label-icon" /> Confirm Password
                </label>
                <input
                  id="profileConfirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary submit-profile-btn" disabled={updating}>
              <Save size={16} /> {updating ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
