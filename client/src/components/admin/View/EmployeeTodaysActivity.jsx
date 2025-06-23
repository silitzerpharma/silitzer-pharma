import React, { useState, useEffect } from "react";
import "./style/EmployeeTodaysActivity.scss";
import { format } from "date-fns";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TaskDetailsDialog from "../View/employee/TaskDetailsDialog";
import Loader from "../../common/Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LocationDisplay = ({ address, lat, lon }) => {
  if (!lat || !lon) return <span>N/A</span>;

  return (
    <span>
      {address || "Unknown"}{" "}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in Google Maps"
        style={{ textDecoration: "none", marginLeft: 6 }}
      >
        <LocationOnIcon />
      </a>
    </span>
  );
};

const EmployeeTodaysActivity = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("today"); // "today" | "pending"

  useEffect(() => {
    if (!employeeId) return;

    const fetchTodaysActivity = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/admin/employee/todaysactivity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ employeeId }),
        });

        if (!res.ok) throw new Error("Failed to fetch today's activity");

        const data = await res.json();
        setTasks(data.tasks || []);
        setPendingTasks(data.pendingTasks || []);
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Error fetching today's activity:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysActivity();
  }, [employeeId]);

  const handleClick = (task) => setSelectedTask(task);
  const handleClose = () => setSelectedTask(null);

  if (loading) return <Loader message="Loading EmployeeTodaysActivity..." />;

  const displayedTasks = activeTab === "today" ? tasks : pendingTasks;

  return (
    <div className="EmployeeTodaysActivity">
      <div className="EmployeeTodaysActivity-title">Employee Today's Activity</div>

      <div className="EmployeeTodaysActivity-row">
        <div className="row-col-left">
          <div className="row-title">Tasks</div>

          <div className="task-tabs">
            <button
              className={`task-tab ${activeTab === "today" ? "active" : ""}`}
              onClick={() => setActiveTab("today")}
            >
              Today's Tasks
            </button>
            <button
              className={`task-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Tasks
            </button>
          </div>

          <ul className="emp-task-list">
            {displayedTasks.length === 0 && (
              <li>{activeTab === "today" ? "No tasks for today" : "No pending tasks"}</li>
            )}
            {displayedTasks.map((task) => (
              <li key={task._id} onClick={() => handleClick(task)} style={{ cursor: "pointer" }}>
                <div><strong>Title:</strong> {task.title}</div>
                <div><strong>Status:</strong> {task.status}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="row-col-right">
          <div className="row-title">Today's Login Sessions</div>
          <ul className="session-list">
            {sessions.length === 0 && <li>No login sessions for today</li>}
            {sessions.map((session) => (
              <li key={session._id}>
                <div>
                  <span>
                    <strong>Login Time:</strong><br />
                    {session.loginTime ? (
                      <>
                        {format(new Date(session.loginTime), "d/M/yyyy")}<br />
                        {format(new Date(session.loginTime), "'time' h.mm a")}
                      </>
                    ) : "N/A"}
                  </span>
                  <span>
                    <strong>Login Location:</strong>{" "}
                    <LocationDisplay
                      address={session.loginAddress}
                      lat={session.loginLocation?.latitude}
                      lon={session.loginLocation?.longitude}
                    />
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Logout Time:</strong><br />
                    {session.logoutTime ? (
                      <>
                        {format(new Date(session.logoutTime), "d/M/yyyy")}<br />
                        {format(new Date(session.logoutTime), "h.mm a")}
                      </>
                    ) : "N/A"}
                  </span>
                  <span>
                    <strong>Logout Location:</strong>{" "}
                    {session.logoutLocation ? (
                      <LocationDisplay
                        address={session.logoutAddress}
                        lat={session.logoutLocation.latitude}
                        lon={session.logoutLocation.longitude}
                      />
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TaskDetailsDialog open={!!selectedTask} onClose={handleClose} task={selectedTask} />
    </div>
  );
};

export default EmployeeTodaysActivity;
