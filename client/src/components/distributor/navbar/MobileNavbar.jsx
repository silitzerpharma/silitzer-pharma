import "./mobilenavbar.scss";
import { NavLink, useNavigate } from "react-router-dom";
import { selectTotalCartQuantity } from "../../../store/slices/cartSlice";
import { useSelector,useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { logout } from "../../../store/slices/UserSlice"; // ✅ Needed in MobileNavbar.jsx

import { FaRegCalendarCheck } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FiSearch } from "react-icons/fi";

import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const MobileNavbar = () => {
  const totalQuantity = useSelector(selectTotalCartQuantity);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

const dispatch = useDispatch();

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
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
    <nav className="mobile-nav">
      <div className="mobile-nav-1">
         <NavLink to="/" className="nav-logo">
            <img src="/rectangle-logo.png" alt="logo" />
          </NavLink>
    
        <div className="mobile-nav-menu">
          <NavLink
            to="/distributor/orders"
             className={({ isActive }) => (isActive ? "icon" : "icon")}
          >
            <FaRegCalendarCheck size={25} className="icon" />
          </NavLink>

          <NavLink
            to="/distributor/cart"
            className={({ isActive }) => (isActive ? "icon" : "icon")}
          >
            <Badge
              badgeContent={totalQuantity}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.5rem",
                  height: 16,
                  minWidth: 16,
                  padding: "0 4px",
                },
              }}
            >
              <ShoppingCartIcon />
            </Badge>
          </NavLink>

          <div className="profile-wrapper" ref={menuRef}>
            <CgProfile
              size={25}
              className="icon"
              onClick={() => setShowMenu((prev) => !prev)}
            />
            {showMenu && (
              <div className="profile-menu">
                <div onClick={() => { navigate("/distributor/profile"); setShowMenu(false); }}>
                  Profile
                </div>
                <div onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-nav-2">
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
