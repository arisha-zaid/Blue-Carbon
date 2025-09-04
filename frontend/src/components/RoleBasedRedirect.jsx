import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export function mapRole(role) {
  if (role === "ngo") return "government";
  return role;
}

export default function RoleBasedRedirect() {
  const { role } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return; // no role yet → do nothing
    const mappedRole = mapRole(role);
    if (mappedRole === "admin") navigate("/admin");
    else if (mappedRole === "government") navigate("/government");
    else if (mappedRole === "industry") navigate("/industry");
    else navigate("/community");
  }, [role, navigate]);

  return <div>Redirecting...</div>; // safe fallback
}
