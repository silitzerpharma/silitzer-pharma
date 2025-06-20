// services/locationService.js

const axios = require("axios");

exports.getAddressFromLatLng = async (latitude, longitude) => {
  const apiKey = process.env.LOCATIONIQ_API_KEY;

  if (!latitude || !longitude) {
    throw new Error("Latitude and Longitude are required.");
  }

  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "your-app-name" // optional but good to include
      }
    });

    const address = response.data.display_name;
    return address;

  } catch (error) {
    console.error("Reverse geocoding failed:", error?.response?.data || error.message);
    throw new Error("Failed to retrieve address from coordinates");
  }
};


