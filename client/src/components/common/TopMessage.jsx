import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const TopMessage = ({ open, message, severity = 'success', onClose, duration = 3000 }) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={duration}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default TopMessage;
