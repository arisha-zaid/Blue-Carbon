// src/components/Layout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";
import { MoreVertical } from "lucide-react";

export default function Layout({
  children,
  showSidebar = true,
  hideNavbar = true, // navbar hidden by default; enable per-page by passing hideNavbar={false}
}) {
  const { role } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed sidebar container */}
      {showSidebar && role && (
        <div
          className={`fixed top-0 left-0 h-full z-[9999] transition-all duration-500 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
          style={{
            transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div
            className={`w-64 h-full transition-transform duration-500 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              role={role}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content container - adjusts based on sidebar state */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
          showSidebar && role && isSidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {/* Toggle button for mobile */}
        {showSidebar && role && !isSidebarOpen && (
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 right-4 z-[10000] p-2 rounded-full bg-white shadow hover:bg-gray-100 focus:outline-none lg:hidden transition-all duration-300"
          >
            <MoreVertical className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* Desktop toggle button - only shows when sidebar is closed */}
        {showSidebar && role && !isSidebarOpen && (
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:block fixed top-6 left-6 z-[10000] p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 focus:outline-none transition-all duration-300 transform hover:scale-110 border border-gray-200"
          >
            <MoreVertical className="h-6 w-6 text-gray-700" />
          </button>
        )}

        {!hideNavbar && (
          <div className="h-16 bg-white shadow flex items-center px-6 font-semibold">
            Blue Carbon Registry
          </div>
        )}
        <main
          className={`flex-1 py-6 transition-all duration-500 ${
            !isSidebarOpen && showSidebar && role
              ? "px-6 lg:pl-20 lg:pr-6"
              : "px-6"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && showSidebar && role && (
        <div
          className={`fixed inset-0 bg-black/30 z-[9998] lg:hidden transition-opacity duration-500 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
