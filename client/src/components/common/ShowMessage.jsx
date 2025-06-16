import React from 'react';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { createPortal } from 'react-dom';

import './style/ShowMessage.scss'

const ShowMessage = ({ status, message, warnings = [], onClose }) => {
  let bgColor = '';
  let IconComponent = null;
  let color = '';

  if (warnings.length > 0) {
    bgColor = '#fff3cd'; // yellow background
    IconComponent = <WarningIcon color="warning" sx={{ mr: 1 }} />;
    color = '#856404'; // dark yellow
  } else if (status === 200) {
    bgColor = '#d4edda'; // green background
    IconComponent = <CheckCircleIcon color="success" sx={{ mr: 1 }} />;
    color = 'green';
  } else if (status === 400) {
    bgColor = '#f8d7da'; // red background
    IconComponent = <ErrorIcon color="error" sx={{ mr: 1 }} />;
    color = 'red';
  } else {
    bgColor = '#e2e3e5'; // default gray
    IconComponent = <InfoIcon color="info" sx={{ mr: 1 }} />;
    color = '#383d41';
  }

  const content = (
    <Box className="show-message-backdrop">
  <Paper
    className={`show-message-box ${
      warnings.length > 0
        ? 'show-message-warning'
        : status === 200
        ? 'show-message-success'
        : status === 400
        ? 'show-message-error'
        : 'show-message-info'
    }`}
  >
    <Box className="show-message-content">
      {IconComponent}
      <Typography variant="h6">{message}</Typography>
      <IconButton className="show-message-close" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>

    {warnings.length > 0 && (
      <Stack spacing={1} mt={1}>
        {warnings.map((w, idx) => (
          <Typography key={idx} variant="body2">
            ⚠ {w}
          </Typography>
        ))}
      </Stack>
    )}
  </Paper>
</Box>

  );

  // Render with a portal for guaranteed visibility
  return createPortal(content, document.body);
};

export default ShowMessage;
