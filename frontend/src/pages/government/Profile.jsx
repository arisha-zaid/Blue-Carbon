// src/pages/government/Profile.jsx
import React, { useState } from "react";

export default function Profile() {
  const [name, setName] = useState("Gov User");
  const [email, setEmail] = useState("gov@example.com");

  const handleSave = () => {
    alert("Profile saved (backend placeholder)");
    // POST /api/government/profile { name, email }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-4 max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
