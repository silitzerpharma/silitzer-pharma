import './style/ViewTask.scss';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const ViewTask = ({ task, onClose, refreshTasksList }) => {
  const [editMode, setEditMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({ ...task });
  const [updateNote, setUpdateNote] = useState('');
  const [completionAddress, setCompletionAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/employee/task/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Task updated successfully!');
        setUpdateNote(data.note || '');
        setEditMode(false);
        refreshTasksList();
      } else {
        alert('Update failed: ' + data.message);
      }
    } catch (error) {
      alert('Error updating task: ' + error.message);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/employee/task/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ task_id: task._id })
      });

      if (res.ok) {
        alert('Task deleted successfully!');
        setConfirmOpen(false);
        refreshTasksList();
        onClose();
      } else {
        const error = await res.json();
        alert('Delete failed: ' + error.message);
      }
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (
        formData.completionLocation?.latitude &&
        formData.completionLocation?.longitude
      ) {
        setLoadingAddress(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${formData.completionLocation.latitude}&lon=${formData.completionLocation.longitude}`
          );
          const data = await response.json();
          if (data?.display_name) {
            setCompletionAddress(data.display_name);
          } else {
            setCompletionAddress('Address not found');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          setCompletionAddress('Failed to fetch address');
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchAddress();
  }, [formData.completionLocation]);

  return (
    <div className="ViewTask">

      <div className="ViewTask-row">
        <span><strong>TaskId:</strong> {task.taskId}</span>
        <span>
          <strong>Title:</strong>{' '}
          {editMode ? (
            <TextField
              size="small"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          ) : (
            task.title
          )}
        </span>
      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Priority:</strong>{' '}
          {editMode ? (
            <TextField
              select
              size="small"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {['Low', 'Medium', 'High'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          ) : (
            task.priority
          )}
        </span>
        <span>
          <strong>Assign Date:</strong> {formatDate(task.assignDate)}
        </span>
      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Start Date:</strong>{' '}
          {editMode ? (
            <TextField
              type="date"
              size="small"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          ) : (
            formatDate(task.startDate)
          )}
        </span>
        <span>
          <strong>Due Date:</strong>{' '}
          {editMode ? (
            <TextField
              type="date"
              size="small"
              value={formatDateForInput(formData.dueDate)}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          ) : (
            formatDate(task.dueDate)
          )}
        </span>
      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Completion Date:</strong>{' '}
          {editMode ? (
            <TextField
              type="date"
              size="small"
              value={formatDateForInput(formData.completionDate)}
              onChange={(e) => handleChange('completionDate', e.target.value)}
            />
          ) : (
            formatDate(task.completionDate)
          )}
        </span>
      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Status:</strong>{' '}
          {editMode ? (
            <TextField
              select
              size="small"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {['Assigned', 'Scheduled', 'Ongoing', 'Complete', 'Pending', 'Overdue', 'Cancelled'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          ) : (
            task.status
          )}
        </span>
        <span>
          <strong>Address:</strong>{' '}
          {editMode ? (
            <TextField
              size="small"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          ) : (
            task.address || '-'
          )}
        </span>
      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Description:</strong>{' '}
          {editMode ? (
            <TextField
              fullWidth
              multiline
              size="small"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          ) : (
            task.description || '-'
          )}
        </span>
      </div>

      <div className="ViewTask-row-Location">
        <strong>Completion Location:</strong>{' '}
    {formData.completionLocation?.latitude && formData.completionLocation?.longitude ? (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>
      <strong>Address:</strong>{' '}
      {loadingAddress ? 'Loading address...' : completionAddress}
    </span>
    <IconButton
      size="small"
      color="primary"
      onClick={() => {
        const { latitude, longitude } = formData.completionLocation;
        window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
      }}
      title="View on Google Maps"
    >
      <LocationOnIcon />
    </IconButton>
  </div>
) : (
  <span>Not available</span>
)}

      </div>

      <div className="ViewTask-row">
        <span>
          <strong>Notes:</strong>{' '}
          {editMode ? (
            <TextField
              fullWidth
              multiline
              size="small"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          ) : (
            task.notes || '-'
          )}
        </span>
      </div>

      <div className="ViewTask-status">
        <div><strong>Status History:</strong></div>
        {Array.isArray(task.statusHistory) && task.statusHistory.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {task.statusHistory.map((entry, index) => (
              <li key={index}>
                {entry.status} on {formatDate(entry.changedAt)}
              </li>
            ))}
          </ul>
        ) : (
          <span>-</span>
        )}
      </div>

      <div className="ViewTask-actions">
        {editMode ? (
          <>
            <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button variant="outlined" color="primary" onClick={() => setEditMode(true)}>Edit</Button>
            <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>Remove</Button>
          </>
        )}
      </div>

      {updateNote && (
        <Typography variant="body2" color="warning.main" style={{ marginTop: '1rem' }}>
          ⚠️ {updateNote}
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRemove} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewTask;
