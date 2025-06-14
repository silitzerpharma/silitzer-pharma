import { NavLink } from "react-router-dom";
import React, { useState ,useEffect} from "react";
import "./MobileNavbar.scss";

import { FaBell, FaUserCircle } from "react-icons/fa";
import GridViewIcon from '@mui/icons-material/GridView';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import BadgeIcon from '@mui/icons-material/Badge';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import ListIcon from '@mui/icons-material/List';
import socket from "../../../store/socket";
import NotificationPanel from "../View/NotificationPanel"

import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";

import { TbLogin } from "react-icons/tb";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MobileNavbar = ({handleLogout}) => {

 const [notificationCount,setNotificationCount] = useState(0);
 const [showNotifications, setShowNotifications] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {

    fetchNotificationsCount();

  }, []);

  const fetchNotificationsCount = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/notifications/count`, {
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



  return (
    <nav className="Admin-MobileNavbar">

      <div className="adm-nav-top">
        <div className="adm-nav-left">
          <NavLink to="/">
            <img src="/rectangle-logo.png" alt="logo" className="nav-logo" />
          </NavLink>
        </div>

        <div className="adm-nav-right">

          <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <FaBell size={20} />
              <div className="counter">{notificationCount}</div>
            </button>
        
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <AiOutlineMenuFold className="menu-icon" />
            ) : (
              <AiOutlineMenuUnfold className="menu-icon" />
            )}
          </button>
        </div>
      </div>
      
      {menuOpen && (
        <div className="adm-nav-menu">

        <NavLink to="/admin" onClick={()=>setMenuOpen(false)} className="menu-link">
              <GridViewIcon />
              <span>Dashboard</span>
            </NavLink>
          <NavLink to="distributors" onClick={()=>setMenuOpen(false)} className="menu-link">
              <Diversity3Icon />
              <span>Distributors</span>
            </NavLink>
            <NavLink to="employees" onClick={()=>setMenuOpen(false)} className="menu-link">
              <BadgeIcon />
              <span>Employees</span>
            </NavLink>
             <NavLink to="products" onClick={()=>setMenuOpen(false)} className="menu-link">
              <AddShoppingCartIcon />
              <span>Products</span>
            </NavLink>
              <NavLink to="orders" onClick={()=>setMenuOpen(false)} className="menu-link">
              <LocalShippingIcon />
              <span>Orders</span>
            </NavLink>
               <NavLink to="stock" onClick={()=>setMenuOpen(false)} className="menu-link">
              <StoreIcon/>
              <span>Stock</span>
            </NavLink>
              <NavLink to="DistributorDashboardSettings" onClick={()=>setMenuOpen(false)} className="menu-link">
              <SettingsApplicationsIcon/>
              <span>Distributors</span>
            </NavLink>
                <NavLink to="Orderrecords" onClick={()=>setMenuOpen(false)} className="menu-link">
              <ListIcon/>
              <span>Order Records</span>
            </NavLink>
          

          <button className="menu-link logout-btn" onClick={handleLogout} >
           <TbLogin className="logout-btn-icon"/> Logout
          </button>

        </div>
      )}
        {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)}  />
      )}
    </nav>
  );
};

export default MobileNavbar;
