import "./style/viewdistributors.scss";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import EditDistributor from "../form/EditDistributor";
import DistributorOrderTable from "../tables/DistributorOrderTable";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ViewDistributors = ({
  distributor,
  onClose,
  refreshDistributorsList,
  setMsgData,
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordPurpose, setPasswordPurpose] = useState(null); // 'edit' or 'delete'
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [blockAction, setBlockAction] = useState("block");

  const [isBlocked, setIsBlocked] = useState(distributor?.isBlock || false);

  const [viewDistributor, setviewDistributor] = useState({
    password: "",
    auth_id: distributor._id,
    distributorId: distributor.refId.distributorId,
    distributor_Id: distributor.refId._id,
    username: distributor.username || "",
    name: distributor.refId.name || "",
    email: distributor.refId.email || "",
    phone_number: distributor.refId.phone_number || "",
    address: distributor.refId.address || "",
    gst_number: distributor.refId.gst_number || "",
    drug_license_number: distributor.refId.drug_license_number || "",
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
        credentials: "include",
        body: JSON.stringify({ id: distributor._id }),
      });

      if (response.ok) {
        setMsgData({
          show: true,
          status: 200,
          message: "Distributor removed successfully",
          warnings: [],
        });
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        setPasswordDialogOpen(false);
        setAdminPassword("");
        setPasswordError("");

        if (passwordPurpose === "edit") {
          setIsEditing(true);
        } else if (passwordPurpose === "delete") {
          setOpenConfirm(true);
        }

        setPasswordPurpose(null);
      } else {
        setPasswordError("Invalid admin password. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("Server error. Please try again later.");
    }
  };

  const handleToggleBlock = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/distributor/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: distributor._id, block: !isBlocked }),
      });

      if (response.ok) {
        setIsBlocked(!isBlocked);
        setMsgData({
          show: true,
          status: 200,
          message: `Distributor ${!isBlocked ? "blocked" : "unblocked"} successfully`,
          warnings: [],
        });
        refreshDistributorsList();
      } else {
        console.error("Failed to toggle block status");
      }
    } catch (error) {
      console.error("Error blocking/unblocking distributor:", error);
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
                <span>Distributor ID:</span>
                {viewDistributor.distributorId}
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
                <span>Drug License Number:</span>{" "}
                {viewDistributor.drug_license_number}
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
            <button
              className="remove"
              onClick={() => {
                setPasswordPurpose("delete");
                setPasswordDialogOpen(true);
              }}
            >
              Remove
            </button>
            <button
              className="edit"
              onClick={() => {
                setPasswordPurpose("edit");
                setPasswordDialogOpen(true);
              }}
            >
              Edit
            </button>
            <button
              className={`block ${isBlocked ? "unblock" : ""}`}
              onClick={() => {
                setBlockAction(isBlocked ? "unblock" : "block");
                setConfirmBlockOpen(true);
              }}
            >
              {isBlocked ? "Unblock" : "Block"}
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
            Are you sure you want to remove distributor{" "}
            <strong>{distributor.refId.name}</strong>?
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

      {/* Confirm Block/Unblock Dialog */}
      <Dialog open={confirmBlockOpen} onClose={() => setConfirmBlockOpen(false)}>
        <DialogTitle>Confirm {blockAction === "block" ? "Block" : "Unblock"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            <strong>{blockAction === "block" ? "block" : "unblock"}</strong>{" "}
            distributor <strong>{distributor.refId.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBlockOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmBlockOpen(false);
              handleToggleBlock();
            }}
            color={blockAction === "block" ? "error" : "success"}
            variant="contained"
          >
            Yes, {blockAction === "block" ? "Block" : "Unblock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setAdminPassword("");
          setPasswordError("");
          setPasswordPurpose(null);
        }}
      >
        <DialogTitle>Enter Admin Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the admin password to proceed.
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
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              setAdminPassword("");
              setPasswordError("");
              setPasswordPurpose(null);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewDistributors;
