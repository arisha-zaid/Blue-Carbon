
import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((messageOrObj, type = "info") => {
    // Normalize input: support addNotification("msg", "success") and addNotification({ message, type })
    const id = Date.now() + Math.random();
    const notification =
      typeof messageOrObj === "string"
        ? { message: messageOrObj, type }
        : { ...messageOrObj };

    setNotifications((prev) => [
      ...prev,
      { id, ...notification },
    ]);

    // Auto-dismiss after 4s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

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