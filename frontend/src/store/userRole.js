import { useState, useEffect } from "react";

export function useUserRole() {
  // initialize from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || "Developer");

  // keep in sync with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("role") || "Developer";
    setRole(saved);
  }, []);

  const updateRole = (newRole) => {
    localStorage.setItem("role", newRole);
    setRole(newRole);
  };

  return { role, updateRole };
}
