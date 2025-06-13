import React, { useEffect, useState } from "react";
import "./style/AdminProfile.scss";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AdminProfile = () => {
  const [profile, setProfile] = useState({ username: "", name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/admin/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setProfile(data);
        setFormData((prev) => ({
          ...prev,
          username: data.username,
          name: data.name,
          email: data.email || ""
        }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVerifyAndSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/verifypassword", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: verifyPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Password verification failed: ${err.message}`);
        return;
      }

      const updateRes = await fetch("http://localhost:3000/admin/profile/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (updateRes.ok) {
        alert("Profile updated successfully");
        setProfile({ username: formData.username, name: formData.name, email: formData.email });
        setEditMode(false);
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      } else {
        const updateErr = await updateRes.json();
        alert(`Update failed: ${updateErr.message}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error");
    } finally {
      setConfirmDialogOpen(false);
      setVerifyPassword("");
    }
  };

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>

      {!editMode ? (
        <div className="profile-details">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <Button variant="contained" onClick={() => setEditMode(true)}>Edit</Button>
        </div>
      ) : (
        <div className="edit-form">
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="New Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <div className="form-actions">
            <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={formData.password && formData.password !== formData.confirmPassword}
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Admin Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your current password to confirm these changes.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Password"
            type={showVerifyPassword ? "text" : "password"}
            fullWidth
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowVerifyPassword((prev) => !prev)}>
                    {showVerifyPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVerifyAndSubmit}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminProfile;
