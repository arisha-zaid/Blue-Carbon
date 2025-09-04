// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [role, setRole] = useState(null);

  // Load role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // Listen for localStorage changes (e.g., in other tabs or after registration)
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "role") {
        setRole(e.newValue);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Also update localStorage when setRole is called directly
  const setRoleAndSync = (newRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("role", newRole);
    } else {
      localStorage.removeItem("role");
    }
  };

  return (
    <UserContext.Provider value={{ role, setRole: setRoleAndSync }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
