// src/pages/industry/Profile.jsx
import React, { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "Industry",
    company: "",
  });

  useEffect(() => {
    // ✅ Backend/API call placeholder
    // fetch("/api/industry/profile")
    //   .then(res => res.json())
    //   .then(data => setUser(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Industry Profile</h1>
      <p><strong>Name:</strong> {user.name || "John Doe"}</p>
      <p><strong>Email:</strong> {user.email || "industry@example.com"}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Company:</strong> {user.company || "ABC Corp"}</p>
    </div>
  );
}
