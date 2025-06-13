import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const priorities = ['Low', 'Medium', 'High'];

const AssignTask = ({ employeeObjectId, onClose }) => {
  const [taskType, setTaskType] = useState("Assigned");
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    startDate: '',
    dueDate: '',
    address: '',
  });

  const [titleError, setTitleError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [dueDateError, setDueDateError] = useState('');

  // Utility to get today's date string yyyy-mm-dd in local timezone
  const getTodayString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toLocaleDateString('en-CA'); // yyyy-mm-dd
  };

  // Utility to get tomorrow's date string yyyy-mm-dd in local timezone
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleDateString('en-CA');
  };

  // Set start date when taskType changes
  useEffect(() => {
    if (taskType === 'Assigned') {
      setFormData(prev => ({
        ...prev,
        startDate: getTodayString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        startDate: '',
      }));
    }

    // Clear errors on task type change
    setTitleError('');
    setStartDateError('');
    setDueDateError('');
  }, [taskType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (name === 'title') setTitleError('');
    if (name === 'startDate') setStartDateError('');
    if (name === 'dueDate') setDueDateError('');
  };

  const handleChangeTaskType = (value) => {
    setTaskType(value);
  };

  const handleSubmit = async () => {
    const { title, startDate, dueDate } = formData;

    // Title validation
    if (!title.trim()) {
      setTitleError(`${taskType} task requires a title`);
      return;
    }

    // Start date validation for Scheduled task
    if (taskType === 'Scheduled') {
      if (!startDate) {
        setStartDateError('Start date is required for scheduled tasks');
        return;
      }
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start <= today) {
        setStartDateError('Start date must be after today for scheduled tasks');
        return;
      }
    }

    // Due date validation
    if (dueDate) {
      const due = new Date(dueDate);
      const start = new Date(formData.startDate || getTodayString());
      if (due < start) {
        setDueDateError('Due date cannot be earlier than start date');
        return;
      }
    }

    try {
      const response = await fetch(`${BASE_URL}/admin/employee/assigntask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ ...formData, taskType, employeeObjectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign task');
      }

      alert('Task assigned successfully');
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Error assigning task');
    }
  };

  return (
    <>
      <DialogTitle>
        <span
          style={{ cursor: 'pointer', fontWeight: taskType === "Assigned" ? 'bold' : 'normal', marginRight: 10 }}
          onClick={() => handleChangeTaskType("Assigned")}
        >
          Assign Task
        </span>
        /
        <span
          style={{ cursor: 'pointer', fontWeight: taskType === "Scheduled" ? 'bold' : 'normal', marginLeft: 10 }}
          onClick={() => handleChangeTaskType("Scheduled")}
        >
          Scheduled Task
        </span>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          margin="dense"
          error={!!titleError}
          helperText={titleError}
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          margin="dense"
          multiline
          rows={3}
        />
        <TextField
          select
          fullWidth
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          margin="dense"
        >
          {priorities.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          margin="dense"
          InputLabelProps={{ shrink: true }}
          disabled={taskType === 'Assigned'}
          error={!!startDateError}
          helperText={startDateError}
          inputProps={{
            min: taskType === 'Scheduled' ? getTomorrowDateString() : getTodayString(),
          }}
        />
        <TextField
          fullWidth
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          margin="dense"
          InputLabelProps={{ shrink: true }}
          error={!!dueDateError}
          helperText={dueDateError}
          inputProps={{
            min: taskType === 'Scheduled'
              ? getTomorrowDateString()
              : (formData.startDate || getTodayString()),
          }}
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {taskType === 'Scheduled' ? 'Schedule' : 'Assign'}
        </Button>
      </DialogActions>
    </>
  );
};

export default AssignTask;
