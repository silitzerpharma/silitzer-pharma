import React, { useEffect, useState } from "react";
import "./style/EmployeeLeave.scss";

const PAGE_SIZE = 5;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeLeave = ({ employeeId }) => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState({});

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // ✅ NEW

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedReason, setSelectedReason] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!employeeId) return;

    const fetchLeaveData = async () => {
  setLoading(true);
  try {
    let url = `${BASE_URL}/admin/employee/leaves?employeeId=${employeeId}&page=${page}&limit=${PAGE_SIZE}`;

    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    const res = await fetch(url, {
      credentials: 'include', // ✅ Important for session/cookie-based auth
    });

    const data = await res.json();

    setLeaveBalance(data.leaveBalance || {});
    setLeaveRequests(data.leaveRequests || []);
    setTotalPages(data.totalPages || 1);
    setLeaves(data.leaves || {});
  } catch (error) {
    console.error("Error fetching leave data:", error);
  } finally {
    setLoading(false);
  }
};

    fetchLeaveData();
  }, [employeeId, fromDate, toDate, statusFilter, page]);

  const openReasonDialog = (request) => {
    setSelectedReason(request);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedReason(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="employee-leave">
      <h2>Leave Balance</h2>
      <div className="leave-balance">
        {leaveBalance &&
          Object.entries(leaveBalance).map(([type, count]) => (
            <div key={type} className="leave-card">
              <span className="type">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <span className="count">{count}</span>
            </div>
          ))}
      </div>

      <div className="leaves">
        <h2>Leaves</h2>
        <div className="leaves-count">
          <div><span>Casual:</span> <span>{leaves.casual}</span></div>
          <div><span>Sick:</span> <span>{leaves.sick}</span></div>
          <div><span>Unpaid:</span> <span>{leaves.unpaid}</span></div>
          <div><span>Earned:</span> <span>{leaves.earned}</span></div>
        </div>
      </div>

      <div className="filter-container">
        <div className="date-filter">
          <label htmlFor="from-date">From:</label>
          <input
            type="date"
            id="from-date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="date-filter">
          <label htmlFor="to-date">To:</label>
          <input
            type="date"
            id="to-date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="date-filter">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading leave data...</p>
      ) : (
        <>
          <div className="leave-requests-table">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied At</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.requestId} className={req.status.toLowerCase()}>
                      <td>{req.requestId}</td>
                      <td>{req.leaveType}</td>
                      <td>{new Date(req.startDate).toLocaleDateString("en-GB")}</td>
                      <td>{new Date(req.endDate).toLocaleDateString("en-GB")}</td>
                      <td>
                        <span
                          className="reason-link"
                          onClick={() => openReasonDialog(req)}
                        >
                          {req.reason.length > 20
                            ? req.reason.slice(0, 20) + "... "
                            : req.reason + " "}
                          <u>see</u>
                        </span>
                      </td>
                      <td className="status">{req.status}</td>
                      <td>{new Date(req.appliedAt).toLocaleDateString("en-GB")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showDialog && selectedReason && (
        <div className="reason-dialog">
          <div className="dialog-content">
            <h3>Leave Reason</h3>
            <p><strong>Reason:</strong> {selectedReason.reason}</p>
            {selectedReason.status === "Rejected" && selectedReason.rejectionReason && (
              <p><strong>Rejection Reason:</strong> {selectedReason.rejectionReason}</p>
            )}
            <button onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
