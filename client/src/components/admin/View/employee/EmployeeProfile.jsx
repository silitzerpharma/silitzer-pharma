import React, { useState } from 'react';
import './EmployeeProfile.scss';

import { toast } from 'react-toastify';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeProfile = ({ employee, username, AuthUser_id, refreshEmployeesList, openViewEmployee }) => {
  const [localEmployee, setLocalEmployee] = useState(employee);
  const [localUsername, setLocalUsername] = useState(username || "");
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null); // 'remove' | 'block'
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    if (!localEmployee || !localEmployee._id || !AuthUser_id) {
     toast.error("Missing employee IDs");
      return;
    }

    let joiningDateISO = null;
    if (localEmployee.JoiningDate) {
      const parts = localEmployee.JoiningDate.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const dateObj = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
        if (!isNaN(dateObj.getTime())) {
          joiningDateISO = dateObj.toISOString();
        }
      }
    }

    const updatedEmployee = {
      ...localEmployee,
      JoiningDate: joiningDateISO,
    };

  fetch(`${BASE_URL}/admin/employee/update`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // ✅ Important for sending cookies/session
  body: JSON.stringify({
    employeeId: AuthUser_id,
    employee: {
      ...updatedEmployee,
      _id: localEmployee._id,
    },
    username: localUsername,
    password: password?.trim() || undefined,
  }),
})
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update employee");
        return res.json();
      })
      .then(() => {
        toast.success("Employee updated successfully");
        setEditMode(false);
        setPassword("");
        refreshEmployeesList();
      })
      .catch((err) => {
        toast.error("Update failed: " + err.message);
      });
  };

  const handleRemove = () => {
    setConfirmAction("remove");
    setShowPasswordDialog(true);
  };

 const handleRemoveConfirmed = () => {
  if (!localEmployee._id) {
  toast.error("Missing employee ID");
    return;
  }

  fetch(`${BASE_URL}/admin/employee/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ Include cookies/session
    body: JSON.stringify({ employeeId: AuthUser_id }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.message || "Failed to delete employee");
        });
      }
      return res.json();
    })
    .then(() => {
     toast.success("Employee deleted successfully.");
      setShowPasswordDialog(false);
      setConfirmPassword("");
      refreshEmployeesList();
      openViewEmployee();
    })
    .catch((err) => {
      toast.error("Error deleting employee: " + err.message);
    });
};

  const handleBlockToggle = () => {
    setConfirmAction("block");
    setShowPasswordDialog(true);
  };

  const handleBlockToggleConfirmed = () => {
    if (!localEmployee._id) {
      toast.error("Missing employee ID");
      return;
    }

    const updatedStatus = !localEmployee.isBlock;

  fetch(`${BASE_URL}/admin/employee/block`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // ✅ Required for sending cookies/session
  body: JSON.stringify({
    employeeId: AuthUser_id,
    isBlock: updatedStatus, // true or false
  }),
})
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update block status");
        return res.json();
      })
      .then(() => {
        setLocalEmployee((prev) => ({ ...prev, isBlock: updatedStatus }));
      toast.success(updatedStatus ? "Employee blocked." : "Employee unblocked.");
        setShowPasswordDialog(false);
        setConfirmPassword("");
      })
      .catch((err) => {
        toast.error("Error updating block status: " + err.message);
      });
  };

  const verifyPasswordAndExecute = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/verifypassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: confirmPassword }),
      });

      if (!res.ok) throw new Error("Password verification failed");

      setShowPasswordDialog(false);
      setConfirmPassword("");

      if (confirmAction === "remove") handleRemoveConfirmed();
      else if (confirmAction === "block") handleBlockToggleConfirmed();
    } catch (err) {
      toast.error("Invalid password. Action denied.");
    }
  };

  if (!localEmployee) return <div>Loading employee data...</div>;

  return (
    <div className="EmployeeProfile">
      <div className="profile-header">
        <img
          src={
            localEmployee.profilePhotoUrl ||
            "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg"
          }
          alt="Profile"
        />
        <div className="profile-id">
          Employee ID: {localEmployee.EmployeeID}
        </div>
      </div>

      <div className="profile-section">
        <span>
          <strong>Username:</strong>{" "}
          {editMode ? (
            <input
              name="username"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
            />
          ) : (
            localUsername
          )}
        </span>

        {[
          { label: "Name", name: "Name" },
          { label: "Email", name: "Email" },
          { label: "Phone Number", name: "PhoneNumber" },
          { label: "Position", name: "Position" },
          { label: "Address", name: "Address" },
          { label: "Image URL", name: "profilePhotoUrl" },
        ].map(({ label, name }) => (
          <span key={name}>
            <strong>{label}:</strong>{" "}
            {editMode ? (
              <input
                name={name}
                value={localEmployee[name] || ""}
                onChange={handleChange}
              />
            ) : (
              localEmployee[name]
            )}
          </span>
        ))}

        <span>
          <strong>Joining Date:</strong>{" "}
          {editMode ? (
            <input
              name="JoiningDate"
              value={localEmployee.JoiningDate || ""}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
            />
          ) : (
            localEmployee.JoiningDate
          )}
        </span>

        <span>
          <strong>Status:</strong> {localEmployee.IsActive ? "Active" : "Inactive"}
        </span>

        <span className={`status ${localEmployee.isBlock ? "blocked" : ""}`}>
          <strong>Blocked:</strong> {localEmployee.isBlock ? "Yes" : "No"}
        </span>

        {editMode && (
          <span>
            <strong>Password:</strong>{" "}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
            />
          </span>
        )}
      </div>

      <div className="action-buttons">
        {editMode ? (
          <>
            <button className="edit-btn" onClick={handleEdit}>
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setEditMode(false);
                setPassword("");
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit
            </button>
            <button className="remove-btn" onClick={handleRemove}>
              Remove
            </button>
            <button className="block-btn" onClick={handleBlockToggle}>
              {localEmployee.isBlock ? "Unblock" : "Block"}
            </button>
          </>
        )}
      </div>

      {showPasswordDialog && (
        <div className="password-dialog">
          <div className="dialog-content">
            <h4>Enter Password to Confirm</h4>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Password"
            />
            <div className="dialog-actions">
              <button onClick={verifyPasswordAndExecute}>Confirm</button>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setConfirmPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
