import React, { useState, useMemo } from "react";
import './style/TasksHistory.scss'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

const initialTasks = [
  {
    taskId: "T001",
    title: "Visit Distributor A",
    description: "Discuss new product range and take order details.",
    status: "Pending",
    priority: "High",
    dueDate: "2025-06-01",
    taskCompletedOn: null,
    address: "Mumbai",
    notes: "Prepare brochure before visit",
  },
  {
    taskId: "T002",
    title: "Product Demo at Hospital B",
    description: "Showcase latest equipment to doctors and collect feedback.",
    status: "Completed",
    priority: "Medium",
    dueDate: "2025-05-28",
    taskCompletedOn: "2025-05-28",
    address: "Delhi",
    notes: "Demo was successful, follow up next month",
  },
  {
    taskId: "T003",
    title: "Follow-up Call with Distributor C",
    description: "Resolve pricing and availability concerns over a call.",
    status: "In Progress",
    priority: "Low",
    dueDate: "2025-06-02",
    taskCompletedOn: null,
    address: "Bangalore",
    notes: "Waiting on updated price list",
  },
  // Add more if needed
];

const TasksHistory = () => {
  const [tasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter tasks by title or status (case-insensitive)
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const lowerSearch = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerSearch) ||
        task.status.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, tasks]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        Tasks History
      </Typography>

      <TextField
        label="Search by Title or Status"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table size="small" aria-label="tasks history table">
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow
                key={task.taskId}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => setSelectedTask(task)}
              >
                <TableCell>{task.taskId}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <>
              <Typography><strong>Task ID:</strong> {selectedTask.taskId}</Typography>
              <Typography><strong>Title:</strong> {selectedTask.title}</Typography>
              <Typography><strong>Description:</strong> {selectedTask.description}</Typography>
              <Typography><strong>Status:</strong> {selectedTask.status}</Typography>
              <Typography><strong>Priority:</strong> {selectedTask.priority}</Typography>
              <Typography><strong>Due Date:</strong> {selectedTask.dueDate}</Typography>
              <Typography>
                <strong>Task Completed On:</strong>{" "}
                {selectedTask.taskCompletedOn ?? "Not completed yet"}
              </Typography>
              <Typography><strong>Address:</strong> {selectedTask.address}</Typography>
              <Typography><strong>Notes:</strong> {selectedTask.notes}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksHistory;
