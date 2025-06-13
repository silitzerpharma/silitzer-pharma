import React, { useState } from "react";
import "./AddEmployee.scss"; // External CSS

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddEmployee = ({ openAddEmployeeForm , refreshEmployeesList }) => {
  const [formData, setFormData] = useState({
    EmployeeID: "",
    Name: "",
    profilePhotoUrl: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    Position: "",
    JoiningDate: "",
    UserName: "",
    Password: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/admin/employee/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ employeeDetails: formData }),
      });

      const result = await response.json();
      if (response.ok) {
        refreshEmployeesList();
        alert("Employee added successfully!");
        setFormData({
          EmployeeID: "",
          Name: "",
          profilePhotoUrl: "",
          Email: "",
          PhoneNumber: "",
          Address: "",
          Position: "",
          JoiningDate: "",
          UserName: "",
          Password: "",
        });
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Failed to add employee: " + err.message);
    }
  };

  return (
    <div className="employee-container">
      <h2 className="employee-title">Add New Employee</h2>
      <form onSubmit={handleSubmit} className="employee-form">
        <input
          name="UserName"
          value={formData.UserName}
          onChange={handleChange}
          placeholder="Username"
          className="employee-input"
          required
        />
        <input
          type="password"
          name="Password"
          value={formData.Password}
          onChange={handleChange}
          placeholder="Password"
          className="employee-input"
          required
        />

        <input
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          placeholder="Name"
          className="employee-input"
        />
        <input
          name="profilePhotoUrl"
          value={formData.profilePhotoUrl}
          onChange={handleChange}
          placeholder="Profile Photo URL"
          className="employee-input"
        />
        <input
          name="Email"
          value={formData.Email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="employee-input"
        />
        <input
          name="PhoneNumber"
          value={formData.PhoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="employee-input"
        />
        <input
          name="Address"
          value={formData.Address}
          onChange={handleChange}
          placeholder="Address"
          className="employee-input"
        />
        <input
          name="Position"
          value={formData.Position}
          onChange={handleChange}
          placeholder="Position"
          className="employee-input"
        />

        <label className="employee-label">
          Joining Date:
          <input
            name="JoiningDate"
            type="date"
            value={formData.JoiningDate}
            onChange={handleChange}
            className="employee-input"
          />
        </label>
        <div className="employee-button-group">
          <button type="submit" className="employee-submit-btn">
            Add Employee
          </button>
          <button
            type="button"
            onClick={openAddEmployeeForm}
            className="employee-cancel-btn"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
