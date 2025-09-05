// src/pages/dashboard/AddProject.jsx
import React, { useState } from "react";
import { useNotification } from "../../context/NotificationContext";

export default function AddProject() {
  const [project, setProject] = useState({
    title: "",
    description: "",
    location: "",
  });

  const { addNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ Backend/API call placeholder
    // fetch("/api/projects/add", { method: "POST", body: JSON.stringify(project) })
    addNotification("Project submitted (backend call placeholder)", "success");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Add New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Project Title"
          value={project.title}
          onChange={(e) => setProject({ ...project, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Project Description"
          value={project.description}
          onChange={(e) =>
            setProject({ ...project, description: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={project.location}
          onChange={(e) => setProject({ ...project, location: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
