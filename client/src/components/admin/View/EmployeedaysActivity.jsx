import React, { useState, useEffect } from "react";
import "./style/EmployeeTodaysActivity.scss";
import { format } from "date-fns";
import TaskDetailsDialog from "../View/employee/TaskDetailsDialog";
import Loader from "../../common/Loader";
import LocationDisplay from "../View/LocationDisplay"; // Update path if needed

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeedaysActivity = ({ employeeId, day }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId || !day) return;

    const fetchDaysActivity = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/admin/employee/daysactivity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ employeeId, day }),
        });

        if (!response.ok) throw new Error("Failed to fetch day's activity");

        const data = await response.json();
        setTasks(data.tasks || []);
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Error fetching day's activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDaysActivity();
  }, [employeeId, day]);

  const handleClick = (task) => setSelectedTask(task);
  const handleClose = () => setSelectedTask(null);

  if (loading) return <Loader message="Loading Employee Day Activity..." />;

  return (
    <div className="EmployeeTodaysActivity">
      <div className="EmployeeTodaysActivity-title">
        Employee Activity for {format(new Date(day), "d/M/yyyy")}
      </div>

      <div className="EmployeeTodaysActivity-row">
        <div className="row-col-left">
          <div className="row-title">Tasks</div>
          <ul className="emp-task-list">
            {tasks.length === 0 && <li>No tasks for this day</li>}
            {tasks.map((task) => (
              <li key={task._id} onClick={() => handleClick(task)} style={{ cursor: "pointer" }}>
                <div><strong>Title:</strong> {task.title}</div>
                <div><strong>Status:</strong> {task.status}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="row-col-right">
          <div className="row-title">Login Sessions</div>
          <ul className="session-list">
            {sessions.length === 0 && <li>No login sessions for this day</li>}
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
                    <strong>Login Location:</strong><br />
                    <LocationDisplay
                      address={session.loginAddress}
                      latitude={session.loginLocation?.latitude}
                      longitude={session.loginLocation?.longitude}
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
                    <strong>Logout Location:</strong><br />
                    {session.logoutLocation ? (
                      <LocationDisplay
                        address={session.logoutAddress}
                        latitude={session.logoutLocation.latitude}
                        longitude={session.logoutLocation.longitude}
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

export default EmployeedaysActivity;
