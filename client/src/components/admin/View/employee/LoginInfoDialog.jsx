// src/components/employee/common/LoginInfoDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const LoginInfoDialog = ({
  open,
  onClose,
  loginInfo,
  loginAddress,
  logoutAddress,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Today's Login Info</DialogTitle>
      <DialogContent dividers>
        {loginInfo ? (
          <>
            <Typography>
              <strong>Login Time:</strong>{" "}
              {new Date(loginInfo.loginTime).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Logout Time:</strong>{" "}
              {loginInfo.logoutTime
                ? new Date(loginInfo.logoutTime).toLocaleString()
                : "-"}
            </Typography>
            <Typography>
              <strong>Login Location:</strong>{" "}
              {loginInfo.loginLocation?.latitude &&
              loginInfo.loginLocation?.longitude ? (
                <>
                  {loginAddress ||
                    `Lat: ${loginInfo.loginLocation.latitude}, Long: ${loginInfo.loginLocation.longitude}`}
                  <IconButton
                    onClick={() => {
                      const { latitude, longitude } = loginInfo.loginLocation;
                      window.open(
                        `https://www.google.com/maps?q=${latitude},${longitude}`,
                        "_blank"
                      );
                    }}
                    size="small"
                    color="primary"
                  >
                    <LocationOnIcon />
                  </IconButton>
                </>
              ) : (
                " -"
              )}
            </Typography>
            <Typography>
              <strong>Logout Location:</strong>{" "}
              {loginInfo.logoutLocation?.latitude &&
              loginInfo.logoutLocation?.longitude ? (
                <>
                  {logoutAddress ||
                    `Lat: ${loginInfo.logoutLocation.latitude}, Long: ${loginInfo.logoutLocation.longitude}`}
                  <IconButton
                    onClick={() => {
                      const { latitude, longitude } = loginInfo.logoutLocation;
                      window.open(
                        `https://www.google.com/maps?q=${latitude},${longitude}`,
                        "_blank"
                      );
                    }}
                    size="small"
                    color="secondary"
                  >
                    <LocationOnIcon />
                  </IconButton>
                </>
              ) : (
                " -"
              )}
            </Typography>
          </>
        ) : (
          <Typography>No login info available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginInfoDialog;
