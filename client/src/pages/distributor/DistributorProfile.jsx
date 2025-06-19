import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './style/distributorprofile.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Loader from "../../components/common/Loader";
import { toast } from 'react-toastify';

const DistributorProfile = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // show/hide password state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/distributor/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
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
        await fetch(`${BASE_URL}/distributor/saveprofile`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        toast.success('Profile updated successfully');
      } catch (err) {
        console.error('Error saving profile:', err);
        toast.error('Failed to save profile');
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
      const res = await fetch(`${BASE_URL}/distributor/savepassword`, {
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
        toast.success('Password changed successfully');
      } else {
        setPasswordError(result.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Server error');
    }
  };

  if (loading) return <Loader message="Loading Profile..." />;

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
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="dense"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
