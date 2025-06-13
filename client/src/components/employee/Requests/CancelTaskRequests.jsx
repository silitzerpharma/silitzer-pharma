import React, { useEffect, useState } from 'react';
import './CancelTaskRequests.scss';

const statuses = ['', 'Pending', 'Approved', 'Rejected'];

const CancelTaskRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:3000/employee/task/cancelrequests');
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (search.trim() !== '') {
        url.searchParams.append('q', search.trim());
      }
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }

      const response = await fetch(url.toString(), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch cancel task requests');

      const data = await response.json();
      setRequests(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching cancel task requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, search, statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="cancel-task-requests">
      <input
        type="text"
        placeholder="Search by Request ID or Task ID"
        value={search}
        onChange={handleSearchChange}
        className="search-input"
      />

      <select
        className="status-filter"
        value={statusFilter}
        onChange={handleStatusChange}
      >
        <option value="">All Statuses</option>
        {statuses
          .filter((s) => s !== '')
          .map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
      </select>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="no-data">No cancel task requests found.</div>
      ) : (
        <>
          {requests.map((request) => (
            <div key={request.requestId} className="cancel-task-card">
              <div><strong>Request ID:</strong> {request.requestId}</div>
              <div><strong>Task ID:</strong> {request.taskId}</div>
              <div><strong>Reason:</strong> {request.reason || '-'}</div>
              <div><strong>Status:</strong> {request.status}</div>
              <div><strong>Requested At:</strong> {formatDate(request.requestedAt)}</div>
              <div><strong>Reviewed At:</strong> {formatDate(request.reviewedAt)}</div>
            </div>
          ))}

          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>

            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                className={page === num + 1 ? 'active' : ''}
                onClick={() => setPage(num + 1)}
              >
                {num + 1}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CancelTaskRequests;
