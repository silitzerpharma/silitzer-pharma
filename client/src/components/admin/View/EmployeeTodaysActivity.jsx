import React, { useState, useEffect } from "react";
import "./style/EmployeeTodaysActivity.scss";
import { format } from "date-fns";

import LocationOnIcon from "@mui/icons-material/LocationOn";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const reverseGeocode = async (lat, lon) => {
  if (!lat || !lon) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "EmployeeTodaysActivityApp/1.0 (your.email@example.com)", // Replace with your info if needed
      },
    });
    if (!response.ok) throw new Error("Failed to fetch address");
    const data = await response.json();
    return data.display_name || null;
  } catch (e) {
    console.error("Reverse geocoding error:", e);
    return null;
  }
};

const LocationDisplay = ({ lat, lon }) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lon) {
      setAddress(null);
      return;
    }
    setLoading(true);
    reverseGeocode(lat, lon)
      .then((addr) => setAddress(addr))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (!lat || !lon) return <span>N/A</span>;

  return (
    <span>
      {loading ? (
        <em>Loading address...</em>
      ) : address ? (
        <>
          {address}{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{ textDecoration: "none", marginLeft: 6 }}
          >
            <LocationOnIcon />
          </a>
        </>
      ) : (
        <>
          Lat: {lat}, Lng: {lon}{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{ textDecoration: "none", marginLeft: 6 }}
          >
            <LocationOnIcon />
          </a>
        </>
      )}
    </span>
  );
};

const EmployeeTodaysActivity = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionAddress, setCompletionAddress] = useState(null);
  const [completionLoading, setCompletionLoading] = useState(false);



  useEffect(() => {
    if (!employeeId) return;

    // Fetch today's tasks and sessions
    const fetchTodaysActivity = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/employee/todaysactivity`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ employeeId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch todays activity");
        }

        const data = await response.json();
        setTasks(data.tasks || []);
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Error fetching today's activity:", error);
      }
    };

    fetchTodaysActivity();
  }, [employeeId]);

  useEffect(() => {
    if (
      selectedTask &&
      selectedTask.completionLocation &&
      selectedTask.completionLocation.latitude &&
      selectedTask.completionLocation.longitude
    ) {
      const { latitude, longitude } = selectedTask.completionLocation;
      setCompletionLoading(true);
      reverseGeocode(latitude, longitude)
        .then((address) => {
          setCompletionAddress(address);
        })
        .finally(() => {
          setCompletionLoading(false);
        });
    } else {
      setCompletionAddress(null);
    }
  }, [selectedTask]);

  const handleClick = (task) => {
    setSelectedTask(task);
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setSelectedTask(null);
  };

  return (
    <div className="EmployeeTodaysActivity">
      <div className="EmployeeTodaysActivity-title">
        Employee Today's Activity
      </div>

      <div className="EmployeeTodaysActivity-row">
        <div className="row-col-left">
          <div className="row-title">Today's Tasks</div>
          <ul className="emp-task-list">
            {tasks.length === 0 && <li>No tasks for today</li>}
            {tasks.map((task) => (
              <li
                key={task._id}
                onClick={() => handleClick(task)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <strong>Title:</strong> {task.title}
                </div>
                <div>
                  <span>
                    <strong>Status:</strong> {task.status}
                  </span>
                </div>
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
                    <strong>Login Time:</strong>
                    <br />
                    {session.loginTime ? (
                      <>
                        {format(new Date(session.loginTime), "d/M/yyyy")}
                        <br />
                        {format(new Date(session.loginTime), "'time' h.mm a")}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </span>
                  <span>
                    <strong>Login Location:</strong>{" "}
                    <LocationDisplay
                      lat={session.loginLocation?.latitude}
                      lon={session.loginLocation?.longitude}
                    />
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Logout Time:</strong>
                    {session.logoutTime ? (
                      <>
                        {format(new Date(session.logoutTime), "d/M/yyyy")}
                        <br />
                        {format(new Date(session.logoutTime), " h.mm a")}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </span>

                  <span>
                    <strong>Logout Location:</strong>{" "}
                    {session.logoutLocation ? (
                      <LocationDisplay
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

      {showDialog && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <button onClick={handleClose} style={{ float: "right" }}>
              X
            </button>

            <div>
              <span>
                <strong>Title:</strong> {selectedTask.title}
              </span>
              <span>
                <strong> Task ID:</strong> {selectedTask.taskId}
              </span>
            </div>

            <div>
                 <span>
                <strong> AssignDate:</strong>
                {format(new Date(selectedTask.assignDate), "d/M/yyyy")}{" "}
              </span>
              <span>
                <strong>Due Date:</strong>{" "}
                {selectedTask.dueDate
                  ? format(new Date(selectedTask.dueDate), "d/M/yyyy")
                  : "Not Set"}
              </span>
            </div>

            <div>
              <span>
                <strong>Priority:</strong> {selectedTask.priority}
              </span>
              <span>
                <strong>Status:</strong> {selectedTask.status}
              </span>
            </div>

            <div>
              <span> <strong>Description:</strong> {selectedTask.description} </span>
              <span><strong>Address:</strong> {selectedTask.address} </span>
            </div>
            <div>
              <span>
                <strong>Completion Date:</strong>{" "}
                {selectedTask.completionDate
                  ? format(new Date(selectedTask.completionDate), "d/M/yyyy")
                  : "Not-Completed"}
              </span>

              <span>
                <strong>StartDate:</strong>{" "}
                {format(new Date(selectedTask.startDate), "d/M/yyyy")}
              </span>
            </div>

            {selectedTask.completionLocation && (
              <div className="location-span">
                <strong>Completion Location:</strong>
                <div>
                  {completionLoading ? (
                    <em>Loading address...</em>
                  ) : completionAddress ? (
                    <>
                      <span>{completionAddress}</span>{" "}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedTask.completionLocation.latitude},${selectedTask.completionLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        style={{ textDecoration: "none", marginLeft: 6 }}
                      >
                        <LocationOnIcon />
                      </a>
                    </>
                  ) : (
                    <>
                      <span>
                        Lat: {selectedTask.completionLocation.latitude}, Lng:{" "}
                        {selectedTask.completionLocation.longitude}
                      </span>{" "}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedTask.completionLocation.latitude},${selectedTask.completionLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        style={{ textDecoration: "none", marginLeft: 6 }}
                      >
                        <LocationOnIcon />
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <strong>Status History:</strong>
              {selectedTask.statusHistory?.map((entry, idx) => (
                <div key={idx}>
                  <strong>status:</strong> '{entry.status}', changedAt: '
                  {format(
                    new Date(entry.changedAt),
                    "d/M/yyyy 'and time' h a mm''"
                  )}
                  '
                </div>
              ))}
            </div>

            {selectedTask.note && (
              <div>
                <strong>Note:</strong>
                <p>{selectedTask.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTodaysActivity;
