import "./style/viewdistributors.scss";
import CloseIcon from "@mui/icons-material/Close";
import {  useState } from "react";
import EditDistributor from "../form/EditDistributor";
import DistributorOrderTable from "../tables/DistributorOrderTable";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const ViewDistributors = ({ distributor, onClose, refreshDistributorsList }) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const [viewDistributor, setviewDistributor] = useState({
    password: '',
    auth_id: distributor._id,
    distributorId:distributor.refId.distributorId,
    distributor_Id: distributor.refId._id,
    username: distributor.username || '',
    name: distributor.refId.name || '',
    email: distributor.refId.email || '',
    phone_number: distributor.refId.phone_number || '',
    address: distributor.refId.address || '',
    gst_number: distributor.refId.gst_number || '',
    drug_license_number: distributor.refId.drug_license_number || '',
    date_registered: distributor.refId.date_registered,
  });

  if (!distributor) return null;

  const handleRemove = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/removedistributor`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ id: distributor._id }),
      });

      if (response.ok) {
        console.log("Distributor removed successfully");
        refreshDistributorsList();
        onClose();
        setOpenConfirm(false);
      } else {
        console.error("Failed to remove distributor");
      }
    } catch (error) {
      console.error("Error removing distributor:", error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verifypassword`, {
        method: "POST",
         credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });
       
      if (response.ok) {
        setIsEditing(true);
        setPasswordDialogOpen(false);
        setAdminPassword('');
        setPasswordError('');
      } else {
        setPasswordError("Invalid admin password. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("Server error. Please try again later.");
    }
  };

  return (
    <div className="view-distributors">
      <div className="top">
        <button onClick={onClose}>
          <CloseIcon sx={{ fontSize: 30 }} />
        </button>
      </div>

      <div className="title">
        <span>Distributor Details</span>
      </div>

      {isEditing ? (
        <EditDistributor
          setIsEditing={setIsEditing}
          viewDistributor={viewDistributor}
          setviewDistributor={setviewDistributor}
        />
      ) : (
        <>
          <div className="distributors-details">
            <div className="derails-row">
              <div>
                <span>User Name:</span> {viewDistributor.username}
              </div>
              <div>
                <span>distributorId:</span>{viewDistributor.distributorId}
              </div>
            </div>



            <div className="derails-row">
              <div>
                <span>Name:</span> {viewDistributor.name}
              </div>
              <div>
                <span>Phone Number:</span> {viewDistributor.phone_number}
              </div>
            </div>
            <div className="derails-row">
              <div>
                <span>Email:</span> {viewDistributor.email}
              </div>
              <div>
                <span>Address:</span> {viewDistributor.address}
              </div>
            </div>
            <div className="derails-row">
              <div>
                <span>GST Number:</span> {viewDistributor.gst_number}
              </div>
              <div>
                <span>Drug License Number:</span> {viewDistributor.drug_license_number}
              </div>
            </div>
            <div className="derails-row">
              <div>
                <span>Date Registered:</span>{" "}
                {viewDistributor.date_registered
                  ? new Date(viewDistributor.date_registered).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
            
            </div>
          </div>

          <div className="fun-btn">
            <button className="remove" onClick={() => setOpenConfirm(true)}>
              Remove
            </button>
            <button className="edit" onClick={() => setPasswordDialogOpen(true)}>
              Edit
            </button>
          </div>

          <div>
            <DistributorOrderTable distributorId={viewDistributor.auth_id} />

          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove distributor <strong>{distributor.refId.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="error" variant="contained">
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Enter Admin Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the admin password to enable editing.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Password"
            type="password"
            fullWidth
            variant="standard"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewDistributors;
