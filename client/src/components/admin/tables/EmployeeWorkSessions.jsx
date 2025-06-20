import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import { format, differenceInMinutes, parseISO } from "date-fns";
import EmployeedaysActivity from "../View/EmployeedaysActivity";
import "./style/EmployeeWorkSessions.scss";
import Loader from "../../common/Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeWorkSessions = ({ employeeId }) => {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalDays, setTotalDays] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/admin/employee/employee-work-sessions?employeeId=${employeeId}&page=${page}&limit=${limit}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      const data = await response.json();
      setSessions(data.workSessions || []);
      setTotalDays(data.totalDays || 0);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchSessions();
  }, [employeeId, page]);

  const handleSearch = () => {
    setPage(1);
    fetchSessions();
  };

  const handleDownload = async () => {
    try {
      let url = `${BASE_URL}/admin/employee/worksessions/download?employeeId=${employeeId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `employee_work_sessions_${employeeId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download session data.");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "d/M/yyyy h:mm a");
  };

  const calculateWorkHours = (login, logout) => {
    if (!login || !logout) return "N/A";
    const minutes = differenceInMinutes(new Date(logout), new Date(login));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const totalPages = Math.ceil(totalDays / limit);

  const handleRowClick = (date) => {
    setSelectedDay(date);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedDay(null);
  };

  if (loading) return <Loader message="Loading Employee Work Sessions..." />;

  return (
    <div className="employee-work-sessions">
      <Typography variant="h5" className="title">
        Employee Work Sessions
        <span className="search-date" style={{ marginLeft: "20px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {" "}To{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <button className="download-btn" onClick={handleDownload}>
            Download
          </button>
        </span>
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead className="table-head">
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Login Time</TableCell>
              <TableCell>Login Location</TableCell>
              <TableCell>Logout Time</TableCell>
              <TableCell>Logout Location</TableCell>
              <TableCell>Work Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleRowClick(session.date)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{format(parseISO(session.date), "d/M/yyyy")}</TableCell>
                  <TableCell>{formatDateTime(session.loginTime)}</TableCell>
                  <TableCell>
                    {session.loginAddress || "N/A"}{" "}
                    {session.loginLocation?.latitude && session.loginLocation?.longitude && (
                      <IconButton
                        size="small"
                        href={`https://maps.google.com/?q=${session.loginLocation.latitude},${session.loginLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ padding: 0, marginLeft: 1 }}
                      >
                        <PlaceIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(session.logoutTime)}</TableCell>
                  <TableCell>
                    {session.logoutAddress || "N/A"}{" "}
                    {session.logoutLocation?.latitude && session.logoutLocation?.longitude && (
                      <IconButton
                        size="small"
                        href={`https://maps.google.com/?q=${session.logoutLocation.latitude},${session.logoutLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ padding: 0, marginLeft: 1 }}
                      >
                        <PlaceIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    {calculateWorkHours(session.loginTime, session.logoutTime)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="no-data">
                  No session data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>

        <Typography>
          Page {page} of {totalPages || 1}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Employee Activity for{" "}
          {selectedDay && format(parseISO(selectedDay), "d/M/yyyy")}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedDay && (
            <EmployeedaysActivity employeeId={employeeId} day={selectedDay} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeWorkSessions;
