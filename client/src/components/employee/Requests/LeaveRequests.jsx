import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./LeaveRequests.scss";

const LeaveRequests = () => {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  // New state for success dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/employee/leaverequest", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch leave requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message || "Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setOpen(false);
    setError("");
  };

  const handleSuccessDialogClose = () => setSuccessDialogOpen(false);

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate) {
      setError("Please fill all required fields.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setError("Start date cannot be in the past.");
      return;
    }
    if (end < today) {
      setError("End date cannot be in the past.");
      return;
    }
    if (end < start) {
      setError("End date cannot be before start date.");
      return;
    }

    setSubmitLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/employee/leaverequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit leave request");
      }
      await fetchRequests();
      handleClose();
      setSuccessDialogOpen(true); // Open success dialog here
    } catch (err) {
      setError(err.message || "Error submitting leave request");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box className="leave-container">
      <Box className="header">
        <Typography variant="h6">Leave Requests</Typography>
        <IconButton color="primary" onClick={handleOpen}>
          <AddIcon />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <TextField
            label="Leave Type"
            select
            fullWidth
            margin="dense"
            required
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            {["Casual", "Sick", "Unpaid", "Earned"].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <TextField
            label="Reason"
            multiline
            rows={3}
            fullWidth
            margin="dense"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit" disabled={submitLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitLoading}>
            {submitLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success confirmation dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        maxWidth="xs"
      >
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Your leave request has been sent successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Box className="request-list" mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          My Leave Requests
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        ) : requests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No leave requests yet.
          </Typography>
        ) : (
          <List dense>
            {requests.map((req) => (
              <ListItem key={req._id} divider>
                <ListItemText
                  primary={`${req.leaveType} (${req.startDate?.slice(0, 10)} to ${req.endDate?.slice(0, 10)})`}
                  secondary={`Status: ${req.status} | Applied: ${new Date(
                    req.appliedAt
                  ).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default LeaveRequests;
