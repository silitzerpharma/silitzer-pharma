import React, { useState, useEffect } from "react";
import "./EmployeeRequests.scss";
import { format } from "date-fns";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

const EmployeeRequests = ({ employeeId,refreshEmployeeData }) => {
  const [cancelRequests, setCancelRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingType, setPendingType] = useState(null); // "cancel" or "leave"
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

 const fetchRequests = async () => {
  if (!employeeId) return;

  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`http://localhost:3000/admin/employee/requests?employeeId=${employeeId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch employee requests");
    }

    const data = await res.json();
    setCancelRequests(data.cancelRequests || []);
    setLeaveRequests(data.leaveRequests || []);
  } catch (err) {
    setError(err.message || "Error fetching data");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRequests();
  }, [employeeId]);

  const openDialog = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const openLeaveDialog = (leave) => {
    setSelectedLeave(leave);
    setLeaveDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const closeLeaveDialog = () => {
    setLeaveDialogOpen(false);
    setSelectedLeave(null);
  };

  const openConfirmDialog = (action, type) => {
    setPendingAction(action);
    setPendingType(type); // "cancel" or "leave"
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
    setPendingType(null);
    setRejectionReason("");
  };

const handleConfirmAction = async () => {
  if (!pendingAction || (!selectedRequest && !selectedLeave)) return;

  setActionLoading(true);
  setError(null);

  let url = "";
  let payload = {};

  if (pendingType === "cancel") {
    url = "http://localhost:3000/admin/employee/taskcancelrequest/update";
    payload = {
      requestId: selectedRequest._id,
      action: pendingAction,
    };
    if (pendingAction === "Rejected") payload.rejectionReason = rejectionReason;
  } else if (pendingType === "leave") {
    url = "http://localhost:3000/admin/employee/leaverequest/update";
    payload = {
      _id: selectedLeave._id,
      action: pendingAction,
    };
    if (pendingAction === "Rejected") payload.rejectionReason = rejectionReason;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ <-- Add this line for sending cookies
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update request status");

    const data = await res.json();
    setSuccessMessage(data.message || "Request updated successfully");
    setSuccessDialogOpen(true);
    refreshEmployeeData();
    closeConfirmDialog();
    closeDialog();
    closeLeaveDialog();
    fetchRequests();
  } catch (err) {
    setError(err.message || "Error updating request");
  } finally {
    setActionLoading(false);
  }
};


  return (
    <div className="EmployeeRequest">
      <div className="EmployeeRequest-title">Employee Requests</div>

      {loading && <div>Loading requests...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <div className="EmployeeRequest-row">
          <div className="request-col-left">
            <div className="request-title">Task Cancel Requests</div>
            <ul className="emp-request-list">
              {cancelRequests.length === 0 ? (
                <li>No cancel requests found</li>
              ) : (
                cancelRequests.map((req) => (
                  <li key={req._id} className="request-card" onClick={() => openDialog(req)}>
                    <div><strong>Task:</strong> {req.task?.title || req.taskId}</div>
                    <div><strong>Reason:</strong> {req.reason}</div>
                    <div>
                      <span><strong>Status:</strong> {req.status}</span>
                      <span style={{ marginLeft: 10 }}>
                        <strong>Requested At:</strong> {format(new Date(req.requestedAt), "d/M/yyyy h:mm a")}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="request-col-right">
            <div className="request-title">Leave Requests</div>
            <ul className="emp-request-list">
              {leaveRequests.length === 0 ? (
                <li>No leave requests found</li>
              ) : (
                leaveRequests.map((leave) => (
                  <li key={leave._id} className="request-card" onClick={() => openLeaveDialog(leave)}>
                    <div><strong>Leave Type:</strong> {leave.leaveType}</div>
                    <div><strong>Status:</strong> {leave.status}</div>
                    <div>
                      <strong>Start:</strong> {format(new Date(leave.startDate), "d/M/yyyy")} - 
                      <strong> End:</strong> {format(new Date(leave.endDate), "d/M/yyyy")}
                    </div>
                    <div><strong>Reason:</strong> {leave.reason}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Cancel Request Details Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <>
              <div><strong>Request ID:</strong> {selectedRequest.requestId}</div>
              <div><strong>Reason:</strong> {selectedRequest.reason}</div>
              <div><strong>Status:</strong> {selectedRequest.status}</div>
              <div><strong>Requested At:</strong> {format(new Date(selectedRequest.requestedAt), "PPpp")}</div>

              {selectedRequest.task && (
                <>
                  <h4>Task Details</h4>
                  <div><strong>Title:</strong> {selectedRequest.task.title}</div>
                  <div><strong>Description:</strong> {selectedRequest.task.description}</div>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {selectedRequest?.status === "Pending" && (
            <>
              <Button onClick={() => openConfirmDialog("Approved", "cancel")} color="success" variant="contained">Approve</Button>
              <Button onClick={() => openConfirmDialog("Rejected", "cancel")} color="error" variant="contained">Reject</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialogOpen} onClose={closeLeaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedLeave && (
            <>
              <div><strong>Leave Type:</strong> {selectedLeave.leaveType}</div>
              <div><strong>Status:</strong> {selectedLeave.status}</div>
              <div><strong>Reason:</strong> {selectedLeave.reason}</div>
              <div><strong>Start Date:</strong> {format(new Date(selectedLeave.startDate), "PP")}</div>
              <div><strong>End Date:</strong> {format(new Date(selectedLeave.endDate), "PP")}</div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLeaveDialog}>Close</Button>
          {selectedLeave?.status === "Pending" && (
            <>
              <Button onClick={() => openConfirmDialog("Approved", "leave")} color="success" variant="contained">Approve</Button>
              <Button onClick={() => openConfirmDialog("Rejected", "leave")} color="error" variant="contained">Reject</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm {pendingAction}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {pendingAction?.toLowerCase()} this request?
          </DialogContentText>

          {pendingAction === "Rejected" && (
            <TextField
              label="Rejection Reason"
              multiline
              rows={3}
              fullWidth
              margin="dense"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            disabled={actionLoading || (pendingAction === "Rejected" && !rejectionReason.trim())}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>{successMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)} autoFocus>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeeRequests;
