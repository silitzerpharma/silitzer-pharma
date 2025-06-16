import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import './style/ViewEmployee.scss';

import EmployeeTodaysActivity from "./EmployeeTodaysActivity";
import TaskTable from "../tables/TaskTable";
import EmployeeWorkSessions from "../tables/EmployeeWorkSessions";
import EmployeeProfile from './employee/EmployeeProfile';
import EmployeeLeave from './employee/EmployeeLeave';
import EmployeeRequests from './employee/EmployeeRequests';  // NEW

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewEmployee = ({ openViewEmployee, EmployeeId, EmployeeObjectId, refreshEmployeesList }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [requestCount, setRequestCount] = useState(1); // example default value

    const [refreshFlag, setRefreshFlag] = useState(false);
    const refreshEmployeeData = () => setRefreshFlag((prev) => !prev);

  useEffect(() => {
    if (!EmployeeId) return;

    setLoading(true);
    fetch(`${BASE_URL}/admin/employee/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ EmployeeID: EmployeeId }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch employee data");
        return res.json();
      })
      .then(data => {
        setRequestCount(data.data.requestcount);
        const emp = data.data.employee;
        if (emp.JoiningDate) {
          const d = new Date(emp.JoiningDate);
          emp.JoiningDate = isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        }
        setEmployee(emp);
        setUsername(data.data.username || "");
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });


  }, [EmployeeId,refreshFlag]);

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "today", label: "TodaysActivity" },
    { key: "sessions", label: "Work Sessions" },
    { key: "tasks", label: "Manage Tasks" },
    { key: "leave", label: "Leave" },
 {
  key: "requests",
  label: (
    <Badge
      badgeContent={requestCount}
      color="error"
      max={99}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '10px',
          height: '16px',
          minWidth: '16px',
          top: '2px',
          right: '-8px',
        },
      }}
    >
      Requests
    </Badge>
  ),
}
  ];

  return (
    <div className="ViewEmployee">
      <nav className="ViewEmployee-nav">
        {tabs.map(tab => (
          <div
            key={tab.key}
            className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
        <button className="nav-link btn" onClick={openViewEmployee}>
          <CloseIcon />
        </button>
      </nav>

      <div className="ViewEmployee-container">
        {loading && <div className="loading">Loading employee data...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && employee && (
          <>
            {activeTab === 'profile' && (
              <EmployeeProfile
                employee={employee}
                username={username}
                AuthUser_id={EmployeeId}
                refreshEmployeesList={refreshEmployeesList}
                openViewEmployee={openViewEmployee}
              />
            )}

            {activeTab === 'today' && <EmployeeTodaysActivity employeeId={EmployeeObjectId} />}
            {activeTab === 'sessions' && <EmployeeWorkSessions employeeId={EmployeeObjectId} />}
            {activeTab === 'tasks' && <TaskTable employeeId={EmployeeObjectId} />}
            {activeTab === 'leave' && <EmployeeLeave employeeId={EmployeeObjectId} />}
            {activeTab === 'requests' && <EmployeeRequests employeeId={EmployeeObjectId} refreshEmployeeData={refreshEmployeeData}  />} {/* NEW */}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewEmployee;
