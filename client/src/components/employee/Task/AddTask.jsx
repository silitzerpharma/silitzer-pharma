import React, { useState } from 'react';
import './style/AddTask.scss'; // Optional for styling


const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Loader from "../../common/Loader";
import { toast } from 'react-toastify';

const AddTask = ({isActive}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Ongoing',
    address: '',
    notes: '',
  });
const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const submitData = async (location) => {
    try {
      setLoading(true)
      const payload = {
        ...formData,
        ...(location && { location }), // include location if available
      };

      const response = await fetch(`${BASE_URL}/employee/task/add`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit task");

      const data = await response.json();
      toast.success("Task added successfully!");
      setFormData({
        title: '',
        description: '',
        status: 'Ongoing',
        address: '',
        notes: '',
      });
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Error submitting task. Please try again.");
    }
    finally{
      setLoading(false);
    }
  };

  // If Completed, get location first
  if (formData.status === "Completed") {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        submitData(location);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. Task not added.");
      }
    );
  } else {
    // Submit directly for non-completed tasks
    submitData(null);
  }
};

  if (isActive === false) {
    return <p>
      To add Task You need to Active
    </p>;
  }

  if (loading) return <Loader message="Adding Task..." />;

  return (
    <div className="add-task-form">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Status:
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Ongoing">Ongoing</option>
            <option value="Complete">Completed</option>
          </select>
        </label>

        <label>
          Address:
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>

        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTask;
