import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import './distributorprofile.css';

const DistributorProfile = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3000/distributor/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        await fetch('http://localhost:3000/distributor/saveprofile', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      } catch (err) {
        console.error('Error saving profile:', err);
      }
    }
    setIsEditing((prev) => !prev);
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/distributor/savepassword', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await res.json();
      if (res.ok) {
        setOpenPasswordDialog(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        alert('Password changed successfully');
      } else {
        setPasswordError(result.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Server error');
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-form">
        <label>
          Username:
          <span>{profile.username}</span>
        </label>

        <label>
          Name:
          {isEditing ? (
            <input type="text" name="name" value={profile.name} onChange={handleChange} />
          ) : (
            <span>{profile.name}</span>
          )}
        </label>

        <label>
          Phone Number:
          {isEditing ? (
            <input
              type="text"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.phone_number}</span>
          )}
        </label>

        <label>
          Email Address:
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.email}</span>
          )}
        </label>

        <label>
          GSTIN Number:
          <span>{profile.gst_number || 'Not provided'}</span>
        </label>

        <label>
          Drug License Number:
          <span>{profile.drug_license_number || 'Not provided'}</span>
        </label>

        <label>
          Address:
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.address}</span>
          )}
        </label>

        <button className="edit-btn" onClick={toggleEdit}>
          {isEditing ? 'Save' : 'Edit'}
        </button>

        {!isEditing && (
          <button className="edit-btn" onClick={() => setOpenPasswordDialog(true)}>
            Change Password
          </button>
        )}
      </div>

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="dense"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DistributorProfile;
