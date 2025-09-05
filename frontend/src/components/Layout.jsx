// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";

export default function Layout({
  children,
  showSidebar = true,
  hideNavbar = false,
}) {
  const { role } = useUser();

  // Always render children, sidebar only if role exists
  return (
    <div className="flex min-h-screen bg-gray-50">
      {showSidebar && role ? <Sidebar role={role} /> : null}
      <div className="flex-1 flex flex-col">
        {!hideNavbar && (
          <div className="h-16 bg-white shadow flex items-center px-6 font-semibold">
            Blue Carbon Registry
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
