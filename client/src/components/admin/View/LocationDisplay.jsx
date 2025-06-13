import React, { useEffect, useState } from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";

const LocationDisplay = ({ location }) => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Lat: ${location.latitude}, Lng: ${location.longitude}`);
          }
        })
        .catch(() => {
          setAddress(`Lat: ${location.latitude}, Lng: ${location.longitude}`);
        })
        .finally(() => setLoading(false));
    } else {
      setAddress("N/A");
    }
  }, [location]);

  if (!location?.latitude || !location?.longitude) return <span>N/A</span>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {loading ? (
        <span>Loading address...</span>
      ) : (
        <Tooltip title={address}>
          <a
            href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RoomIcon color="primary" />
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default LocationDisplay;
