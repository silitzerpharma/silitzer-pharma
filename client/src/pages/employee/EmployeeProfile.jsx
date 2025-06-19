import React, { useEffect, useState } from "react";
import './style/EmployeeProfile.scss';
import Loader from "../../components/common/Loader";
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/employee/profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setEmployee({
        username: data.username,
        employeeID: data.EmployeeID,
        name: data.Name,
        profilePhoto: data.profilePhotoUrl,
        email: data.Email,
        phoneNumber: data.PhoneNumber,
        address: data.Address,
        joiningDate: data.JoiningDate?.split("T")[0] || "",
      });
    } catch (err) {
      console.error("Failed to fetch employee profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleEdit = () => {
    setError("");
    if (editMode) {
      setPassword("");
      setConfirmPassword("");
    }
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let base64Image = "";
    if (imageFile) {
      try {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
        });
      } catch (err) {
        console.error("Failed to read image file:", err);
        setError("Image conversion failed");
        return;
      }
    }

    try {
      setUpdateLoading(true);
      const response = await fetch(`${BASE_URL}/employee/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: employee.name,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          address: employee.address,
          password: password || undefined,
          profileImage: base64Image || undefined,
          imageName: imageFile?.name || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
        return;
      }

      await fetchProfile(); // ✅ Refresh data after update
      toast.success("Profile updated successfully");
      setEditMode(false);
      setPassword("");
      setConfirmPassword("");
      setImageFile(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Something went wrong");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Loader message="Loading profile..." />;
  if (updateLoading) return <Loader message="Updating profile..." />;

  if (!employee) return <div className="employee-profile">Failed to load profile.</div>;

  return (
    <div className="employee-profile">
      <div className="photo-container">
        <img
          src={
            imageFile
              ? URL.createObjectURL(imageFile)
              : employee.profilePhoto || "/images/default-profile.jpg"
          }
          alt={`${employee.name} profile`}
          className="profile-photo"
        />
      </div>

      {!editMode ? (
        <div className="info-container">
          <h2>{employee.name}</h2>
          <p><strong>Username:</strong> {employee.username}</p>
          <p><strong>Employee ID:</strong> {employee.employeeID}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone Number:</strong> {employee.phoneNumber}</p>
          <p><strong>Address:</strong> {employee.address}</p>
          <p><strong>Joining Date:</strong> {employee.joiningDate}</p>
          <button className="edit-btn" onClick={toggleEdit}>Edit Profile</button>
        </div>
      ) : (
        <form className="info-container" onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>

          <label>
            <strong>Name:</strong>
            <input
              type="text"
              name="name"
              value={employee.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <strong>Email:</strong>
            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <strong>Phone Number:</strong>
            <input
              type="text"
              name="phoneNumber"
              value={employee.phoneNumber}
              onChange={handleChange}
            />
          </label>

          <label>
            <strong>Address:</strong>
            <input
              type="text"
              name="address"
              value={employee.address}
              onChange={handleChange}
            />
          </label>

          <label>
            <strong>Profile Image:</strong>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>

          <label>
            <strong>Joining Date:</strong>
            <input
              type="date"
              name="joiningDate"
              value={employee.joiningDate}
              disabled
            />
          </label>

          <label>
            <strong>Password:</strong>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>

          <label>
            <strong>Confirm Password:</strong>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>

          {error && <p className="error-msg">{error}</p>}

          <div className="buttons-row">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={toggleEdit}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployeeProfile;
