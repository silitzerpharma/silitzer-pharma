import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import "./adminnavbar.css";

import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from '../../../store/slices/UserSlice';
import socket from "../../../store/socket";

import MobileNavbar from "./MobileNavbar";
import NotificationPanel from "../View/NotificationPanel";

const AdminNavbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount,setNotificationCount] = useState(0);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {

    fetchNotificationsCount();


    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('profile');
  };

const fetchNotificationsCount = async () => {
  try {
    const response = await fetch("http://localhost:3000/admin/notifications/count", {
      method: "GET",
      credentials: "include", // This includes cookies in the request
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notification count");
    }

    const data = await response.json();
    setNotificationCount(data.count);
    return data.count;
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return 0;
  }
};



  useEffect(() => {
    socket.on("AdminNotificationUpdate", () => {
      fetchNotificationsCount();
    });
    return () => {
      socket.off("AdminNotificationUpdate");
    };
  }, []);


  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      const res = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include' // important for cookies
      });

      if (res.ok) {
        dispatch(logout());
        navigate('/login');
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Logout failed due to network error');
    }
  };

  return (
    <>
      {isMobile ? (
        <MobileNavbar handleLogout={handleLogout} />
      ) : (
        <nav className="navbar">
          {/* Left Side */}
          <div className="navbar-left">
            <div className="logo">
              <img src="/rectangle-logo.png" alt="logo" />
            </div>
            <button className="menu-toggle">
              {/* <FaBars size={20} /> */}
            </button>
          </div>

          {/* Right Side */}
          <div className="navbar-right">
            <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <FaBell size={20} />
              <div className="counter">{notificationCount}</div>
            </button>

            <div className="user-menu">
              <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                className="user-button"
              >
                <FaUserCircle size={22} />
              </Button>

              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
                className="user-dropdown"
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </div>
        </nav>
      )}

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)}  />
      )}
    </>
  );
};

export default AdminNavbar;
