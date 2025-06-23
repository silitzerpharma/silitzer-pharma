import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import { selectTotalCartQuantity } from "../../../store/slices/cartSlice";
import { logout } from "../../../store/slices/UserSlice";
import "./desktopnavbar.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DesktopNavbar = () => {
  const totalQuantity = useSelector(selectTotalCartQuantity);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = async () => {
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
    <>
      <nav className="dist-navbar">
        <div className="left">
          <NavLink to="/">
            <img src="/rectangle-logo.png" alt="logo" />
          </NavLink>
        </div>

        <div className="center">
          <div className="search-container">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
            />
            <span className="search-icon" onClick={handleSearch}>
              <SearchIcon />
            </span>
          </div>
        </div>

        <div className="right home">
          <NavLink to="/distributor" className={({ isActive }) => isActive ? "nav-link d-active" : "nav-link"} end>
            Home
          </NavLink>

          <NavLink to="/distributor/orders" className={({ isActive }) => isActive ? "nav-link d-active" : "nav-link"}>
            Order
          </NavLink>

          <NavLink to="/distributor/cart" className={({ isActive }) => isActive ? "nav-link d-active" : "nav-link"}>
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
            </Badge>{" "}
            Cart
          </NavLink>

          <NavLink to="/distributor/profile" className={({ isActive }) => isActive ? "nav-link d-active" : "nav-link"}>
            Profile
          </NavLink>

          <button onClick={handleLogout} className="nav-link button">
            Logout
          </button>
        </div>
      </nav>

      <nav className="cat-navbar">
        <div className="header">
          <NavLink to="/distributor" className={({ isActive }) => isActive ? "cat-active" : "cat-link"} end>
            View Products
          </NavLink>
        </div>

        <div className="cat-menu">
          <NavLink to="allproductslist" className={({ isActive }) => isActive ? "cat-active" : "cat-link"} end>
            All product list
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default DesktopNavbar;
