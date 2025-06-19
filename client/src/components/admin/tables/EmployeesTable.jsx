import { useState, useEffect } from "react";
import "./style/EmployeesTable.scss";
import "./style/Table.scss";
import ViewEmployee from "../View/ViewEmployee";
import AssignTask from "../form/AssignTask";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import IconButton from "@mui/material/IconButton";
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
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@mui/material";

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
      {
        credentials: 'include', // ✅ Send cookies for session authentication
      }
    );

    const data = await res.json();
    setTotal(data.total || 0);
    
    const formatted = data.employees.map((emp) => ({
      employeeID: emp.EmployeeID || "-",
      name: emp.username || "-",
      isActive: emp.IsActive ?? false,
      location: "-", // default value
      task: emp.task || null,
      employee_id: emp.employee_id,
      employeeObjectId: emp.EmployeeObjectId,
      todayLogin: emp.todayLogin || null,
      lastLocation: emp.liveLocation,
    }));

    setEmployees(formatted);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
  }
  finally{
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
  const fetchAddress = async ({ latitude, longitude }, setAddress) => {
    try {
      if (!latitude || !longitude) return;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await res.json();
      setAddress(data.display_name || "Unknown location");
    } catch (err) {
      console.error("Failed to fetch address:", err);
      setAddress("Failed to load location");
    }
  };

  if (loginInfo?.loginLocation) {
    fetchAddress(loginInfo.loginLocation, setLoginAddress);
  }

  if (loginInfo?.logoutLocation) {
    fetchAddress(loginInfo.logoutLocation, setLogoutAddress);
  }
}, [loginInfo]);

  useEffect(() => {
    socket.on("updateEmployeeData", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return () => {
      socket.off("updateEmployeeData");
    };
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
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </div>
        </div>
      )}

      {/* Assign Task Dialog */}
      {selectedEmployee && (
        <Dialog
          open={assignTaskOpen}
          onClose={() => setAssignTaskOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <AssignTask
            employeeObjectId={selectedEmployee.employeeObjectId}
            onClose={() => setAssignTaskOpen(false)}
          />
        </Dialog>
      )}

      {/* Login Info Dialog */}
      <Dialog
        open={loginInfoOpen}
        onClose={() => setLoginInfoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Today's Login Info</DialogTitle>
        <DialogContent dividers>
          {loginInfo ? (
            <>
              <Typography>
                <strong>Login Time:</strong>{" "}
                {new Date(loginInfo.loginTime).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Logout Time:</strong>{" "}
                {loginInfo.logoutTime
                  ? new Date(loginInfo.logoutTime).toLocaleString()
                  : "-"}
              </Typography>
              <Typography>
                <strong>Login Location:</strong>{" "}
                {loginInfo.loginLocation?.latitude &&
                  loginInfo.loginLocation?.longitude ? (
                  <>
                    {loginAddress ||
                      `Lat: ${loginInfo.loginLocation.latitude}, Long: ${loginInfo.loginLocation.longitude}`}
                    <IconButton
                      onClick={() => {
                        const { latitude, longitude } = loginInfo.loginLocation;
                        window.open(
                          `https://www.google.com/maps?q=${latitude},${longitude}`,
                          "_blank"
                        );
                      }}
                      size="small"
                      color="primary"
                    >
                      <LocationOnIcon />
                    </IconButton>
                  </>
                ) : (
                  " -"
                )}
              </Typography>
              <Typography>
                <strong>Logout Location:</strong>{" "}
                {loginInfo.logoutLocation?.latitude &&
                  loginInfo.logoutLocation?.longitude ? (
                  <>
                    {logoutAddress ||
                      `Lat: ${loginInfo.logoutLocation.latitude}, Long: ${loginInfo.logoutLocation.longitude}`}
                    <IconButton
                      onClick={() => {
                        const { latitude, longitude } =
                          loginInfo.logoutLocation;
                        window.open(
                          `https://www.google.com/maps?q=${latitude},${longitude}`,
                          "_blank"
                        );
                      }}
                      size="small"
                      color="secondary"
                    >
                      <LocationOnIcon />
                    </IconButton>
                  </>
                ) : (
                  " -"
                )}
              </Typography>
            </>
          ) : (
            <Typography>No login info available.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="task-details-dialog">
          <DialogTitle>Current Task Details</DialogTitle>
          <DialogContent dividers>
            {selectedTask ? (
              <>
                <div className="task-field">
                  <strong>Title:</strong> <span>{selectedTask.title}</span>
                </div>
                <div className="task-field">
                  <strong>Description:</strong>{" "}
                  <span>{selectedTask.description || "-"}</span>
                </div>
                <div className="task-field">
                  <strong>Status:</strong> <span>{selectedTask.status}</span>
                </div>
                <div className="task-field">
                  <strong>Priority:</strong>{" "}
                  <span>{selectedTask.priority}</span>
                </div>
                <div className="task-field">
                  <strong>Start Date:</strong>{" "}
                  <span>
                    {selectedTask.startDate
                      ? new Date(selectedTask.startDate).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="task-field">
                  <strong>Due Date:</strong>{" "}
                  <span>
                    {selectedTask.dueDate
                      ? new Date(selectedTask.dueDate).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="task-field">
                  <strong>Address:</strong>{" "}
                  <span>{selectedTask.address || "-"}</span>
                </div>
                <div className="task-field">
                  <strong>Notes:</strong>{" "}
                  <span>{selectedTask.notes || "-"}</span>
                </div>
              </>
            ) : (
              <Typography>No task data available.</Typography>
            )}
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default EmployeesTable;
