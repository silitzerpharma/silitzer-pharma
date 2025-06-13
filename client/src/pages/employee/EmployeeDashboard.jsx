import React, { useEffect, useState } from "react";
import "./style/EmployeeDashboard.scss";
import { NavLink } from "react-router-dom";

import OfferSlider from "../../components/distributor/slider/OfferSlider";
import EmployeeProductSlider from "../../components/employee/product/EmployeeProductSlider";

import EmployeeFooter from "../../components/employee/EmployeeFooter";


const EmployeeDashboard = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const res = await fetch("http://localhost:3000/employee/dashboard", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
          setEmployeeName(data.name);
        }
      } catch (err) {
        console.error("Error fetching employee profile:", err);
      }
    };

    fetchEmployeeData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="EmployeeDashboard">
      <div className="welcome-header">
        <h2>
          {getGreeting()}, {employeeName || "Employee"} 👋
        </h2>
        <p>
          Welcome to <strong>Silitzer Pharma</strong>. Let’s make today
          productive!
        </p>
        <NavLink to="tasks" className="task-link">
          See today’s assigned tasks and work updates
        </NavLink>

        <div className="today-login-link">
          <NavLink to="todaylogin" className="login-nav">
            👉 Today Login
          </NavLink>
        </div>
      </div>
      <div className="offer-div">
        <OfferSlider offersList={dashboardData.offers} />
      </div>

      <div className="emp-product-slider">
    {(dashboardData.productSliders || []).map((slider) => (
  <EmployeeProductSlider
    key={slider._id}
    title={slider.title}
    productList={slider.productList}
  />
))}
      </div>


      <EmployeeFooter/>
    </div>
  );
};

export default EmployeeDashboard;
