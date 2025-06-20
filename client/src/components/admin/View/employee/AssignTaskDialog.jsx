// src/components/employee/common/AssignTaskDialog.jsx
import React from "react";
import { Dialog } from "@mui/material";
import AssignTask from "../../form/AssignTask";

const AssignTaskDialog = ({ open, onClose, employeeObjectId }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <AssignTask employeeObjectId={employeeObjectId} onClose={onClose} />
    </Dialog>
  );
};

export default AssignTaskDialog;
