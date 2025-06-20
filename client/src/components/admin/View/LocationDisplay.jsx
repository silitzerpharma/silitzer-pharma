import React from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";

const LocationDisplay = ({ address, latitude, longitude }) => {
  if (!latitude || !longitude) return <Typography variant="body2">N/A</Typography>;

  const locationText = address || `Lat: ${latitude}, Lng: ${longitude}`;
  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {locationText}
      </Typography>

      <Tooltip title="View on Map">
        <IconButton
          size="small"
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ padding: 0 }}
        >
          <PlaceIcon color="primary" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LocationDisplay;
