import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { MdLocationPin } from "react-icons/md";
import Loader from "../common/Loader";
import { toast } from "react-toastify";

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

const TodaysLoginSession = () => {
  const [sessions, setSessions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employee/todaylogin`, {
        credentials: "include",
      });
      const data = await res.json();
      setIsActive(data.isActive);
      setSessions(data.allSessions || []);
    } catch (err) {
      toast.error("Failed to fetch today's login sessions.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading sessions..." />;

  if (!sessions.length) {
    return (
      <Typography variant="body2" color="textSecondary">
        No login sessions for today.
      </Typography>
    );
  }

  return (
    <Box mt={2}>
      {sessions.map((s, i) => {
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
      })}
    </Box>
  );
};

export default TodaysLoginSession;
