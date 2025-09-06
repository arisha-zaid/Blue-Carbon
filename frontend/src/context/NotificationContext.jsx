
import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (msgOrConfig, type = "info", duration = 3000) => {
      // Support both signatures:
      // - addNotification("text", "success", 3000)
      // - addNotification({ message: "text", type: "success", duration: 3000 })
      let message = msgOrConfig;
      if (typeof msgOrConfig === "object" && msgOrConfig !== null) {
        message = msgOrConfig.message;
        type = msgOrConfig.type ?? "info";
        duration = msgOrConfig.duration ?? 3000;
      }
      const id = Date.now() + Math.random();
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationToaster() {
  const { notifications } = useNotification();
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n?.id}
          className={`px-4 py-3 rounded shadow-lg text-white transition-all animate-fade-in-down ${
            n?.type === "success"
              ? "bg-green-600"
              : n?.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {n?.message}
        </div>
      ))}
    </div>
  );
}