import './leftnavbar.scss'
import { NavLink } from 'react-router-dom'
import { MdDashboard } from "react-icons/md";
import GridViewIcon from '@mui/icons-material/GridView';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import BadgeIcon from '@mui/icons-material/Badge';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import ListIcon from '@mui/icons-material/List';

const LeftNavbar = () => {
  return (
    <div className="left-navbar">
      <div className="top">
        <MdDashboard className="logo" />
        Admin-Dashboard
      </div>
      <hr />
      <div className="center">
        <ul>
          <li>
            <NavLink to="/admin" className="nav-link" end>
              <GridViewIcon />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="distributors" className="nav-link">
              <Diversity3Icon />
              <span>Distributors</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="employees" className="nav-link">
              <BadgeIcon />
              <span>Employees</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="products" className="nav-link">
              <AddShoppingCartIcon />
              <span>Products</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="orders" className="nav-link">
              <LocalShippingIcon />
              <span>Orders</span>
            </NavLink>
            
          </li>
          <li>
            <NavLink to="stock" className="nav-link">
              <StoreIcon/>
              <span>Stock</span>
            </NavLink>
          </li>
          <hr />
          <li>
            <NavLink to="DistributorDashboardSettings" className="nav-link">
              <SettingsApplicationsIcon/>
              <span>Distributors</span>
            </NavLink>
            
              <NavLink to="Orderrecords" className="nav-link">
              <ListIcon/>
              <span>Order Records</span>
            </NavLink>
          </li>

        </ul>
      </div>
      <div className="bottom">
        <div className="colorOption"></div>
        <div className="colorOption"></div>
      </div>
    </div>
  );
}

export default LeftNavbar;
