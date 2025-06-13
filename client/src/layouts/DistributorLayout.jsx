// src/layouts/DistributorLayout.jsx
import { Outlet } from "react-router-dom";
import DistributorNavbar from "../components/distributor/DistributorNavbar";

import './DistributorLayout.scss'

const DistributorLayout = () => (
  <div className="main-screen">
    <DistributorNavbar />

    <div className="Outlet-screen">
      <Outlet />
    </div>
  </div>
);

export default DistributorLayout;
