import { useState, useEffect } from "react";
import "./style/EmployeesTable.scss";
import "./style/Table.scss";

import ViewEmployee from "../View/ViewEmployee";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Pagination from "@mui/material/Pagination";

import socket from "../../../store/socket";
import Loader from "../../common/Loader";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
} from "@mui/material";

// Dialogs
import AssignTaskDialog from "../View/employee/AssignTaskDialog";
import LoginInfoDialog from "../View/employee/LoginInfoDialog";
import TaskDetailsDialog from "../View/employee/TaskDetailsDialog";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeesTable = ({ refreshEmployeesList, refreshFlag }) => {
  const [viewEmployee, setViewEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [loginInfoOpen, setLoginInfoOpen] = useState(false);
  const [loginInfo, setLoginInfo] = useState(null);
  const [loginAddress, setLoginAddress] = useState("");
  const [logoutAddress, setLogoutAddress] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  const openViewEmployee = () => setViewEmployee((prev) => !prev);

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setViewEmployee(true);
  };

  const handleAssignTask = (employee) => {
    setSelectedEmployee(employee);
    setAssignTaskOpen(true);
  };

  const handleLoginInfo = (employee) => {
    setLoginInfo(employee.todayLogin);
    setLoginInfoOpen(true);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/employee/all?search=${search}&page=${page}&limit=${limit}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setTotal(data.total || 0);

      const formatted = data.employees.map((emp) => ({
        employeeID: emp.EmployeeID || "-",
        name: emp.username || "-",
        isActive: emp.IsActive ?? false,
        location: "-",
        task: emp.task || null,
        employee_id: emp.employee_id,
        employeeObjectId: emp.EmployeeObjectId,
        todayLogin: emp.todayLogin || null,
        lastLocation: emp.liveLocation,
      }));

      setEmployees(formatted);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshFlag, refreshTrigger, search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setLoginAddress(loginInfo?.loginAddress || "Unknown");
    setLogoutAddress(loginInfo?.logoutAddress || "Unknown");
  }, [loginInfo]);

  useEffect(() => {
    socket.on("updateEmployeeData", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return () => socket.off("updateEmployeeData");
  }, []);

  if (loading) return <Loader message="Loading Employees..." />;

  return (
    <>
      {viewEmployee && selectedEmployee ? (
        <ViewEmployee
          EmployeeObjectId={selectedEmployee.employeeObjectId}
          EmployeeId={selectedEmployee.employee_id}
          openViewEmployee={openViewEmployee}
          refreshEmployeesList={refreshEmployeesList}
        />
      ) : (
        <div className="table">
          <div className="table-filter">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Is Active</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Current Task</TableCell>
                  <TableCell>Today's Login</TableCell>
                  <TableCell>Assign Task For Today</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    key={employee.employeeID}
                    className={!employee.isActive ? "inactive-row" : ""}
                  >
                    <TableCell
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleViewEmployee(employee)}
                    >
                      {employee.employeeID}
                    </TableCell>
                    <TableCell
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleViewEmployee(employee)}
                    >
                      {employee.name}
                    </TableCell>
                    <TableCell>
                      <Switch checked={employee.isActive} disabled />
                    </TableCell>
                    <TableCell>
                      {employee.lastLocation ? (
                        <a
                          href={`https://www.google.com/maps?q=${employee.lastLocation.latitude},${employee.lastLocation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#555",
                            textDecoration: "underline",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <LocationOnIcon fontSize="small" />
                          {employee.lastLocation?.timestamp
                            ? new Date(
                                employee.lastLocation.timestamp
                              ).toLocaleString("en-US", {
                                weekday: "long",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "-"}
                        </a>
                      ) : (
                        "No location yet"
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.task ? (
                        <span
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            setSelectedTask(employee.task);
                            setTaskDialogOpen(true);
                          }}
                        >
                          {employee.task.title || "Untitled Task"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleLoginInfo(employee)}
                        className="Login-Info"
                      >
                        ⏱ Login Info
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleAssignTask(employee)}
                      >
                        Assign Task
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AssignTaskDialog
        open={assignTaskOpen}
        onClose={() => setAssignTaskOpen(false)}
        employeeObjectId={selectedEmployee?.employeeObjectId}
      />

      <LoginInfoDialog
        open={loginInfoOpen}
        onClose={() => setLoginInfoOpen(false)}
        loginInfo={loginInfo}
        loginAddress={loginAddress}
        logoutAddress={logoutAddress}
      />

      <TaskDetailsDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={selectedTask}
      />
    </>
  );
};

export default EmployeesTable;
