import React from "react";

function ViewTask({ task, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>Close</button>
        <h2>{task.title}</h2>
        <p><strong>Description:</strong> {task.description || "No description"}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleString()}</p>
        <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleString() : "N/A"}</p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 6,
  width: "90%",
  maxWidth: 400,
  maxHeight: "80%",
  overflowY: "auto",
};

const closeBtnStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  cursor: "pointer",
};

export default ViewTask;
