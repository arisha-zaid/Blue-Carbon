// src/components/Layout.jsx
<<<<<<< HEAD
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";
import { MoreVertical } from "lucide-react";
=======
import React from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";
>>>>>>> 14d0e911a23d93330f551ef9db9469d873e41345

export default function Layout({
  children,
  showSidebar = true,
<<<<<<< HEAD
}) {
  const { role } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Kebab (3-dots) button to open sidebar */}
      {showSidebar && role && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow hover:bg-gray-100 focus:outline-none"
        >
          <MoreVertical className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Sidebar - fixed, overlays content, content does not shift */}
      {showSidebar && role ? (
        <Sidebar
          role={role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : null}

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
=======
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
>>>>>>> 14d0e911a23d93330f551ef9db9469d873e41345
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 14d0e911a23d93330f551ef9db9469d873e41345
