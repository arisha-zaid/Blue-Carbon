// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiService from "../services/api";
import {
  Home,
  FileText,
  Users,
  Award,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { mapRole } from "./RoleBasedRedirect";

export default function Sidebar({ role, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const links = {
    community: [
      { name: "Dashboard", path: "/community", icon: <Home size={18} /> },
      {
        name: "Community Profile",
        path: "/community/profile",
        icon: <Users size={18} />,
      },
      {
        name: "Add Project",
        path: "/add-project",
        icon: <FileText size={18} />,
      },
      { name: "My Projects", path: "/my-projects", icon: <Users size={18} /> },
      {
        name: "Certificates",
        path: "/certificates",
        icon: <Award size={18} />,
      },
      {
        name: "Leaderboard",
        path: "/leaderboard",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Settings",
        path: "/dashboard/settings",
        icon: <Settings size={18} />,
      },
      {
        name: "Projects Map",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
    ],
    industry: [
      { name: "Dashboard", path: "/industry", icon: <Home size={18} /> },
      {
        name: "Marketplace",
        path: "/industry/marketplace",
        icon: <CreditCard size={18} />,
      },
      {
        name: "Transactions",
        path: "/industry/transactions",
        icon: <FileText size={18} />,
      },
      { name: "Wallet", path: "/industry/wallet", icon: <Award size={18} /> },
      {
        name: "Reports",
        path: "/industry/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Projects Map",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Settings",
        path: "/industry/settings",
        icon: <Settings size={18} />,
      },
    ],
    admin: [
      { name: "Dashboard", path: "/admin", icon: <Home size={18} /> },
      {
        name: "Project Approval",
        path: "/admin/project-approval",
        icon: <FileText size={18} />,
      },
      {
        name: "Credit Issuance",
        path: "/admin/credit-issuance",
        icon: <CreditCard size={18} />,
      },
      {
        name: "User Management",
        path: "/admin/user-management",
        icon: <Users size={18} />,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Projects Map",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Profile",
        path: "/admin/profile",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Settings",
        path: "/admin/settings",
        icon: <Settings size={18} />,
      },
    ],
    government: [
      { name: "Dashboard", path: "/government", icon: <Home size={18} /> },
      {
        name: "Reports & Analytics",
        path: "/government/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Projects Map",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        name: "Audit Projects",
        path: "/government/audit-projects",
        icon: <FileText size={18} />,
      },
      {
        name: "Policies",
        path: "/government/policies",
        icon: <Settings size={18} />,
      },
      {
        name: "Settings",
        path: "/government/settings",
        icon: <Settings size={18} />,
      },
    ],
  };

  const effectiveRole = mapRole(role);
  const roleLinks = links[effectiveRole] || links["community"];

  return (
    <aside
      className="bg-[#121110] shadow-lg w-64 h-screen fixed lg:relative left-0 top-0 lg:h-auto lg:top-auto lg:left-auto z-[9999]"
      aria-hidden={!isOpen}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="text-xl font-bold text-teal-400">Blue Carbon</div>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="p-2 rounded-md hover:bg-[#1a1a1a]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto h-[calc(100vh-150px)]">
            {roleLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium bg-[#1a1a1a] text-gray-300 transition-all duration-300
              ${
                location.pathname === link.path
                  ? "border border-teal-500 text-teal-400 shadow-[0_0_6px_#14b8a6]"
                  : "hover:border hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]"
              }`}
                onClick={() => {
                  // Only close sidebar on mobile screens
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#1a1a1a] text-gray-300 transition-all duration-300 hover:border hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]"
              onClick={async () => {
                await apiService.logout();
                navigate("/login");
                // Only close sidebar on mobile screens
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
