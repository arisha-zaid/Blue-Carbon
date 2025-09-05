// Example: src/pages/dashboard/Profile.jsx
import React, { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    // ✅ Placeholder backend call to get user info
    // fetch("/api/user/profile")
    //   .then(res => res.json())
    //   .then(data => setUser(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <p>
        <strong>Name:</strong> {user.name || "John Doe"}
      </p>
      <p>
        <strong>Email:</strong> {user.email || "email@example.com"}
      </p>
      <p>
        <strong>Role:</strong> {user.role || "Community"}
      </p>
    </div>
  );
}
