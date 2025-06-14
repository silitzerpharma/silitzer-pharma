import React, { useEffect, useState } from 'react';

const BASE_URL = "https://silitzer-pharma.onrender.com"; // Replace if needed

const CheckCookies = () => {
  const [cookieData, setCookieData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkCookies = async () => {
      try {
        const res = await fetch(`${BASE_URL}/checkcookies`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();
        setCookieData(data);
      } catch (err) {
        setError('Failed to fetch cookie data');
        console.error(err);
      }
    };

    checkCookies();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Check Cookies Debug</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cookieData ? (
        <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          {JSON.stringify(cookieData, null, 2)}
        </pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CheckCookies;
