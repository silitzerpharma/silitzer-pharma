import React from "react";

function ViewTask({ task, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
        <h2 style={titleStyle}>{task.title}</h2>
        <div style={contentStyle}>
          <p><strong>Description:</strong> {task.description || "No description"}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleString()}</p>
          <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleString() : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "10px",
};

const modalStyle = {
  position: "relative",
  backgroundColor: "#fff",
  padding: "16px 20px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
};

const closeBtnStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#555",
  cursor: "pointer",
};

const titleStyle = {
  marginBottom: "12px",
  fontSize: "20px",
  textAlign: "center",
  color: "#333",
};

const contentStyle = {
  fontSize: "14px",
  color: "#444",
  lineHeight: 1.5,
};

export default ViewTask;
