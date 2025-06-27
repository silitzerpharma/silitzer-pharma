import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  TextField,
  useTheme,
  useMediaQuery,
  DialogContentText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TaskCancelRequestDialog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "Approved" | "Rejected"
  const [rejectionReason, setRejectionReason] = useState("");

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/employee/taskcancelrequest?id=${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setRequest(data);
      } catch (error) {
        console.error('Failed to fetch task cancel request:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleClose = () => navigate(-1);

  const handleAction = (type) => {
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!request) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/employee/taskcancelrequest/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId: request._id,
          action: actionType,
          ...(actionType === "Rejected" && { rejectionReason }),
        }),
      });

      if (!res.ok) throw new Error("Failed to update request status");
      const data = await res.json();
      setSuccessMessage(data.message || "Request updated successfully");
      setSuccessDialogOpen(true);
      setConfirmOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Task Cancel Request
          <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CircularProgress />
            </div>
          ) : !request ? (
            <Typography>No request found.</Typography>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr',
                gap: '16px 24px',
              }}
            >
              <Field label="Employee" value={request.employee?.name} />
              <Field label="Task Title" value={request.task?.title} />
              <Field label="Address" value={request.task?.address} />
              <Field label="Assign Date" value={format(new Date(request.task?.assignDate), 'dd MMM yyyy')} />
              <Field label="Start Date" value={format(new Date(request.task?.startDate), 'dd MMM yyyy')} />
              <Field label="Due Date" value={request.task?.dueDate ? format(new Date(request.task.dueDate), 'dd MMM yyyy') : 'N/A'} />
              <Field label="Cancel Reason" value={request.reason} />
              <Field label="Status" value={request.status} />
              <Field label="Requested At" value={format(new Date(request.requestedAt), 'dd MMM yyyy, hh:mm a')} />
            </div>
          )}
        </DialogContent>

        {request?.status === "Pending" && (
          <DialogActions>
            <Button onClick={() => handleAction("Approved")} color="success" variant="contained">Approve</Button>
            <Button onClick={() => handleAction("Rejected")} color="error" variant="contained">Reject</Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {actionType}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType?.toLowerCase()} this request?
          </DialogContentText>

          {actionType === "Rejected" && (
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
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={actionLoading || (actionType === "Rejected" && !rejectionReason.trim())}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => { setSuccessDialogOpen(false); handleClose(); }}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>{successMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSuccessDialogOpen(false); handleClose(); }}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Field = ({ label, value }) => (
  <div>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>{label}</Typography>
    <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
  </div>
);

export default TaskCancelRequestDialog;
