import React from 'react';
import './style/editdistributor.scss';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const EditDistributor = ({ setIsEditing, viewDistributor, setviewDistributor }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setviewDistributor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/editdistributor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(viewDistributor),
      });

      if (!response.ok) {
        throw new Error('Failed to update distributor');
      }

      const updatedDistributor = await response.json();
      console.log(updatedDistributor)
      alert("data update")
      setviewDistributor(viewDistributor);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating distributor:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="edit-distributor">
      <div className="form-row">
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={viewDistributor.username || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Password:</label>
        <input
          type="text"
          name="password"
          placeholder='Enter New Password'
          value={viewDistributor.password || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={viewDistributor.name || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={viewDistributor.email || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Phone Number:</label>
        <input
          type="text"
          name="phone_number"
          value={viewDistributor.phone_number || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={viewDistributor.address || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>GST Number:</label>
        <input
          type="text"
          name="gst_number"
          value={viewDistributor.gst_number || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Drug License Number:</label>
        <input
          type="text"
          name="drug_license_number"
          value={viewDistributor.drug_license_number || ''}
          onChange={handleChange}
        />
      </div>

      <div className="edit-actions">
        <button className="save" onClick={handleSave}>Save</button>
        <button className="cancel" onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default EditDistributor;
