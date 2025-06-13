import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
} from "date-fns";
import { MdLocationPin } from "react-icons/md";
import "./style/EmployeeWork.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeWork = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workDates, setWorkDates] = useState({});
  const [fetchedMonths, setFetchedMonths] = useState(new Set());
  const [dayData, setDayData] = useState(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
      days.push(day);
    }
    return days;
  }, [startDate, endDate]);

  useEffect(() => {
    const monthKey = format(monthStart, "yyyy-MM");
    if (fetchedMonths.has(monthKey)) return;

    const fetchMonthDays = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/employee/work/month?month=${monthKey}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const newWorkDates = {};
          data.forEach((entry) => {
            const [key, value] = Object.entries(entry)[0];
            newWorkDates[key] = value;
          });
          setWorkDates((prev) => ({ ...prev, ...newWorkDates }));
          setFetchedMonths((prev) => new Set(prev).add(monthKey));
        }
      } catch (err) {
        console.error("Failed to fetch work dates:", err);
      }
    };

    fetchMonthDays();
  }, [monthStart, fetchedMonths]);

  const handleDateClick = async (day) => {
    setSelectedDate(day);
    const dayStr = format(day, "yyyy-MM-dd");

    try {
      const res = await fetch(`${BASE_URL}/employee/work/day?day=${dayStr}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDayData(data);
    } catch (err) {
      console.error("Failed to fetch day work data:", err);
      setDayData(null);
    }
  };

  const goToMonth = (n) => {
    setSelectedDate((prev) => addMonths(prev, n));
  };

  return (
    <div className="employee-work">
      <div className="calendar-header">
        <button onClick={() => goToMonth(-1)}>&#8592;</button>
        <div className="month-label">{format(monthStart, "MMMM yyyy")}</div>
        <button onClick={() => goToMonth(1)}>&#8594;</button>
      </div>

      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((dayItem) => {
          const dayStr = format(dayItem, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(dayItem, monthStart);
          const isSelected = isSameDay(dayItem, selectedDate);
          const hasWork = workDates[dayStr] === true;

          return (
            <div
              key={dayStr}
              onClick={() => handleDateClick(dayItem)}
              className={`calendar-day ${isCurrentMonth ? "" : "not-current"} ${
                isSelected ? "selected" : ""
              }`}
            >
              {format(dayItem, "d")}
              {hasWork && <span className="dot green" />}
            </div>
          );
        })}
      </div>

      {dayData && (
        <div className="day-details">
          <div className="card">
            <h3>Login Sessions</h3>
            {dayData.loginSessions?.length ? (
              dayData.loginSessions.map((s, i) => (
                <div key={i} className="session-block">
                  <p>
                    <strong>Login:</strong>{" "}
                    {s.loginTime ? format(new Date(s.loginTime), "dd/MM/yyyy hh:mm a") : "N/A"}
                  </p>
                  {s.loginLocation?.latitude && (
                    <p>
                      <strong>Login Location:</strong>{" "}
                      {`${s.loginLocation.latitude}, ${s.loginLocation.longitude}`}
                      <a
                        href={`https://www.google.com/maps?q=${s.loginLocation.latitude},${s.loginLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MdLocationPin style={{ color: "red", marginLeft: 5 }} />
                      </a>
                    </p>
                  )}
                  <p>
                    <strong>Logout:</strong>{" "}
                    {s.logoutTime ? format(new Date(s.logoutTime), "dd/MM/yyyy hh:mm a") : "N/A"}
                  </p>
                  {s.logoutLocation?.latitude && (
                    <p>
                      <strong>Logout Location:</strong>{" "}
                      {`${s.logoutLocation.latitude}, ${s.logoutLocation.longitude}`}
                      <a
                        href={`https://www.google.com/maps?q=${s.logoutLocation.latitude},${s.logoutLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MdLocationPin style={{ color: "red", marginLeft: 5 }} />
                      </a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No login sessions.</p>
            )}
          </div>

          <div className="card">
            <h3>Tasks</h3>
            {dayData.tasks?.length ? (
              dayData.tasks.map((task, i) => (
                <div key={i} className="task-block">
                  <p>
                    <strong>Task ID:</strong> {task.taskId}
                  </p>
                  <p>
                    <strong>Title:</strong> {task.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {task.description}
                  </p>
                  <p>
                    <strong>Status:</strong> {task.status}
                  </p>
                  <p>
                    <strong>Address:</strong> {task.address}
                  </p>
                  <p>
                    <strong>Notes:</strong> {task.notes}
                  </p>
                  <p>
                    <strong>Assign Date:</strong> {format(new Date(task.assignDate), "dd/MM/yyyy")}
                  </p>
                  {task.completionLocation?.latitude && (
                    <p>
                      <strong>Completion Location:</strong>{" "}
                      {`${task.completionLocation.latitude}, ${task.completionLocation.longitude}`}
                      <a
                        href={`https://www.google.com/maps?q=${task.completionLocation.latitude},${task.completionLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MdLocationPin style={{ color: "red", marginLeft: 5 }} />
                      </a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No tasks.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWork;
