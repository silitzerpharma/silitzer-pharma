import React, { useState, useEffect } from "react";

import './style/EmployeeDistributors.scss'

function EmployeeDistributors() {
  const [distributors, setDistributors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDistributors = async (search) => {
    setLoading(true);
    setError(null);

    const url = new URL("http://localhost:3000/employee/distributors");
    if (search) {
      url.searchParams.append("search", search);
    }

    try {
      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();
      setDistributors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch distributors", err);
      setError("Error fetching distributors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDistributors(searchTerm.trim());
    }, 300); // Debounce for better UX

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="distributors-container">
      <h2 className="distributors-header">Distributors</h2>

      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="distributors-search"
      />

      {loading && <div className="distributors-info">Loading...</div>}
      {error && <div className="distributors-info error">{error}</div>}

      {!loading && distributors.length === 0 && (
        <div className="distributors-info">No matching distributors.</div>
      )}

      <div className="distributors-list">
        {distributors.map((dist, idx) => (
          <div key={idx} className="distributor-card">
            <div className="distributor-field"><strong>Name:</strong> {dist.name}</div>
            <div className="distributor-field"><strong>Phone:</strong> {dist.phone_number}</div>
            <div className="distributor-field"><strong>Address:</strong> {dist.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeDistributors;