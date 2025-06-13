import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useRef, useState } from "react";
import './login.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


import { MdLocalPharmacy } from "react-icons/md";
import { Snackbar, Alert } from "@mui/material";
import { login } from "../../store/slices/UserSlice"; // 🟡 Adjust path as needed

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const usernameRef = useRef();
  const passwordRef = useRef();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  // 🟢 Redirect if already logged in
  if (user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!username || !password) {
      setSnackbarMsg("Please enter both username and password");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🟡 Includes cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMsg("Signin successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        dispatch(login(data.user)); // ✅ Set user in Redux store
      } else {
        setSnackbarMsg(data.message || "Login failed");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setSnackbarMsg("Network error or server not responding.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <div className="login-Container">
      <div className="pharma-login-wrapper">
        <div className="pharma-login-box">
          <h1 className="pharma-title">
            <MdLocalPharmacy /> Silitzer-Pharma
          </h1>
          <p className="pharma-subtitle">Committed to Wellness</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              className="pharma-input"
              ref={usernameRef}
            />
            <input
              type="password"
              placeholder="Password"
              className="pharma-input"
              ref={passwordRef}
            />
            <button className="pharma-button">Login</button>
          </form>
        </div>
      </div>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
