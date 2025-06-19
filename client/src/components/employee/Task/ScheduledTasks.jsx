import React, { useState, useEffect, useMemo } from "react";
import ViewTask from "./ViewTask";
import Loader from "../../common/Loader";
import "./style/ScheduledTasks.scss";
import { List, ListItem, ListItemText, Divider, Typography } from "@mui/material";

import {
  format, isSameMonth, isSameDay,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths,
} from "date-fns";

function ScheduledTasks() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskDays, setTaskDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthData = async (date) => {
    const month = format(date, "yyyy-MM");
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/employee/task/month?month=${month}&date=${dateStr}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await response.json();
      setTaskDays(Array.isArray(data.taskDays) ? data.taskDays : []);
      setTasks(Array.isArray(data.tasksForDate) ? data.tasksForDate : []);
    } catch (error) {
      console.error("Failed to fetch task data", error);
      setTaskDays([]);
      setTasks([]);
    } finally {
      setLoading(false);
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
    setSelectedTask(null);
  };

  if (loading) return <Loader message="Loading Scheduled Tasks..." />;

  return (
    <div className="scheduled-tasks">
      <div className="header">
        <button className="nav-btn" onClick={() => goToMonth(-1)}>&#8592;</button>
        <div className="month-title">{format(monthStart, "MMMM yyyy")}</div>
        <button className="nav-btn" onClick={() => goToMonth(1)}>&#8594;</button>
      </div>

      <div className="day-labels">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="day-label">{d}</div>
        ))}
      </div>

      <div className="calendar">
        {calendarDays.map((dayItem) => {
          const dayStr = format(dayItem, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(dayItem, monthStart);
          const isSelected = isSameDay(dayItem, selectedDate);
          const hasTask = taskDatesSet.has(dayStr);

          const cellClass = [
            "calendar-cell",
            !isCurrentMonth && "not-current-month",
            isSelected && "selected",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={dayStr}
              onClick={() => isCurrentMonth && setSelectedDate(dayItem)}
              className={cellClass}
            >
              {format(dayItem, "d")}
              {hasTask && (
                <span
                  className={`task-dot ${isSelected ? "dot-selected" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="task-list">
        <div className="task-title">
          Tasks for {format(selectedDate, "do MMM yyyy")}
        </div>
        {tasks.length === 0 ? (
          <div className="no-tasks">No tasks scheduled</div>
        ) : (
          <ul>
            {tasks.map((task, idx) => (
              <li key={idx} onClick={() => setSelectedTask(task)}>
                {task.title}
                {task.time && <span>({task.time})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedTask && (
        <ViewTask task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}

export default ScheduledTasks;
