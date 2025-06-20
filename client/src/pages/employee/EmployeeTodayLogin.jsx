import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { NavLink, useOutletContext } from "react-router-dom";
import { MdLocationPin } from "react-icons/md";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import "./style/EmployeeTodayLogin.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getMapLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

const SessionLocation = ({ label, location }) => {
  if (!location?.latitude || !location?.longitude) return null;
  return (
    <Typography variant="body2" color="textSecondary" gutterBottom>
      <strong>{label}:</strong>{" "}
      <a
        href={getMapLink(location.latitude, location.longitude)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MdLocationPin style={{ color: "red", verticalAlign: "middle" }} />
        {" " + location.latitude + "," + location.longitude}
      </a>
    </Typography>
  );
};

const getDuration = (start, end) => {
  if (!start) return "—";
  const diff = new Date(end || Date.now()) - new Date(start);
  if (diff < 0) return "—";
  const s = Math.floor(diff / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const EmployeeTodayLogin = () => {
  const [sessions, setSessions] = useState([]);
  const { isActive, setIsActive, setLocationError } = useOutletContext(); // ✅ include locationError setter
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [geoDialogOpen, setGeoDialogOpen] = useState(false);
  const [geoCountdown, setGeoCountdown] = useState(15);

  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const latestLocation = useRef(null);

  useEffect(() => {
    fetchSession();
    return stopLiveLocation;
  }, []);

  useEffect(() => {
    if (!geoDialogOpen) return;
    const interval = setInterval(() => {
      setGeoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGeoDialogOpen(false);
          toast.error("Failed to get location: timeout");
          setLocationError(true); // ✅ set error
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [geoDialogOpen]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employee/todaylogin`, {
        credentials: "include",
      });
      const data = await res.json();
      setIsActive(data.isActive);
      setSessions(data.allSessions || []);
      if (data.isActive) startLiveLocation();
    } catch {
      toast.error("Failed to fetch session info.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocationError(false); // ✅ clear error on success
          resolve(coords);
        },
        (err) => {
          setLocationError(true); // ✅ set error on failure
          reject(new Error("Location error: " + err.message));
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });

  const sendLiveLocation = async (lat, lng) => {
    try {
      await fetch(`${BASE_URL}/employee/livelocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
    } catch {
      toast.warn("Failed to send live location.");
    }
  };

  const startLiveLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported.");
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        latestLocation.current = coords;
        sendLiveLocation(coords.latitude, coords.longitude);
        setLocationError(false); // ✅ clear error
      },
      (err) => {
        console.error("watchPosition error:", err.message);
        setLocationError(true); // ✅ set error
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    intervalRef.current = setInterval(() => {
      if (latestLocation.current) {
        const { latitude, longitude } = latestLocation.current;
        sendLiveLocation(latitude, longitude);
      }
    }, 2 * 60 * 1000);
  };

  const stopLiveLocation = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setGeoCountdown(15);
    setGeoDialogOpen(true);
    setLoading(true);

    try {
      const { latitude, longitude } = await getLocation();
      setGeoDialogOpen(false);

      const url = confirmAction === "login" ? "/employee/login" : "/employee/logout";
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Server error");

      if (confirmAction === "login") {
        startLiveLocation();
        toast.success("Login successful.");
      } else {
        stopLiveLocation();
        toast.success("Logout successful.");
      }

      await fetchSession();
    } catch (err) {
      setGeoDialogOpen(false);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Processing..." />;

  return (
    <Box className="employee-today-login" sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>Today’s Login Info</Typography>

      <Box mb={2}>
        <Typography variant="body1" gutterBottom color={isActive ? "green" : "textSecondary"}>
          {isActive ? "You are currently logged in." : "You have not logged in yet today."}
        </Typography>
        <Button
          variant="contained"
          color={isActive ? "error" : "primary"}
          fullWidth
          onClick={() => {
            setConfirmAction(isActive ? "logout" : "login");
            setConfirmOpen(true);
          }}
        >
          {isActive ? "Logout for Today" : "Login for Today"}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {sessions.length === 0 ? (
        <Typography variant="body2" color="textSecondary">No login sessions for today.</Typography>
      ) : (
        sessions.map((s, i) => {
          const active = isActive && i === 0 && !s.logoutTime;
          return (
            <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: active ? "#e0ffe0" : undefined }}>
              <Typography variant="subtitle1" fontWeight={active ? "bold" : "normal"}>
                Session #{sessions.length - i} {active && "(Active)"}
              </Typography>
              <Typography variant="body2">Login Time: {s.loginTime ? new Date(s.loginTime).toLocaleTimeString() : "—"}</Typography>
              <SessionLocation label="Login Location" location={s.loginLocation} />
              <Typography variant="body2">Logout Time: {s.logoutTime ? new Date(s.logoutTime).toLocaleTimeString() : "—"}</Typography>
              <SessionLocation label="Logout Location" location={s.logoutLocation} />
              <Typography variant="body2">Duration: {getDuration(s.loginTime, s.logoutTime)}</Typography>
            </Paper>
          );
        })
      )}

      <NavLink to="/employee/tasks" className="nav-link" style={{ marginTop: 16, display: "inline-block" }}>
        👉 See Today’s Tasks
      </NavLink>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {confirmAction}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to {confirmAction}?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Geolocation Loading Dialog */}
      <Dialog open={geoDialogOpen}>
        <DialogTitle>Getting Location</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please wait while we access your location.
          </DialogContentText>
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Time remaining: {geoCountdown}s
            </Typography>
            <Box sx={{ width: "100%", height: 10, backgroundColor: "#eee", borderRadius: 5 }}>
              <Box
                sx={{
                  width: `${((15 - geoCountdown) / 15) * 100}%`,
                  height: "100%",
                  backgroundColor: "#1976d2",
                  transition: "width 1s linear",
                  borderRadius: 5,
                }}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeTodayLogin;
