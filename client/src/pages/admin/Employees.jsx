import React, { useState } from "react";
import "./style/Pages.scss";

import EmployeesTable from "../../components/admin/tables/EmployeesTable";
import AddEmployee from "../../components/admin/form/AddEmployee";

const Employees = () => {
  const [addEmployee, setAddEmployee] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refreshEmployeesList = () => setRefreshFlag((prev) => !prev);
  const handleAddNew = () => setAddEmployee((prev) => !prev);

  return (
    <div className="page">
      <div className="page-title">Employees</div>

      <div className="page-nav">
        <button className="nav-btn" onClick={handleAddNew}>
          {addEmployee ? "View Employees" : "Add New"}
        </button>
        <div>Employees Total : 34</div> {/* You can update this count dynamically later */}
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
