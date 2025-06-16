import React from "react";
import "./style/PopMsg.scss"; // Import the SCSS file

const PopMsg = ({ message, onClose }) => {
  return (
    <div className="popmsg-overlay">
      <div className="popmsg-box">
        <p className="popmsg-message">{message}</p>
        <button className="popmsg-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PopMsg;
