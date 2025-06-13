import React, { useState, useEffect, useMemo } from "react";
import ViewTask from "./ViewTask";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import {
  format, isSameMonth, isSameDay,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths,
} from "date-fns";

function ScheduledTasks() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskDays, setTaskDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // <-- Selected task state

  const fetchMonthData = async (date) => {
    const month = format(date, "yyyy-MM");
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const response = await fetch(
        `${BASE_URL}/employee/task/month?month=${month}&date=${dateStr}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await response.json();
      setTaskDays(Array.isArray(data.taskDays) ? data.taskDays : []);
      setTasks(Array.isArray(data.tasksForDate) ? data.tasksForDate : []);
    } catch (error) {
      console.error("Failed to fetch task data", error);
      setTaskDays([]);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchMonthData(selectedDate);
  }, [selectedDate]);

  const taskDatesSet = useMemo(() => new Set(taskDays), [taskDays]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
    calendarDays.push(day);
  }

  const goToMonth = (n) => {
    setSelectedDate((prev) => addMonths(prev, n));
    setSelectedTask(null); // close any open task when changing month
  };

  return (
    <div style={{ maxWidth: 350, margin: "auto", fontFamily: "sans-serif" }}>
      <div style={headerStyle}>
        <button onClick={() => goToMonth(-1)} style={navBtnStyle}>&#8592;</button>
        <div style={{ fontWeight: "bold", fontSize: 18 }}>{format(monthStart, "MMMM yyyy")}</div>
        <button onClick={() => goToMonth(1)} style={navBtnStyle}>&#8594;</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} style={dayLabelStyle}>{d}</div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {calendarDays.map((dayItem) => {
          const dayStr = format(dayItem, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(dayItem, monthStart);
          const isSelected = isSameDay(dayItem, selectedDate);
          const hasTask = taskDatesSet.has(dayStr);

          return (
            <div
              key={dayStr}
              onClick={() => isCurrentMonth && setSelectedDate(dayItem)}
              style={{
                ...calendarCellStyle,
                backgroundColor: isSelected ? "#007bff" : "transparent",
                color: isSelected ? "white" : isCurrentMonth ? "#000" : "#ccc",
              }}
            >
              {format(dayItem, "d")}
              {hasTask && (
                <span style={{
                  position: "absolute",
                  bottom: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 6,
                  height: 6,
                  backgroundColor: isSelected ? "white" : "#007bff",
                  borderRadius: "50%",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Task List */}
      <div style={{ marginTop: 16, maxHeight: 200, overflowY: "auto", borderTop: "1px solid #ddd", paddingTop: 8 }}>
        <div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 16 }}>Tasks for {format(selectedDate, "do MMM yyyy")}</div>
        {tasks.length === 0 ? (
          <div style={{ color: "#888", fontSize: 14 }}>No tasks scheduled</div>
        ) : (
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {tasks.map((task, idx) => (
              <li
                key={idx}
                style={taskItemStyle}
                onClick={() => setSelectedTask(task)}  // <-- open task details
              >
                {task.title}
                {task.time && <span style={{ color: "#666", fontSize: 12, marginLeft: 6 }}>({task.time})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ViewTask Modal */}
      {selectedTask && (
        <ViewTask
          task={selectedTask}
          onClose={() => setSelectedTask(null)} // callback to close ViewTask
        />
      )}
    </div>
  );
}
// Styles
const navBtnStyle = {
  padding: "4px 8px",
  fontSize: 18,
  cursor: "pointer",
  borderRadius: 4,
  border: "1px solid #ccc",
  background: "#f9f9f9",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const dayLabelStyle = {
  width: 36,
  textAlign: "center",
  fontSize: 12,
  color: "#666",
};

const calendarCellStyle = {
  width: 36,
  height: 36,
  margin: 1,
  textAlign: "center",
  lineHeight: "36px",
  borderRadius: 6,
  cursor: "pointer",
  position: "relative",
  userSelect: "none",
};

const taskItemStyle = {
  marginBottom: 6,
  fontSize: 14,
  lineHeight: 1.3,
  borderBottom: "1px solid #eee",
  paddingBottom: 4,
};

export default ScheduledTasks;
