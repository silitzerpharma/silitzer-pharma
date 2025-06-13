import React from "react";
import "./style/EmployeeFooter.scss";

import { MdEmail } from "react-icons/md";

const EmployeeFooter = () => {
  return (
    <footer className="footer">
         <div className="footer-info">
        © 2025 Silitzer-Pharma | v1.0.0 | <MdEmail size={14} /> support@silitzerpharma.com
      </div>
    </footer>
  );
};

export default EmployeeFooter;
