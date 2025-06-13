import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { MdLocationPin } from "react-icons/md";
import "./style/EmployeeTodayLogin.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getMapLinkFromString = (locationString) => {
  if (!locationString) return null;
  return `https://www.google.com/maps?q=${locationString.trim()}`;
};

const SessionLocation = ({ label, location }) => {
  if (!location) return null;

  return (
    <Typography variant="body2" color="textSecondary" gutterBottom>
      <strong>{label}:</strong>{" "}
      <a
        href={getMapLinkFromString(location)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MdLocationPin
          style={{ color: "red", verticalAlign: "middle", marginLeft: 4 }}
        />
      </a>
      {" " + location}
    </Typography>
  );
};

const formatDuration = (start, end) => {
  if (!start) return "—";
  const endTime = end ? new Date(end) : new Date();
  const diffMs = endTime - new Date(start);
  if (diffMs < 0) return "—";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const EmployeeTodayLogin = () => {
  const [sessions, setSessions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const latestLocationRef = useRef(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employee/todaylogin`, {
        credentials: "include",
      });
      const data = await res.json();
      setIsActive(data.isActive);
      setSessions(data.allSessions || []);

      // Start live location if already logged in
      if (data.isActive) {
        startLiveLocationUpdates();
      }
    } catch (error) {
      alert("Error fetching session info.");
    } finally {
      setLoading(false);
      setActionLoading(false);
    }
  };

  const sendLiveLocation = async (latitude, longitude) => {
    try {
      const res = await fetch(`${BASE_URL}/employee/livelocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Server error");
      }
    } catch (error) {
      setErrorDialogMessage("Failed to send live location: " + error.message);
      setErrorDialogOpen(true);
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogMessage("");
  };

  const startLiveLocationUpdates = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        latestLocationRef.current = { latitude, longitude };
        sendLiveLocation(latitude, longitude);
      },
      (error) => {
        console.error("watchPosition error:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;

    const intervalId = setInterval(() => {
      console.log("Interval trigger: Sending latest location...");
      if (latestLocationRef.current) {
        const { latitude, longitude } = latestLocationRef.current;
        sendLiveLocation(latitude, longitude);
      }
    }, 2 * 60 * 1000); 

    intervalIdRef.current = intervalId;
  };

  const stopLiveLocationUpdates = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  useEffect(() => {
    fetchSession();
    return () => {
      stopLiveLocationUpdates();
    };
  }, []);

  const handleLogin = () => {
    setConfirmAction("login");
    setConfirmOpen(true);
  };

  const handleLogout = () => {
    setConfirmAction("logout");
    setConfirmOpen(true);
  };

  const performLogin = () => {
    setConfirmOpen(false);
    setActionLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const response = await fetch(`${BASE_URL}/employee/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ latitude, longitude }),
          });

          const result = await response.json();

          if (response.ok) {
            startLiveLocationUpdates();
            alert("Login successful. Location saved.");
            fetchSession();
          } else {
            alert(result.message || "Login failed");
          }
        } catch (error) {
          alert("Something went wrong while logging in.");
        } finally {
          setActionLoading(false);
        }
      },
      (err) => {
        alert(`Could not get location: ${err.message}`);
        setActionLoading(false);
        setConfirmOpen(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const performLogout = async () => {
    setConfirmOpen(false);
    setActionLoading(true);

    try {
      const getLocation = () =>
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
              resolve({ latitude: coords.latitude, longitude: coords.longitude }),
            (error) => reject("Location error: " + error.message)
          );
        });

      const { latitude, longitude } = await getLocation();

      const response = await fetch(`${BASE_URL}/employee/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await response.json();

      if (response.ok) {
        stopLiveLocationUpdates();
        alert("Logout successful");
        fetchSession();
      } else {
        alert("Logout failed: " + result.message);
      }
    } catch (err) {
      alert("Logout failed: " + err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = () => {
    if (confirmAction === "login") {
      performLogin();
    } else if (confirmAction === "logout") {
      performLogout();
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  if (loading) {
    return (
      <Box className="employee-today-login" sx={{ p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box className="employee-today-login" sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Today’s Login Info
      </Typography>

      {isActive ? (
        <Box mb={2}>
          <Typography variant="body1" color="green" gutterBottom>
            You are currently logged in.
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            disabled={actionLoading}
            fullWidth
          >
            {actionLoading ? "Logging out..." : "Logout for Today"}
          </Button>
        </Box>
      ) : (
        <Box mb={2}>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            You have not logged in yet today.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={actionLoading}
            fullWidth
          >
            {actionLoading ? "Logging in..." : "Login for Today"}
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {sessions.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No login sessions for today.
        </Typography>
      ) : (
        sessions.map((session, index) => {
          const isCurrentActive = isActive && index === 0 && !session.logoutTime;
          return (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: isCurrentActive ? "rgba(144,238,144,0.3)" : "inherit",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: isCurrentActive ? "bold" : "normal" }}
                gutterBottom
              >
                Session #{sessions.length - index} {isCurrentActive && "(Active)"}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Login Time:{" "}
                {session.loginTime
                  ? new Date(session.loginTime).toLocaleTimeString()
                  : "—"}
              </Typography>

              <SessionLocation
                label="Login Location"
                location={session.loginLocation}
              />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Logout Time:{" "}
                {session.logoutTime
                  ? new Date(session.logoutTime).toLocaleTimeString()
                  : "—"}
              </Typography>

              <SessionLocation
                label="Logout Location"
                location={session.logoutLocation}
              />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Duration: {formatDuration(session.loginTime, session.logoutTime)}
              </Typography>
            </Paper>
          );
        })
      )}

      <NavLink
        to="/employee/tasks"
        className="nav-link"
        style={{ marginTop: 16, display: "inline-block" }}
      >
        👉 See Today’s Tasks
      </NavLink>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={handleCloseErrorDialog}>
        <DialogTitle>Location Send Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>
          {confirmAction === "login" ? "Confirm Login" : "Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmAction}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeTodayLogin;
