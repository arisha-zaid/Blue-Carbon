import React from "react";
import { useNotification } from "../context/NotificationContext";

export default function NotificationToaster() {
  const { notifications } = useNotification();
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-3 rounded shadow-lg text-white transition-all animate-fade-in-down ${
            n.type === "success"
              ? "bg-green-600"
              : n.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
