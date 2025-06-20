import { NavLink } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import "./style/EmployeeNavbar.scss";

import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { FaUserCircle, FaRegDotCircle, FaHome } from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import { TiThMenu } from "react-icons/ti";
import { TbLogin } from "react-icons/tb";
import { RiLoginBoxLine } from "react-icons/ri";
import GroupsIcon from "@mui/icons-material/Groups";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from "@mui/material/Tooltip";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeNavbar = ({ isActive, setIsActive, locationError }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        dispatch(logout());
        navigate("/login");
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed due to network error");
    }
  };

  return (
    <nav className="EmployeeNavbar">
      <div className="emp-nav-top">
        <div className="emp-nav-left">
          <NavLink to="/">
            <img src="/rectangle-logo.png" alt="logo" className="nav-logo" />
          </NavLink>
        </div>
        <div className="emp-nav-right">
          {/* Live status dot */}
          <div className="loginout-menu">
            {isActive ? (
              <FaRegDotCircle className="menu-icon logout" />
            ) : (
              <FaRegDotCircle className="menu-icon login" />
            )}
          </div>

          {/* Location warning icon */}
          {locationError && (
            <Tooltip title="Live location not updating">
              <WarningAmberIcon color="error" style={{ marginLeft: 8 }} />
            </Tooltip>
          )}

          {/* Menu toggle */}
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <AiOutlineMenuFold className="menu-icon" />
            ) : (
              <AiOutlineMenuUnfold className="menu-icon" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="emp-nav-menu">
          <NavLink to="" onClick={() => setMenuOpen(false)} className="menu-link">
            <FaHome /> Home
          </NavLink>
          <NavLink to="todaylogin" onClick={() => setMenuOpen(false)} className="menu-link">
            <RiLoginBoxLine /> TodayLogin
          </NavLink>
          <NavLink to="profile" onClick={() => setMenuOpen(false)} className="menu-link">
            <FaUserCircle /> Profile
          </NavLink>
          <NavLink to="tasks" onClick={() => setMenuOpen(false)} className="menu-link">
            <MdAssignment /> Tasks
          </NavLink>
          <NavLink to="stock" onClick={() => setMenuOpen(false)} className="menu-link">
            <TiThMenu /> Stock
          </NavLink>
          <NavLink to="orders" onClick={() => setMenuOpen(false)} className="menu-link">
            <ListAltIcon /> Orders
          </NavLink>
          <NavLink to="work" onClick={() => setMenuOpen(false)} className="menu-link">
            <WorkHistoryIcon /> Work
          </NavLink>
          <NavLink to="requests" onClick={() => setMenuOpen(false)} className="menu-link">
            <PendingActionsIcon /> Requests
          </NavLink>
          <NavLink to="distributors" onClick={() => setMenuOpen(false)} className="menu-link">
            <GroupsIcon /> Distributors
          </NavLink>

          <button className="menu-link logout-btn" onClick={handleSignOut}>
            <TbLogin className="logout-btn-icon" /> SignOut
          </button>
        </div>
      )}
    </nav>
  );
};

export default EmployeeNavbar;
