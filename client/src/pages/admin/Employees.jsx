import React, { useState, useEffect } from "react";
import "./style/Pages.scss";

import EmployeesTable from "../../components/admin/tables/EmployeesTable";
import AddEmployee from "../../components/admin/form/AddEmployee";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Employees = () => {
  const [addEmployee, setAddEmployee] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const refreshEmployeesList = () => setRefreshFlag((prev) => !prev);
  const handleAddNew = () => setAddEmployee((prev) => !prev);

  // 🔁 Fetch employee count
  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/employees/data`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        setTotalEmployees(data.totalCount || 0); // Adjust key if needed
      } catch (error) {
        console.error("Failed to fetch employee count", error);
      }
    };

    fetchEmployeeCount();
  }, [refreshFlag]);

  return (
    <div className="page">
      <div className="page-title">Employees</div>

      <div className="page-nav">
        <button className="nav-btn" onClick={handleAddNew}>
          {addEmployee ? "View Employees" : "Add New"}
        </button>
        <div>Employees Total : {totalEmployees}</div>
      </div>

      {addEmployee ? (
        <AddEmployee
          openAddEmployeeForm={handleAddNew}
          refreshEmployeesList={refreshEmployeesList}
        />
      ) : (
        <EmployeesTable
          openAddEmployeeForm={handleAddNew}
          refreshEmployeesList={refreshEmployeesList}
          refreshFlag={refreshFlag}
        />
      )}
    </div>
  );
};

export default Employees;
