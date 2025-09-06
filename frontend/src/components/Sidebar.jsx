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
      { name: "Community Profile", path: "/community/profile", icon: <Users size={18} /> },
      { name: "Add Project", path: "/add-project", icon: <FileText size={18} /> },
      { name: "My Projects", path: "/my-projects", icon: <Users size={18} /> },
      { name: "Certificates", path: "/certificates", icon: <Award size={18} /> },
      { name: "Leaderboard", path: "/leaderboard", icon: <BarChart2 size={18} /> },
      { name: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
      { name: "Projects Map", path: "/projects/map", icon: <BarChart2 size={18} /> },
    ],
    industry: [
      { name: "Dashboard", path: "/industry", icon: <Home size={18} /> },
      { name: "Marketplace", path: "/industry/marketplace", icon: <CreditCard size={18} /> },
      { name: "Transactions", path: "/industry/transactions", icon: <FileText size={18} /> },
      { name: "Wallet", path: "/industry/wallet", icon: <Award size={18} /> },
      { name: "Reports", path: "/industry/reports", icon: <BarChart2 size={18} /> },
      { name: "Projects Map", path: "/projects/map", icon: <BarChart2 size={18} /> },
      { name: "Settings", path: "/industry/settings", icon: <Settings size={18} /> },
    ],
    admin: [
      { name: "Dashboard", path: "/admin", icon: <Home size={18} /> },
      { name: "Project Approval", path: "/admin/project-approval", icon: <FileText size={18} /> },
      { name: "Credit Issuance", path: "/admin/credit-issuance", icon: <CreditCard size={18} /> },
      { name: "User Management", path: "/admin/user-management", icon: <Users size={18} /> },
      { name: "Reports", path: "/admin/reports", icon: <BarChart2 size={18} /> },
      { name: "Projects Map", path: "/projects/map", icon: <BarChart2 size={18} /> },
      { name: "Profile", path: "/admin/profile", icon: <BarChart2 size={18} /> },
      { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
    ],
    government: [
      { name: "Dashboard", path: "/government", icon: <Home size={18} /> },
      { name: "Reports & Analytics", path: "/government/reports", icon: <BarChart2 size={18} /> },
      { name: "Projects Map", path: "/projects/map", icon: <BarChart2 size={18} /> },
      { name: "Audit Projects", path: "/government/audit-projects", icon: <FileText size={18} /> },
      { name: "Policies", path: "/government/policies", icon: <Settings size={18} /> },
      { name: "Settings", path: "/government/settings", icon: <Settings size={18} /> },
    ],
  };

  // Use centralized role mapping
  const effectiveRole = mapRole(role);
  const roleLinks = links[effectiveRole] || links["community"];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="text-xl font-bold text-green-700">Blue Carbon</div>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {/* X icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
        {roleLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
              location.pathname === link.path
                ? "bg-teal-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={onClose}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border font-medium text-gray-700 hover:bg-gray-100"
          onClick={async () => {
            await apiService.logout();
            navigate("/login");
            onClose && onClose();
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
