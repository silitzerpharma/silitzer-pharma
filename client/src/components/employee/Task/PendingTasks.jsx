import React, { useState, useEffect } from "react";
import "./style/TasksList.scss";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import Loader from "../../common/Loader";
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PendingTasks = ({ isActive }) => {
  const [tasks, setTasks] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [note, setNote] = useState("");
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTaskId, setCancelTaskId] = useState("");

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const refreshTaskList = () => setRefreshFlag((prev) => !prev);

  useEffect(() => {
    const fetchPendingTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await fetch(`${BASE_URL}/employee/task/pending`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch pending tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchPendingTasks();
  }, [refreshFlag]);

  const handleStatusChange = (task_id, newStatus, oldStatus) => {
    if (newStatus === oldStatus) return;
    setUpdateTaskId(task_id);
    setUpdateStatus(newStatus);
    if (newStatus === "Complete") {
      setShowDialog(true);
    } else {
      updateTaskStatus({ task_id, status: newStatus });
    }
  };

  const updateTaskStatus = async ({ task_id, status }) => {
    const resetForm = () => {
      setNote("");
      setUpdateStatus("");
      setUpdateTaskId("");
    };

    if (!task_id || !status) {
      toast.error("Missing status or task ID.");
      resetForm();
      return;
    }

    setLoadingStatus(true);

    if (status === "Complete") {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        resetForm();
        setLoadingStatus(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          try {
            const response = await fetch(
              `${BASE_URL}/employee/task/update-status`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  status,
                  location,
                  task_id,
                  note,
                }),
              }
            );

            if (!response.ok) throw new Error("Failed to update status.");
            refreshTaskList();
            toast.success("Status updated successfully.");
          } catch (error) {
            toast.error("Error updating status: " + error.message);
          } finally {
            resetForm();
            setLoadingStatus(false);
          }
        },
        () => {
          toast.error("Error getting location. Status not updated.");
          resetForm();
          setLoadingStatus(false);
        }
      );
    } else {
      try {
        const response = await fetch(
          `${BASE_URL}/employee/task/update-status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status, task_id }),
          }
        );

        if (!response.ok) throw new Error("Failed to update status.");
        refreshTaskList();
        toast.success("Status updated successfully.");
      } catch (error) {
        toast.error("Error updating status: " + error.message);
      } finally {
        resetForm();
        setLoadingStatus(false);
      }
    }
  };

  const handleDialogSubmit = () => {
    updateTaskStatus({ task_id: updateTaskId, status: updateStatus });
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setNote("");
  };

  const openCancelDialog = (taskId) => {
    setCancelTaskId(taskId);
    setCancelDialogVisible(true);
    setCancelReason("");
  };

  const closeCancelDialog = () => {
    setCancelDialogVisible(false);
    setCancelReason("");
    setCancelTaskId("");
  };

  const submitCancelRequest = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/employee/task/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          taskId: cancelTaskId,
          reason: cancelReason,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit cancel request");

      toast.success("Cancel request submitted successfully.");
      closeCancelDialog();
      refreshTaskList();
    } catch (err) {
      toast.error("Error submitting cancel request: " + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="tasks-list">
      {loadingTasks ? (
        <Loader message="Loading pending tasks..." />
      ) : tasks.length === 0 ? (
        <div className="no-tasks-message">No pending tasks.</div>
      ) : (
        tasks.map((task, index) => (
          <div key={task.taskId || index} className="task-card">
            <div className="task-title">{task.title}</div>
            <div className="task-meta">
              <span>{task.address || "-"}</span> ·{" "}
            </div>
            <div className="task-desc">{task.description}</div>

            <div
              className={`task-status ${task.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              Status: {task.status}
              <br />
              <span>
                AssignDate:{" "}
                {new Date(task.assignDate).toLocaleDateString("en-GB")}
              </span>
              <span>
                {" "}
                StartDate:{" "}
                {new Date(task.startDate).toLocaleDateString("en-GB")}
              </span>
              <br />
              {(() => {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                dueDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                const isDueToday = dueDate.getTime() === today.getTime();

                return (
                  <span style={{ color: isDueToday ? "red" : "inherit" }}>
                    DueDate: {dueDate.toLocaleDateString("en-GB")}
                    {isDueToday && (
                      <HourglassBottomIcon
                        style={{ verticalAlign: "middle", marginLeft: 4 }}
                      />
                    )}
                  </span>
                );
              })()}
            </div>

            <div className="priority-field">
              <strong>Priority:</strong> {task.priority}
            </div>

            {isActive && (
              <select
                className="status-select"
                value=""
                onChange={(e) =>
                  handleStatusChange(task.taskId, e.target.value, task.status)
                }
              >
                <option value="" disabled>
                  Update status
                </option>
                <option value="Ongoing">Ongoing</option>
                <option value="Complete">Complete</option>
              </select>
            )}

            <button
              onClick={() => openCancelDialog(task.taskId)}
              className="cancel-request-button"
            >
              Request to Cancel
            </button>
          </div>
        ))
      )}

      {loadingStatus && (
        <div style={{ marginTop: "20px" }}>
          <Loader message="Updating task status..." fullPage={false} size={40} />
        </div>
      )}

      {showDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Task Completion Note</h3>
            <textarea
              placeholder="Enter note about task completion..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <div className="modal-buttons">
              <button onClick={handleDialogCancel}>Cancel</button>
              <button onClick={handleDialogSubmit} disabled={!note.trim()}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelDialogVisible && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal-dialog">
            {cancelLoading ? (
              <Loader message="Submitting cancel request..." fullPage={false} size={40} />
            ) : (
              <>
                <h3>Request to Cancel Task</h3>
                <textarea
                  placeholder="Optional: Enter reason for cancel request"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                />
                <div className="modal-buttons">
                  <button onClick={closeCancelDialog}>Cancel</button>
                  <button onClick={submitCancelRequest}>Submit Request</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTasks;
