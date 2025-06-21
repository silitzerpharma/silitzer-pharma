import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import TodaysLoginSession from "../../components/employee/TodaysLoginSession"; // ✅ New component
import "./style/EmployeeTodayLogin.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeTodayLogin = () => {
  const { isActive, setIsActive, setLocationError } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [geoDialogOpen, setGeoDialogOpen] = useState(false);
  const [geoCountdown, setGeoCountdown] = useState(15);

  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const latestLocation = useRef(null);

  useEffect(() => {
    fetchLoginStatus();
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
          setLocationError(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [geoDialogOpen]);

  const fetchLoginStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employee/todaylogin`, {
        credentials: "include",
      });
      const data = await res.json();
      setIsActive(data.isActive);
      if (data.isActive) startLiveLocation();
    } catch {
      toast.error("Failed to check login status.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocationError(false);
          resolve(coords);
        },
        (err) => {
          setLocationError(true);
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
        setLocationError(false);
      },
      (err) => {
        console.error("watchPosition error:", err.message);
        setLocationError(true);
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

      await fetchLoginStatus();
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

      {/* ✅ New component to render session details */}
      <TodaysLoginSession />

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
