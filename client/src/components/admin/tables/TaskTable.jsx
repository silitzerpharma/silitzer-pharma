import React, { useEffect, useState } from "react";
import "./style/TaskTable.scss";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import ViewTask from "../View/ViewTask";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const TaskTable = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const refreshTasksList = () => setRefreshFlag((prev) => !prev);

const fetchTasks = async () => {
  try {
    const params = new URLSearchParams();
    params.append("employee_id", employeeId);
    params.append("page", currentPage);
    params.append("limit", limit);
    if (searchDate) params.append("date", searchDate);
    if (searchStatus) params.append("status", searchStatus);
    if (searchText) params.append("search", searchText);

    const response = await fetch(
      `http://localhost:3000/admin/employee/tasks?${params.toString()}`,
      {
        credentials: 'include' // ✅ Ensures cookies/session are sent
      }
    );

    const data = await response.json();
    setTasks(data.tasks || []);
    setTotalPages(data.totalPages || 1);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};


  useEffect(() => {
    fetchTasks();
  }, [
    employeeId,
    refreshFlag,
    searchDate,
    searchStatus,
    searchText,
    currentPage,
  ]);

  const handleSearch = () => {
    const date = document.querySelector(".TaskTable-search-date").value;
    const status = document.querySelector(".TaskTable-search-select").value;
    const search = document.querySelector(".TaskTable-search-text").value;

    setSearchDate(date);
    setSearchStatus(status);
    setSearchText(search);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div className="manage-tasks-title">Manage tasks</div>
      <div className="TaskTable-search">
        <input type="date" className="TaskTable-search-date" />
        <select name="status" className="TaskTable-search-select">
          <option value="">all</option>
          <option value="Assigned">Assigned</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Complete">Complete</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          className="TaskTable-search-text"
          placeholder="Search Task id"
        />
        <button className="TaskTable-search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Task Completed On</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.taskId}
                onClick={() => setSelectedTask(task)}
                style={{ cursor: "pointer" }}
                hover
                selected={selectedTask?.taskId === task.taskId}
              >
                <TableCell>{task.taskId}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{formatDate(task.startDate)}</TableCell>
                <TableCell>{formatDate(task.dueDate)}</TableCell>
                <TableCell>{formatDate(task.completionDate)}</TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tasks available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Button
          variant="contained"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="contained"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Task Details
          <Button
            onClick={() => setSelectedTask(null)}
            color="secondary"
            style={{ float: "right", minWidth: "auto" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <ViewTask
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              refreshTasksList={refreshTasksList}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTable;
