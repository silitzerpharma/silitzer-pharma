import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

const Loader = ({ message = 'Loading...', fullPage = true, size = 60 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={fullPage ? '100vh' : '100%'}
      width="100%"
    >
      {/* <CircularProgress size={size} color="primary" /> */}
      <LocalPharmacyIcon/>
      {message && (
        <Typography variant="subtitle1" mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loader;
