// src/utils/reverseGeocode.js
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data.display_name || `Lat: ${latitude}, Lng: ${longitude}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `Lat: ${latitude}, Lng: ${longitude}`;
  }
};
