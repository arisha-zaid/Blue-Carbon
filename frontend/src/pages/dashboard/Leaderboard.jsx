// src/pages/dashboard/Leaderboard.jsx
import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    // ✅ Backend/API call placeholder
    // fetch("/api/leaderboard")
    //   .then(res => res.json())
    //   .then(data => setLeaders(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
      <ul className="space-y-2">
        {leaders.length === 0 ? (
          <p>No leaderboard data (backend placeholder)</p>
        ) : (
          leaders.map((user, idx) => (
            <li key={user.id} className="p-2 border rounded">
              {idx + 1}. {user.name} - {user.points} pts
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
