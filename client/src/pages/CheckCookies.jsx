import React, { useEffect, useState } from 'react';

const CheckCookies = () => {
  const [cookies, setCookies] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const res = await fetch("https://silitzer-pharma.onrender.com/checkcookies", {
          method: "GET",
          credentials: "include", // 🔑 Important: include cookies
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setCookies(data.receivedCookies);
      } catch (err) {
        console.error("Error fetching cookies:", err);
        setError(err.message);
      }
    };

    fetchCookies();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Check Cookies</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {cookies ? (
        <pre>{JSON.stringify(cookies, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CheckCookies;
