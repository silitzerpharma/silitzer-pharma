import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Stack,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationDisplay from "../LocationDisplay"; // Adjust path if needed

const TaskField = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
      {value || "--"}
    </Typography>
  </Box>
);

// Format date as DD/MM/YYYY or "--" if not available
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "--";

const TaskDetailsDialog = ({ open, onClose, task }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          mx: "auto",
          my: 2,
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        {task ? `Task-${task.taskId} Details` : "Task Details"}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 1.5 }}>
        {task ? (
          <Stack spacing={1.5}>
            <TaskField label="Title" value={task.title} />
            <TaskField label="Description" value={task.description} />
            <Divider />
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <TaskField label="Status" value={task.status} />
              <TaskField label="Priority" value={task.priority} />
            </Stack>
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <TaskField label="Assign Date" value={formatDate(task.assignDate)} />
              <TaskField label="Due Date" value={formatDate(task.dueDate)} />
            </Stack>
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <TaskField label="Start Date" value={formatDate(task.startDate)} />
              <TaskField label="Completion Date" value={formatDate(task.completionDate)} />
            </Stack>
            <Divider />
            <TaskField label="Address" value={task.address} />
            <TaskField label="Notes" value={task.notes} />

            {task.completionLocation?.latitude &&
            task.completionLocation?.longitude ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Completion Location:
                </Typography>
                <LocationDisplay
                  address={task.completionAdreess}
                  latitude={task.completionLocation.latitude}
                  longitude={task.completionLocation.longitude}
                />
              </Box>
            ) : null}
          </Stack>
        ) : (
          <Typography>No task data available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
